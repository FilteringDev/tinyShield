import * as HTTP from 'node:http'
import * as Fs from 'node:fs'
import * as Path from 'node:path'

function IsLoopBack(IP: string) {
  return IP === '127.0.0.1' || IP === '::1' || IP === '::ffff:127.0.0.1'
}

export function RunDebugServer(Port: number, FileName: string[], ShouldPreventHTTPResponse: boolean) {
  const HTTPServer = HTTP.createServer((Req, Res) => {
    const DistRoot = Path.resolve(process.cwd(), 'dist')
    const RequestPath = Req.url?.substring(1) || ''
    const ResolvedPath = Path.resolve(DistRoot, RequestPath)
    const RelativePath = Path.relative(DistRoot, ResolvedPath)

    // Ensure the resolved path stays within the dist root to prevent directory traversal
    if (RelativePath.startsWith('..') || Path.isAbsolute(RelativePath)) {
      Res.writeHead(403)
      Res.end()
      return
    }

    if (!FileName.includes(RequestPath)) {
      Res.writeHead(404)
      Res.end()
      return
    } else if (!IsLoopBack(Req.socket.remoteAddress)) {
      Res.writeHead(403)
      Res.end()
      return
    } else if (ShouldPreventHTTPResponse || !Fs.existsSync(ResolvedPath)) {
      Res.writeHead(503)
      Res.end('File not built yet.')
      return
    }

    const Content = Fs.readFileSync(ResolvedPath, 'utf-8')
    Res.writeHead(200, {
      'content-type': 'application/javascript; charset=utf-8',
      'content-length': new TextEncoder().encode(Content).byteLength.toString()
    })
    Res.end(Content)
  })

  HTTPServer.listen(Port)
}