import { IndexAdShieldDomainsFromAG } from './filterslists/ADG.js'
import { IndexAdShieldDomainsFromUBO } from './filterslists/uBO.js'

export async function FetchAdShieldDomainsFromFiltersLists(): Promise<Set<string>> {
  const [AGDomains, UBODomains] = await Promise.all([
    IndexAdShieldDomainsFromAG(),
    IndexAdShieldDomainsFromUBO()
  ])

  const CombinedDomains = new Set<string>([...AGDomains, ...UBODomains])
  return CombinedDomains
}