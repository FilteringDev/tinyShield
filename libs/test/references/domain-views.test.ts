import { expect, test } from 'vitest'
import { CreateDomainViews } from '@filteringdev/tinyshield-lib/references'

test('preserves collected domains and explicit wildcards in matching groups', () => {
  const Domains = new Set(['example.com', 'other.org', 'example.net', 'sub.example.com', 'wild.*'])
  const Views = CreateDomainViews(Domains)

  expect(Views.get('Normal')).toEqual(new Set(['example.*', 'other.org', 'wild.*']))
  expect(Views.get('Full')).toEqual(Domains)
  expect([...Views.get('EachDomain')!]).toEqual([
    new Set(['example.*']), new Set(['other.org']), new Set(['wild.*'])
  ])
  expect([...Views.get('EachDomainFull')!]).toEqual([
    new Set(['example.com', 'example.net', 'sub.example.com']), new Set(['other.org']), new Set(['wild.*'])
  ])
})

test('explicit wildcards and concrete domains remain one group', () => {
  const Domains = new Set(['example.*', 'example.com', 'sub.example.net'])
  const Views = CreateDomainViews(Domains)
  expect(Views.get('Normal')).toEqual(new Set(['example.*']))
  expect([...Views.get('EachDomainFull')!]).toEqual([Domains])
})

test('domain views and group names do not depend on input order', () => {
  const Domains = ['z.example.com', 'a.example.com', 'example.net', 'example.com', 'wild.*']
  const Forward = CreateDomainViews(new Set(Domains))
  const Reverse = CreateDomainViews(new Set([...Domains].reverse()))
  expect([...Forward.get('Normal')!]).toEqual([...Reverse.get('Normal')!])
  expect([...Forward.get('Groups')!].map(([Names, Matches]) => [[...Names], [...Matches]]))
    .toEqual([...Reverse.get('Groups')!].map(([Names, Matches]) => [[...Names], [...Matches]]))
})