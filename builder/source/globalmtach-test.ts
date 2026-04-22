import * as Fs from 'node:fs'
import * as ESBuild from 'esbuild'
import PackageJson from '@npmcli/package-json'
import { CreateBanner } from './banner/index.js'
import { Build, type BuildOptions } from './build-core.js'

export class GlobalMatchBuild extends Build {
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
    let SubscriptionURL = new URL(`https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@${this.Options?.Version ?? (await PackageJson.load(this.ProjectRoot)).content.version ?? '0.0.0'}/dist/tinyShield-GlobalMatch.user.js`)
    const Banner = CreateBanner({
      Version: this.Options?.Version ?? (await PackageJson.load(this.ProjectRoot)).content.version ?? '0.0.0',
      BuildType: this.Options!.BuildType ?? 'production',
      Domains: new Set<string>(['*']),
      Name: 'tinyShield GlobalMatch',
      Namespace: 'https://github.com/FilteringDev/tinyShield',
      DownloadURL: SubscriptionURL,
      UpdateURL: SubscriptionURL,
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

    Fs.copyFileSync(this.ProjectRoot + '/userscript/source/index.ts', this.ProjectRoot + '/userscript/source/index-globalmatch.ts')
    const GlobalMatchIndexPath = this.ProjectRoot + '/userscript/source/index-globalmatch.ts'
    const SourceText = Fs.readFileSync(GlobalMatchIndexPath, 'utf8')
    const Anchor = 'export const OriginalRegExpTest = BrowserWindow.RegExp.prototype.test'
    const AnchorIndex = SourceText.indexOf(Anchor)
    if (AnchorIndex === -1) {
      throw new Error('[globalmatch] Failed to find OriginalRegExpTest anchor in index-globalmatch.ts')
    }

    const AnchorLineEndIndex = SourceText.indexOf('\n', AnchorIndex)
    if (AnchorLineEndIndex === -1) {
      throw new Error('[globalmatch] Failed to determine insertion point in index-globalmatch.ts')
    }

    const DomainListElements = Array.from(MatchingDomains).map(Domain => JSON.stringify(Domain)).join(', ')
    const ExecutionCondition = `(() => {\n  const DomainList: string[] = [${DomainListElements}]\n  const CurrentURL = new URL(BrowserWindow.location.href)\n  if (!DomainList.some(Domain => BrowserWindow.location.href.includes(\`://\${Domain}/\`) || CurrentURL.hostname.endsWith(\`.\${Domain}\`))) {\n    return\n  }\n\n`

    const Head = SourceText.slice(0, AnchorLineEndIndex + 1)
    const Tail = SourceText.slice(AnchorLineEndIndex + 1)
    const TransformedSource = `${Head}\n${ExecutionCondition}${Tail}\n})()\n`
    Fs.writeFileSync(GlobalMatchIndexPath, TransformedSource)

    await ESBuild.build({
      entryPoints: [this.ProjectRoot + '/userscript/source/index-globalmatch.ts'],
      bundle: true,
      minify: this.Options!.Minify,
      outfile: `${this.ProjectRoot}/dist/tinyShield-GlobalMatch${this.Options!.BuildType === 'development' ? '.dev' : ''}.user.js`,
      banner: {
        js: Banner
      },
      target: ['es2024', 'chrome119', 'firefox142', 'safari26']
    })

    Fs.rmSync(this.ProjectRoot + '/userscript/source/index-globalmatch.ts')
  }
}