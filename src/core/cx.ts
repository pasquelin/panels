type ClassValue = string | false | null | undefined

/** Joins class names, dropping the falsy ones. The library owns its class names, so there is
 * nothing to merge or de-duplicate — a consumer's `className` is appended and wins by order. */
export function cx(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ')
}
