import * as Utils from './utils.js'
import { OriginalRegExpTest } from './index.js'

export function CheckDepthInASWeakMap(Args: [object, unknown]) {
  if (typeof Args[0] !== 'object') {
    return false
  }
  if (Utils.CountCommonStrings(['device', 'id', 'imp', 'regs', 'site', 'source'], Object.keys(Args[0])) < 5) {
    return false
  }

  let ASBannerFrameIdRegExp = /^[0-9]+\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+\/[a-z0-9-\(\)]+\/[a-zA-Z0-9_]+_slot[0-9]+_+/
  let ASBannerFrameKey: string = Object.keys(Args[0]).find(Arg => typeof Args[0][Arg] === 'object' && Array.isArray(Args[0][Arg]) &&
    Args[0][Arg].filter(SubArg => typeof SubArg === 'object' && Object.keys(SubArg).filter(InnerArg => {
      return typeof InnerArg === 'string' && OriginalRegExpTest.call(ASBannerFrameIdRegExp, InnerArg) as boolean
    })).length >= 1)
  if (typeof ASBannerFrameKey === 'undefined') {
    return false
  }

  return true
}