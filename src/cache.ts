// @ts-ignore
import PureCache from 'pure-cache'

export type CacheableOptions = { expireAtInSecond: number; isDebug: boolean }
export const cacheable = (options?: Partial<CacheableOptions>) => {
  const mergeOptions: CacheableOptions = {
    expireAtInSecond: 15 * 60,
    isDebug: false,
    ...options
  }
  const { isDebug, expireAtInSecond } = mergeOptions
  if (isDebug) { console.log('Cache initializing', mergeOptions) }
  const cache = new PureCache({
    // @ts-ignore
    expiryCheckInterval: window.Cypress ? 0 : expireAtInSecond * 1000
  })
  return function (
    _target: Object,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
      const key = `${originalMethod.name}-${JSON.stringify(args)}`
      const cachedData = cache.get(key)
      if (cachedData) {
        if (isDebug) { console.log('Cache hit', key, '=>', cachedData) }
        return cachedData.value
      }
      if (isDebug) { console.log('Cache miss', key, 'fetching...') }
      const promise = originalMethod.apply(this, args)
      cache.put(key, promise)
      if (isDebug) { console.log('Cache promise', key, '=>', promise) }
      return promise
    }
  }
}
