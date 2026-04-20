import * as TLDTS from 'tldts'
import { PublicSuffixList } from './wildcard-suffix-converter.js'

type ParsedEntry = {
  Entry: string
  RootLabel: string
  Stem: string
  PublicSuffix: string | null
  WildcardSuffix: boolean
}

function ParseEntry(Entry: string): ParsedEntry {
  if (Entry.endsWith('.*')) {
    const Stem = Entry.slice(0, -2)
    const RootLabel = Stem.split('.').at(-1) ?? Stem
    return {
      Entry,
      RootLabel,
      Stem,
      PublicSuffix: null,
      WildcardSuffix: true
    }
  }

  const Parsed = TLDTS.parse(Entry)
  if (Parsed.publicSuffix) {
    PublicSuffixList.add(Parsed.publicSuffix)
  }

  if (Parsed.hostname && Parsed.publicSuffix && Parsed.hostname.endsWith(`.${Parsed.publicSuffix}`)) {
    return {
      Entry,
      RootLabel: Parsed.domainWithoutSuffix ?? Parsed.hostname,
      Stem: Parsed.hostname.slice(0, -(Parsed.publicSuffix.length + 1)),
      PublicSuffix: Parsed.publicSuffix,
      WildcardSuffix: false
    }
  }

  const Stem = Parsed.hostname ?? Entry
  return {
    Entry,
    RootLabel: Stem.split('.').at(-1) ?? Stem,
    Stem,
    PublicSuffix: Parsed.publicSuffix,
    WildcardSuffix: false
  }
}

function IsCoveredByParent(Child: ParsedEntry, Parent: ParsedEntry): boolean {
  if (Child.Stem === Parent.Stem || !Child.Stem.endsWith(`.${Parent.Stem}`)) {
    return false
  }

  if (Parent.WildcardSuffix) {
    return true
  }

  return !Child.WildcardSuffix && Child.PublicSuffix === Parent.PublicSuffix
}

export function RegroupDomainTldLevel(OriginSet: Set<string>): Set<Set<string>> {
  const ParsedEntries = [...OriginSet].map(ParseEntry)
  const WithoutCoveredSubdomains = ParsedEntries.filter(
    Entry => !ParsedEntries.some(Parent => Parent.Entry !== Entry.Entry && IsCoveredByParent(Entry, Parent))
  )

  const RootLevelDomains = new Map<string, string>()
  const Groups = new Map<string, Set<string>>()

  for (const Entry of WithoutCoveredSubdomains) {
    if (Entry.Stem === Entry.RootLabel) {
      const Existing = RootLevelDomains.get(Entry.RootLabel)
      if (Existing && Existing !== Entry.Entry) {
        throw new Error('RegroupDomainTldLevel: Found multiple domains with the same TLD level. Use DiscardResolvedDupWildcard func first before using RegroupDomainTldLevel.')
      }

      RootLevelDomains.set(Entry.RootLabel, Entry.Entry)
    }

    const Group = Groups.get(Entry.RootLabel)
    if (typeof Group === 'undefined') {
      Groups.set(Entry.RootLabel, new Set([Entry.Entry]))
      continue
    }

    Group.add(Entry.Entry)
  }

  return new Set(Groups.values())
}
