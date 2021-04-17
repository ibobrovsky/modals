import { transitionAppendModal, transitionRemoveModal } from "./transition"
import { remove } from "../util/dom"

export function initView (modal)
{
    modal._isShow = false
}

export function destroyView (modal)
{
    remove(modal._el, modal.$options.container)
    modal._isShow = false
}

export function viewMixin (Modal)
{
    Modal.prototype.show = function ()
    {
        const modal = this
        if (modal._hasRegister() || modal._isDestroy)
            return modal

        modal._isShow = true

        modal._register()

        transitionAppendModal(modal)

        return modal
    }

    Modal.prototype.hide = function ()
    {
        const modal = this
        if (!modal._hasRegister() || modal._isDestroy)
            return modal

        transitionRemoveModal(modal)

        modal._unregister()
        modal._isShow = false
        return modal
    }
}