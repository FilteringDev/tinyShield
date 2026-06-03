/*!
 * @license MPL-2.0
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Contributors:
 *   - See Git history at https://github.com/FilteringDev/tinyShield for detailed authorship information.
 */

type unsafeWindow = typeof window
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const unsafeWindow: unsafeWindow

const BrowserWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window
const UserscriptName = 'tinyShield'

import { CheckDepthInASWeakMapBudgeted } from './as-weakmap.js'
import { ShouldSkipRegExpTest } from './regexp-cheap-guard.js'
import { SafeArrayToString } from './safe-ArrayToString.js'

export const OriginalRegExpTest = BrowserWindow.RegExp.prototype.test
const OriginalArrayMap = BrowserWindow.Array.prototype.map
const OriginalString = BrowserWindow.String
const OriginalArrayJoin = BrowserWindow.Array.prototype.join
const OriginalObjectGetPrototypeOf = BrowserWindow.Object.getPrototypeOf

const ProtectedFunctionStrings = ['toString', 'get', 'set']

BrowserWindow.Function.prototype.toString = new Proxy(BrowserWindow.Function.prototype.toString, {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  apply(Target: () => string, ThisArg: Function, Args: []) {
    if (ProtectedFunctionStrings.includes(ThisArg.name)) {
      return `function ${ThisArg.name}() { [native code] }`
    } else {
      return Reflect.apply(Target, ThisArg, Args)
    }
  }
})

const ASInitPositiveRegExps: RegExp[][] = [[
  /[a-zA-Z0-9]+ *=> *{ *const *[a-zA-Z0-9]+ *= *[a-zA-Z0-9]+ *; *if/,
  /===? *[a-zA-Z0-9]+ *\[ *[a-zA-Z0-9]+\( *[0-9a-z]+ *\) *\] *\) *return *[a-zA-Z0-9]+ *\( *{ *('|")?inventoryId('|")? *:/,
  /{ *('|")?inventoryId('|")? *: *this *\[[a-zA-Z0-9]+ *\( *[0-9a-z]+ *\) *\] *, *\.\.\. *[a-zA-Z0-9]+ *\[ *[a-zA-Z0-9]+ *\( *[0-9a-z]+ * *\) *\] *} *\)/
]]
BrowserWindow.Map.prototype.get = new Proxy(BrowserWindow.Map.prototype.get, {
  apply(Target: (key: unknown) => unknown, ThisArg: Map<unknown, unknown>, Args: [unknown]) {
    if (Args.length > 0 && typeof Args[0] !== 'function') {
      return Reflect.apply(Target, ThisArg, Args)
    }

    let ArgText = SafeArrayToString(Args, { OriginalArrayMap, OriginalString, OriginalArrayJoin, OriginalObjectGetPrototypeOf })
    
    if (!ShouldSkipRegExpTest(ArgText) && ASInitPositiveRegExps.filter(ASInitPositiveRegExp => ASInitPositiveRegExp.filter(Index => OriginalRegExpTest.call(Index, ArgText) as boolean).length >= 2).length === 1) {
      console.debug(`[${UserscriptName}]: Map.prototype.get:`, ThisArg, Args)
      throw new Error()
    }

    return Reflect.apply(Target, ThisArg, Args)
  }
})

type ASReinsertedAdvInvenPossibleArgsType = { Key: 'string' | 'number' | 'function', Value: ['string', 'number', 'function'][number][] }
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

function IsASReinsertedAdvInvenArgsTypeMatched(Args: [unknown, unknown], ArgsType: ASReinsertedAdvInvenPossibleArgsType): boolean {
  const KeyType = typeof Args[0]
  const ValueType = typeof Args[1]

  if (KeyType !== ArgsType.Key) {
    return false
  }

  return ArgsType.Value.includes(ValueType as ['string', 'number', 'function'][number])
}

BrowserWindow.Map.prototype.set = new Proxy(BrowserWindow.Map.prototype.set, {
  apply(Target: (key: unknown, value: unknown) => Map<unknown, unknown>, ThisArg: Map<unknown, unknown>, Args: [unknown, unknown]) {
    let ArgText = ''

    const ArgsTypeMatchedRegExps = ASReinsertedAdvInvenPositiveRegExps.filter(ASReinsertedAdvInvenPositiveRegExp =>
      IsASReinsertedAdvInvenArgsTypeMatched(Args, ASReinsertedAdvInvenPositiveRegExp.ArgsType),
    )
    if (ArgsTypeMatchedRegExps.length === 0) {
      return Reflect.apply(Target, ThisArg, Args)
    }

    ArgText = SafeArrayToString(Args, { OriginalArrayMap, OriginalString, OriginalArrayJoin, OriginalObjectGetPrototypeOf })
    
    if (!ShouldSkipRegExpTest(ArgText) && ArgsTypeMatchedRegExps.filter(ASReinsertedAdvInvenPositiveRegExp => ASReinsertedAdvInvenPositiveRegExp.Search.filter(Index => OriginalRegExpTest.call(Index, ArgText) as boolean).length >= 3).length === 1) {
      console.debug(`[${UserscriptName}]: Map.prototype.set:`, ThisArg, Args)
      throw new Error()
    }
    return Reflect.apply(Target, ThisArg, Args)
  }
})

BrowserWindow.WeakMap.prototype.set = new Proxy(BrowserWindow.WeakMap.prototype.set, {
  apply(Target: (key: object, value: unknown) => WeakMap<object, unknown>, ThisArg: WeakMap<object, unknown>, Args: [object, unknown]) {
    let CheckResult = CheckDepthInASWeakMapBudgeted(Args)
    switch (CheckResult.Status) {
      case 'matched':
        console.debug(`[${UserscriptName}]: WeakMap.prototype.set:`, ThisArg, Args)
        throw new Error()
      case 'not-matched':
        break
      case 'too-expensive':
        console.warn(`[${UserscriptName}]: WeakMap.prototype.set: Check too expensive:`, ThisArg, Args)
        break
      case 'unsafe-object':
        console.warn(`[${UserscriptName}]: WeakMap.prototype.set: Unsafe object:`, ThisArg, Args, CheckResult.Reason)
        break
    }

    return Reflect.apply(Target, ThisArg, Args)
  }
})

let ASTimerRegExps: RegExp[][] = [[
  /async *\( *\) *=> *{ *const *[A-Za-z0-9]+ *= *[A-Za-z0-9]+ *; *await *[A-Za-z0-9]+ *\( *\)/,
  /; *await *[A-Za-z0-9]+ *\( *\) *, *[A-Za-z0-9]+ *\( *! *1 *, *new *Error *\( *[A-Za-z0-9]+ *\( *[0-9a-f]+ *\) *\) *\) *}/,
  / *\) *\) *\) *}/
]]
BrowserWindow.setTimeout = new Proxy(BrowserWindow.setTimeout, {
  apply(Target: typeof BrowserWindow.setTimeout, ThisArg: undefined, Args: Parameters<typeof setTimeout>) {
    if (ASTimerRegExps.filter(ASTimerRegExp => ASTimerRegExp.filter(Index => Index.test(Args[0].toString())).length >= 3).length === 1) {
      console.debug(`[${UserscriptName}]: setTimeout:`, Args)
      return
    }
    return Reflect.apply(Target, ThisArg, Args)
  }
})
BrowserWindow.setInterval = new Proxy(BrowserWindow.setInterval, {
  apply(Target: typeof BrowserWindow.setInterval, ThisArg: undefined, Args: Parameters<typeof setInterval>) {
    if (ASTimerRegExps.filter(ASTimerRegExp => ASTimerRegExp.filter(Index => Index.test(Args[0].toString())).length >= 3).length === 1) {
      console.debug(`[${UserscriptName}]: setInterval:`, Args)
      return
    }
    return Reflect.apply(Target, ThisArg, Args)
  }
})