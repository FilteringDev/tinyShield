/*!
 * @license MPL-2.0
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Contributors:
 *   - See Git history at https://github.com/FilteringDev/tinyShield for detailed authorship information.
 */

export type CheckDepthResult =
  { Status: 'matched' } |
  { Status: 'not-matched' } |
  { Status: 'too-expensive' } |
  { Status: 'unsafe-object'; Reason: unknown }

export type CheckBudget = {
  MaxTopLevelKeys: number
  MaxArrayItems: number
  MaxInnerKeysPerObject: number
  MaxOperations: number
}

const DefaultBudget: CheckBudget = {
  MaxTopLevelKeys: 300,
  MaxArrayItems: 1_000,
  MaxInnerKeysPerObject: 100,
  MaxOperations: 10_000,
}

const ImportantKeys = ['device', 'id', 'imp', 'regs', 'site', 'source'] as const
const PropertyIsEnumerable = Object.prototype.propertyIsEnumerable

function HasOwnEnumerableStringKey(Obj: object, Key: string): boolean {
  return PropertyIsEnumerable.call(Obj, Key)
}

function CountCommonKnownKeys(Obj: object): number {
  let Count = 0

  for (const Key of ImportantKeys) {
    if (HasOwnEnumerableStringKey(Obj, Key)) {
      Count++
    }
  }

  return Count
}

export function CheckDepthInASWeakMapBudgeted(
  Args: [object, unknown],
  Budget: CheckBudget = DefaultBudget,
  OriginalRegExpTest: typeof RegExp.prototype.test = RegExp.prototype.test,
): CheckDepthResult {
  let Operations = 0

  const Tick = (Amount = 1): boolean => {
    Operations += Amount
    return Operations <= Budget.MaxOperations
  }

  try {
    const FirstArg = Args[0] as Record<string, unknown>

    if (!Tick(ImportantKeys.length)) {
      return { Status: 'too-expensive' }
    }

    if (CountCommonKnownKeys(FirstArg) < 5) {
      return { Status: 'not-matched' }
    }

    const AsBannerFrameIdRegExp =
      /^[0-9]+\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+\/[a-z0-9-\(\)]+\/[a-zA-Z0-9_]+_slot[0-9]+_+/

    let TopLevelKeyCount = 0

    for (const Arg in FirstArg) {
      if (!HasOwnEnumerableStringKey(FirstArg, Arg)) {
        continue
      }

      TopLevelKeyCount++

      if (
        TopLevelKeyCount > Budget.MaxTopLevelKeys ||
        !Tick()
      ) {
        return { Status: 'too-expensive' }
      }

      const Candidate = FirstArg[Arg]

      if (!Array.isArray(Candidate)) {
        continue
      }

      const MaxArrayIndex = Math.min(Candidate.length, Budget.MaxArrayItems)

      for (let I = 0; I < MaxArrayIndex; I++) {
        if (!Tick()) {
          return { Status: 'too-expensive' }
        }

        const SubArg = Candidate[I]

        if (typeof SubArg !== 'object' || SubArg === null) {
          continue
        }

        let InnerKeyCount = 0

        for (const InnerArg in SubArg as Record<string, unknown>) {
          if (!HasOwnEnumerableStringKey(SubArg, InnerArg)) {
            continue
          }

          InnerKeyCount++

          if (
            InnerKeyCount > Budget.MaxInnerKeysPerObject ||
            !Tick()
          ) {
            return { Status: 'too-expensive' }
          }

          if (OriginalRegExpTest.call(AsBannerFrameIdRegExp, InnerArg) as boolean) {
            return { Status: 'matched' }
          }
        }
      }

      if (Candidate.length > Budget.MaxArrayItems) {
        return { Status: 'too-expensive' }
      }
    }

    return { Status: 'not-matched' }
  } catch (Error) {
    return { Status: 'unsafe-object', Reason: Error }
  }
}
