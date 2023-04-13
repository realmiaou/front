import { createModule, extractVuexModule } from 'vuex-class-component'
import {
  collection,
  doc,
  onSnapshot,
  query,
  QueryConstraint,
  Unsubscribe
} from 'firebase/firestore'
import uniqBy from 'lodash.uniqby'
import remove from 'lodash.remove'
import { deserializeFirestoreDate } from './serializer'

export const NuxtVuexModule = (namespaced: string) =>
  createModule({ target: 'nuxt', namespaced })

export const NuxtReactiveCollectionVuexModule = <D extends { id: string | number }>(
  namespaced: string,
  collectionPath: string,
  ...defaultQuery: QueryConstraint[]
) => {
  return class extends NuxtVuexModule(namespaced) {
    innerData: D[] = []
    unsub = null as Unsubscribe | null

    get data () {
      return uniqBy(this.innerData, ({ id }) => id)
    }

    openChannel (...queryConstraints: QueryConstraint[]) {
      this.unsub = onSnapshot(
        query(
          collection(this.$store.$firestore, collectionPath),
          ...defaultQuery,
          ...queryConstraints
        ),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              this.innerData = [
                deserializeFirestoreDate(change.doc.data()),
                ...this.innerData
              ]
            }
            if (change.type === 'modified') {
              this.innerData = this.innerData
                .map(entity =>
                  entity.id === change.doc.data().id
                    ? deserializeFirestoreDate(change.doc.data())
                    : entity
                )
            }
            if (change.type === 'removed') {
              this.innerData = remove(this.innerData, ({ id }) => id !== change.doc.data().id)
            }
          })
        }
      )
      return Promise.resolve()
    }

    closeChannel () {
      if (this.unsub) {
        this.unsub()
      }
    }

    fetchById (id: D['id']) {
      return this.innerData.find(entity => entity.id === id)!
    }
  }
}

export const NuxtReactiveDocumentVuexModule = <D extends { id: string | number }>(
  namespaced: string,
  collectionPath: string
) => {
  return class extends NuxtVuexModule(namespaced) {
    data : D | null = null
    unsub = null as Unsubscribe | null

    openChannel (id: D['id']) {
      this.unsub = onSnapshot(
        doc(this.$store.$firestore, `${collectionPath}/${id}`)
        ,
        (doc) => { this.data = deserializeFirestoreDate(doc.data()) })

      return Promise.resolve()
    }

    closeChannel () {
      if (this.unsub) {
        this.unsub()
      }
    }
  }
}

export const extractModule = (module: any) => ({
  ...Object.values(extractVuexModule(module))[0],
  ...(module.configuration && module.configuration)
})
