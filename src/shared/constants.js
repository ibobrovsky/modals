export const BLOCK = 'b-modal'

export const SELECTOR = {
    FIXED_CONTENT: `.${BLOCK}-fixed`,
}

export const CLASS_NAME = {
    BLOCK: BLOCK,
    OPEN: `${BLOCK}-open`,
    HIDE: `${BLOCK}-hide`,
    OVERLAY: `${BLOCK}--overlay`,
    CONTAINER: `${BLOCK}__container`,
    WRAPPER: `${BLOCK}__wrapper`,
    PRELOADER: `${BLOCK}__preloader`,
    PRELOADER_ICON: `${BLOCK}__preloader-icon`,
    DIALOG: `${BLOCK}__dialog`,
}

export const EVENTS = {
    SET_CONTENT: 'setContent'
}

export const LIFECYCLE_HOOKS = {
    INIT: 'init',
    BEFORE_SHOW: 'beforeShow',
    AFTER_SHOW: 'afterShow',
    BEFORE_HIDE: 'beforeHide',
    AFTER_HIDE: 'afterHide',
    BEFORE_SET_CONTENT: 'beforeSetContent',
    AFTER_SET_CONTENT: 'afterSetContent',
    DESTROY: 'destroy',
}