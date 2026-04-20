import Test from 'ava'
import { DiscardResolvedDupWildcard } from '@builder/utils/discard-resolved-dup-wildcard.js'

Test('DiscardResolvedDupWildcard removes resolved duplicate wildcards', T => {
  const Input = new Set(['google.com', 'google.co.kr', 'google.org', 'example.com', 'example.org', 'duck.com'])
  const Expected = new Set(['google.*', 'example.*', 'duck.com'])

  return T.deepEqual(DiscardResolvedDupWildcard(Input), Expected)
})

Test('DiscardResolvedDupWildcard does not remove non-duplicate wildcards', T => {
  const Input = new Set(['google.com', 'chatgpt.com', 'claude.ai', 'gemini.google.com', 'duck.com'])
  const Expected = new Set(['google.com', 'chatgpt.com', 'claude.ai', 'duck.com'])
  
  return T.deepEqual(DiscardResolvedDupWildcard(Input), Expected)
})

Test('DiscardResolvedDupWildcard does not remove non-duplicate wildcards with multiple subdomains', T => {
  const Input = new Set(['access.chatgpt.com', 'info.chatgpt.com', 'access.claude.ai', 'info.claude.ai', 'access.huggingface.co', 'info.huggingface.co'])
  
  return T.deepEqual(DiscardResolvedDupWildcard(Input), Input)
})

Test('DiscardResolvedDupWildcard removes resolved duplicate wildcards with multiple subdomains', T => {
  const Input = new Set(['google.*', 'access.google.*', 'google.com', 'google.co.kr'])
  const Expected = new Set(['google.*'])
  
  return T.deepEqual(DiscardResolvedDupWildcard(Input), Expected)
})

Test('DiscardResolvedDupWildcard handles nested wildcard scenarios', T => {
  const Input = new Set(['token.google.*', 'access.google.*', 'tools.google.com', 'google.google.co.kr'])
  const Expected = new Set(['token.google.*', 'access.google.*', 'tools.google.*', 'google.google.*'])

  return T.deepEqual(DiscardResolvedDupWildcard(Input), Expected)
})

Test('DiscardResolvedDupWildcard handles complex wildcard scenarios', T => {
  const Input = new Set(['token.google.*', 'access.google.*', 'tools.google.com', 'google.google.co.kr', 'example.*', 'example.com', 'rust-lang.org'])
  const Expected = new Set(['token.google.*', 'access.google.*', 'tools.google.*', 'google.google.*','example.*', 'rust-lang.org'])

  return T.deepEqual(DiscardResolvedDupWildcard(Input), Expected)
})