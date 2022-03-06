import { remove } from '../dom'
import { autoCssTransition } from './autoCssTransition'
import { getTransitionTimeout } from './getTransitionTimeout'
import { invoke } from '../invoke'
import { nextFrame } from '../nextFrame'

export function transitionRemove<E extends string = string>(
  el?: Element,
  wrapper?: Element,
  effect?: E,
  cb?: () => void,
): void {
  if (!el) {
    return
  }

  if (!effect) {
    remove(el, wrapper)
    if (cb) {
      invoke(cb)
    }
    return
  }

  const transitionClasses = autoCssTransition(effect)
  el.classList.add(transitionClasses.leaveClass)
  el.classList.add(transitionClasses.leaveActiveClass)
  nextFrame(() => {
    const timeout = getTransitionTimeout(el)
    el.classList.remove(transitionClasses.leaveClass)
    el.classList.add(transitionClasses.leaveToClass)
    setTimeout(() => {
      el.classList.remove(transitionClasses.leaveActiveClass)
      el.classList.remove(transitionClasses.leaveToClass)
      remove(el, wrapper)
      if (cb) {
        invoke(cb)
      }
    }, timeout)
  })
}
