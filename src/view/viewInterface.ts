import { ModalEventCallback } from '../core/events'

export type ViewHook = 'close'

export interface ViewInterface {
  show(isFirst: boolean, cb?: () => void): void
  hide(isLast: boolean, cb?: () => void): void
  remove(): void
  $on(event: ViewHook | ViewHook[], callback: ModalEventCallback): void
  $off(event?: ViewHook | ViewHook[], callback?: ModalEventCallback): void
  $emit(event: ViewHook, ...args: any[])
}
