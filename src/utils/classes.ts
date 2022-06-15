export type Value = string | number | boolean | undefined | null
export type Mapping = { [key: string]: any }
export type Argument = Value | Mapping | Argument[]

export function classNames(...args: Argument[]): string[] {
  var classes: string[] = []
  args.forEach((arg) => {
    if (!arg) {
      return
    }

    if (typeof arg === 'string' || typeof arg === 'number') {
      classes.push(String(arg))
    } else if (Array.isArray(arg)) {
      if (!arg.length) {
        return
      }

      var innerClasses = classNames(...arg)
      if (innerClasses.length) {
        classes.push(...innerClasses)
      }
    } else if (typeof arg === 'object') {
      if (arg.toString === Object.prototype.toString) {
        for (var key in arg) {
          if (Object.hasOwnProperty.call(arg, key) && arg[key]) {
            classes.push(key)
          }
        }
      } else {
        classes.push(arg.toString())
      }
    }
  })
  return classes
}

export function addClass(el?: Element | null, ...args: Argument[]) {
  if (!el) {
    return
  }

  el.classList.add(...classNames(...args))
}

export function removeClass(el?: Element | null, ...args: Argument[]) {
  if (!el) {
    return
  }

  el.classList.remove(...classNames(...args))
}
