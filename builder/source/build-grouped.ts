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

  private TransformDomainSetToFileName(DomainSet: Set<Set<string>>): Set<Set<string>> {
    const Result = new Set<Set<string>>()
    for (const Value of DomainSet) {
      const FileNameSet = new Set<string>()
      for (const Domain of Value) {
        FileNameSet.add(Domain.endsWith('.*') ? Domain.replaceAll(/\.\*$/g, '.tld') : Domain)
      }
      Result.add(FileNameSet)
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

    const FileNameList: Set<Set<string>> = this.TransformDomainSetToFileName(new Set<Set<string>>(this.FetchedDomains.get('EachDomain')))
    const MatchingDomains: Set<Set<string>> = new Set<Set<string>>(this.FetchedDomains.get('EachDomainFull'))

    for (let I = 0; I < FileNameList.size; I++) {
      const FileName = [...[...FileNameList][I]][0]
      const Domains = [...MatchingDomains][I]
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
    
    await Fs.promises.writeFile(`${this.ProjectRoot}/dist/grouped/metadata.json`, JSON.stringify(MetadataObj, null, 2), 'utf-8')
  }
  
  async Build() {
    if (!this.Options) {
      throw new Error('Build options are not initialized.')
    }

    this.Options.Version ??= (await PackageJson.load(this.ProjectRoot)).content.version ?? '0.0.0'

    const FileNameList: Set<Set<string>> = this.TransformDomainSetToFileName(new Set<Set<string>>(this.FetchedDomains.get('EachDomain')))
    const MatchingDomains: Set<Set<string>> = new Set<Set<string>>(this.FetchedDomains.get('EachDomainFull'))

    const Workerpool =  new Piscina.Piscina({
      filename: Path.resolve(this.ProjectRoot, 'builder/source/build-grouped-worker.ts'),
      execArgv: [...Process.execArgv, '--import=tsx'],
      workerData: { Config: { ...this.Options, SubscriptionUrl: this.Options.SubscriptionUrl.href }, ProjectRoot: this.ProjectRoot }
    })

    const WorkerResults: Promise<void>[] = []
    for (let I = 0; I < FileNameList.size; I++) {
      WorkerResults.push(Workerpool.run({ FileName: [...FileNameList][I], Domains: [...MatchingDomains][I] }))
    }
    await Promise.all(WorkerResults)
  }
}