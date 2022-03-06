import { ViewInterface } from '../view/viewInterface'
import ModalView from '../view/modalView'
import { Params } from './wrapper'
import { ViewDialogParams } from '../view/baseView'

export default class View {
  static create(params: Params, dialogParams: ViewDialogParams): ViewInterface {
    return new ModalView(params, dialogParams)
  }
}
