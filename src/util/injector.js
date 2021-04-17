import { handleError } from './error'

export function invoke (handler, context, args)
{
    let res
    try {
        res = args ? handler.apply(context, args) : handler.call(context)
    } catch (e) {
        handleError(e)
    }
    return res
}