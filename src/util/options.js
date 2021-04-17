import { getDefaultOptions } from "../core/options"
import { hasOwn, capitalize } from "./index"
import { isPlainObject } from "./type"
import { handleError, logWarn } from "./error"
import { invoke } from "./injector"

const functionTypeCheckRE = /^\s*function (\w+)/
const simpleCheckRE = /^(String|Number|Boolean|Function|Symbol|BigInt)$/

export function validateOptions (modal, options)
{
    const defaultOptions = getDefaultOptions()

    for (let key in defaultOptions)
    {
        options[key] = validateOption(modal, defaultOptions, options, key)
    }

    return options
}

export function validateOption (modal, defaultOptions, options, key)
{
    const defaultOption = defaultOptions[key]
    let value = options[key]

    let type = defaultOption.type
    let valid = !type || type === true
    const expectedTypes = []
    if (type)
    {
        if (!Array.isArray(type))
        {
            type = [type]
        }
        for (let i = 0; i < type.length && !valid; i++)
        {
            const assertedType = assertType(value, type[i])
            expectedTypes.push(assertedType.expectedType || '')
            valid = assertedType.valid
        }
    }
    const haveExpectedTypes = expectedTypes.some(t => t)
    if (value !== undefined && !valid && haveExpectedTypes)
    {
        let message = `Invalid option: type check failed for option "${key}".` +
            ` Expected type: ${expectedTypes.map(capitalize).join(', ')}.`

        logWarn(message)
    }

    const validator = defaultOption.validator
    if (value !== undefined && validator)
    {
        const validatorResponse = validator(value)
        if (validatorResponse.value)
        {
            value = validatorResponse.value
        }
        if (!validatorResponse.valid)
        {
            valid = false
            logWarn('Invalid option: validator check failed for option "' + key + '".')
        }
    }

    if (value === undefined || !valid)
    {
        value = getOptionDefaultValue(modal, defaultOptions, options, key)
    }
    return value
}

function getOptionDefaultValue (modal, defaultOptions, options, key)
{
    const defaultOption = defaultOptions[key]
    if (!hasOwn(defaultOption, 'default'))
    {
        return undefined
    }
    const def = defaultOption.default

    return typeof def === 'function' && getType(defaultOption.type) !== 'Function'
        ? invoke(def, modal, [defaultOptions, options])
        : def
}

function assertType (value, type)
{
    let valid
    const expectedType = getType(type)
    if (simpleCheckRE.test(expectedType))
    {
        const t = typeof value
        valid = t === expectedType.toLowerCase()
        if (!valid && t === 'object')
        {
            valid = value instanceof type
        }
    }
    else if (expectedType === 'Object')
    {
        valid = isPlainObject(value)
    }
    else if (expectedType === 'Array')
    {
        valid = Array.isArray(value)
    }
    else
    {
        try {
            valid = value instanceof type
        } catch (e) {
            handleError('Invalid option type: "' + String(type) + '" is not a constructor')
            valid = false
        }
    }
    return {
        valid,
        expectedType
    }
}

function getType (fn)
{
    const match = fn && fn.toString().match(functionTypeCheckRE)
    return match ? match[1] : ''
}