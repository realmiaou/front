export const deserializeFirestoreDate = <T>(obj: any): any => {
  if (!obj) {
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map(deserializeFirestoreDate)
  }
  if (!(obj instanceof Object)) {
    return obj
  }
  return Object.keys(obj).reduce((acc: { [key: string]: any }, key) => {
    const value = obj[key]
    acc[key] = value?.toDate
      ? value.toDate()
      : value
        ? deserializeFirestoreDate(value)
        : value
    return acc
  }, {}) as T
}
