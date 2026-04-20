import * as Zod from 'zod'
import * as Process from 'node:process'
import { FetchAdShieldDomains, type TASDomainContainer } from './references/index.js'
import { SafeInitCwd } from './utils/safe-init-cwd.js'

export type BuildOptions = {
  Minify: boolean
  BuildType: 'production' | 'development',
  SubscriptionUrl: string,
  Version?: string
}

export class Build {
  protected Options: {
    Minify: boolean
    BuildType: 'production' | 'development'
    SubscriptionUrl: URL
    Version?: string
  } | undefined = undefined
  protected ProjectRoot = SafeInitCwd({ Cwd: Process.cwd(), InitCwd: Process.env.INIT_CWD })
  protected FetchedDomains: TASDomainContainer = new Map()

  constructor(Option: BuildOptions) {
    this.Options = Zod.strictObject({
      Minify: Zod.boolean(),
      BuildType: Zod.enum(['production', 'development']),
      SubscriptionUrl: Zod.string().transform(Value => new URL(Value)).default(new URL('https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/tinyShield.user.js')),
      Version: Zod.string().optional()
    }).parse(Option)
  }

  async Init() {
    console.log('[build-core.ts] this.FetchDomains is empty. Fetching domains started.')
    this.FetchedDomains = await FetchAdShieldDomains()
    console.log('[build-core.ts] Fetching domains completed.')
  }

  protected CopyStateFrom(From: Build): void {
    this.Options = From.Options
    this.ProjectRoot = From.ProjectRoot
    this.FetchedDomains = From.FetchedDomains
  }
}