import * as HTTP from 'node:http'
import * as Fs from 'node:fs'

function IsLoopBack(IP: string) {
  return IP === '127.0.0.1' || IP === '::1' || IP === '::ffff:127.0.0.1'
}

export function RunDebugServer(Port: number, FileName: string[], ShouldPreventHTTPResponse: boolean) {
  const HTTPServer = HTTP.createServer((Req, Res) => {
    if (!FileName.includes(Req.url?.substring(1) || '')) {
      Res.writeHead(404)
      Res.end()
      return
    } else if (!IsLoopBack(Req.socket.remoteAddress)) {
      Res.writeHead(403)
      Res.end()
      return
    } else if (ShouldPreventHTTPResponse || !Fs.existsSync(`${process.cwd()}/dist/${Req.url?.substring(1)}`)) {
      Res.writeHead(503)
      Res.end('File not built yet.')
      return
    }

    const Content = Fs.readFileSync(`${process.cwd()}/dist/${Req.url?.substring(1)}`, 'utf-8')
    Res.writeHead(200, {
      'content-type': 'application/javascript; charset=utf-8',
      'content-length': new TextEncoder().encode(Content).byteLength.toString()
    })
    Res.end(Content)
  })

  HTTPServer.listen(Port)
}