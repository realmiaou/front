import {
  collection,
  DocumentData,
  Firestore,
  FirestoreDataConverter,
  getDocs,
  query,
  QueryDocumentSnapshot
} from 'firebase/firestore'

export * from './functions'
export * from './module'

export const testing = async <Type extends DocumentData>(firestore: Firestore) => {
  const data = await getDocs(
    query(
      collection(firestore, 'users').withConverter(
        genericDataConverter<Type>()
      )
    )
  )
  return data.docs.map(doc => doc.data())
}
const genericDataConverter = <
    Type extends DocumentData
    >(): FirestoreDataConverter<Type> => ({
    toFirestore: (data: Type) => data,
    fromFirestore: (snapshot: QueryDocumentSnapshot) =>
        deserializeFirestoreDate(snapshot.data())! as Type
  })

const deserializeFirestoreDate = <T>(obj: any): any => {
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
