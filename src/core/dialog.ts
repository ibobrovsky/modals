import Events from './events'
import { invoke } from '../utils/invoke'
import Registry from './registry'
import View from './view'
import { Params } from './wrapper'
import { ViewInterface } from '../view/viewInterface'
import { rand } from '../utils/rand'

let uid = 0

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

type DialogEventCallbackParams =
  | DialogHookInitParams
  | DialogHookBeforeShowParams
  | DialogHookAfterShowParams
  | DialogHookBeforeHideParams
  | DialogHookAfterHideParams
  | DialogHookDestroyedParams

export interface ModalDialog {
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

interface DialogProps {
  id?: string
  params: Params
  wrapperUid: number
}

const registry = new Registry()

export default class Dialog extends Events implements ModalDialog {
  constructor({ wrapperUid, id, params }: DialogProps) {
    super()
    this.wrapperUid = wrapperUid

    this.uid = `i-${this.wrapperUid}-${uid++}-${rand()}`

    this.view = View.create(params, {
      dialogUid: this.uid,
      dialogId: id,
    })
    this.view.$on('close', () => {
      this.hide()
    })
    this.id = id

    this.params = params

    this.callHook('init', {})

    this.isInit = true
  }

  private readonly wrapperUid: DialogProps['wrapperUid']

  private readonly uid: string

  private readonly view: ViewInterface

  private readonly id: DialogProps['id']

  private readonly params: DialogProps['params']

  private readonly isInit: boolean

  private isDestroyed: boolean = false

  private isShowed: boolean = false

  getId(): DialogProps['id'] {
    return this.id
  }

  getUid(): string {
    return this.uid
  }

  destroy(): void {
    if (this.isDestroyed) {
      return
    }
    this.isDestroyed = true
    this.view.remove()
    this.isShowed = false
    this.callHook('destroyed', {})
    this.$off()
    this.view.$off()
  }

  show(): void {
    if (registry.has(this.uid) || this.isShowed || this.isDestroyed) {
      return
    }

    let res = true
    this.callHook('beforeShow', {
      cancel() {
        res = false
      },
    })
    if (!res) {
      return
    }

    this.isShowed = true
    registry.set(this.uid)

    this.view.show(
      registry.length === 1,
      () => {
        this.callHook('afterShow', {})
      },
      () => {
        this.callHook('setContent', {})
      },
    )
  }

  hide(): void {
    if (!registry.has(this.uid) || !this.isShowed || this.isDestroyed) {
      return
    }
    let res = true
    this.callHook('beforeHide', {
      cancel() {
        res = false
      },
    })
    if (!res) {
      return
    }

    this.view.hide(registry.length === 1, () => {
      this.callHook('afterHide', {})
    })

    registry.unset(this.uid)
    this.isShowed = false
  }

  $on<E extends keyof DialogEventsMap>(
    event: E | E[],
    callback: DialogEventsMap[E],
  ): void {
    super.$on(event, callback)
  }

  $off<E extends keyof DialogEventsMap>(
    event?: E | E[],
    callback?: DialogEventsMap[E],
  ): void {
    super.$off(event, callback)
  }

  $emit<E extends keyof DialogEventsMap>(event: E, ...args: any[]): void {
    super.$emit(event, ...args)
  }

  protected callHook<K extends keyof DialogEventsMapParams>(
    hook: K,
    params: DialogEventsMapParams[K],
  ): void {
    const handler = this.params.events?.[hook]

    const _params: DialogHookSharedParams & DialogEventCallbackParams = {
      id: this.id,
      uid: this.uid,
      ...params,
    }
    this.$emit(hook, _params)
    invoke(handler, _params)
  }
}
