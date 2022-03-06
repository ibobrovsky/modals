import { ViewInterface } from './viewInterface'
import BaseView, { ViewDialogParams } from './baseView'
import { Params } from '../core/wrapper'
import Preloader from '../preloader'
import { append, clean, remove } from '../utils/dom'
import { transitionAppend } from '../utils/transition/transitionAppend'
import Scrollbar from '../scrollbar'
import { transitionRemove } from '../utils/transition/transitionRemove'

type Classes = {
  el: string
  open: string
  hide: string
  overlay: string
  container: string
  wrapper: string
  dialog: string
  preloader: string
}

export type ModalClasses = {
  [K in keyof Classes]?: Classes[K]
}

export type ModalViewContentEffect = 'modal-zoom-out' | 'modal-zoom-in' | string

export type ModalViewEffect = 'modal-fade' | string

export default class ModalView extends BaseView implements ViewInterface {
  protected $el: HTMLElement

  protected $wrapper: HTMLElement

  protected $dialog?: HTMLElement

  protected $preloader?: HTMLElement

  protected isShowPreloader: boolean = false

  constructor(params: Params, dialogParams: ViewDialogParams) {
    super(params, dialogParams)
    const [el, wrapper] = this.createEl()
    this.$el = el
    this.$wrapper = wrapper
  }

  protected get defaultClasses(): Classes {
    const el = 'b-modal'
    return {
      el,
      open: `${el}-open`,
      hide: `${el}-hide`,
      overlay: `${el}--overlay`,
      container: `${el}__container`,
      wrapper: `${el}__wrapper`,
      dialog: `${el}__dialog`,
      preloader: `${el}__preloader`,
    }
  }

  protected get classes(): Classes {
    const { classes } = this.params
    return {
      el: classes?.el || this.defaultClasses.el,
      open: classes?.open || this.defaultClasses.open,
      hide: classes?.hide || this.defaultClasses.hide,
      overlay: classes?.overlay || this.defaultClasses.overlay,
      container: classes?.container || this.defaultClasses.container,
      wrapper: classes?.wrapper || this.defaultClasses.wrapper,
      dialog: classes?.dialog || this.defaultClasses.dialog,
      preloader: classes?.preloader || this.defaultClasses.preloader,
    }
  }

  show(isFirst: boolean, afterShowCb?: () => void): void {
    const getContent = (): string | void => {
      const content = this.getContent()
      if (typeof content === 'string') {
        if (this.params.cacheContent) {
          this.$content = content
        }
        return content
      }
      this.isShowPreloader = true
      content.then((str) => {
        this.setContent(str, afterShowCb)
      })
    }

    const content =
      this.params.cacheContent && this.$content ? this.$content : getContent()

    if (this.isShowPreloader) {
      this.$preloader = Preloader.create(
        this.params.preloader,
        this.classes.preloader,
      )
      clean(this.$wrapper)
      append(this.$preloader, this.$wrapper)
    }

    transitionAppend(this.$el, this.getContainer(), this.params.effect)

    if (isFirst) {
      Scrollbar.add(this.$el)
      this.getOverflowContainer().classList.add(this.classes.open)
    }

    if (!this.isShowPreloader && content) {
      clean(this.$wrapper)
      this.$dialog = this.wrapDialog(content)
      transitionAppend(
        this.$dialog,
        this.$wrapper,
        this.params.contentEffect,
        afterShowCb,
      )
    }
  }

  hide(isLast: boolean, afterHideCb?: () => void): void {
    transitionRemove(this.$el, this.getContainer(), this.params.effect, () => {
      if (isLast) {
        Scrollbar.remove(this.$el)
        this.getOverflowContainer().classList.remove(this.classes.open)
      }
    })

    transitionRemove(
      this.$dialog,
      this.$wrapper,
      this.params.contentEffect,
      afterHideCb,
    )
  }

  remove(): void {
    remove(this.$el, this.getContainer())
  }

  protected wrapDialog(content: string): HTMLElement {
    const el = document.createElement('div')
    el.classList.add(this.classes.dialog)

    append(content, el)

    return el
  }

  protected createEl(): [HTMLDivElement, HTMLDivElement] {
    const wrapper: HTMLDivElement = document.createElement('div')
    wrapper.classList.add(this.classes.wrapper)

    const container: HTMLDivElement = document.createElement('div')
    container.classList.add(this.classes.container)
    container.appendChild(wrapper)

    const el: HTMLDivElement = document.createElement('div')
    el.classList.add(this.classes.el, this.classes.overlay)
    el.appendChild(container)
    el.addEventListener('click', this.closeHandler.bind(this))

    return [el, wrapper]
  }

  protected getOverflowContainer(): HTMLElement {
    switch (this.params.overflowContainer) {
      case 'html':
        return document.documentElement
      default:
        return document.body
    }
  }

  protected closeHandler({ target }: MouseEvent): void {
    if (
      this.$wrapper === target ||
      this.$preloader === target ||
      // @ts-ignore
      target?.closest?.('[data-modal-close]')
    ) {
      this.$emit('close')
    }
  }

  protected setContent(content: string, cb?: () => void): void {
    if (this.params.cacheContent) {
      this.$content = content
    }

    if (!content) {
      return
    }
    this.isShowPreloader = false

    clean(this.$wrapper)
    this.$dialog = this.wrapDialog(content)
    transitionAppend(this.$dialog, this.$wrapper, this.params.contentEffect, cb)
  }
}
