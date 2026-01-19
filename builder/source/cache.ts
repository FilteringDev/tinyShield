import * as Zod from 'zod'
import * as Fs from 'node:fs'
import * as Process from 'node:process'
import { FetchAdShieldDomains } from './references/index.js'

const CachePath = Process.cwd() + '/.buildcache'
const CacheDomainsPath = CachePath + '/domains.json'

export function CreateCache(Domains: Set<string>) {
  if (!Fs.existsSync(CachePath)) {
    Fs.mkdirSync(CachePath)
  } else if (!Fs.statSync(CachePath).isDirectory()) {
    throw new Error('.buildcache exists and is not a directory!')
  }
  if (Fs.existsSync(CacheDomainsPath)) {
    throw new Error('Cache already exists!')
  }
  Fs.writeFileSync(CacheDomainsPath, JSON.stringify([...Domains], null, 2), { encoding: 'utf-8' })
}

export async function LoadCache(): Promise<Set<string>> {
  if (!Fs.existsSync(CacheDomainsPath)) {
    throw new Error('Cache does not exist!')
  }
  const DomainsRaw = Fs.readFileSync(CacheDomainsPath, { encoding: 'utf-8' })
  const DomainsArray: string[] = JSON.parse(DomainsRaw)
  await Zod.array(Zod.string().refine((Value) => {
    try {
      new URLPattern(`https://${Value}/`)
      return true
    } catch {
      return false
    }
  })).parseAsync(DomainsArray)
  return new Set(DomainsArray)
}

export async function LoadDomainsFromCache(): Promise<Set<string>> {
  if (!Fs.existsSync(CacheDomainsPath)) {
    const Domains = await FetchAdShieldDomains()
    CreateCache(Domains)
    return Domains
  } else {
    return await LoadCache()
  }
}