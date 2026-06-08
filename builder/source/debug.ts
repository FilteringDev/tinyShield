import * as Chokidar from 'chokidar'
import * as Process from 'node:process'
import * as Crypto from 'node:crypto'
import * as Fs from 'node:fs'
import { RunDebugServer } from './utils/http-server.js'
import { StandardBuild } from './build.js'
import { SafeInitCwd } from './utils/safe-init-cwd.js'
import { Build } from './build-core.js'

let ProjectRoot = SafeInitCwd({ Cwd: Process.cwd(), InitCwd: Process.env.INIT_CWD })
const WatchingGlob: string[] = []
for (const Dir of ['builder/', 'userscript/', 'libs/', '']) {
  WatchingGlob.push(...Fs.globSync(`${ProjectRoot}/${Dir}source/**/*.ts`))
  WatchingGlob.push(...Fs.globSync(`${ProjectRoot}/${Dir}source/**/*.json`))
  WatchingGlob.push(...Fs.globSync(`${ProjectRoot}/${Dir}source/**/*.txt`))
}
const Watcher = Chokidar.watch([...WatchingGlob], {
  ignored: '**/node_modules/**',
  ignoreInitial: true,
})

let BuildCooldownTimer: NodeJS.Timeout | null = null
let ActiveBuildController: AbortController | null = null
let BuildQueue: Promise<void> = Promise.resolve()
let Version: number = 0
let RandomPort = Crypto.randomInt(8000, 8999)
const CoreBuildInstance = new Build({ Version: `0.0.${Version}`, Minify: false, BuildType: 'development', SubscriptionUrl: `http://localhost:${RandomPort}/tinyShield.dev.user.js` })

type DebugBuildContext = {
  Reason: 'initial' | 'change'
  DebounceMs: number
  WatcherEvent?: string
  WatcherPath?: string
}

function EnqueueDebugBuild(BuildController: AbortController, Context: DebugBuildContext) {
  BuildQueue = BuildQueue.then(async () => {
    try {
      await RunDebugBuild(BuildController, Context)
    } catch (BuildError) {
      if (BuildController.signal.aborted) {
        return
      }

      console.error('Debug build failed:', BuildError)
      if (ActiveBuildController === BuildController) {
        ActiveBuildController = null
      }
    }
  })
}

function ScheduleDebugBuild(Context: DebugBuildContext) {
  if (BuildCooldownTimer) {
    clearTimeout(BuildCooldownTimer)
    BuildCooldownTimer = null
  }

  ActiveBuildController?.abort()
  const BuildController = new AbortController()
  ActiveBuildController = BuildController

  if (Context.DebounceMs <= 0) {
    EnqueueDebugBuild(BuildController, Context)
    return
  }

  BuildCooldownTimer = setTimeout(() => {
    BuildCooldownTimer = null
    EnqueueDebugBuild(BuildController, Context)
  }, Context.DebounceMs)
}

async function RunDebugBuild(BuildController: AbortController, Context: DebugBuildContext) {
  if (BuildController.signal.aborted) {
    return
  }

  if (Context.Reason === 'initial') {
    console.log('Starting initial debug build.')
  } else {
    const WatcherEvent = Context.WatcherEvent ?? 'unknown'
    const WatcherPath = Context.WatcherPath ?? 'unknown'
    console.log(`Detected file change (${WatcherEvent}):`, WatcherPath)
  }

  await new StandardBuild(CoreBuildInstance, { Version: `0.0.${Version}`, Minify: false, BuildType: 'development', SubscriptionUrl: `http://localhost:${RandomPort}/tinyShield.dev.user.js` }).Build()

  if (BuildController.signal.aborted) {
    return
  }

  Version++
  if (ActiveBuildController === BuildController) {
    ActiveBuildController = null
  }
}

await CoreBuildInstance.Init()
Watcher.on('all', (WatcherEvent, WatcherPath) => {
  ScheduleDebugBuild({
    Reason: 'change',
    DebounceMs: 1500,
    WatcherEvent,
    WatcherPath
  })
})

RunDebugServer(RandomPort, ['tinyShield.dev.user.js'], () => ActiveBuildController?.signal ?? null)
console.log(`Debug HTTP server running on http://localhost:${RandomPort}/tinyShield.dev.user.js`)
ScheduleDebugBuild({ Reason: 'initial', DebounceMs: 0 })
