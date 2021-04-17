import { SELECTOR } from "../shared/constants"
import { Data } from "../util/data"
import { countRegisterModals } from "./register"

export function initScroll (modal)
{
    modal._isBodyOverflowing = null
    modal._scrollbarWidth = null
}

export function destroyScroll (modal)
{
    modal._isBodyOverflowing = null
    modal._scrollbarWidth = null
    _firstIsModalOverflowing = null
    _firstIsBodyOverflowing = null
}

let _firstIsModalOverflowing = null
let _firstIsBodyOverflowing = null

export function scrollMixin (Modal)
{
    Modal.prototype._adjustDialog = function ()
    {
        const modal = this
        const el = modal._el
        const isModalOverflowing = el.scrollHeight > document.documentElement.clientHeight

        if (countRegisterModals() === 1)
        {
            _firstIsModalOverflowing = isModalOverflowing
            _firstIsBodyOverflowing = modal._isBodyOverflowing
        }

        if (
            (!modal._isBodyOverflowing && isModalOverflowing) ||
            // fix double open
            (!_firstIsBodyOverflowing && _firstIsModalOverflowing)
        )
        {
            el.style.paddingLeft = `${modal._scrollbarWidth}px`
        }

        if (
            (modal._isBodyOverflowing && !isModalOverflowing) ||
            // fix double open
            (_firstIsBodyOverflowing && !_firstIsModalOverflowing)
        )
        {
            el.style.paddingRight = `${modal._scrollbarWidth}px`
        }
    }

    Modal.prototype._resetAdjustments = function ()
    {
        const modal = this
        const el = modal._el
        el.style.paddingLeft = ''
        el.style.paddingRight = ''
    }

    Modal.prototype._checkScrollbar = function ()
    {
        const modal = this
        const rect = document.body.getBoundingClientRect()
        modal._isBodyOverflowing = rect.left + rect.right < window.innerWidth
        modal._scrollbarWidth = getScrollbarWidth()
    }

    Modal.prototype._setScrollbar = function ()
    {
        const modal = this
        if (modal._isBodyOverflowing)
        {
            let fixedElements = document.querySelectorAll(SELECTOR.FIXED_CONTENT)
            for(let i = 0; i < fixedElements.length; i++)
            {
                let element = fixedElements[i]
                const actualPadding = element.style.paddingRight
                const computedStyle = window.getComputedStyle(element, null)
                const calculatedPadding = computedStyle.paddingRight

                Data.set(element, actualPadding)
                element.style.paddingRight = `${parseFloat(calculatedPadding) + modal._scrollbarWidth}px`
            }

            const actualPadding = document.body.style.paddingRight
            const bodyComputedStyle = window.getComputedStyle(document.body, null)
            const calculatedPadding = bodyComputedStyle.paddingRight

            Data.set(document.body, actualPadding)
            document.body.style.paddingRight = `${parseFloat(calculatedPadding) + modal._scrollbarWidth}px`
        }
    }

    Modal.prototype._resetScrollbar = function ()
    {
        let fixedElements = document.querySelectorAll(SELECTOR.FIXED_CONTENT)
        for(let i = 0; i < fixedElements.length; i++)
        {
            let element = fixedElements[i]
            const padding = Data.get(element)
            if (typeof padding !== 'undefined')
            {
                element.style.paddingRight = padding
                Data.delete(element)
            }
        }

        const bodyPadding = Data.get(document.body)
        if (typeof bodyPadding !== 'undefined')
        {
            document.body.style.paddingRight = bodyPadding
            Data.delete(document.body)
        }
    }
}

function getScrollbarWidth ()
{
    const scrollDiv = document.createElement('div')
    scrollDiv.style.position = "absolute"
    scrollDiv.style.top = "-9999px"
    scrollDiv.style.width = "50px"
    scrollDiv.style.height = "50px"
    scrollDiv.style.overflow = "scroll"
    document.body.appendChild(scrollDiv)
    const scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth
    document.body.removeChild(scrollDiv)
    return scrollbarWidth
}