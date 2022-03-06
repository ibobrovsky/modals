import { getTimeout } from './getTimeout'
import { inBrowser, isIE9 } from '../browser'

export const hasTransition = inBrowser && !isIE9
export let transitionProp = 'transition'
export let animationProp = 'animation'
if (hasTransition) {
  if (
    window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined
  ) {
    transitionProp = 'WebkitTransition'
  }
  if (
    window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined
  ) {
    animationProp = 'WebkitAnimation'
  }
}

export function getTransitionTimeout(el: Element): number {
  const styles = window.getComputedStyle(el)
  const transitionDelays = (styles[transitionProp + 'Delay'] || '').split(', ')
  const transitionDurations = (styles[transitionProp + 'Duration'] || '').split(
    ', ',
  )
  const transitionTimeout = getTimeout(transitionDelays, transitionDurations)
  const animationDelays = (styles[animationProp + 'Delay'] || '').split(', ')
  const animationDurations = (styles[animationProp + 'Duration'] || '').split(
    ', ',
  )
  const animationTimeout = getTimeout(animationDelays, animationDurations)

  return Math.max(transitionTimeout, animationTimeout) || 0
}
