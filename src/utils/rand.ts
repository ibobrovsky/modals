export function rand(length: number = 8): string {
  return [...Array(length)]
    .map(() => (~~(Math.random() * 36)).toString(36))
    .join('')
}
