import { expect, test } from 'vitest'
import { Script } from 'node:vm'
import { CreateBanner } from '../../../builder/source/banner/index.js'

test('banner includes only collected domains and explicit wildcard suffixes', () => {
  const Url = new URL('https://example.com/')
  const Banner = CreateBanner({
    Version: '1', BuildType: 'production', Domains: new Set(['example.com', 'example.net', 'wild.*']),
    Author: 'author', Name: 'name', Namespace: 'namespace', HomepageURL: Url, SupportURL: Url,
    UpdateURL: Url, DownloadURL: Url, License: 'license', Description: { en: 'description' }
  })
  const Patterns = [...Banner.matchAll(/^\/\/ @include\s+\/(.*)\/$/gm)].map(Match => new RegExp(Match[1]))
  for (const Match of Banner.matchAll(/^\/\/ @include\s+(\/.*\/)$/gm)) {
    expect(() => new Script(Match[1])).not.toThrow()
  }
  const Matches = (Input: string) => Patterns.some(Pattern => Pattern.test(Input))

  expect(Patterns).toHaveLength(3)
  expect(Matches('https://sub.example.com:8443/path')).toBe(true)
  expect(Matches('http://example.net/?query')).toBe(true)
  expect(Matches('https://example.org/')).toBe(false)
  expect(Matches('https://notexample.com/')).toBe(false)
  expect(Matches('https://example.com.evil/')).toBe(false)
  expect(Matches('https://wild.com@evil.test/')).toBe(false)
  expect(Matches('https://example.com./')).toBe(true)
  expect(Matches('ftp://example.com/')).toBe(false)
  expect(Matches('https://sub.wild.co.uk/')).toBe(true)
  expect(Matches('https://wild.com.evil/')).toBe(true)
})