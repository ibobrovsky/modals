export type ModalEventCallback = (...args: any[]) => void

export interface EventsStore {
  [key: string]: ModalEventCallback[] | undefined
}

export default class Events {
  private events: EventsStore = {}

  $on(event: string | string[], callback: ModalEventCallback): void {
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        this.$on(event[i], callback)
      }
    } else {
      if (!Array.isArray(this.events[event])) {
        this.events[event] = []
      }
      // @ts-ignore
      this.events[event].push(callback)
    }
  }

  $off(event?: string | string[], callback?: ModalEventCallback): void {
    if (!event && !callback) {
      this.events = {}
      return
    }

    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        this.$off(event[i], callback)
      }
      return
    } else if (!event) {
      return
    }

    const cbs = this.events[event]
    if (!cbs) {
      return
    }

    if (!callback) {
      this.events[event] = undefined
      return
    }

    let cb
    let i = cbs.length
    while (i--) {
      cb = cbs[i]
      if (cb === callback) {
        cbs.splice(i, 1)
        break
      }
    }
  }

  $emit(event: string, ...args: any[]): void {
    const cbs = this.events[event]
    if (!cbs) {
      return cbs
    }

    cbs.forEach((cb) => {
      if (!cb) {
        return
      }
      args ? cb.apply(this, args) : cb.call(this)
    })
  }
}
