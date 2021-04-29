/**
 * Like lodash.once
 * @param func
 * @see https://dustinpfister.github.io/2017/12/04/lodash_once/
 */
export function once<R = any>(func: Function): (...args: any[]) => R {
  if (typeof func !== 'function') {
    throw new TypeError('Expected a function')
  }
  let result: R
  let calls = 1
  return function (...args: any[]) {
    if (calls > 0) {
      result = func.apply(null, args)
      calls--
    }
    return result
  }
}
