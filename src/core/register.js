const container = []

export function initRegister (modal)
{
    modal._isRegister = false
}

export function destroyRegister (modal)
{
    modal._unregister()
}

export function registerMixin (Modal)
{
    Modal.prototype._register = function ()
    {
        const modal = this
        const id = modal._uid
        if (!modal._hasRegister(id))
        {
            modal._isRegister = true
            container.push(id)
        }
    }

    Modal.prototype._unregister = function ()
    {
        const modal = this
        const id = modal._uid
        if (modal._hasRegister(id))
        {
            container.splice(container.indexOf(id), 1)
            modal._isRegister = false
        }
    }

    Modal.prototype._hasRegister = function ()
    {
        const modal = this
        return container.indexOf(modal._uid) >= 0
    }
}

export function countRegisterModals ()
{
    return container.length
}