import { test, expect } from 'vitest'
import { DiscardResolvedDupWildcard } from '@filteringdev/tinyshield-lib/references'

test('DiscardResolvedDupWildcard removes resolved duplicate wildcards', () => {
  const Input = new Set(['google.com', 'google.co.kr', 'google.org', 'example.com', 'example.org', 'duck.com'])
  const Expected = new Set(['google.*', 'example.*', 'duck.com'])

  return expect(DiscardResolvedDupWildcard(Input)).toEqual(Expected)
})

test('DiscardResolvedDupWildcard does not remove non-duplicate wildcards', () => {
  const Input = new Set(['google.com', 'chatgpt.com', 'claude.ai', 'gemini.google.com', 'duck.com'])
  const Expected = new Set(['google.com', 'chatgpt.com', 'claude.ai', 'duck.com'])

  return expect(DiscardResolvedDupWildcard(Input)).toEqual(Expected)
})

test('DiscardResolvedDupWildcard does not remove non-duplicate wildcards with multiple subdomains', () => {
  const Input = new Set(['access.chatgpt.com', 'info.chatgpt.com', 'access.claude.ai', 'info.claude.ai', 'access.huggingface.co', 'info.huggingface.co'])

  return expect(DiscardResolvedDupWildcard(Input)).toEqual(Input)
})

test('DiscardResolvedDupWildcard removes resolved duplicate wildcards with multiple subdomains', () => {
  const Input = new Set(['google.*', 'access.google.*', 'google.com', 'google.co.kr'])
  const Expected = new Set(['google.*'])

  return expect(DiscardResolvedDupWildcard(Input)).toEqual(Expected)
})

test('DiscardResolvedDupWildcard handles nested wildcard scenarios', () => {
  const Input = new Set(['token.google.*', 'access.google.*', 'tools.google.com', 'google.google.co.kr'])
  const Expected = new Set(['token.google.*', 'access.google.*', 'tools.google.*', 'google.google.*'])

  return expect(DiscardResolvedDupWildcard(Input)).toEqual(Expected)
})

test('DiscardResolvedDupWildcard handles complex wildcard scenarios', () => {
  const Input = new Set(['token.google.*', 'access.google.*', 'tools.google.com', 'google.google.co.kr', 'example.*', 'example.com', 'rust-lang.org'])
  const Expected = new Set(['token.google.*', 'access.google.*', 'tools.google.*', 'google.google.*', 'example.*', 'rust-lang.org'])

  return expect(DiscardResolvedDupWildcard(Input)).toEqual(Expected)
})
