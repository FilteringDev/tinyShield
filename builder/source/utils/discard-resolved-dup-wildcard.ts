import * as TLDTS from 'tldts'

export function DiscardResolvedDupWildcard(OriginSet: Set<string>): Set<string> {
  // Step 1: Remove subdomains whose registered domain already exists in the set
  const WithoutCoveredSubdomains = new Set<string>()
  for (const Entry of OriginSet) {
    const Parsed = TLDTS.parse(Entry)
    if (Parsed.subdomain && Parsed.domain && OriginSet.has(Parsed.domain)) {
      continue
    }
    WithoutCoveredSubdomains.add(Entry)
  }

  // Step 2: Group by domainWithoutSuffix
  const Groups = new Map<string, string[]>()
  for (const Entry of WithoutCoveredSubdomains) {
    const Parsed = TLDTS.parse(Entry)
    const Key = Parsed.domainWithoutSuffix ?? Entry
    const Group = Groups.get(Key)
    if (typeof Group === 'undefined') {
      Groups.set(Key, [Entry])
    } else {
      Group.push(Entry)
    }
  }

  // Step 3: Consolidate groups with 2+ top-level entries into wildcards
  const Result = new Set<string>()
  for (const [Key, Entries] of Groups) {
    if (Entries.length >= 2 && Entries.every(E => !TLDTS.parse(E).subdomain)) {
      Result.add(`${Key}.*`)
    } else {
      for (const Entry of Entries) {
        Result.add(Entry)
      }
    }
  }

  return Result
}
