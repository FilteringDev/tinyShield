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

export function DiscardResolvedDupWildcard(OriginSet: Set<string>): Set<string> {
  const ParsedEntries = [...OriginSet].map(ParseEntry)
  const RootsWithWildcard = new Set(
    ParsedEntries
      .filter(Entry => Entry.WildcardSuffix)
      .map(Entry => Entry.RootLabel)
  )

  const ConcreteStemCounts = new Map<string, number>()
  ParsedEntries
    .filter(Entry => !Entry.WildcardSuffix)
    .forEach(Entry => ConcreteStemCounts.set(Entry.Stem, (ConcreteStemCounts.get(Entry.Stem) ?? 0) + 1))

  const NormalizedEntries = ParsedEntries.map(Entry => {
    if (Entry.WildcardSuffix) {
      return Entry
    }

    if (RootsWithWildcard.has(Entry.RootLabel) || (ConcreteStemCounts.get(Entry.Stem) ?? 0) >= 2) {
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
