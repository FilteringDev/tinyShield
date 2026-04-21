import * as Zod from 'zod'
import * as Process from 'node:process'
import { ParseArgumentsAndOptions, FilterArgumentsForOptions } from '@typescriptprime/parsing'
import { StandardBuild } from './build.js'
import { GroupedBuild } from './build-grouped.js'
import { Build } from './build-core.js'
import type { BuildOptions } from './build-core.js'

let ParsedArgv = (await ParseArgumentsAndOptions<BuildOptions>(FilterArgumentsForOptions(Process.argv))).Options
let Options = await Zod.strictObject({
  Minify: Zod.string().pipe(Zod.enum(['true', 'false'])).transform(Value => Value === 'true').default(true),
  BuildType: Zod.enum(['production', 'development']),
  SubscriptionUrl: Zod.string()
}).parseAsync(ParsedArgv)

const CoreBuildInstance = new Build(Options)
await CoreBuildInstance.Init()
await new StandardBuild(CoreBuildInstance, Options).Build()
console.log('StandardBuild completed successfully.')
const GroupedBuildInstance = new GroupedBuild(CoreBuildInstance, Options)
await GroupedBuildInstance.Build()
console.log('GroupedBuild completed successfully.')
await GroupedBuildInstance.MakeGroupMetadata()
console.log('Group metadata creation completed successfully.')