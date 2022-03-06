import { toMs } from './toMs'

export function getTimeout(delays: string[], durations: string[]): number {
  while (delays.length < durations.length) {
    delays = delays.concat(delays)
  }

  return Math.max.apply(
    null,
    durations.map((d, i) => toMs(d) + toMs(delays[i])),
  )
}
