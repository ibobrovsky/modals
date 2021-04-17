import { initOptions } from "./options"
import { initEvents } from "./events"
import { initRegister } from "./register"
import { initRender } from "./render"
import { initView } from "./view"
import { initScroll } from "./scroll"
import { initDestroy } from "./destroy"
import { callHook } from "./lifecycle"
import { LIFECYCLE_HOOKS, EVENTS } from "../shared/constants"
import { transitionSetContent } from "./transition"

let uid = 0

export function initMixin (Modal)
{
    Modal.prototype._init = function (options)
    {
        const modal = this

        modal._uid = uid++

        initOptions(modal, options)
        initEvents(modal)
        initRegister(modal)
        initRender(modal)
        initView(modal)
        initScroll(modal)
        initDestroy(modal)
        callHook(modal, LIFECYCLE_HOOKS.INIT)
        modal.$on(EVENTS.SET_CONTENT, transitionSetContent)
    }
}