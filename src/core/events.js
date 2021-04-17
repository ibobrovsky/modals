import { toArray } from '../util/type'
import { invoke } from '../util/injector'

export function initEvents (modal)
{
    modal._events = Object.create(null)
    modal._hasHookEvent = false
}

export function destroyEvents (modal)
{
    modal.$off()
    modal._hasHookEvent = false
}

export function eventsMixin (Modal)
{
    const hookRE = /^hook:/
    Modal.prototype.$on = function (event, fn)
    {
        const modal = this
        if (Array.isArray(event))
        {
            for (let i = 0, l = event.length; i < l; i++)
            {
                modal.$on(event[i], fn)
            }
        }
        else
        {
            (modal._events[event] || (modal._events[event] = [])).push(fn)
            if (hookRE.test(event))
            {
                modal._hasHookEvent = true
            }
        }

        return modal
    }

    Modal.prototype.$once = function (event, fn)
    {
        const modal = this
        function on ()
        {
            modal.$off(event, on)
            fn.apply(modal, arguments)
        }
        on.fn = fn
        modal.$on(event, on)
        return modal
    }

    Modal.prototype.$off = function (event, fn)
    {
        const modal = this
        if (!arguments.length)
        {
            modal._events = Object.create(null)
            return modal
        }
        if (Array.isArray(event))
        {
            for (let i = 0, l = event.length; i < l; i++)
            {
                modal.$off(event[i], fn)
            }
            return modal
        }

        const cbs = modal._events[event]
        if (!cbs)
        {
            return modal
        }

        if (!fn)
        {
            modal._events[event] = null
            return modal
        }
        let cb
        let i = cbs.length
        while (i--)
        {
            cb = cbs[i]
            if (cb === fn || cb.fn === fn)
            {
                cbs.splice(i, 1)
                break
            }
        }
        return modal
    }

    Modal.prototype.$emit = function (event)
    {
        const modal = this
        let cbs = modal._events[event]
        if (cbs)
        {
            cbs = cbs.length > 1 ? toArray(cbs) : cbs
            const args = toArray(arguments, 1)
            for (let i = 0, l = cbs.length; i < l; i++)
            {
                invoke(cbs[i], modal, args)
            }
        }
        return modal
    }
}