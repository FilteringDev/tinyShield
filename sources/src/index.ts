type unsafeWindow = typeof window
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const unsafeWindow: unsafeWindow

const Win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window

const OriginalArrayToString = Win.Array.prototype.toString

const ProtectedFunctionStrings = ['toString', 'get', 'set']

Win.Function.prototype.toString = new Proxy(Win.Function.prototype.toString, {
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
  /===? *[a-zA-Z0-9]+ *\[ *[a-zA-Z0-9]+\( *[0-9]+ *\) *\] *\) *return *[a-zA-Z0-9]+ *\( *{ *inventoryId *:/,
  /{ *inventoryId *: *this *\[[a-zA-Z0-9]+ *\( *[0-9]+ *\) *\] *, *\.\.\. *[a-zA-Z0-9]+ *\[ *[a-zA-Z0-9]+ *\( *[0-9]+ * *\) *\] *} *\)/
]]
Win.Map.prototype.get = new Proxy(Win.Map.prototype.get, {
  apply(Target: (key: unknown) => unknown, ThisArg: Map<unknown, unknown>, Args: [unknown]) {
    if (Args.length > 0 && typeof Args[0] !== 'function') {
      return Reflect.apply(Target, ThisArg, Args)
    }

    let ArgText = OriginalArrayToString.call(Args) as string
    if (ASInitPositiveRegExps.filter(ASInitPositiveRegExp => ASInitPositiveRegExp.filter(Index => Index.test(ArgText)).length >= 2).length === 1) {
      console.debug('[tinyShield]: Map.prototype.get:', ThisArg, Args)
      throw new Error()
    }

    return Reflect.apply(Target, ThisArg, Args)
  }
})

const ASReinsertedAdvInvenPositiveRegExps: RegExp[][] = [[
  /inventory_id,[a-zA-Z0-9-]+\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+/
]]
Win.Map.prototype.set = new Proxy(Win.Map.prototype.set, {
  apply(Target: (key: unknown, value: unknown) => Map<unknown, unknown>, ThisArg: Map<unknown, unknown>, Args: [unknown, unknown]) {
    let ArgText = ''
    try {
      ArgText = OriginalArrayToString.call(Args) as string
    } catch {
      console.warn('[tinyShield]: Map.prototype.get:', ThisArg, Args)
    }
    if (ASReinsertedAdvInvenPositiveRegExps.filter(ASReinsertedAdvInvenPositiveRegExp => ASReinsertedAdvInvenPositiveRegExp.filter(Index => Index.test(ArgText)).length >= 1).length === 1) {
      console.debug('[tinyShield]: Map.prototype.set:', ThisArg, Args)
      throw new Error()
    }

    return Reflect.apply(Target, ThisArg, Args)
  }
})