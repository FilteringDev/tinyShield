import * as Fs from 'node:fs'
import * as Path from 'node:path'

export function SafeInitCwd(Paths: { Cwd: string, InitCwd?: string }): string {
  const RepoPath = Fs.realpathSync(Path.resolve(import.meta.dirname, '../../..'))
  if (Paths.InitCwd) {
    const ResolvedInitCwd = Path.resolve(Paths.InitCwd)
    if (ResolvedInitCwd === RepoPath && Path.resolve(RepoPath, 'builder').startsWith(ResolvedInitCwd)) {
      return ResolvedInitCwd
    } else {
      throw new Error(`INIT_CWD (${ResolvedInitCwd}) does not match the repository path (${RepoPath})!`)
    }
  }
  return RepoPath
}