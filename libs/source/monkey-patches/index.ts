/*!
 * @license MPL-2.0
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Contributors:
 *   - See Git history at https://github.com/FilteringDev/tinyShield for detailed authorship information.
 */

import { CheckDepthInASWeakMapBudgeted } from './as-weakmap.js'
import { ShouldSkipRegExpTest } from './regexp-cheap-guard.js'
import { SafeArrayToString } from './safe-array-to-string.js'

/* eslint-disable @typescript-eslint/naming-convention */
export type TinyShieldWindow = {
  RegExp: RegExpConstructor
  Array: ArrayConstructor
  String: StringConstructor
  Object: ObjectConstructor
  Function: FunctionConstructor
  Map: MapConstructor
  WeakMap: WeakMapConstructor
  setTimeout: typeof globalThis.setTimeout
  setInterval: typeof globalThis.setInterval
}
/* eslint-enable @typescript-eslint/naming-convention */

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const unsafeWindow: TinyShieldWindow | undefined

export const TinyShieldPatchIds = [
  'FunctionToString',
  'MapGet',
  'MapSet',
  'WeakMapSet',
  'SetTimeout',
  'SetInterval',
] as const

export type TinyShieldPatchId = typeof TinyShieldPatchIds[number]

export type TinyShieldControllerOptions = {
  Window?: TinyShieldWindow
  PatchIds?: Iterable<TinyShieldPatchId>
  UserscriptName?: string
}

export type TinyShieldPatchController = {
  Id: TinyShieldPatchId
  Enable(): void
  Disable(): void
  IsEnabled(): boolean
}

export type TinyShieldController = {
  Enable(PatchIds?: Iterable<TinyShieldPatchId>): void
  Disable(PatchIds?: Iterable<TinyShieldPatchId>): void
  IsEnabled(PatchId?: TinyShieldPatchId): boolean
  GetPatch(PatchId: TinyShieldPatchId): TinyShieldPatchController
}

type TinyShieldPatchState = TinyShieldPatchController & {
  Enabled: boolean
  Installed: boolean
  Install(): void
}

type TinyShieldState = {
  BrowserWindow: TinyShieldWindow
  UserscriptName: string
  OriginalRegExpTest: typeof RegExp.prototype.test
  OriginalArrayMap: typeof Array.prototype.map
  OriginalString: typeof String
  OriginalArrayJoin: typeof Array.prototype.join
  OriginalObjectGetPrototypeOf: typeof Object.getPrototypeOf
  Patches: Map<TinyShieldPatchId, TinyShieldPatchState>
}

type ASReinsertedAdvInvenPossibleArgsType = {
  Key: 'string' | 'number' | 'function'
  Value: ['string', 'number', 'function'][number][]
}

const DefaultUserscriptName = 'tinyShield'
const TinyShieldPatchIdSet: ReadonlySet<string> = new Set(TinyShieldPatchIds)
const WindowStates = new WeakMap<TinyShieldWindow, TinyShieldState>()
const ProtectedFunctionStrings: ReadonlySet<string> = new Set(['toString', 'get', 'set'])
const FunctionNameProperty = 'name'

const ASInitPositiveRegExps: RegExp[][] = [[
  /[a-zA-Z0-9]+ *=> *{ *const *[a-zA-Z0-9]+ *= *[a-zA-Z0-9]+ *; *if/,
  /===? *[a-zA-Z0-9]+ *\[ *[a-zA-Z0-9]+\( *[0-9a-z]+ *\) *\] *\) *return *[a-zA-Z0-9]+ *\( *{ *('|")?inventoryId('|")? *:/,
  /{ *('|")?inventoryId('|")? *: *this *\[[a-zA-Z0-9]+ *\( *[0-9a-z]+ *\) *\] *, *\.\.\. *[a-zA-Z0-9]+ *\[ *[a-zA-Z0-9]+ *\( *[0-9a-z]+ * *\) *\] *} *\)/
]]

const ASReinsertedAdvInvenPositiveRegExps: { Search: RegExp[], ArgsType: ASReinsertedAdvInvenPossibleArgsType }[] = [{
  Search: [
    /inventory_id,[a-zA-Z0-9-]+\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+/,
    /inventory_id,[a-zA-Z0-9-]+\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+/,
    /inventory_id,[a-zA-Z0-9-]+\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+/
  ],
  ArgsType: { Key: 'string', Value: ['string'] }
}, {
  Search: [
    /[a-z0-9A-Z]+\.setAttribute\( *('|")onload('|") *, *('|")! *async *function\( *\) *\{ *let */,
    /confirm\( *[A-Za-z0-9]+ *\) *\) *{ *const *[A-Za-z0-9]+ *= *new *[A-Za-z0-9]+\.URL\(('|")https:\/\/report\.error-report\.com\//,
    /\.forEach *\( *\( *[A-Za-z0-9]+ *=> *[A-Za-z0-9]+\.remove *\( *\) *\) *\) *\) *, *[0-9a-f]+ *\) *; *const *[A-Za-z0-9]+ *= *awai,t *\( *await *fetch *\(/
  ],
  ArgsType: { Key: 'string', Value: ['function'] }
}]

const ASTimerRegExps: RegExp[][] = [[
  /async *\( *\) *=> *{ *const *[A-Za-z0-9]+ *= *[A-Za-z0-9]+ *; *await *[A-Za-z0-9]+ *\( *\)/,
  /; *await *[A-Za-z0-9]+ *\( *\) *, *[A-Za-z0-9]+ *\( *! *1 *, *new *Error *\( *[A-Za-z0-9]+ *\( *[0-9a-f]+ *\) *\) *\) *}/,
  / *\) *\) *\) *}/
]]

class TinyShieldControllerImpl implements TinyShieldController {
  private State: TinyShieldState
  private DefaultPatchIds: TinyShieldPatchId[]

  constructor(State: TinyShieldState, PatchIds: Iterable<TinyShieldPatchId>) {
    this.State = State
    this.DefaultPatchIds = NormalizePatchIds(PatchIds)
  }

  Enable(PatchIds: Iterable<TinyShieldPatchId> = this.DefaultPatchIds): void {
    for (const PatchId of NormalizePatchIds(PatchIds)) {
      this.GetPatch(PatchId).Enable()
    }
  }

  Disable(PatchIds: Iterable<TinyShieldPatchId> = this.DefaultPatchIds): void {
    for (const PatchId of NormalizePatchIds(PatchIds)) {
      this.GetPatch(PatchId).Disable()
    }
  }

  IsEnabled(PatchId?: TinyShieldPatchId): boolean {
    if (typeof PatchId === 'undefined') {
      return this.DefaultPatchIds.every(CurrentPatchId => this.GetPatch(CurrentPatchId).IsEnabled())
    }

    return this.GetPatch(PatchId).IsEnabled()
  }

  GetPatch(PatchId: TinyShieldPatchId): TinyShieldPatchController {
    const Patch = this.State.Patches.get(PatchId)

    if (typeof Patch === 'undefined') {
      throw new Error(`Unknown tinyShield patch id: ${PatchId}`)
    }

    return Patch
  }
}

export function CreateTinyShieldController(Options: TinyShieldControllerOptions = {}): TinyShieldController {
  const State = GetTinyShieldState(Options)
  return new TinyShieldControllerImpl(State, Options.PatchIds ?? TinyShieldPatchIds)
}

export function EnableTinyShield(Options: TinyShieldControllerOptions = {}): TinyShieldController {
  const Controller = CreateTinyShieldController(Options)
  Controller.Enable()
  return Controller
}

function ResolveBrowserWindow(WindowOption?: TinyShieldWindow): TinyShieldWindow {
  if (typeof WindowOption !== 'undefined') {
    return WindowOption
  }

  if (typeof unsafeWindow !== 'undefined') {
    return unsafeWindow
  }

  return globalThis as unknown as TinyShieldWindow
}

function GetTinyShieldState(Options: TinyShieldControllerOptions): TinyShieldState {
  const BrowserWindow = ResolveBrowserWindow(Options.Window)
  const ExistingState = WindowStates.get(BrowserWindow)

  if (typeof ExistingState !== 'undefined') {
    if (typeof Options.UserscriptName !== 'undefined') {
      ExistingState.UserscriptName = Options.UserscriptName
    }

    return ExistingState
  }

  const State: TinyShieldState = {
    BrowserWindow,
    UserscriptName: Options.UserscriptName ?? DefaultUserscriptName,
    OriginalRegExpTest: BrowserWindow.RegExp.prototype.test,
    OriginalArrayMap: BrowserWindow.Array.prototype.map,
    OriginalString: BrowserWindow.String,
    OriginalArrayJoin: BrowserWindow.Array.prototype.join,
    OriginalObjectGetPrototypeOf: BrowserWindow.Object.getPrototypeOf,
    Patches: new Map()
  }

  State.Patches.set('FunctionToString', CreatePatchState('FunctionToString', () => InstallFunctionToStringPatch(State)))
  State.Patches.set('MapGet', CreatePatchState('MapGet', () => InstallMapGetPatch(State)))
  State.Patches.set('MapSet', CreatePatchState('MapSet', () => InstallMapSetPatch(State)))
  State.Patches.set('WeakMapSet', CreatePatchState('WeakMapSet', () => InstallWeakMapSetPatch(State)))
  State.Patches.set('SetTimeout', CreatePatchState('SetTimeout', () => InstallSetTimeoutPatch(State)))
  State.Patches.set('SetInterval', CreatePatchState('SetInterval', () => InstallSetIntervalPatch(State)))

  WindowStates.set(BrowserWindow, State)
  return State
}

function CreatePatchState(PatchId: TinyShieldPatchId, Install: () => void): TinyShieldPatchState {
  const Patch: TinyShieldPatchState = {
    Id: PatchId,
    Enabled: false,
    Installed: false,
    Install,
    Enable() {
      if (!Patch.Installed) {
        Patch.Install()
        Patch.Installed = true
      }

      Patch.Enabled = true
    },
    Disable() {
      Patch.Enabled = false
    },
    IsEnabled() {
      return Patch.Enabled
    }
  }

  return Patch
}

function NormalizePatchIds(PatchIds: Iterable<TinyShieldPatchId>): TinyShieldPatchId[] {
  const Result = [...PatchIds]

  for (const PatchId of Result) {
    if (!TinyShieldPatchIdSet.has(PatchId)) {
      throw new Error(`Unknown tinyShield patch id: ${PatchId}`)
    }
  }

  return Result
}

function IsPatchEnabled(State: TinyShieldState, PatchId: TinyShieldPatchId): boolean {
  return State.Patches.get(PatchId)?.IsEnabled() === true
}

function InstallFunctionToStringPatch(State: TinyShieldState): void {
  const Target = State.BrowserWindow.Function.prototype.toString as () => string
  State.BrowserWindow.Function.prototype.toString = new Proxy(Target, {
    apply(Target, ThisArg: object, Args: []) {
      if (!IsPatchEnabled(State, 'FunctionToString')) {
        return Reflect.apply(Target, ThisArg, Args)
      }

      const ThisArgName = Reflect.get(ThisArg, FunctionNameProperty)

      if (typeof ThisArgName === 'string' && ProtectedFunctionStrings.has(ThisArgName)) {
        return 'function ' + ThisArgName + '() { [native code] }'
      }

      return Reflect.apply(Target, ThisArg, Args)
    }
  }) as typeof State.BrowserWindow.Function.prototype.toString
}

function InstallMapGetPatch(State: TinyShieldState): void {
  const Target = State.BrowserWindow.Map.prototype.get as (Key: unknown) => unknown
  State.BrowserWindow.Map.prototype.get = new Proxy(Target, {
    apply(Target, ThisArg: Map<unknown, unknown>, Args: [unknown]) {
      if (!IsPatchEnabled(State, 'MapGet')) {
        return Reflect.apply(Target, ThisArg, Args)
      }

      if (Args.length > 0 && typeof Args[0] !== 'function') {
        return Reflect.apply(Target, ThisArg, Args)
      }

      const ArgText = SafeArrayToString(Args, {
        OriginalArrayMap: State.OriginalArrayMap,
        OriginalString: State.OriginalString,
        OriginalArrayJoin: State.OriginalArrayJoin,
        OriginalObjectGetPrototypeOf: State.OriginalObjectGetPrototypeOf
      })

      if (!ShouldSkipRegExpTest(ArgText) && ASInitPositiveRegExps.filter(ASInitPositiveRegExp => ASInitPositiveRegExp.filter(Index => State.OriginalRegExpTest.call(Index, ArgText) as boolean).length >= 2).length === 1) {
        console.debug(`[${State.UserscriptName}]: Map.prototype.get:`, ThisArg, Args)
        throw new Error()
      }

      return Reflect.apply(Target, ThisArg, Args)
    }
  }) as typeof State.BrowserWindow.Map.prototype.get
}

function InstallMapSetPatch(State: TinyShieldState): void {
  const Target = State.BrowserWindow.Map.prototype.set as (Key: unknown, Value: unknown) => Map<unknown, unknown>
  State.BrowserWindow.Map.prototype.set = new Proxy(Target, {
    apply(Target, ThisArg: Map<unknown, unknown>, Args: [unknown, unknown]) {
      if (!IsPatchEnabled(State, 'MapSet')) {
        return Reflect.apply(Target, ThisArg, Args)
      }

      const ArgsTypeMatchedRegExps = ASReinsertedAdvInvenPositiveRegExps.filter(ASReinsertedAdvInvenPositiveRegExp =>
        IsASReinsertedAdvInvenArgsTypeMatched(Args, ASReinsertedAdvInvenPositiveRegExp.ArgsType),
      )

      if (ArgsTypeMatchedRegExps.length === 0) {
        return Reflect.apply(Target, ThisArg, Args)
      }

      const ArgText = SafeArrayToString(Args, {
        OriginalArrayMap: State.OriginalArrayMap,
        OriginalString: State.OriginalString,
        OriginalArrayJoin: State.OriginalArrayJoin,
        OriginalObjectGetPrototypeOf: State.OriginalObjectGetPrototypeOf
      })

      if (!ShouldSkipRegExpTest(ArgText) && ArgsTypeMatchedRegExps.filter(ASReinsertedAdvInvenPositiveRegExp => ASReinsertedAdvInvenPositiveRegExp.Search.filter(Index => State.OriginalRegExpTest.call(Index, ArgText) as boolean).length >= 3).length === 1) {
        console.debug(`[${State.UserscriptName}]: Map.prototype.set:`, ThisArg, Args)
        throw new Error()
      }

      return Reflect.apply(Target, ThisArg, Args)
    }
  }) as typeof State.BrowserWindow.Map.prototype.set
}

function InstallWeakMapSetPatch(State: TinyShieldState): void {
  const Target = State.BrowserWindow.WeakMap.prototype.set as (Key: object, Value: unknown) => WeakMap<object, unknown>
  State.BrowserWindow.WeakMap.prototype.set = new Proxy(Target, {
    apply(Target, ThisArg: WeakMap<object, unknown>, Args: [object, unknown]) {
      if (!IsPatchEnabled(State, 'WeakMapSet')) {
        return Reflect.apply(Target, ThisArg, Args)
      }

      const CheckResult = CheckDepthInASWeakMapBudgeted(Args, undefined, State.OriginalRegExpTest)
      switch (CheckResult.Status) {
        case 'matched':
          console.debug(`[${State.UserscriptName}]: WeakMap.prototype.set:`, ThisArg, Args)
          throw new Error()
        case 'not-matched':
          break
        case 'too-expensive':
          console.warn(`[${State.UserscriptName}]: WeakMap.prototype.set: Check too expensive:`, ThisArg, Args)
          break
        case 'unsafe-object':
          console.warn(`[${State.UserscriptName}]: WeakMap.prototype.set: Unsafe object:`, ThisArg, Args, CheckResult.Reason)
          break
      }

      return Reflect.apply(Target, ThisArg, Args)
    }
  }) as typeof State.BrowserWindow.WeakMap.prototype.set
}

function InstallSetTimeoutPatch(State: TinyShieldState): void {
  const Target = State.BrowserWindow.setTimeout
  State.BrowserWindow.setTimeout = new Proxy(Target, {
    apply(Target, ThisArg: unknown, Args: Parameters<typeof globalThis.setTimeout>) {
      if (!IsPatchEnabled(State, 'SetTimeout')) {
        return Reflect.apply(Target, ThisArg, Args)
      }

      if (IsASTimerMatched(State.OriginalString(Args[0]))) {
        console.debug(`[${State.UserscriptName}]: setTimeout:`, Args)
        return undefined as unknown as ReturnType<typeof globalThis.setTimeout>
      }

      return Reflect.apply(Target, ThisArg, Args)
    }
  }) as typeof State.BrowserWindow.setTimeout
}

function InstallSetIntervalPatch(State: TinyShieldState): void {
  const Target = State.BrowserWindow.setInterval
  State.BrowserWindow.setInterval = new Proxy(Target, {
    apply(Target, ThisArg: unknown, Args: Parameters<typeof globalThis.setInterval>) {
      if (!IsPatchEnabled(State, 'SetInterval')) {
        return Reflect.apply(Target, ThisArg, Args)
      }

      if (IsASTimerMatched(State.OriginalString(Args[0]))) {
        console.debug(`[${State.UserscriptName}]: setInterval:`, Args)
        return undefined as unknown as ReturnType<typeof globalThis.setInterval>
      }

      return Reflect.apply(Target, ThisArg, Args)
    }
  }) as typeof State.BrowserWindow.setInterval
}

function IsASReinsertedAdvInvenArgsTypeMatched(Args: [unknown, unknown], ArgsType: ASReinsertedAdvInvenPossibleArgsType): boolean {
  const KeyType = typeof Args[0]
  const ValueType = typeof Args[1]

  if (KeyType !== ArgsType.Key) {
    return false
  }

  return ArgsType.Value.includes(ValueType as ['string', 'number', 'function'][number])
}

function IsASTimerMatched(ArgText: string): boolean {
  return ASTimerRegExps.filter(ASTimerRegExp => ASTimerRegExp.filter(Index => Index.test(ArgText)).length >= 3).length === 1
}
