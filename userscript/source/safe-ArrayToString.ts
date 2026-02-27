type OriginalAPI = {
  OriginalArrayMap: typeof Array.prototype.map
  OriginalString: typeof String
  OriginalArrayJoin: typeof Array.prototype.join
  OriginalObjectGetPrototypeOf: typeof Object.getPrototypeOf
}

export function SafeArrayToString(This: unknown[], OriginalAPI: OriginalAPI): string {

  const Mapped = OriginalAPI.OriginalArrayMap.call(
    This,
    (Value: unknown) => {
      if (Value && typeof Value === 'object' && OriginalAPI.OriginalObjectGetPrototypeOf(Value) === null) {
        return '[Object: null prototype]'
      }

      return OriginalAPI.OriginalString(Value)
    }
  ) as string[]

  return OriginalAPI.OriginalArrayJoin.call(Mapped) as string
}