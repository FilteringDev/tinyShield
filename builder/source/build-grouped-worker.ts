import * as ESBuild from 'esbuild'
import * as Piscina from 'piscina'
import { CreateBanner } from './banner/index.js'
import type { BuildOptions } from './build-core.js'

type WorkerData = {
  Config: BuildOptions
  ProjectRoot: string
  OutfileName: string
}

export default async function Worker({ FileName, Domains }: { FileName: Set<string>, Domains: Set<string> }) {
  const WorkerData: WorkerData = Piscina.workerData as WorkerData

  const Banner = CreateBanner({
      Version: WorkerData.Config.Version!,
      BuildType: WorkerData.Config.BuildType ?? 'production',
      Domains: Domains,
      Name: 'tinyShield',
      Namespace: 'https://github.com/FilteringDev/tinyShield',
      DownloadURL: new URL(WorkerData.Config.SubscriptionUrl),
      UpdateURL: new URL(WorkerData.Config.SubscriptionUrl),
      HomepageURL: new URL('https://github.com/FilteringDev/tinyShield'),
      SupportURL: new URL('https://github.com/FilteringDev/tinyShield/issues'),
      License: 'MPL-2.0',
      Author: 'PiQuark6046 and contributors',
      Description: {
        en: 'tinyShield allows AdGuard, uBlock Origin, Brave and ABP to resist against Ad-Shield quickly.',
        ko: 'tinyShield는 AdGuard, uBlock Origin, Brave 와 ABP가 애드쉴드에 빠르게 저항할 수 있도록 합니다.',
        ja: 'tinyShieldを使うと、AdGuard, uBlock Origin, Brave, およびABPがAd-Shieldに素早く対抗できます。'
      }
    })

    await ESBuild.build({
      entryPoints: [WorkerData.ProjectRoot + '/userscript/source/index.ts'],
      bundle: true,
      minify: WorkerData.Config.Minify,
      outfile: `${WorkerData.ProjectRoot}/dist/grouped/tinyShield-${[...FileName][0]}.user.js`,
      banner: {
        js: Banner
      },
      target: ['es2024', 'chrome119', 'firefox142', 'safari26']
    })
}