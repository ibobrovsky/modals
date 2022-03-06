import ModalWrapper from './core/wrapper'
import './index.scss'

const createModalInstance = (params) => {
  return ModalWrapper.create(params)
}

export default createModalInstance
