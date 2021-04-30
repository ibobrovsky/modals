import { invoke } from "../util/injector"
import {append, clean, create, findChild, hasClass, removeClass} from '../util/dom'
import {isDomNode, isObject, isPromise, isString} from '../util/type'
import { handleError } from "../util/error"
import { CLASS_NAME, EVENTS } from '../shared/constants'
import { transitionSetContent } from "./transition"
import { hasOwn } from "../util/index"

export function initRender (modal)
{
    modal._el = null
    modal._content = null
    modal._isAsyncContent = false

    modal._originalNode = null
    modal._originalNodeChildNodes = null
}

export function destroyRender (modal)
{
    modal._el = null
    modal._content = null
    modal._isAsyncContent = false

    if (modal._originalNode && modal._originalNodeChildNodes)
    {
        const fragment = document.createDocumentFragment()
        for (let child of modal._originalNodeChildNodes)
        {
            fragment.appendChild(child)
        }
        modal._originalNodeChildNodes = null
        modal._originalNode.appendChild(fragment)
        modal._originalNode = null
    }
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

        transitionSetContent(modal, getContent(modal, content), isError, useTransition, null)
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
                res = cloneNode(modal, document.getElementById(content))
                if (hasClass(res, CLASS_NAME.HIDE))
                {
                    removeClass(res, CLASS_NAME.HIDE)
                }
            }
            else
            {
                // checkScripts(modal, content)
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
                res = cloneNode(modal, content)
                if (hasClass(res, CLASS_NAME.HIDE))
                {
                    removeClass(res, CLASS_NAME.HIDE)
                }
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

// function checkScripts (modal, content)
// {
//     let elData = {}
//     if (isString(content))
//     {
//         elData = {html: content}
//     }
//     else if (isDomNode(content))
//     {
//         elData = {children: [content]}
//     }
//     else
//     {
//         return
//     }
//
//     const el = create('div', elData)
//
//     const scripts = el.querySelectorAll('script')
//
//     if (scripts.length > 0)
//     {
//         for (let script of scripts)
//         {
//             modal._scripts.push(new Function(script.textContent))
//         }
//     }
// }

// export function runScripts (modal)
// {
//     if (modal._scripts.length > 0)
//     {
//         modal._scripts.forEach(fn => {
//             try {
//                 invoke(fn, null)
//             } catch (e) {
//                 console.warn(e)
//             }
//         })
//         const dialog = getElementDialog(modal._el)
//         modal._content = dialog.innerHTML
//         modal._scripts = []
//     }
// }

function cloneNode (modal, node)
{
    if (isDomNode(node))
    {
        modal._originalNode = node
        if (modal._originalNode.childNodes.length)
        {
            modal._originalNodeChildNodes = []
            for (let child of modal._originalNode.childNodes)
            {
                modal._originalNodeChildNodes.push(child)
            }
        }
        const clone = modal._originalNode.cloneNode(true)
        clean(modal._originalNode)
        return clone
    }

    return null
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