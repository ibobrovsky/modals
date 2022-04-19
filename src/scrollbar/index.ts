export default class Scrollbar {
  private static isBodyOverflowing: boolean = false

  private static firstIsModalOverflowing: boolean = false

  private static firstIsBodyOverflowing: boolean = false

  private static scrollbarWidth: number = 0

  private static data = new WeakMap<HTMLElement, string>()

  private static count: number = 0

  static getScrollbarWidth(): number {
    const scrollDiv: HTMLDivElement = document.createElement('div')
    scrollDiv.style.position = 'absolute'
    scrollDiv.style.top = '-9999px'
    scrollDiv.style.width = '50px'
    scrollDiv.style.height = '50px'
    scrollDiv.style.overflow = 'scroll'
    document.body.appendChild(scrollDiv)
    const scrollbarWidth =
      scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth
    document.body.removeChild(scrollDiv)
    return scrollbarWidth
  }

  private static checkScrollbar(): void {
    const rect = document.body.getBoundingClientRect()
    this.isBodyOverflowing = rect.left + rect.right < window.innerWidth
    this.scrollbarWidth = Scrollbar.getScrollbarWidth()
  }

  private static setScrollbar(calssName = 'fixed-content'): void {
    if (!this.isBodyOverflowing) {
      return
    }

    const fixedElements =
      document.querySelectorAll<HTMLElement>(`.${calssName}`)

    for (let i = 0; i < fixedElements.length; i++) {
      const element = fixedElements[i]
      const actualPadding = element.style.paddingRight
      const computedStyle = window.getComputedStyle(element, null)
      const calculatedPadding = computedStyle.paddingRight
      this.data.set(element, actualPadding)
      element.style.paddingRight = `${
        parseFloat(calculatedPadding) + this.scrollbarWidth
      }px`
    }

    const actualPadding = document.body.style.paddingRight
    const bodyComputedStyle = window.getComputedStyle(document.body, null)
    const calculatedPadding = bodyComputedStyle.paddingRight

    this.data.set(document.body, actualPadding)
    document.body.style.paddingRight = `${
      parseFloat(calculatedPadding) + this.scrollbarWidth
    }px`
  }

  private static adjustDialog(el?: HTMLElement): void {
    if (!el) return

    const isModalOverflowing =
      el.scrollHeight > document.documentElement.clientHeight

    if (this.count === 1) {
      this.firstIsModalOverflowing = isModalOverflowing
      this.firstIsBodyOverflowing = this.isBodyOverflowing
    }

    if (
      (!this.isBodyOverflowing && isModalOverflowing) ||
      // fix double open
      (!this.firstIsBodyOverflowing && this.firstIsModalOverflowing)
    ) {
      el.style.paddingLeft = `${this.scrollbarWidth}px`
    }

    if (
      (this.isBodyOverflowing && !isModalOverflowing) ||
      // fix double open
      (this.firstIsBodyOverflowing && !this.firstIsModalOverflowing)
    ) {
      el.style.paddingRight = `${this.scrollbarWidth}px`
    }
  }

  private static resetAdjustments(el?: HTMLElement): void {
    if (!el) return

    el.style.paddingLeft = ''
    el.style.paddingRight = ''
  }

  private static resetScrollbar(calssName = 'fixed-content'): void {
    const fixedElements =
      document.querySelectorAll<HTMLElement>(`.${calssName}`)
    for (let i = 0; i < fixedElements.length; i++) {
      const element = fixedElements[i]
      const padding = this.data.get(element)
      if (typeof padding !== 'undefined') {
        element.style.paddingRight = padding
        this.data.delete(element)
      }
    }

    const bodyPadding = this.data.get(document.body)
    if (typeof bodyPadding !== 'undefined') {
      document.body.style.paddingRight = bodyPadding
      this.data.delete(document.body)
    }
  }

  static add(el?: HTMLElement, calssName?: string): void {
    this.count++
    this.checkScrollbar()
    this.setScrollbar(calssName)
    this.adjustDialog(el)
    document.body.style.overflowY = 'hidden'
  }

  static remove(el?: HTMLElement, timeout?: number, calssName?: string): void {
    setTimeout(() => {
      Scrollbar.resetAdjustments(el)
      document.body.style.overflowY = ''
      if (this.count === 1) {
        this.resetScrollbar(calssName)
      }
      this.count--
    }, timeout || 0)
  }
}
