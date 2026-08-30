import { test, expect } from 'vitest'
import { RegroupDomainTldLevel } from '@filteringdev/tinyshield-lib/references'

test('RegroupDomainTldLevel discard subdomain elements only if their parent domain exists', () => {
  const Origin = new Set(['duckduckgo.com', 'access.duckduckgo.com', 'google.com', 'www.google.com'])
  const Expected = new Set([new Set(['duckduckgo.com']), new Set(['google.com'])])
  const Actual = RegroupDomainTldLevel(Origin)
  return expect(Actual).toEqual(Expected)
})

test('RegroupDomainTldLevel keep subdomain elements if their parent domain does not exist', () => {
  const Origin = new Set(['access.duckduckgo.com', 'token.duckduckgo.com', 'www.google.com', 'accounts.google.com'])
  const Expected = new Set([new Set(['access.duckduckgo.com', 'token.duckduckgo.com']), new Set(['www.google.com', 'accounts.google.com'])])
  const Actual = RegroupDomainTldLevel(Origin)
  return expect(Actual).toEqual(Expected)
})

test('RegroupDomainTldLevel throw error if multiple domains with the same TLD level exist', () => {
  const Origin = new Set(['duckduckgo.com', 'duckduckgo.co.kr', 'duckduckgo.co.jp'])
  let ErrorInstance: Error | undefined

  try {
    RegroupDomainTldLevel(Origin)
  } catch (Error_) {
    ErrorInstance = Error_ as Error
  }

  const Message = 'RegroupDomainTldLevel: Found multiple domains with the same TLD level. Use DiscardResolvedDupWildcard func first before using RegroupDomainTldLevel.'
  return expect(ErrorInstance?.message).toBe(Message)
})
