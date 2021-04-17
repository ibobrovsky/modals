import { isArray } from "./type"

const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn (obj, key)
{
    return hasOwnProperty.call(obj, key)
}

export function getTag (value)
{
    return Object.prototype.toString.call(value)
}

export function arrayMerge (first, second)
{
    if (!isArray(first)) first = []
    if (!isArray(second)) second = []

    let i = first.length, j = 0;

    if (typeof second.length === "number")
    {
        for (let l = second.length; j < l; j++)
        {
            first[i++] = second[j]
        }
    }
    else
    {
        while (second[j] !== undefined)
        {
            first[i++] = second[j++]
        }
    }

    first.length = i

    return first
}

export function cached (fn)
{
    const cache = Object.create(null)
    return (function cachedFn (str)
    {
        const hit = cache[str]
        return hit || (cache[str] = fn(str))
    })
}

export const capitalize = cached((str) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
})