import Dialog, { ModalDialog } from './dialog'
import { mergeOptions } from '../utils/mergeObjects'
import {
  Definition,
  Params,
  ModalWrapperEvents,
  ModalWrapperParams,
} from './wrapper'

interface IInstance {
  id?: string
  uid: string
  dialog: ModalDialog
}

interface IDefinitions {
  [id: string]: Params | undefined
}

interface ModalContainerProps {
  uid: number
  defaults?: ModalWrapperParams
  parentEvents: ModalWrapperEvents
}

type BuildParams = Params & {
  id?: string
}

export default class ModalContainer {
  private readonly instances: IInstance[] = []

  private readonly definitions: IDefinitions = {}

  private readonly uid: ModalContainerProps['uid']

  private readonly defaults: ModalContainerProps['defaults']

  private readonly parentEvents: ModalContainerProps['parentEvents']

  constructor({ parentEvents, defaults, uid }: ModalContainerProps) {
    this.uid = uid
    this.defaults = defaults
    this.parentEvents = parentEvents
  }

  setDefinitions(definitions: Definition[]) {
    definitions.forEach(({ id, ...params }) => {
      if (!id) {
        return
      }
      this.definitions[id] = params
    })
  }

  get(id: string | Params, params?: Params): ModalDialog | undefined {
    if (typeof id === 'string') {
      const instance = this.getInstance(id)
      if (instance) {
        return instance
      } else if (this.definitions[id]) {
        return this.build({
          id,
          ...mergeOptions<Params>(this.definitions[id], params, true),
        })
      }

      if (params) {
        return this.build({
          id,
          ...params,
        })
      }

      return undefined
    }

    return this.build(id)
  }

  getInstance(id: string): ModalDialog | undefined {
    const instance = this.instances.find((i) => i.uid === id || i.id === id)
    return instance ? instance.dialog : undefined
  }

  unsetInstance(id?: string): void {
    const index = this.instances.findIndex((i) => i.uid === id || i.id === id)

    if (index !== -1) {
      this.instances.splice(index, 1)
    }
  }

  protected build(params: BuildParams): ModalDialog {
    const _params = mergeOptions<BuildParams>(this.defaults, params, true)

    const dialog = new Dialog({
      id: _params.id,
      params: _params,
      wrapperUid: this.uid,
    })

    const hide = dialog.hide.bind(dialog)

    this.parentEvents.$on('hideAll', hide)

    dialog.$on('destroyed', ({ id }) => {
      this.unsetInstance(id)
      this.parentEvents.$off('hideAll', hide)
    })

    this.instances.push({
      id: dialog.getId(),
      uid: dialog.getUid(),
      dialog,
    })

    return dialog
  }
}
