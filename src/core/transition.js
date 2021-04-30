import { addClass, append, removeClass } from "../util/dom"
import { wrapDialog, getElementWrapper, renderPreloader, getElementDialog } from "./render"
import { transitionAppend, transitionRemove } from "../util/transition"
import { CLASS_NAME, LIFECYCLE_HOOKS } from "../shared/constants"
import { callHook } from "./lifecycle"
import { isFunction } from "../util/type"
import { invoke } from "../util/injector"

export function transitionAppendModal (modal)
{
    const asyncAfterCallback = function ()
    {
        callHook(modal, LIFECYCLE_HOOKS.AFTER_SHOW)
    }

    const el = modal._renderEl()
    const content = modal._renderContent(asyncAfterCallback)
    if (!content && modal._isAsyncContent)
    {
        append(renderPreloader(modal), getElementWrapper(el))
    }

    callHook(modal, LIFECYCLE_HOOKS.BEFORE_SHOW)

    transitionAppend(modal, el, modal.$options.container, modal.$options.effect, false)

    modal._checkScrollbar()
    modal._setScrollbar()
    modal._adjustDialog()

    addClass(modal.$options.overflowContainer, CLASS_NAME.OPEN)

    transitionSetContent(modal, content, false, true, asyncAfterCallback)
}

export function transitionRemoveModal (modal, countOpenModals)
{
    callHook(modal, LIFECYCLE_HOOKS.BEFORE_HIDE)
    transitionRemove(modal, modal._el, modal.$options.container, modal.$options.effect, () => {
        modal._resetAdjustments()
        if (countOpenModals == 1)
        {
            removeClass(modal.$options.overflowContainer, CLASS_NAME.OPEN)
            modal._resetScrollbar()
        }
    })
    transitionRemove(modal, getElementDialog(modal._el), getElementWrapper(modal._el), modal.$options.contentEffect, () => {
        callHook(modal, LIFECYCLE_HOOKS.AFTER_HIDE)
    })
}

export function transitionSetContent (modal, content, isError = false, useTransition = true, callback = null)
{
    if (!modal._el || content === undefined)
    {
        return
    }

    callHook(modal, LIFECYCLE_HOOKS.BEFORE_SET_CONTENT)

    content = wrapDialog(content)

    if (!!modal.$options.cacheContent && !isError)
    {
        modal._content = content
    }

    transitionAppend(modal, content, getElementWrapper(modal._el), modal.$options.contentEffect, true, useTransition, () => {
        callHook(modal, LIFECYCLE_HOOKS.AFTER_SET_CONTENT)
        if (isFunction(callback))
        {
            invoke(callback, modal)
        }
    })
}