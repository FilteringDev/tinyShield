type unsafeWindow = typeof window
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const unsafeWindow: unsafeWindow

const Win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window

const OriginalArrayToString = Win.Array.prototype.toString
const OriginalStringIncludes = Win.String.prototype.includes

const ProtectedFunctionStrings = ['toString', 'get']

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

Win.Map.prototype.get = new Proxy(Win.Map.prototype.get, {
  apply(Target: (key: unknown) => unknown, ThisArg: Map<unknown, unknown>, Args: [unknown]) {
    let ArgText = OriginalArrayToString.call(Args) as string
    console.debug(ThisArg, Args)
    for (const Item of ['{"inventoryId":', '({inventoryId:this']) {
      if (OriginalStringIncludes.call(ArgText, Item)) {
        console.debug('[tinyShield]:', ThisArg, Args)
        throw new Error()
      }
    }

    return Reflect.apply(Target, ThisArg, Args)
  }
})