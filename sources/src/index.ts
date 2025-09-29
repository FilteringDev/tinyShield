type unsafeWindow = typeof window
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const unsafeWindow: unsafeWindow

const Win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window

import { CheckDepthInASWeakMap } from './as-weakmap.js'

export const OriginalRegExpTest = Win.RegExp.prototype.test

export function RunTinyShieldUserscript(BrowserWindow: typeof window, UserscriptName: string = 'tinyShield'): void {
  const OriginalArrayToString = BrowserWindow.Array.prototype.toString
  const OriginalRegExpTest = BrowserWindow.RegExp.prototype.test

  const ProtectedFunctionStrings = ['toString', 'get', 'set']

  BrowserWindow.Function.prototype.toString = new Proxy(BrowserWindow.Function.prototype.toString, {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    apply(Target: () => string, ThisArg: Function, Args: null) {
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

      let ArgText = OriginalArrayToString.call(Args) as string
      if (ASInitPositiveRegExps.filter(ASInitPositiveRegExp => ASInitPositiveRegExp.filter(Index => OriginalRegExpTest.call(Index, ArgText) as boolean).length >= 2).length === 1) {
        console.debug(`[${UserscriptName}]: Map.prototype.get:`, ThisArg, Args)
        throw new Error()
      }

      return Reflect.apply(Target, ThisArg, Args)
    }
  })

  const ASReinsertedAdvInvenPositiveRegExps: RegExp[][] = [[
    /inventory_id,[a-zA-Z0-9-]+\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+/,
    /inventory_id,[a-zA-Z0-9-]+\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+/,
    /inventory_id,[a-zA-Z0-9-]+\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+/
  ], [
    /[a-z0-9A-Z]+\.setAttribute\( *('|")onload('|") *, *('|")! *async *function\( *\) *\{ *let */,
    /confirm\( *[A-Za-z0-9]+ *\) *\) *{ *const *[A-Za-z0-9]+ *= *new *[A-Za-z0-9]+\.URL\(('|")https:\/\/report\.error-report\.com\//,
    /\.forEach *\( *\( *[A-Za-z0-9]+ *=> *[A-Za-z0-9]+\.remove *\( *\) *\) *\) *\) *, *[0-9a-f]+ *\) *; *const *[A-Za-z0-9]+ *= *await *\( *await *fetch *\(/
  ]]
  BrowserWindow.Map.prototype.set = new Proxy(BrowserWindow.Map.prototype.set, {
    apply(Target: (key: unknown, value: unknown) => Map<unknown, unknown>, ThisArg: Map<unknown, unknown>, Args: [unknown, unknown]) {
      let ArgText = ''
      try {
        ArgText = OriginalArrayToString.call(Args) as string
      } catch {
        console.warn(`[${UserscriptName}]: Map.prototype.set:`, ThisArg, Args)
      }
      if (ASReinsertedAdvInvenPositiveRegExps.filter(ASReinsertedAdvInvenPositiveRegExp => ASReinsertedAdvInvenPositiveRegExp.filter(Index => OriginalRegExpTest.call(Index, ArgText) as boolean).length >= 3).length === 1) {
        console.debug(`[${UserscriptName}]: Map.prototype.set:`, ThisArg, Args)
        throw new Error()
      }
      return Reflect.apply(Target, ThisArg, Args)
    }
  })

  BrowserWindow.WeakMap.prototype.set = new Proxy(BrowserWindow.WeakMap.prototype.set, {
    apply(Target: (key: object, value: unknown) => WeakMap<object, unknown>, ThisArg: WeakMap<object, unknown>, Args: [object, unknown]) {
      if (CheckDepthInASWeakMap(Args)) {
        console.debug(`[${UserscriptName}]: WeakMap.prototype.set:`, ThisArg, Args)
        throw new Error()
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
}

RunTinyShieldUserscript(Win)