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