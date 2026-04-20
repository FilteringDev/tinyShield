import Test from 'ava'
import { RegroupDomainTldLevel } from '@builder/utils/regroup-domain-tldlevel.js'

Test('RegroupDomainTldLevel discard subdomain elements only if their parent domain exists', T => {
  const Origin = new Set(['duckduckgo.com', 'access.duckduckgo.com', 'google.com', 'www.google.com'])
  const Expected = new Set([new Set(['duckduckgo.com']), new Set(['google.com'])])
  const Actual = RegroupDomainTldLevel(Origin)
  return T.deepEqual(Actual, Expected)
})

Test('RegroupDomainTldLevel keep subdomain elements if their parent domain does not exist', T => {
  const Origin = new Set(['access.duckduckgo.com', 'token.duckduckgo.com', 'www.google.com', 'accounts.google.com'])
  const Expected = new Set([new Set(['access.duckduckgo.com', 'token.duckduckgo.com']), new Set(['www.google.com', 'accounts.google.com'])])
  const Actual = RegroupDomainTldLevel(Origin)
  return T.deepEqual(Actual, Expected)
})

Test('RegroupDomainTldLevel throw error if multiple domains with the same TLD level exist', T => {
  const Origin = new Set(['duckduckgo.com', 'duckduckgo.co.kr', 'duckduckgo.co.jp'])
  const ErrorInstance = T.throws(() => RegroupDomainTldLevel(Origin))
  const Message = 'RegroupDomainTldLevel: Found multiple domains with the same TLD level. Use DiscardResolvedDupWildcard func first before using RegroupDomainTldLevel.'
  return T.is(ErrorInstance?.message, Message)
})