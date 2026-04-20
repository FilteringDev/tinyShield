import * as ESBuild from 'esbuild'
import PackageJson from '@npmcli/package-json'
import { CreateBanner } from './banner/index.js'
import { Build, type BuildOptions } from './build-core.js'

export class StandardBuild extends Build {
  constructor(FromOrOption: Build | BuildOptions, Option?: BuildOptions) {
    if (FromOrOption instanceof Build) {
      super(Option!)
      this.CopyStateFrom(FromOrOption)
      return
    }

    super(FromOrOption)
  }

  async Build() {
    let MatchingDomains: Set<string> = new Set<string>(this.FetchedDomains.get('Full'))
    const Banner = CreateBanner({
      Version: this.Options?.Version ?? (await PackageJson.load(this.ProjectRoot)).content.version ?? '0.0.0',
      BuildType: this.Options!.BuildType ?? 'production',
      Domains: MatchingDomains,
      Name: 'tinyShield',
      Namespace: 'https://github.com/FilteringDev/tinyShield',
      DownloadURL: this.Options!.SubscriptionUrl,
      UpdateURL: this.Options!.SubscriptionUrl,
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
      entryPoints: [this.ProjectRoot + '/userscript/source/index.ts'],
      bundle: true,
      minify: this.Options!.Minify,
      outfile: `${this.ProjectRoot}/dist/tinyShield${this.Options!.BuildType === 'development' ? '.dev' : ''}.user.js`,
      banner: {
        js: Banner
      },
      target: ['es2024', 'chrome119', 'firefox142', 'safari26']
    })
  }
}