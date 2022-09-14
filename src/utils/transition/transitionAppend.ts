import { append } from '../dom'
import { autoCssTransition } from './autoCssTransition'
import { getTransitionTimeout } from './getTransitionTimeout'
import { invoke } from '../invoke'
import { nextFrame } from '../nextFrame'

export function transitionAppend<E extends string = string>(
  el: Element | string,
  wrapper?: Element,
  effect?: E,
  cb?: () => void,
  cb2?: () => void,
): void {
  if (!effect || typeof el === 'string') {
    append(el, wrapper)
    if (cb2) {
      invoke(cb2)
    }
    if (cb) {
      invoke(cb)
    }
    return
  }

  const transitionClasses = autoCssTransition(effect)
  el.classList.add(transitionClasses.enterClass)
  el.classList.add(transitionClasses.enterActiveClass)
  const isAppend = append(el, wrapper)
  if (!isAppend) {
    return
  }
  if (cb2) {
    invoke(cb2)
  }

  const timeout = getTransitionTimeout(el)

  nextFrame(() => {
    el.classList.add(transitionClasses.enterToClass)
    el.classList.remove(transitionClasses.enterClass)
    setTimeout(() => {
      el.classList.remove(transitionClasses.enterActiveClass)
      el.classList.remove(transitionClasses.enterToClass)
      if (cb) {
        invoke(cb)
      }
    }, timeout)
  })
}
