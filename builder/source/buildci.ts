import * as Zod from 'zod'
import * as Process from 'node:process'
import { PreProcessing, PostProcessing } from '@typescriptprime/parsing'
import { Build, BuildOptions } from './build.js'

let ParsedArgv = (await PostProcessing<BuildOptions>(PreProcessing(Process.argv))).Options
let Options = await Zod.strictObject({
  Minify: Zod.string().pipe(Zod.enum(['true', 'false'])).transform(Value => Value === 'true').default(true),
  UseCache: Zod.string().pipe(Zod.enum(['true', 'false'])).transform(Value => Value === 'true').default(true),
  BuildType: Zod.enum(['production', 'development'])
}).parseAsync(ParsedArgv)

await Build(Options)