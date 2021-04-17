import {isDomNode, isString, isObject, isFunction, isPromise} from "../util/type"
import { validateOptions, validateOption } from '../util/options'
import { CLASS_NAME } from "../shared/constants"

export function initOptions (modal, options)
{
    modal.$options = validateOptions(modal, options)
}

export function destroyOptions (modal)
{
    modal.$options = null
}

export function getDefaultOptions ()
{
    return {
        content: {
            type: [
                String,
                Function,
                Node,
                Promise
            ],
            default: ''
        },
        preloader: {
            type: String,
            default: function (defaultOptions, options)
            {
                const modal = this
                const preloaderColor = validateOption(modal, defaultOptions, options, 'preloaderColor')
                let style = !!preloaderColor ? 'style="fill: '+ preloaderColor +'"' : ''
                return `
                    <div class="${CLASS_NAME.PRELOADER_ICON}">
                        <svg ${style} version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
                            <path d="M31.6,3.5C5.9,13.6-6.6,42.7,3.5,68.4c10.1,25.7,39.2,38.3,64.9,28.1l-3.1-7.9c-21.3,8.4-45.4-2-53.8-23.3 c-8.4-21.3,2-45.4,23.3-53.8L31.6,3.5z"/>
                            <path d="M42.3,39.6c5.7-4.3,13.9-3.1,18.1,2.7c4.3,5.7,3.1,13.9-2.7,18.1l4.1,5.5c8.8-6.5,10.6-19,4.1-27.7 c-6.5-8.8-19-10.6-27.7-4.1L42.3,39.6z"/>
                            <path d="M82,35.7C74.1,18,53.4,10.1,35.7,18S10.1,46.6,18,64.3l7.6-3.4c-6-13.5,0-29.3,13.5-35.3s29.3,0,35.3,13.5 L82,35.7z"/>
                        </svg>
                    </div>
                `
            }
        },
        preloaderColor: {
            type: String,
            default: '#fff'
        },
        effect: {
            type: String,
            default: ''
        },
        contentEffect: {
            type: String,
            default: ''
        },
        cacheContent: {
            type: Boolean,
            default: true
        },
        container: {
            type: [
                String,
                Node
            ],
            default: document.body,
            validator: function (value)
            {
                let valid = false
                if (isString(value))
                {
                    let node = document.querySelector(value)
                    if (isDomNode(node))
                    {
                        valid = true
                        value = node
                    }
                }
                else if (isDomNode(value))
                {
                    valid = true
                }
                return {
                    valid,
                    value
                }
            }
        },
        overflowContainer: {
            type: [
                Node,
                String
            ],
            default: document.body,
            validator: function (value)
            {
                let valid = false
                if (isDomNode(value) && (value === document.body || value === document.documentElement))
                {
                    valid = true
                }
                else if (isString(value))
                {
                    switch (value)
                    {
                        case 'body':
                            valid = true
                            value = document.body
                            break;
                        case 'html':
                            valid = true
                            value = document.documentElement
                            break
                    }
                }

                return {
                    valid,
                    value
                }
            }
        }
    }
}