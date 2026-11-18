import { createHash } from 'node:crypto'
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import { CreateDomainViews } from '@filteringdev/tinyshield-lib/references'
import { GroupedBuild } from '../../../builder/source/build-grouped.js'
import { StandardBuild } from '../../../builder/source/build.js'

class TestGroupedBuild extends GroupedBuild {
  constructor(Root: string, Domains: Set<string>) {
    super({ Minify: false, BuildType: 'development', SubscriptionUrl: 'https://example.com/tinyShield.user.js' })
    this.ProjectRoot = Root
    this.FetchedDomains = CreateDomainViews(Domains)
  }
}

class TestStandardBuild extends StandardBuild {
  constructor(Root: string, Domains: Set<string>) {
    super({ Minify: false, BuildType: 'development', SubscriptionUrl: 'https://example.com/tinyShield.user.js', Version: '1' })
    this.ProjectRoot = Root
    this.FetchedDomains = CreateDomainViews(Domains)
  }
}

test('group metadata maps collected domains without expanding wildcard suffixes', async () => {
  const Root = await mkdtemp(join(tmpdir(), 'tinyshield-group-'))
  try {
    const Directory = join(Root, 'dist/grouped/e')
    await mkdir(Directory, { recursive: true })
    const Content = 'grouped userscript'
    await writeFile(join(Directory, 'tinyShield-example.tld.user.js'), Content)
    const Builder = new TestGroupedBuild(Root, new Set(['example.*', 'example.com', 'example.net']))
    await Builder.MakeGroupMetadata()
    const Metadata: unknown = JSON.parse(await readFile(join(Root, 'dist/grouped/metadata.json'), 'utf8'))
    expect(Metadata).toEqual({
      DomainMapping: { 'example.*': 'example.tld', 'example.com': 'example.tld', 'example.net': 'example.tld' },
      FileMapping: {
        'example.tld': {
          SHA386: createHash('sha384').update(Content).digest('hex').toUpperCase(),
          FileName: 'tinyShield-example.tld.user.js'
        }
      }
    })
  } finally {
    await rm(Root, { recursive: true, force: true })
  }
})

test('standard and grouped workers build with collected matching rules', async () => {
  const Root = await mkdtemp(join(tmpdir(), 'tinyshield-build-'))
  try {
    await symlink(new URL('../../../builder/', import.meta.url).pathname, join(Root, 'builder'), 'dir')
    await symlink(new URL('../../../userscript/', import.meta.url).pathname, join(Root, 'userscript'), 'dir')
    await symlink(new URL('../../../package.json', import.meta.url).pathname, join(Root, 'package.json'))
    const Domains = new Set(['example.com', 'example.net', 'notebookcheck.*'])
    await new TestStandardBuild(Root, Domains).Build()
    const Builder = new TestGroupedBuild(Root, Domains)
    await Builder.Build()
    await Builder.MakeGroupMetadata()
    const Standard = await readFile(join(Root, 'dist/tinyShield.dev.user.js'), 'utf8')
    const Grouped = await readFile(join(Root, 'dist/grouped/e/tinyShield-example.tld.user.js'), 'utf8')
    const Notebookcheck = await readFile(join(Root, 'dist/grouped/n/tinyShield-notebookcheck.tld.user.js'), 'utf8')
    for (const Output of [Standard, Notebookcheck]) {
      expect(Output).toContain('@match      *://notebookcheck.*/*')
      expect(Output).toContain('@match      *://*.notebookcheck.*/*')
      expect(Output).not.toContain('@include')
    }
    for (const Output of [Standard, Grouped]) {
      expect(Output).toContain('@match      *://*.example.com/*')
      expect(Output).toContain('@match      *://*.example.net/*')
      expect(Output).not.toContain('example.org')
      expect(Output).not.toContain('example.*')
      expect(Output).not.toContain('@include')
    }
    expect(Grouped).not.toContain('notebookcheck.*')
  } finally {
    await rm(Root, { recursive: true, force: true })
  }
})