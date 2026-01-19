
import * as Chokidar from 'chokidar'
import * as Process from 'node:process'
import * as Crypto from 'node:crypto'
import * as Fs from 'node:fs'
import { RunDebugServer } from './utils/http-server.js'
import { Build } from './build.js'

let ProjectRoot = Process.cwd()
if (Process.cwd().endsWith('/builder')) {
  ProjectRoot = Process.cwd().replaceAll(/\/builder$/g, '')
}
const WatchingGlob = [];
['builder/', 'userscript/', ''].forEach(Dir => {
  WatchingGlob.push(...Fs.globSync(`${ProjectRoot}/${Dir}source/**/*.ts`))
  WatchingGlob.push(...Fs.globSync(`${ProjectRoot}/${Dir}source/**/*.json`))
  WatchingGlob.push(...Fs.globSync(`${ProjectRoot}/${Dir}source/**/*.txt`))
})
const Watcher = Chokidar.watch([...WatchingGlob], {
  ignored: '**/node_modules/**',
})

let BuildCooldownTimer: NodeJS.Timeout = null
let ShouldPreventHTTPResponse = false
let Version: number = 0
Watcher.on('all', async (WatcherEvent, WatcherPath) => {
  clearTimeout(BuildCooldownTimer)
  BuildCooldownTimer = setTimeout(async () => {
    console.log(`Detected file change (${WatcherEvent}):`, WatcherPath)
    ShouldPreventHTTPResponse = true
    await Build({ Version: `0.0.${Version}`, Minify: false, UseCache: true, BuildType: 'development', SubscriptionUrl: `http://localhost:${RandomPort}/tinyShield.dev.user.js` })
    Version++
    ShouldPreventHTTPResponse = false
  }, 1500)
})

let RandomPort = Crypto.randomInt(8000, 8999)
RunDebugServer(RandomPort, ['tinyShield.dev.user.js'], ShouldPreventHTTPResponse)
console.log(`Debug HTTP server running on http://localhost:${RandomPort}/tinyShield.dev.user.js`)