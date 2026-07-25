export type ClassValue = string | number | bigint | false | null | undefined

export function cn(...values: ClassValue[]) {
  return values.filter(Boolean).join(' ')
}

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
