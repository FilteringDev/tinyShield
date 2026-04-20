import { FetchAdShieldDomainsFromFiltersLists } from './filterslists.js'
import { FetchIABSellersJsonData } from './iabsellers.js'
import { DiscardResolvedDupWildcard } from '@builder/utils/discard-resolved-dup-wildcard.js'
import { RegroupDomainTldLevel } from '@builder/utils/regroup-domain-tldlevel.js'
import { ConvertWildcardSuffixToRegexPattern } from '@builder/utils/wildcard-suffix-converter.js'
import { CustomDefinedMatches, CustomExcludeMatches } from './custom-defined.js'

export type TASDomainContainer = Map<'Normal', Set<string>> & Map<'Full', Set<string>> & Map<'EachDomain', Set<Set<string>>> & Map<'EachDomainFull', Set<Set<string>>>

function ConvertToFlatFullDomains(Origin: Set<string>): Set<string> {
  return new Set<string>([...Origin].flatMap(Domain => ConvertWildcardSuffixToRegexPattern(Domain)))
}

function IsGroupedDomains(Origin: Set<string> | Set<Set<string>>): Origin is Set<Set<string>> {
  const FirstValue = Origin.values().next().value
  return typeof FirstValue !== 'string' && typeof FirstValue !== 'undefined'
}

function ConvertToFullDomains(Origin: Set<string>): Set<string>
function ConvertToFullDomains(Origin: Set<Set<string>>): Set<Set<string>>
function ConvertToFullDomains(Origin: Set<string> | Set<Set<string>>): Set<string> | Set<Set<string>> {
  if (IsGroupedDomains(Origin)) {
    return new Set<Set<string>>([...Origin].map(DomainGroup => ConvertToFlatFullDomains(DomainGroup)))
  }

  return ConvertToFlatFullDomains(Origin)
}

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
  const FullDomains = ConvertToFullDomains(NormalDomains)
  const EachDomain = RegroupDomainTldLevel(NormalDomains)
  const EachDomainFull = ConvertToFullDomains(EachDomain)

  Result.set('Normal', NormalDomains)
  Result.set('Full', FullDomains)
  Result.set('EachDomain', EachDomain)
  Result.set('EachDomainFull', EachDomainFull)

  return Result
}
