import * as Piscina from 'piscina'
import * as Path from 'node:path'
import * as Process from 'node:process'
import * as Crypto from 'node:crypto'
import * as Fs from 'node:fs'
import PackageJson from '@npmcli/package-json'
import { Build, type BuildOptions } from './build-core.js'

export class GroupedBuild extends Build {
  constructor(FromOrOption: Build | BuildOptions, Option?: BuildOptions) {
    if (FromOrOption instanceof Build) {
      super(Option!)
      this.CopyStateFrom(FromOrOption)
      return
    }

    super(FromOrOption)
  }

  private GetGroups(): Map<Set<string>, Set<string>> {
    const Groups = this.FetchedDomains.get('Groups')
    if (!Groups) throw new Error('Domain groups are not initialized.')
    const Result = new Map<Set<string>, Set<string>>()
    for (const [Names, Domains] of Groups) {
      Result.set(
        new Set([...Names].map(Domain => Domain.endsWith('.*') ? Domain.slice(0, -2) + '.tld' : Domain)),
        Domains
      )
    }
    return Result
  }

  async MakeGroupMetadata() {
    const MetadataObj: {
      DomainMapping: Record<string, string>,
      FileMapping: Record<string, { SHA386: string, FileName: string }>
    } = {
      DomainMapping: {},
      FileMapping: {}
    }

    for (const [Names, Domains] of this.GetGroups()) {
      const FileName = Names.values().next().value!
      const FilePath = `${this.ProjectRoot}/dist/grouped/${FileName[0]}/tinyShield-${FileName}.user.js`
      const FileContent = await Fs.promises.readFile(FilePath)
      const SHA386Hash = Crypto.createHash('sha384').update(FileContent).digest('hex').toUpperCase()

      for (const Domain of Domains) {
        MetadataObj.DomainMapping[Domain] = FileName
        MetadataObj.FileMapping[FileName] = {
          SHA386: SHA386Hash,
          FileName: `tinyShield-${FileName}.user.js`
        }
      }
    }
    
    await Fs.promises.mkdir(`${this.ProjectRoot}/dist/grouped`, { recursive: true })
    await Fs.promises.writeFile(`${this.ProjectRoot}/dist/grouped/metadata.json`, JSON.stringify(MetadataObj, null, 2), 'utf-8')
  }
  
  async Build() {
    if (!this.Options) {
      throw new Error('Build options are not initialized.')
    }

    this.Options.Version ??= (await PackageJson.load(this.ProjectRoot)).content.version ?? '0.0.0'

    const Workerpool =  new Piscina.Piscina({
      filename: Path.resolve(this.ProjectRoot, 'builder/source/build-grouped-worker.ts'),
      execArgv: [...Process.execArgv, `--import=${import.meta.resolve('tsx')}`],
      workerData: { Config: { ...this.Options, SubscriptionUrl: this.Options.SubscriptionUrl.href }, ProjectRoot: this.ProjectRoot }
    })

    try {
      const WorkerResults: Promise<unknown>[] = []
      for (const [FileName, Domains] of this.GetGroups()) {
        WorkerResults.push(Workerpool.run({ FileName, Domains }))
      }
      await Promise.all(WorkerResults)
    } finally {
      await Workerpool.destroy()
    }
  }
}