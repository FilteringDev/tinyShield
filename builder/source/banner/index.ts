export interface BannerOptions {
  Version: string
  BuildType: 'production' | 'development'
  Domains: Set<string>
  Author: string
  Name: string
  Namespace: string
  HomepageURL: URL
  SupportURL: URL
  UpdateURL: URL
  DownloadURL: URL
  License: string
  Description: Record<'en' | 'ko' | 'ja' | string, string>
}

export function CreateBanner(Options: BannerOptions): string {
  let BannerString: string = '// ==UserScript==\n'
  BannerString += `// @name         ${Options.BuildType === 'production' ? Options.Name : Options.Name + ' (Development)'}\n`
  BannerString += '//\n'
  BannerString += `// @namespace    ${Options.Namespace}\n`
  BannerString += `// @homepageURL  ${Options.HomepageURL.href}\n`
  BannerString += `// @supportURL   ${Options.SupportURL.href}\n`
  BannerString += `// @updateURL    ${Options.UpdateURL.href}\n`
  BannerString += `// @downloadURL  ${Options.DownloadURL.href}\n`
  BannerString += `// @license      ${Options.License}\n`
  BannerString += '//\n'
  BannerString += `// @version      ${Options.Version}\n`
  BannerString += `// @author       ${Options.Author}\n`
  BannerString += '//\n'
  BannerString += '// @grant        unsafeWindow\n'
  BannerString += '// @run-at       document-start\n'
  BannerString += '//\n'
  BannerString += `// @description  ${Options.Description['en']}\n`
  
  for (const Key of Object.keys(Options.Description)) {
    if (Key === 'en') continue
    BannerString += `// @description:${Key}  ${Options.Description[Key]}\n`
  }
  BannerString += '//\n'

  for (const Domain of Options.Domains) {
    BannerString += `// @match      *://${Domain}/*\n`
    BannerString += `// @match      *://*.${Domain}/*\n`
  }
  BannerString += '// ==/UserScript==\n\n'
  return BannerString
}