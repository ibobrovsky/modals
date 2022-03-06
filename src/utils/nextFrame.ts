import { inBrowser } from './browser'

type FN = () => void

const raf = inBrowser
  ? window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : setTimeout
  : (fn: FN): void => fn()

export function nextFrame(fn: FN): void {
  raf(() => {
    raf(fn)
  })
}
