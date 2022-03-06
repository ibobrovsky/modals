import { hasOwn } from './hasOwn'
import { mergeDeep } from './mergeDeep'

const defaultStrat = function (parentVal: any, childVal: any): any {
  return childVal === undefined ? parentVal : childVal
}

export function mergeOptions<R extends Object = Object>(
  parent?: Object,
  child?: Object,
  deep: boolean = false,
): R {
  if (typeof parent !== 'object') {
    parent = {}
  }
  if (typeof child !== 'object') {
    child = {}
  }

  if (deep) {
    // @ts-ignore
    return mergeDeep({}, parent, child)
  }

  const options = {}
  let key
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }

  function mergeField(key: string) {
    // @ts-ignore
    options[key] = defaultStrat(parent[key], child[key])
  }
  // @ts-ignore
  return options
}
