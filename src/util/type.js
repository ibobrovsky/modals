import { getTag } from './index'

export function toArray (list, start)
{
    start = start || 0
    let i = list.length - start
    const ret = new Array(i)
    while (i--)
    {
        ret[i] = list[i + start]
    }
    return ret
}

export function isString (value)
{
    return typeof value === 'string'
}

export function isPlainObject (value)
{
    if (!isObjectLike(value) || getTag(value) !== '[object Object]')
    {
        return false
    }
    const proto = Object.getPrototypeOf(value)
    if (proto === null)
    {
        return true
    }
    const ctor = proto.hasOwnProperty('constructor') && proto.constructor

    return (
        typeof ctor === 'function' &&
        Function.prototype.toString.call(ctor) === Function.prototype.toString.call(Object)
    )

}

export function isObjectLike (value)
{
    return !!value && typeof value === 'object'
}

export function isDomNode (value)
{
    return isObjectLike(value) && !isPlainObject(value) && 'nodeType' in value
}

export function isElementNode (value)
{
    return isDomNode(value) && value.nodeType === Node.ELEMENT_NODE
}

export function isNull (value)
{
    return value === null
}

export function isUndefined (value)
{
    return typeof value === 'undefined'
}

export function isNumber (value)
{
    return !Number.isNaN(value) && typeof value === 'number'
}

export function isNil (value)
{
    return value === null || value === undefined
}

export function isArray (value)
{
    return !isNil(value) && Array.isArray(value)
}

export function isFunction (value)
{
    return typeof value === 'function'
}

export function isObject (value)
{
    return !!value && (typeof value === 'object' || typeof value === 'function')
}

export function isPromise (value)
{
    return (
        !isNil(value) &&
        typeof value.then === 'function' &&
        typeof value.catch === 'function'
    )
}