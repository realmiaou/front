import {
  collection,
  onSnapshot,
  query,
  QueryConstraint,
  Unsubscribe
} from 'firebase/firestore'
import uniqBy from 'lodash/uniqBy'
import { deserializeFirestoreDate } from '../serializer'
import { NuxtVuexModule } from './util'

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
              this.innerData = this.innerData.filter(({ id }) => id !== change.doc.data().id)
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
