import { expect, test } from 'vitest'
import { CreateBanner } from '../../../builder/source/banner/index.js'

test('banner preserves explicit wildcard suffixes in match rules', () => {
  const Url = new URL('https://example.com/')
  const Banner = CreateBanner({
    Version: '1', BuildType: 'production', Domains: new Set(['example.com', 'example.net', 'wild.*']),
    Author: 'author', Name: 'name', Namespace: 'namespace', HomepageURL: Url, SupportURL: Url,
    UpdateURL: Url, DownloadURL: Url, License: 'license', Description: { en: 'description' }
  })
  expect(Banner.match(/^\/\/ @match\s+.*$/gm)).toEqual([
    '// @match      *://example.com/*',
    '// @match      *://*.example.com/*',
    '// @match      *://example.net/*',
    '// @match      *://*.example.net/*',
    '// @match      *://wild.*/*',
    '// @match      *://*.wild.*/*'
  ])
  expect(Banner).not.toContain('@include')
})

test('banner rejects an empty matching set but accepts wildcard-only inputs', () => {
  const Url = new URL('https://example.com/')
  const Options = {
    Version: '1', BuildType: 'production' as const, Domains: new Set<string>(),
    Author: 'author', Name: 'name', Namespace: 'namespace', HomepageURL: Url, SupportURL: Url,
    UpdateURL: Url, DownloadURL: Url, License: 'license', Description: { en: 'description' }
  }
  expect(() => CreateBanner(Options)).toThrow('No domains available')
  Options.Domains.add('wild.*')
  expect(CreateBanner(Options)).toContain('// @match      *://*.wild.*/*')
})