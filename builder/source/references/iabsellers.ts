import * as Zod from 'zod'
import { HTTPSRequest } from '@typescriptprime/securereq'


const IABSellersJsonURL = 'https://info.ad-shield.io/sellers.json'

export async function FetchIABSellersJsonData(): Promise<string[]> {
  const IABSellersJsonResponse: { StatusCode: number, Headers: Record<string, string | string[]>, Body: unknown } = await HTTPSRequest(new URL(IABSellersJsonURL), { ExpectedAs: 'JSON' })
  let IABSellersJsonData =IABSellersJsonResponse.Body as {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    sellers: Array<{
      // eslint-disable-next-line @typescript-eslint/naming-convention
      seller_id: number,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      seller_type: string,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      name: string,
      // eslint-disable-next-line @typescript-eslint/naming-convention
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