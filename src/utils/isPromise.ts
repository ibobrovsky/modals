export function isPromise(value: any) {
  return (
    !(value === null || value === undefined) &&
    typeof value.then === 'function' &&
    typeof value.catch === 'function'
  )
}
