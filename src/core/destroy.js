import { destroyEvents } from "./events"
import { callHook } from "./lifecycle"
import { LIFECYCLE_HOOKS } from "../shared/constants"
import { destroyOptions } from "./options"
import { destroyRegister } from "./register"
import { destroyRender } from "./render"
import { destroyScroll } from "./scroll"
import { destroyView } from "./view"

export function initDestroy (modal)
{
    modal._isDestroy = false
}

export function destroyMixin (Modal)
{
    Modal.prototype.destroy = function ()
    {
        const modal = this
        if (modal._isDestroy)
            return

        modal._isDestroy = true

        destroyScroll(modal)
        destroyView(modal)
        destroyRender(modal)
        destroyRegister(modal)
        callHook(modal, LIFECYCLE_HOOKS.DESTROY)
        destroyEvents(modal)
        destroyOptions(modal)
    }
}