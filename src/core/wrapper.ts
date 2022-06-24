import ModalContainer from './container'
import Events from './events'
import { DialogEventsMap, ModalDialog } from './dialog'
import {
  ModalClasses,
  ModalViewContentEffect,
  ModalViewEffect,
} from '../view/modalView'
import Scrollbar from '../scrollbar'

let uid = 0

interface SharedParams {
  container?: HTMLElement
  overflowContainer?: 'body' | 'html'
  cacheContent?: boolean
  preloader?: string
  scrollbar?: typeof Scrollbar
  scrollbarFixedClass?: string
  events?: {
    [K in keyof DialogEventsMap]?: DialogEventsMap[K]
  }
}

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

export interface Params extends ModalParams, DialogContentParam {}

export interface Definition extends Params {
  id: string
}

export interface ModalWrapperParams extends ModalParams, DefinitionsParam {}

interface ModalWrapperEventsMap {
  hideAll: () => void
}

export interface ModalWrapperEvents {
  $on<E extends keyof ModalWrapperEventsMap>(
    event: E | E[],
    callback: ModalWrapperEventsMap[E],
  ): void
  $off<E extends keyof ModalWrapperEventsMap>(
    event?: E | E[],
    callback?: ModalWrapperEventsMap[E],
  ): void
  $emit<E extends keyof ModalWrapperEventsMap>(event: E, ...args: any[])
}

class ModalWrapper {
  static create(params?: ModalWrapperParams) {
    return new ModalWrapper(params)
  }

  private constructor(defaults?: ModalWrapperParams) {
    this.uid = uid++
    this.events = new Events()
    let definitions: Definition[] = []
    if (defaults?.modals) {
      definitions = defaults.modals
      delete defaults.modals
    }
    this.container = new ModalContainer({
      uid: this.uid,
      defaults,
      parentEvents: this.events,
    })
    this.setDefinitions(definitions)
  }

  private readonly uid: number

  private readonly container: ModalContainer

  private readonly events: ModalWrapperEvents

  getInstance(id: string | Params, params?: Params): ModalDialog | undefined {
    return this.container.get(id, params)
  }

  setDefinitions(definitions: Definition[]): void {
    this.container.setDefinitions(definitions)
  }

  show(id: string | Params, params?: Params): void {
    const instance = this.container.get(id, params)
    if (!instance) {
      return
    }

    instance.show()
  }

  hide(id: string): void {
    let instance = this.container.getInstance(id)
    if (!instance) {
      return
    }

    instance.hide()
  }

  hideAll(): void {
    this.events.$emit('hideAll')
  }

  destroy(id: string): void {
    let instance = this.container.getInstance(id)
    if (!instance) {
      return
    }

    instance.destroy()
  }

  $on<E extends keyof DialogEventsMap>(
    id: string,
    event: E | E[],
    callback: DialogEventsMap[E],
  ): void {
    let instance = this.container.getInstance(id)
    if (!instance) {
      return
    }
    instance.$on(event, callback)
  }

  $off<E extends keyof DialogEventsMap>(
    id: string,
    event?: E | E[],
    callback?: DialogEventsMap[E],
  ): void {
    let instance = this.container.getInstance(id)
    if (!instance) {
      return
    }
    instance.$off(event, callback)
  }
}

export default ModalWrapper
