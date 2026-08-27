import * as Zod from 'zod'
import { SimpleSecureReq } from '@typescriptprime/securereq'

const IABSellersJsonURL = 'https://info.ad-shield.io/sellers.json'

export async function FetchIABSellersJsonData(): Promise<string[]> {
  const IABSellersJsonResponse = await SimpleSecureReq.Request(new URL(IABSellersJsonURL), { ExpectedAs: 'JSON' })
  let IABSellersJsonData = IABSellersJsonResponse.Body as {
    // oxlint-disable-next-line tinyshield/pascal-case
    sellers: Array<{
      // oxlint-disable-next-line tinyshield/pascal-case
      seller_id: number,
      // oxlint-disable-next-line tinyshield/pascal-case
      seller_type: string,
      // oxlint-disable-next-line tinyshield/pascal-case
      name: string,
      // oxlint-disable-next-line tinyshield/pascal-case
      domain: string
    }>
  }
  IABSellersJsonData = await Zod.object({
    sellers: Zod.array(Zod.object({
      seller_id: Zod.number(),
      seller_type: Zod.string(),
      name: Zod.string(),
      domain: Zod.string().refine(D => {
        try {
          new URL(`https://${D}`)
        } catch {
          return false
        }
        return true
      })
    }))
  }).parseAsync(IABSellersJsonData)
  return [...new Set(IABSellersJsonData.sellers.map(S => S.domain))]
}
