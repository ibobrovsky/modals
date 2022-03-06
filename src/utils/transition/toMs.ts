export function toMs(s: string): number {
  return Number(s.slice(0, -1).replace(',', '.')) * 1000
}
