import { initMixin } from './init'
import { eventsMixin } from './events'
import { registerMixin } from './register'
import { renderMixin } from './render'
import { viewMixin } from "./view"
import { handleError } from '../util/error'
import { scrollMixin } from "./scroll"
import { destroyMixin } from "./destroy"

function Modal (options)
{
    if (!(this instanceof Modal))
    {
        handleError('Modal is a constructor and should be called with the `new` keyword')
    }
    this._init(options)
}

initMixin(Modal)
eventsMixin(Modal)
registerMixin(Modal)
renderMixin(Modal)
viewMixin(Modal)
scrollMixin(Modal)
destroyMixin(Modal)

export default Modal