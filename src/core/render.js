import { invoke } from "../util/injector"
import {append, create, findChild, hasClass, removeClass} from '../util/dom'
import {isDomNode, isObject, isPromise} from '../util/type'
import { handleError } from "../util/error"
import { CLASS_NAME, EVENTS } from '../shared/constants'
import { transitionSetContent } from "./transition"
import { hasOwn } from "../util/index"

export function initRender (modal)
{
    modal._el = null
    modal._content = null
    modal._isAsyncContent = false
}

export function destroyRender (modal)
{
    modal._el = null
    modal._content = null
    modal._isAsyncContent = false
}

export function renderMixin (Modal)
{
    Modal.prototype._renderEl = function ()
    {
        const modal = this

        if (!this._el)
        {
            const wrapper = create('div', {
                props: {
                    className: CLASS_NAME.WRAPPER
                }
            })

            const container = create('div', {
                props: {
                    className: CLASS_NAME.CONTAINER
                },
                children: [
                    wrapper
                ]
            })

            modal._el = create('div', {
                props: {
                    className: `${CLASS_NAME.BLOCK} ${CLASS_NAME.OVERLAY}`
                },
                events: {
                    click: function (e)
                    {
                        close(modal, e.target)
                    }
                },
                children: [
                    container
                ]
            })
        }

        return modal._el
    }

    Modal.prototype._renderContent = function (asyncAfterCallback)
    {
        const modal = this

        if (!modal._content || !modal.$options.cacheContent)
        {
            modal._content = getContent(modal, modal.$options.content, asyncAfterCallback)
        }

        return modal._content
    }

    Modal.prototype.setContent = function (content, isError = false, useTransition = true)
    {
        const modal = this
        if (modal._isDestroy)
            return

        transitionSetContent(modal, getContent(modal, content), isError, useTransition)
    }
}

export function renderPreloader (modal)
{
    const preloader = create('div', {
        props: {
            className: CLASS_NAME.PRELOADER
        }
    })

    append(modal.$options.preloader, preloader)

    return preloader
}

export function getElementWrapper (el)
{
    return findChild(el, {
        className: CLASS_NAME.WRAPPER
    }, true, false)
}

export function getElementDialog (el)
{
    return findChild(el, {
        className: CLASS_NAME.DIALOG
    }, true, false)
}

export function wrapDialog (content)
{
    const dialog = create('div', {
        props: {
            className: CLASS_NAME.DIALOG
        }
    })
    append(content, dialog)

    return dialog
}

export function getContent (modal, content, asyncAfterCallback)
{
    let res
    switch (typeof content)
    {
        case "string":
            if (content.length > 0 && document.getElementById(content))
            {
                const node = document.getElementById(content).cloneNode(true)
                if (hasClass(node, CLASS_NAME.HIDE))
                {
                    removeClass(node, CLASS_NAME.HIDE)
                }
                res = node
            }
            else
            {
                res = content
            }
            break
        case "function":
            const result = invoke(content, modal)
            if (isPromise(result))
            {
                modal._isAsyncContent = true
                result.then((res) => {
                    modal._isAsyncContent = false
                    modal.$emit(EVENTS.SET_CONTENT, modal, getContent(modal, res), false, true, asyncAfterCallback)
                })
                result.catch((e) => {
                    modal._isAsyncContent = false
                    modal.$emit(EVENTS.SET_CONTENT, modal, e, true, true, asyncAfterCallback)
                    handleError(e)
                })
            }
            else
            {
                res = getContent(modal, result)
            }
            break
        case "object":
            if (isDomNode(content))
            {
                const node = content.cloneNode(true)
                if (hasClass(node, CLASS_NAME.HIDE))
                {
                    removeClass(node, CLASS_NAME.HIDE)
                }
                res = node
            }
            else if (isPromise(content))
            {
                modal._isAsyncContent = true
                content.then((res) => {
                    modal._isAsyncContent = false
                    modal.$emit(EVENTS.SET_CONTENT, modal, getContent(modal, res))
                })
                content.catch((e) => {
                    modal._isAsyncContent = false
                    modal.$emit(EVENTS.SET_CONTENT, modal, e, true)
                    handleError(e)
                })
            }
            else if (isObject(content) && hasOwn(content, 'data'))
            {
                res = getContent(modal, content.data)
            }
            break
    }

    return res
}

function close (modal, target)
{
    const wrapper = getElementWrapper(modal._el)

    let hide = wrapper === target || !!target.closest('[data-modal-close=""]')

    if (hide)
    {
        modal.hide()
    }
}