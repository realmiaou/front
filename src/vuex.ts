import { IEasyFirestoreModule } from 'vuex-easy-firestore/types/declarations'
import { VuexModule } from 'vuex-class-component/dist/interfaces'
import { createModule, extractVuexModule } from 'vuex-class-component'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  QueryConstraint
} from '@firebase/firestore'

export const NuxtEasyVuexModule = <D extends { id: any }>(
  namespaced: string,
  configuration: Omit<
        IEasyFirestoreModule,
        'moduleName' | 'statePropName' | 'firestoreRefType'
        >
) =>
    class extends VuexModule {
      dataById: { [key in string]: D } = {}

      public static readonly configuration = {
        ...configuration,
        moduleName: namespaced,
        statePropName: 'dataById',
        firestoreRefType: 'collection',
        serverChange: {
          addedHook: (updateStore: any, doc: any) =>
            updateStore(deserializeFirestoreDate(doc)),
          modifiedHook: (updateStore: any, doc: any) =>
            updateStore(deserializeFirestoreDate(doc)),
          removedHook: (updateStore: any, doc: any) =>
            updateStore(deserializeFirestoreDate(doc))
        }
      }

      async openDBChannel () {
        await this.$store.dispatch(`${namespaced}/openDBChannel`)
      }

      fetchById (id: D['id']) {
        return this.$store.dispatch(`${namespaced}/fetchById`, id)
      }

      async fetchAndAdd (request: any) {
        const data = await this.$store.dispatch(
                `${namespaced}/fetchAndAdd`,
                request
        )
        return data.docs.map((doc: any) => deserializeFirestoreDate(doc.data()))
      }
    }
export const NuxtVuexModule = (namespaced: string) =>
  createModule({ target: 'nuxt', namespaced })

export const NuxtFirebaseVuexModule = <D extends { id: any }>(
  namespaced: string,
  collectionPath: string
) =>
    class extends createModule({ target: 'nuxt', namespaced }) {
      async fetchAll (...queryConstraints: QueryConstraint[]) {
        const data = await getDocs(
          query(
            collection(this.$store.app.$fire.firestore, collectionPath),
            ...queryConstraints
          )
        )
        return data.docs.map<D>(
          doc => deserializeFirestoreDate(doc.data()) as D
        )
      }

      async fetchById (id: D['id']) {
        const data = await getDoc(
          doc(this.$store.app.$fire.firestore, collectionPath, id)
        )
        return deserializeFirestoreDate(data.data()) as D
      }

      async fetchIds () {
        const data = await getDocs(
          query(collection(this.$store.app.$fire.firestore, collectionPath))
        )
        return data.docs.map(doc => doc.data().id)
      }
    }

export const extractModule = (module: any) => ({
  ...Object.values(extractVuexModule(module))[0],
  ...(module.configuration && module.configuration)
})

const deserializeFirestoreDate = <T>(obj: any): any => {
  if (!obj) { return obj }
  if (Array.isArray(obj)) { return obj.map(deserializeFirestoreDate) }
  if (!(obj instanceof Object)) { return obj }
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
