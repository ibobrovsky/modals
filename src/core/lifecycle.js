import { toArray } from '../util/type'
import { invoke } from '../util/injector'

export function callHook (modal, hook)
{
    const handler = modal.$options[hook]
    if (handler)
    {
        const args = toArray(arguments, 2)
        invoke(handler, modal, args)
    }

    if (modal._hasHookEvent)
    {
        modal.$emit('hook:' + hook)
    }
}