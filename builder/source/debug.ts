
import * as Chokidar from 'chokidar'
import * as Process from 'node:process'
import * as Crypto from 'node:crypto'
import { RunDebugServer } from './utils/http-server.js'
import { Build } from './build.js'

let ProjectRoot = Process.cwd()
if (Process.cwd().endsWith('/builder')) {
  ProjectRoot = Process.cwd().replaceAll(/\/builder$/g, '')
}
const WatchingGlob = [];
['builder/', 'userscript/', ''].forEach(Dir => {
  WatchingGlob.push(`${ProjectRoot}/${Dir}sources/**/*.ts`)
  WatchingGlob.push(`${ProjectRoot}/${Dir}sources/**/*.json`)
  WatchingGlob.push(`${ProjectRoot}/${Dir}sources/**/*.txt`)
})
const Watcher = Chokidar.watch([
  `${ProjectRoot}/sources/**/*.ts`,
  `${ProjectRoot}/sources/**/*.json`
], {
  cwd: ProjectRoot,
  ignored: '**/node_modules/**',
})

let BuildCooldownTimer: NodeJS.Timeout = null
let ShouldPreventHTTPResponse = false
Watcher.on('all', (WatcherEvent, WatcherPath) => {
  clearTimeout(BuildCooldownTimer)
  BuildCooldownTimer = setTimeout(async () => {
    console.log(`Detected file change (${WatcherEvent}):`, WatcherPath)
    ShouldPreventHTTPResponse = true
    await Build({ Minify: false, UseCache: true, BuildType: 'development', SubscriptionUrl: `http://localhost:${RandomPort}/tinyShield.dev.user.js` })
    ShouldPreventHTTPResponse = false
  }, 1500)
})

let RandomPort = Crypto.randomInt(8000, 8999)
await Build({ Minify: false, UseCache: true, BuildType: 'development', SubscriptionUrl: `http://localhost:${RandomPort}/tinyShield.dev.user.js` })
RunDebugServer(RandomPort, ['tinyShield.dev.user.js'], ShouldPreventHTTPResponse)
console.log(`Debug HTTP server running on http://localhost:${RandomPort}/tinyShield.dev.user.js`)