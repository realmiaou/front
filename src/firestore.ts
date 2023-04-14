import {
  collection,
  doc,
  DocumentData,
  Firestore,
  FirestoreDataConverter,
  getDoc,
  getDocs,
  query,
  QueryConstraint,
  QueryDocumentSnapshot
} from 'firebase/firestore'
import { deserializeFirestoreDate } from './serializer'

export const fetchAll = async <D extends { id: any }>(
  firestore: Firestore,
  pathCollection: string,
  ...queryConstraints: QueryConstraint[]) => {
  const data = await getDocs(
    query(
      collection(firestore, pathCollection).withConverter(
        genericDataConverter<D>()
      ),
      ...queryConstraints
    )
  )
  return data.docs.map(doc => doc.data())
}

export const fetchById = async <D extends { id: any }>(firestore: Firestore, pathCollection: string, id: D['id']) => {
  const data = await getDoc(
    doc(firestore, pathCollection, id).withConverter(
      genericDataConverter<D>()
    )
  )
  return data.data()!
}

export const fetchIds = async <D extends { id: any }>(firestore: Firestore, pathCollection: string) => {
  const data = await getDocs(
    query(
      collection(firestore, pathCollection).withConverter(
        genericDataConverter<D>()
      )
    )
  )
  return data.docs.map(doc => doc.data().id)
}

const genericDataConverter = <Type extends DocumentData>(): FirestoreDataConverter<Type> => ({
  toFirestore: (data: Type) => data,
  fromFirestore: (snapshot: QueryDocumentSnapshot) =>
        deserializeFirestoreDate(snapshot.data())! as Type
})
