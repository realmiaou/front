import { createModule, extractVuexModule } from 'vuex-class-component'
import {
  collection,
  onSnapshot,
  query,
  QueryConstraint,
  Unsubscribe
} from 'firebase/firestore'
import _ from 'lodash'
import { deserializeFirestoreDate } from './serializer'

export const NuxtVuexModule = (namespaced: string) =>
  createModule({ target: 'nuxt', namespaced })

export const NuxtEasyVuexModule = <D extends { id: string | number }>(
  namespaced: string,
  collectionPath: string,
  ...defaultQuery: QueryConstraint[]
) => {
  return class extends NuxtVuexModule(namespaced) {
    private innerData: D[] = []
    private unsub = null as Unsubscribe | null

    protected get data () {
      return _.chain(this.innerData)
        .uniqBy(({ id }) => id)
        .value()
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
              this.innerData = _.chain(this.innerData)
                .map(entity =>
                  entity.id === change.doc.data().id
                    ? deserializeFirestoreDate(change.doc.data())
                    : entity
                )
                .value()
            }
            if (change.type === 'removed') {
              this.innerData = _.chain(this.innerData)
                .remove(({ id }) => id !== change.doc.data().id)
                .value()
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

export const extractModule = (module: any) => ({
  ...Object.values(extractVuexModule(module))[0],
  ...(module.configuration && module.configuration)
})
