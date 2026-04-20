import * as TLD from 'tldts'
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
  CombinedDomains.forEach(Domain => {
    const Parsed = TLD.parse(Domain)
    if (Domain.startsWith('~') && !Parsed.domain?.startsWith('~')) CombinedDomains.delete(Domain)
  })
  CustomDefinedMatches.forEach(Match => CombinedDomains.add(Match))
  CustomExcludeMatches.forEach(Match => CombinedDomains.delete(Match))
  const Result: TASDomainContainer = new Map()
  const NormalDomains = DiscardResolvedDupWildcard(CombinedDomains)
  const FullDomains = ConvertToFullDomains(NormalDomains)
  const EachDomain = RegroupDomainTldLevel(NormalDomains)
  const EachDomainFull = ConvertToFullDomains(EachDomain)

  Result.set('Normal', NormalDomains)
  Result.set('Full', FullDomains)
  Result.set('EachDomain', EachDomain)
  Result.set('EachDomainFull', EachDomainFull)

  return Result
}
