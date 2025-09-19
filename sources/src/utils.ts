export function CountCommonStrings(ArrayA: string[], ArrayB: string[]): number {
  let SetB = new Set(ArrayB)
  const Common = new Set(ArrayA.filter(Item => SetB.has(Item)))
  return Common.size
}