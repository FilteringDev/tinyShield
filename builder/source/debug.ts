
import * as Chokidar from 'chokidar'
import * as Process from 'node:process'
import * as Crypto from 'node:crypto'
import { RunDebugServer } from './utils/http-server.js'
import { Build } from './build.js'

const ProcessCwd = Process.cwd()
const WatchingGlob = [];
['builder/', 'userscript/', ''].forEach(Dir => {
  WatchingGlob.push(`${ProcessCwd}/${Dir}sources/**/*.ts`)
  WatchingGlob.push(`${ProcessCwd}/${Dir}sources/**/*.json`)
  WatchingGlob.push(`${ProcessCwd}/${Dir}sources/**/*.txt`)
})
const Watcher = Chokidar.watch([
  `${ProcessCwd}/sources/**/*.ts`,
  `${ProcessCwd}/sources/**/*.json`
], {
  cwd: ProcessCwd,
  ignored: '**/node_modules/**',
})

let BuildCooldownTimer: NodeJS.Timeout = null
let ShouldPreventHTTPResponse = false
Watcher.on('all', (WatcherEvent, WatcherPath) => {
  clearTimeout(BuildCooldownTimer)
  BuildCooldownTimer = setTimeout(async () => {
    console.log(`Detected file change (${WatcherEvent}):`, WatcherPath)
    ShouldPreventHTTPResponse = true
    await Build({ Minify: false, UseCache: true, BuildType: 'development' })
    ShouldPreventHTTPResponse = false
  }, 1500)
})

let RandomPort = Crypto.randomInt(8000, 8999)
RunDebugServer(RandomPort, ['tinyShield.dev.user.js'], ShouldPreventHTTPResponse)
console.log(`Debug HTTP server running on http://localhost:${RandomPort}/tinyShield.dev.user.js`)