import * as TLD from 'tldts'
import { CustomDefinedMatches, CustomExcludeMatches } from './custom-defined.js'
import { FetchAdShieldDomainsFromFiltersLists } from './filterslists.js'
import { FetchIABSellersJsonData } from './iabsellers.js'
import { DiscardResolvedDupWildcard } from './utils/discard-resolved-dup-wildcard.js'
import { GetDomainRootLabel, RegroupDomainTldLevel } from './utils/regroup-domain-tldlevel.js'

export { CustomDefinedMatches, CustomExcludeMatches } from './custom-defined.js'
export { FetchAdShieldDomainsFromFiltersLists } from './filterslists.js'
export { FetchIABSellersJsonData } from './iabsellers.js'
export { IndexAdShieldDomainsFromAG } from './filterslists/ADG.js'
export { IndexAdShieldDomainsFromUBO } from './filterslists/uBO.js'
export { AdShieldCDNDomains, IsAdShieldCDNDomain } from './filterslists/keywords.js'
export { DiscardResolvedDupWildcard } from './utils/discard-resolved-dup-wildcard.js'
export { RegroupDomainTldLevel } from './utils/regroup-domain-tldlevel.js'

export type TASDomainContainer =
  Map<'Normal', Set<string>> &
  Map<'Full', Set<string>> &
  Map<'EachDomain', Set<Set<string>>> &
  Map<'EachDomainFull', Set<Set<string>>> &
  Map<'Groups', Map<Set<string>, Set<string>>>

export function CreateDomainViews(Domains: Set<string>): TASDomainContainer {
  const FullDomains = new Set([...Domains].sort())
  const NormalDomains = DiscardResolvedDupWildcard(FullDomains)
  const EachDomain = RegroupDomainTldLevel(NormalDomains)
  const MatchingGroups = new Map<string, Set<string>>()
  for (const Domain of FullDomains) {
    const Root = GetDomainRootLabel(Domain)
    const Group = MatchingGroups.get(Root) ?? new Set<string>()
    Group.add(Domain)
    MatchingGroups.set(Root, Group)
  }

  const Groups = new Map([...EachDomain].map(Group => [Group, MatchingGroups.get(GetDomainRootLabel(Group.values().next().value!))!] as const))
  const EachDomainFull = new Set(Groups.values())
  const Result: TASDomainContainer = new Map()
  Result.set('Normal', NormalDomains)
  Result.set('Full', FullDomains)
  Result.set('EachDomain', EachDomain)
  Result.set('EachDomainFull', EachDomainFull)
  Result.set('Groups', Groups)
  return Result
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
  return CreateDomainViews(CombinedDomains)
}
