import { logError } from '../log/logError'

export function invoke<T = any>(cb?: (...params: any[]) => void, params?: T) {
  if (!cb) {
    return
  }

  try {
    cb(params)
  } catch (e: any) {
    logError(e)
  }
}
