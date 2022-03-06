const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn<T extends object>(
  obj: T,
  key: keyof T | string,
): boolean {
  return hasOwnProperty.call(obj, key)
}
