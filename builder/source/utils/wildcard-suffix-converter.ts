const PublicSuffixList = [
  'com', 'org', 'co', 'de', 'ru', 'fr', 'me', 'it', 'nl', 'io', 'cc', 'in', 'pl', 'xyz', 'es', 'se', 'uk', 'tv', 'info',
  'site', 'us', 'online', 'ch', 'at', 'eu', 'top', 'be', 'cz', 'app', 'ca', 'to', 'jp', 'dev', 'kr'
]

export function ConvertWildcardSuffixToRegexPattern(Domain: string): string[] {
  const Result: string[] = []
  PublicSuffixList.forEach(Suffix => {
    Result.push(Domain.replaceAll(/\.\*$/g, '.' + Suffix))
  })
  return Result
}