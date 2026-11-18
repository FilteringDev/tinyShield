import * as TLDTS from 'tldts'

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
  if (Child.Stem === Parent.Stem) {
    return Parent.WildcardSuffix && !Child.WildcardSuffix
  }
  if (!Child.Stem.endsWith(`.${Parent.Stem}`)) {
    return false
  }

  if (Parent.WildcardSuffix) {
    return true
  }

  return !Child.WildcardSuffix && Child.PublicSuffix === Parent.PublicSuffix
}

export function DiscardResolvedDupWildcard(OriginSet: Set<string>): Set<string> {
  const ParsedEntries = [...OriginSet].map(ParseEntry)

  const ConcreteSuffixes = new Map<string, Set<string>>()
  ParsedEntries
    .filter(Entry => !Entry.WildcardSuffix && Entry.PublicSuffix)
    .forEach(Entry => {
      const Suffixes = ConcreteSuffixes.get(Entry.Stem) ?? new Set<string>()
      Suffixes.add(Entry.PublicSuffix!)
      ConcreteSuffixes.set(Entry.Stem, Suffixes)
    })

  const NormalizedEntries = ParsedEntries.map(Entry => {
    if (Entry.WildcardSuffix) {
      return Entry
    }

    if ((ConcreteSuffixes.get(Entry.Stem)?.size ?? 0) >= 2) {
      return ParseEntry(`${Entry.Stem}.*`)
    }

    return Entry
  })

  const Result = new Set<string>()
  const UniqueNormalizedEntries = [...new Map(NormalizedEntries.map(Entry => [Entry.Entry, Entry])).values()]
  for (const Entry of UniqueNormalizedEntries) {
    if (UniqueNormalizedEntries.some(Parent => Parent.Entry !== Entry.Entry && IsCoveredByParent(Entry, Parent))) {
      continue
    }

    Result.add(Entry.Entry)
  }

  return Result
}
