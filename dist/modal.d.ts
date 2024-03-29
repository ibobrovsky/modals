export type Value = string | number | boolean | undefined | null
export type Mapping = { [key: string]: any }
export type Argument = Value | Mapping | Argument[]

interface ModalClasses {
  el: Argument | Argument[]
  open: Argument | Argument[]
  hide: Argument | Argument[]
  overlay: Argument | Argument[]
  container: Argument | Argument[]
  wrapper: Argument | Argument[]
  dialog: Argument | Argument[]
  preloader: Argument | Argument[]
}

interface DialogHookSharedParams {
  id?: string
  uid: string
}

interface DialogHookInitParams {}

interface DialogHookBeforeShowParams {
  cancel(): void
}

interface DialogHookAfterShowParams {}

interface DialogHookBeforeHideParams {
  cancel(): void
}

interface DialogHookAfterHideParams {}

interface DialogHookDestroyedParams {}

interface DialogHookSetContentParams {}

type DialogEventCallback<T> = (params: T & DialogHookSharedParams) => void

interface DialogEventsMapParams {
  init: DialogHookInitParams
  beforeShow: DialogHookBeforeShowParams
  afterShow: DialogHookAfterShowParams
  beforeHide: DialogHookBeforeHideParams
  afterHide: DialogHookAfterHideParams
  destroyed: DialogHookDestroyedParams
  setContent: DialogHookSetContentParams
}

export type DialogEventsMap = {
  [K in keyof DialogEventsMapParams]: DialogEventCallback<
    DialogEventsMapParams[K]
  >
}

interface Scrollbar {
  add(el?: HTMLElement | null): void
  remove(el?: HTMLElement | null): void
}

interface SharedParams {
  container?: HTMLElement
  overflowContainer?: 'body' | 'html'
  cacheContent?: boolean
  scrollbar?: Scrollbar
  scrollbarFixedClass?: string
  preloader?: string
  events?: {
    [K in keyof DialogEventsMap]?: DialogEventsMap[K]
  }
}

type ModalViewEffect = 'modal-zoom-out' | 'modal-zoom-in' | string

type ModalViewContentEffect = 'modal-fade' | string

export interface ModalParams extends SharedParams {
  classes?: ModalClasses
  effect?: ModalViewEffect
  contentEffect?: ModalViewContentEffect
}

type ContentFnParams = {
  id?: string
  uid: string
}

interface DialogContentParam {
  content:
    | string
    | ((params: ContentFnParams) => string)
    | ((params: ContentFnParams) => Promise<string>)
}

interface DefinitionsParam {
  modals?: Definition[]
}

interface Params extends ModalParams, DialogContentParam {}

interface Definition extends Params {
  id: string
}

interface CreateModalInstanceParams extends ModalParams, DefinitionsParam {}

interface ModalDialogInstance {
  getId(): string | undefined
  getUid(): string
  show(): void
  hide(): void
  destroy(): void
  $on<E extends keyof DialogEventsMap>(
    event: E | E[],
    callback: DialogEventsMap[E],
  ): void
  $off<E extends keyof DialogEventsMap>(
    event?: E | E[],
    callback?: DialogEventsMap[E],
  ): void
  $emit<E extends keyof DialogEventsMap>(event: E, ...args: any[]): void
}

interface ModalInstance {
  getInstance(
    id: string | Params,
    params?: Params,
  ): ModalDialogInstance | undefined
  setDefinitions(definitions: Definition[]): void
  show(id: string | Params, params?: Params): void
  hide(id: string): void
  destroy(id: string): void
  hideAll(): void
  $on<E extends keyof DialogEventsMap>(
    id: string,
    event: E | E[],
    callback: DialogEventsMap[E],
  ): void
  $off<E extends keyof DialogEventsMap>(
    id: string,
    event?: E | E[],
    callback?: DialogEventsMap[E],
  ): void
}

type CreateModalInstance = (params?: CreateModalInstanceParams) => ModalInstance

declare global {
  interface Window {
    createModalInstance: CreateModalInstance
  }
}
