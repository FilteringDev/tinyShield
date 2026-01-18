import * as ESBuild from 'esbuild'
import * as Zod from 'zod'
import * as Process from 'node:process'
import * as TLDTS from 'tldts'
import PackageJson from '@npmcli/package-json'
import { LoadDomainsFromCache } from './cache.js'
import { FetchAdShieldDomains } from './references/index.js'
import { CustomDefinedMatches } from './references/custom-defined.js'
import { ConvertWildcardSuffixToRegexPattern } from './utils/wildcard-suffix-converter.js'
import { CreateBanner } from './banner/index.js'

export type BuildOptions = {
  Minify: boolean
  UseCache: boolean
  BuildType: 'production' | 'development'
}

export async function Build(OptionsParam?: BuildOptions): Promise<void> {
  const Options = await Zod.strictObject({
    Minify: Zod.boolean(),
    UseCache: Zod.boolean(),
    BuildType: Zod.enum(['production', 'development'])
  }).parseAsync(OptionsParam)

  let MatchingDomains: Set<string> = new Set<string>()
  if (Options.UseCache) {
    MatchingDomains = await LoadDomainsFromCache()
  } else {
    MatchingDomains = await FetchAdShieldDomains()
  }
  CustomDefinedMatches.forEach(Domain => MatchingDomains.add(Domain))

  MatchingDomains = new Set<string>([...MatchingDomains].map(Domain => TLDTS.parse(Domain).domain ?? Domain).filter((D): D is string => D !== null))
  for (const Domain of MatchingDomains) {
    if (Domain.endsWith('.*')) {
      MatchingDomains.delete(Domain)
      ConvertWildcardSuffixToRegexPattern(Domain).forEach(GeneratedPattern => MatchingDomains.add(GeneratedPattern))
    }
  }
  
  const Banner = CreateBanner({
    Version: (await PackageJson.load(Process.cwd())).content.version ?? '0.0.0',
    BuildType: Options.BuildType ?? 'production',
    Domains: MatchingDomains,
    Name: 'tinyShield',
    Namespace: 'https://github.com/FilteringDev/tinyShield',
    DownloadURL: new URL('https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/tinyShield.user.js'),
    UpdateURL: new URL('https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/tinyShield.user.js'),
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

  let ProjectRoot = Process.cwd()
  if (Process.cwd().endsWith('/builder')) {
    ProjectRoot = Process.cwd() + '/..'
  }
  await ESBuild.build({
    entryPoints: [ProjectRoot + '/userscript/source/index.ts'],
    bundle: true,
    minify: Options.Minify,
    outfile: `${ProjectRoot}/dist/tinyShield${Options.BuildType === 'development' ? '.dev' : ''}.user.js`,
    banner: {
      js: Banner
    },
    target: ['es2024', 'chrome119', 'firefox142', 'safari26']
  })
}