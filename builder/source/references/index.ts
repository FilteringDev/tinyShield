import { FetchAdShieldDomainsFromFiltersLists } from './filterslists.js'
import { FetchIABSellersJsonData } from './iabsellers.js'
import { DiscardResolvedDupWildcard } from '@builder/utils/discard-resolved-dup-wildcard.js'
import { RegroupDomainTldLevel } from '@builder/utils/regroup-domain-tldlevel.js'
import { ConvertWildcardSuffixToRegexPattern } from '@builder/utils/wildcard-suffix-converter.js'
import { CustomDefinedMatches, CustomExcludeMatches } from './custom-defined.js'

type TASDomainContainer = Map<'Normal', Set<string>> & Map<'Full', Set<string>> & Map<'EachDomain', Set<Set<string>>> & Map<'EachDomainFull', Set<Set<string>>>

export async function FetchAdShieldDomains(): Promise<TASDomainContainer> {
  const [IABSellersDomains, FiltersListsDomains] = await Promise.all([
    FetchIABSellersJsonData(),
    FetchAdShieldDomainsFromFiltersLists()
  ])

  const CombinedDomains = new Set<string>([...IABSellersDomains, ...FiltersListsDomains])
  const Result: TASDomainContainer = new Map()
  const NormalDomains = DiscardResolvedDupWildcard(CombinedDomains)
  CustomDefinedMatches.forEach(Match => NormalDomains.add(Match))
  CustomExcludeMatches.forEach(Match => NormalDomains.delete(Match))
  const FullDomains = new Set<string>([...NormalDomains].flatMap(Domain => ConvertWildcardSuffixToRegexPattern(Domain)))

  Result.set('Normal', NormalDomains)
  Result.set('Full', FullDomains)
  Result.set('EachDomain', RegroupDomainTldLevel(NormalDomains))
  Result.set('EachDomainFull', RegroupDomainTldLevel(FullDomains))

  return Result
}
