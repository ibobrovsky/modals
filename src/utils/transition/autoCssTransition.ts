interface TransitionClasses {
  enterClass: string
  enterToClass: string
  enterActiveClass: string
  leaveClass: string
  leaveToClass: string
  leaveActiveClass: string
}

export function autoCssTransition(name: string): TransitionClasses {
  return {
    enterClass: `${name}-enter`,
    enterToClass: `${name}-enter-to`,
    enterActiveClass: `${name}-enter-active`,
    leaveClass: `${name}-leave`,
    leaveToClass: `${name}-leave-to`,
    leaveActiveClass: `${name}-leave-active`,
  }
}
