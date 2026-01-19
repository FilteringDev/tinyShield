import { HTTPS2Request } from '@typescriptprime/securereq'
import * as AGTree from '@adguard/agtree'
import { AdShieldCDNDomains } from './keywords.js'

const UBOFilterListSpecificURL = 'https://ublockorigin.github.io/uAssets/filters/filters.min.txt'
const UBOFilterListAdShieldKeys = {
  Starting: '! SECTION: Ad-Shield',
  Ending: '! !SECTION: Ad-Shield'
}

export async function IndexAdShieldDomainsFromUBO(): Promise<Set<string>> {
  const FiltersListContent = await HTTPS2Request(new URL(UBOFilterListSpecificURL), { ExpectedAs: 'String' })
  const AGTreeFiltersList = AGTree.FilterListParser.parse(FiltersListContent.Body)
  let StartingLine = -1
  let EndingLine = -1
  for (const [Index, Filter] of AGTreeFiltersList.children.entries()) {
    if (Filter.category === 'Comment' && typeof Filter.raws.text === 'string' && Filter.raws.text.includes(UBOFilterListAdShieldKeys.Starting)) {
      StartingLine = Index
    } else if (Filter.category === 'Comment' && typeof Filter.raws.text === 'string' && Filter.raws.text.includes(UBOFilterListAdShieldKeys.Ending)) {
      EndingLine = Index
    } else if (StartingLine !== -1 && EndingLine !== -1) {
      break
    } else if (Index === AGTreeFiltersList.children.length - 1) {
      throw new Error('Could not find Ad-Shield ad reinsertion section in ' + UBOFilterListSpecificURL)
    }
  }
  const AdShieldFilters = AGTreeFiltersList.children.filter((Filter, Index) => Index > StartingLine && Index < EndingLine)

  const AdShieldDomains = new Set<string>()
  for (const Filter of AdShieldFilters) {
    if (Filter.category === 'Cosmetic' && Filter.type === 'ScriptletInjectionRule') {
      Filter.domains.children.forEach(Domain => AdShieldDomains.add(Domain.value))
    } else if (Filter.category === 'Cosmetic' && Filter.type === 'JsInjectionRule') {
      Filter.domains.children.forEach(Domain => AdShieldDomains.add(Domain.value))
    } else if (Filter.category === 'Network' && Filter.type === 'NetworkRule' && typeof Filter.modifiers !== 'undefined' && Filter.modifiers.children.some(M => M.name.value === 'domain')) {
      let DomainValue = Filter.modifiers.children.find(M => M.name.value === 'domain').value.value
      DomainValue.split('|').forEach(Domain => AdShieldDomains.add(Domain))
    }
  }

  let FilteredDomains = [...AdShieldDomains].filter(Domain => {
    try {
      new URLPattern(`https://${Domain}/`)
    } catch {
      return false
    }
    return !AdShieldCDNDomains.has(Domain)
  })

  return new Set(FilteredDomains)
}