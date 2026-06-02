const MinimumInputLength = 512
const MaximumSampleLength = 4096

const MinimumObjectTokenCount = 10
const MinimumCommaCount = 50
const MinimumSplitPartCount = 50

const UselessPartRatioThreshold = 0.65

const ObjectTokenMarker = '[object '

const MaskedDumpMarkers = [
  '[object ',
  '[native code]',
  'function ',
  '=>',
  'HTMLElement',
  'HTML',
  'ShadowRoot',
  'Comment',
  'Text',
  'Object',
] as const

const DomObjectSuffixMarkers = [
  'HTMLElement]',
  'ShadowRoot]',
  'Comment]',
  'Text]',
] as const

const LiteralUselessPartSet: ReadonlySet<string> = new Set([
  '',
  'true',
  'false',
])

export function SafeRegExpTest(RegExpObject: RegExp, Input: string): boolean {
  if (ShouldSkipRegExpTest(Input)) {
    return false
  }

  return RegExpObject.test(Input)
}

export function ShouldSkipRegExpTest(Input: string): boolean {
  if (Input.length < MinimumInputLength) {
    return false
  }

  const Sample = Input.length > MaximumSampleLength
    ? Input.slice(0, MaximumSampleLength)
    : Input

  if (!Sample.includes(ObjectTokenMarker)) {
    return false
  }

  const ObjectTokenCount = CountOccurrences(Sample, ObjectTokenMarker)

  if (ObjectTokenCount < MinimumObjectTokenCount) {
    return false
  }

  const CommaCount = CountOccurrences(Sample, ',')

  if (CommaCount < MinimumCommaCount) {
    return false
  }

  const HasMaskedDumpMarker = MaskedDumpMarkers.some((Marker) =>
    Sample.includes(Marker),
  )

  if (!HasMaskedDumpMarker) {
    return false
  }

  const Parts = Sample.split(',')

  if (Parts.length < MinimumSplitPartCount) {
    return false
  }

  let UselessPartCount = 0

  for (const RawPart of Parts) {
    const Part = RawPart.trim()

    if (IsLikelyUselessMaskedPart(Part)) {
      UselessPartCount += 1
    }
  }

  const UselessPartRatio = UselessPartCount / Parts.length

  return UselessPartRatio >= UselessPartRatioThreshold
}

function IsLikelyUselessMaskedPart(Part: string): boolean {
  if (LiteralUselessPartSet.has(Part)) {
    return true
  }

  if (IsIntegerLikeString(Part)) {
    return true
  }

  if (Part.startsWith(ObjectTokenMarker)) {
    return true
  }

  if (DomObjectSuffixMarkers.some((Marker) => Part.includes(Marker))) {
    return true
  }

  return (
    Part.includes('[native code]') ||
    Part.startsWith('function ') ||
    Part.startsWith('()=>')
  )
}

function IsIntegerLikeString(Value: string): boolean {
  if (Value.length === 0) {
    return false
  }

  let StartIndex = 0

  if (Value[0] === '-') {
    if (Value.length === 1) {
      return false
    }

    StartIndex = 1
  }

  for (let Index = StartIndex; Index < Value.length; Index += 1) {
    const CharCode = Value.charCodeAt(Index)

    if (CharCode < 48 || CharCode > 57) {
      return false
    }
  }

  return true
}

function CountOccurrences(Haystack: string, Needle: string): number {
  let Count = 0
  let Index = 0

  while (true) {
    const FoundIndex = Haystack.indexOf(Needle, Index)

    if (FoundIndex === -1) {
      break
    }

    Count += 1
    Index = FoundIndex + Needle.length
  }

  return Count
}