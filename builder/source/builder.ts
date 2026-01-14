// This is a build script temporarily.
// If development of https://github.com/TypescriptPrime/userscript-build-toolkit is completed,
// this script will be replaced by that package.

import * as ESBuild from 'esbuild'
import * as Zod from 'zod'
import PackageJson from '@npmcli/package-json'
import * as Semver from 'semver'
import * as Fs from 'node:fs'
import * as NodeHttps from 'node:https'
import * as Process from 'node:process'

let BuildType: 'production' | 'development' = Zod.string().refine(BT => BT === 'production' || BT === 'development').default('production').parse(Process.argv[3] ?? 'production')
console.log('Build type set to:', BuildType)

let Version: string = (await PackageJson.load('./')).content.version
Version = await Zod.string().refine(V => Semver.valid(V) !== null).parseAsync(Version)
console.log('Applying version value:', Version)

let DomainsList: Set<string> = new Set()

const IABSellersJsonURL = 'https://info.ad-shield.io/sellers.json'
const IABSellersJsonResponse: { StatusCode: number, Headers: Record<string, string | string[]>, Body: string } = await new Promise((Resolve, Reject) => {
  const IABSellersJsonReq = NodeHttps.get({
    hostname: new URL(IABSellersJsonURL).hostname,
    path: new URL(IABSellersJsonURL).pathname,
    headers: {
      'user-agent': 'node/v24.12.0 linux x64 workspaces/true'
    },
    ciphers: 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256',
    ecdhCurve: 'X25519MLKEM768',
    minVersion: 'TLSv1.3'
  }, (Res) => {
    const Chunks: Buffer[] = []
    Res.on('data', (Chunk: Buffer) => Chunks.push(Chunk))
    Res.on('end', () => {
      Resolve({
        StatusCode: Res.statusCode,
        Headers: Res.headers,
        Body: new TextDecoder().decode(Buffer.concat(Chunks))
      })
    })
    IABSellersJsonReq.on('error', (Err) => Reject(Err))
  })
})
console.log('Fetched IAB Sellers.json with status code:', IABSellersJsonResponse.StatusCode)
let IABSellersJsonData = JSON.parse(IABSellersJsonResponse.Body) as {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  sellers: Array<{
    // eslint-disable-next-line @typescript-eslint/naming-convention
    seller_id: number,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    seller_type: string,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    name: string,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    domain: string
  }>
}
IABSellersJsonData = await Zod.object({
  sellers: Zod.array(Zod.object({
    seller_id: Zod.number(),
    seller_type: Zod.string(),
    name: Zod.string(),
    domain: Zod.string().refine(D => {
      try {
        new URL(`https://${D}`)
      } catch {
        return false
      }
      return true
    })
  }))
}).parseAsync(IABSellersJsonData)
console.log('Validated IAB Sellers.json data')
for (const SellerEntry of IABSellersJsonData.sellers) {
  DomainsList.add(SellerEntry.domain)
}
console.log('Collected', DomainsList.size, 'unique domains from IAB Sellers.json')

const HeaderLocation = './sources/banner.txt'
let ConvertedHeader: string = ''
for (const Line of Fs.readFileSync(HeaderLocation, 'utf-8').split('\n')) {
  if (Line.includes('%%VERSION_VALUE%%')) {
    ConvertedHeader += Line.replaceAll('%%VERSION_VALUE%%', Version) + '\n'
  } else if (Line.includes('%%NAME%%')) {
    ConvertedHeader += Line.replaceAll('%%NAME%%', BuildType === 'production' ? 'tinyShield' : 'tinyShield (Development)') + '\n'
  } else if (Line === '%%DOMAIN_INJECTION%%') {
    for (const DomainEntry of DomainsList) {
      ConvertedHeader += `// @match        *://${DomainEntry}/*\n`
      ConvertedHeader += `// @match        *://*.${DomainEntry}/*\n`
    }
  } else {
    ConvertedHeader += Line + '\n'
  }
}
console.log('Generated header with domain injections and processing')
let AttachHeaderPath = `/tmp/${crypto.randomUUID()}`
Fs.writeFileSync(AttachHeaderPath, ConvertedHeader, { encoding: 'utf-8', mode: 0o700 })
console.log('Written temporary header file to:', AttachHeaderPath)
await ESBuild.build({
  entryPoints: ['./sources/index.ts'],
  bundle: true,
  minify: BuildType === 'production',
  define: {
    global: 'window'
  },
  inject: ['./sources/esbuild.inject.ts'],
  banner: {
    js: Fs.readFileSync(AttachHeaderPath, 'utf-8')
  },
  target: ['es2024', 'chrome119', 'firefox142', 'safari26'],
  outfile: BuildType === 'production' ? './dist/tinyShield.user.js' : './dist/tinyShield.dev.user.js',
})
console.log('Build completed')
Fs.rmSync(AttachHeaderPath)
console.log('Temporary header file removed')