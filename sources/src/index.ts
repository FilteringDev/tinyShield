type unsafeWindow = typeof window
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const unsafeWindow: unsafeWindow

const Win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window

const OrignalFunctionToString = Win.Function.prototype.toString

const ProtectedFunctionStrings = ['toString', 'apply']

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

Win.Function.prototype.apply = new Proxy(Win.Function.prototype.apply, {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  apply(Target: typeof Function.prototype.apply, ThisArg: Function, Args: unknown[]) {
    let FunctionText = OrignalFunctionToString.call(ThisArg) as string
    if ([',inventoryId:', ':if("#adshield"===', ':_.ADS_FRAME,'].some(Item => FunctionText.includes(Item))) {
      throw new Error()
    }
    return Reflect.apply(Target, ThisArg, Args)
  }
})