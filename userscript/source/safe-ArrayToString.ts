type OriginalAPI = {
  OriginalArrayMap: typeof Array.prototype.map
  OriginalString: typeof String
  OriginalArrayJoin: typeof Array.prototype.join
}

export function SafeArrayToString(This: unknown[], OriginalAPI: OriginalAPI): string {
  const Mapped = OriginalAPI.OriginalArrayMap.call(
    This,
    (Value: unknown) => OriginalAPI.OriginalString(Value)
  ) as string[]

  return OriginalAPI.OriginalArrayJoin.call(Mapped) as string
}