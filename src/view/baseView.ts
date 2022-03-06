import { logError } from '../log/logError'
import Events from '../core/events'
import { Params } from '../core/wrapper'

export interface ViewDialogParams {
  dialogId?: string
  dialogUid: string
}

export default class BaseView extends Events {
  protected $content?: string

  constructor(
    protected params: Params,
    protected dialogParams: ViewDialogParams,
  ) {
    super()
  }

  protected getContent(): string | Promise<string> {
    const content = this.params.content

    switch (typeof content) {
      case 'string':
        return content
      case 'function': {
        let res: string | Promise<string> = ''
        try {
          res = content({
            uid: this.dialogParams.dialogUid,
            id: this.dialogParams.dialogId,
          })
        } catch (e: any) {
          res = e?.message || 'Error'
          logError(e)
        }
        if (typeof res === 'string') {
          return res
        }

        return res
      }
      default:
        return ''
    }
  }

  protected getContainer(): HTMLElement {
    return this.params.container || document.body
  }
}
