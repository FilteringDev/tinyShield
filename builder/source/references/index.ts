import { FetchAdShieldDomainsFromFiltersLists } from './filterslists.js'
import { FetchIABSellersJsonData } from './iabsellers.js'

export async function FetchAdShieldDomains(): Promise<Set<string>> {
  const [IABSellersDomains, FiltersListsDomains] = await Promise.all([
    FetchIABSellersJsonData(),
    FetchAdShieldDomainsFromFiltersLists()
  ])

  const CombinedDomains = new Set<string>([...IABSellersDomains, ...FiltersListsDomains])
  return CombinedDomains
}