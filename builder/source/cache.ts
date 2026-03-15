import * as Zod from 'zod'
import * as Fs from 'node:fs'
import * as Path from 'node:path'
import * as Process from 'node:process'
import { FetchAdShieldDomains } from './references/index.js'
import { SafeInitCwd } from './utils/safe-init-cwd.js'

const CachePath = Path.resolve(SafeInitCwd({ Cwd: Process.cwd(), InitCwd: Process.env.INIT_CWD }), '.buildcache')
const CacheDomainsPath = Path.join(CachePath, 'domains.json')

export function CreateCache(Domains: Set<string>) {
  Fs.mkdirSync(CachePath, { recursive: true })

  if (!Fs.statSync(CachePath).isDirectory()) {
    throw new Error('.buildcache exists and is not a directory!')
  }

  try {
    Fs.writeFileSync(
      CacheDomainsPath,
      JSON.stringify([...Domains], null, 2),
      { encoding: 'utf-8', flag: 'wx' },
    )
  } catch (Err) {
    if ((Err as NodeJS.ErrnoException).code === 'EEXIST') {
      throw new Error('Cache already exists!')
    }
    throw Err
  }
}

export async function LoadCache(): Promise<Set<string>> {
  let DomainsRaw: string

  try {
    DomainsRaw = Fs.readFileSync(CacheDomainsPath, { encoding: 'utf-8' })
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error('Cache does not exist!')
    }
    throw error
  }

  let DomainsArray: unknown
  try {
    DomainsArray = JSON.parse(DomainsRaw)
  } catch {
    throw new Error('Cache is corrupted!')
  }

  const ParsedDomains = await Zod.array(
    Zod.string().refine((Value) => {
      try {
        new URLPattern(`https://${Value}/`)
        return true
      } catch {
        return false
      }
    }),
  ).parseAsync(DomainsArray)

  return new Set(ParsedDomains)
}

export async function LoadDomainsFromCache(): Promise<Set<string>> {
  try {
    return await LoadCache()
  } catch {
    const Domains = await FetchAdShieldDomains()
    try {
      CreateCache(Domains)
      return Domains
    } catch (Err: unknown) {
      if ((Err as NodeJS.ErrnoException).code === 'EEXIST') {
        return await LoadCache()
      }
      throw Err
    }
  }
}