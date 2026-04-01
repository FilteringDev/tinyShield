/*!
 * @license MPL-2.0
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Contributors:
 *   - See Git history at https://github.com/FilteringDev/tinyShield for detailed authorship information.
 */

import * as Utils from './utils.js'
import { OriginalRegExpTest } from './index.js'

export function CheckDepthInASWeakMap(Args: [object, unknown]) {
  const FirstArg = Args[0] as Record<string, unknown>
  if (Utils.CountCommonStrings(['device', 'id', 'imp', 'regs', 'site', 'source'], Object.keys(FirstArg)) < 5) {
    return false
  }

  const ASBannerFrameIdRegExp = /^[0-9]+\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+\/[a-z0-9-\(\)]+\/[a-zA-Z0-9_]+_slot[0-9]+_+/
  const ASBannerFrameKey = Object.keys(FirstArg).find(Arg => {
    const Candidate = FirstArg[Arg]
    if (!Array.isArray(Candidate)) {
      return false
    }
    return Candidate.filter(SubArg => {
      if (typeof SubArg !== 'object' || SubArg === null) {
        return false
      }
      return Object.keys(SubArg).some(InnerArg => OriginalRegExpTest.call(ASBannerFrameIdRegExp, InnerArg) as boolean)
    }).length >= 1
  })
  if (typeof ASBannerFrameKey === 'undefined') {
    return false
  }

  return true
}