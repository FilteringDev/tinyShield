import { HTTPS2Request } from '@typescriptprime/securereq'

export const AdShieldCDNDomains: Set<string> = new Set([
  'html-load.com',
  'css-load.com',
  'ads.adthrive.com'
])

export async function IsAdShieldCDNDomain(Domain: string): Promise<boolean> {
  const AdShieldCDNCheckResponse = await HTTPS2Request(new URL(`https://${Domain}/`), { ExpectedAs: 'String' }).catch(() => false)
  return typeof AdShieldCDNCheckResponse !== 'boolean' && AdShieldCDNCheckResponse.StatusCode === 200 &&
    AdShieldCDNCheckResponse.Body.includes('This domain is a part of the <a href="https://www.ad-shield.io/">Ad-Shield</a> (ad-shield.io) platform,')
}