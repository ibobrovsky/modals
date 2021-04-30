import { append, remove, clean, addClass, removeClass } from "./dom"
import { inBrowser, isIE9 } from "./env"
import { isDomNode, isFunction } from "./type"
import { invoke } from "./injector"

export function transitionAppend (
    modal,
    el,
    wrapper,
    effect = '',
    clearWrapper = true,
    useTransition = true,
    callbackAfter = null,
)
{
    if (!isDomNode(el) || !isDomNode(wrapper))
    {
        return
    }

    if (clearWrapper)
    {
        clean(wrapper)
    }

    if (!effect || !useTransition)
    {
        append(el, wrapper)
        if (isFunction(callbackAfter))
        {
            invoke(callbackAfter, modal)
        }
        return
    }

    const transitionClasses = autoCssTransition(effect)

    addClass(el, transitionClasses.enterClass)
    addClass(el, transitionClasses.enterActiveClass)
    append(el, wrapper)
    const timeout = getTransitionTimeout(el)

    nextFrame(() => {
        addClass(el, transitionClasses.enterToClass)
        removeClass(el, transitionClasses.enterClass)
    })

    setTimeout(() => {
        removeClass(el, transitionClasses.enterActiveClass)
        removeClass(el, transitionClasses.enterToClass)
        if (isFunction(callbackAfter))
        {
            invoke(callbackAfter, modal)
        }
    }, timeout)
}

export function transitionRemove (modal, el, wrapper, effect, callbackAfter = null)
{
    if (!isDomNode(el) || !isDomNode(wrapper))
    {
        return
    }

    if (!effect)
    {
        if (isFunction(callbackAfter))
        {
            invoke(callbackAfter, modal)
        }
        remove(el, wrapper)
        return
    }

    const transitionClasses = autoCssTransition(effect)
    addClass(el, transitionClasses.leaveClass)
    addClass(el, transitionClasses.leaveActiveClass)
    nextFrame(() => {
        const timeout = getTransitionTimeout(el)
        removeClass(el, transitionClasses.leaveClass)
        addClass(el, transitionClasses.leaveToClass)
        setTimeout(() => {
            removeClass(el, transitionClasses.leaveActiveClass)
            removeClass(el, transitionClasses.leaveToClass)
            if (isFunction(callbackAfter))
            {
                invoke(callbackAfter, modal)
            }
            remove(el, wrapper)
        }, timeout)
    })
}

export function autoCssTransition (name)
{
    return {
        enterClass: `${name}-enter`,
        enterToClass: `${name}-enter-to`,
        enterActiveClass: `${name}-enter-active`,
        leaveClass: `${name}-leave`,
        leaveToClass: `${name}-leave-to`,
        leaveActiveClass: `${name}-leave-active`
    }
}

export const hasTransition = inBrowser && !isIE9
export let transitionProp = 'transition'
export let animationProp = 'animation'
if (hasTransition)
{
    if (window.ontransitionend === undefined &&
        window.onwebkittransitionend !== undefined
    ) {
        transitionProp = 'WebkitTransition'
    }
    if (window.onanimationend === undefined &&
        window.onwebkitanimationend !== undefined
    ) {
        animationProp = 'WebkitAnimation'
    }
}

export function getTransitionTimeout (el)
{
    const styles = window.getComputedStyle(el)
    const transitionDelays = (styles[transitionProp + 'Delay'] || '').split(', ')
    const transitionDurations = (styles[transitionProp + 'Duration'] || '').split(', ')
    const transitionTimeout = getTimeout(transitionDelays, transitionDurations)
    const animationDelays = (styles[animationProp + 'Delay'] || '').split(', ')
    const animationDurations = (styles[animationProp + 'Duration'] || '').split(', ')
    const animationTimeout = getTimeout(animationDelays, animationDurations)

    return Math.max(transitionTimeout, animationTimeout) || 0
}

const raf = inBrowser
    ? window.requestAnimationFrame
        ? window.requestAnimationFrame.bind(window)
        : setTimeout
    : fn => fn()

export function nextFrame (fn)
{
    raf(() => {
        raf(fn)
    })
}

function getTimeout (delays, durations)
{
    while (delays.length < durations.length)
    {
        delays = delays.concat(delays)
    }

    return Math.max.apply(null, durations.map((d, i) => {
        return toMs(d) + toMs(delays[i])
    }))
}

function toMs (s)
{
    return Number(s.slice(0, -1).replace(',', '.')) * 1000
}