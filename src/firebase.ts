import { Functions, httpsCallable } from 'firebase/functions'
import { Parameter } from '@miaou/types'
import moment from 'moment'

/*********
 * Firebase function
 */
export const functions =
    <T extends (data: any | void) => Promise<any>>(
    firebaseFunctions: Functions,
    route: string
  ) =>
  // @ts-ignore
    async (payload?: Parameter<T>): ReturnType<T> => {
      const { data } = await httpsCallable(firebaseFunctions, route)(payload)
      return deserializeDate(data) as ReturnType<T>
    }

const isISODate =
    /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/

const deserializeDate = <T>(obj: any): any => {
  if (!obj) { return obj }
  if (Array.isArray(obj)) { return obj.map(deserializeDate) }
  if (!(obj instanceof Object)) { return obj }
  return Object.keys(obj).reduce((acc: { [key: string]: any }, key) => {
    const value = obj[key]
    acc[key] =
            isISODate.test(value) && moment(value).isValid()
              ? moment(value).toDate()
              : value instanceof Object
                ? deserializeDate(value)
                : value
    return acc
  }, {}) as T
}
