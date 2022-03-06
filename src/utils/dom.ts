export function remove(element?: Element, wrapper?: Element): boolean {
  try {
    let res = false
    if (!element || !(element.parentNode || wrapper)) {
      return res
    }
    const wrap = element.parentNode || wrapper
    if (wrap) {
      wrap.removeChild(element)
      res = true
    }
    return res
  } catch (e) {
    return false
  }
}

export function append(element: Element | string, wrapper?: Element): boolean {
  let res = false
  if (!wrapper) {
    return res
  }

  if (typeof element === 'string') {
    wrapper.insertAdjacentHTML('beforeend', element)
  } else {
    wrapper.appendChild(element)
  }

  return true
}

export function clean(element?: HTMLElement): void {
  if (!element) {
    return
  }
  while (element.childNodes.length > 0) {
    if (element.firstChild) {
      element.removeChild(element.firstChild)
    }
  }
}
