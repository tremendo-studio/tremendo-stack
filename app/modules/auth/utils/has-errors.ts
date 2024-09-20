export function hasErrors(obj: object) {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return true
    }
  }

  return false
}
