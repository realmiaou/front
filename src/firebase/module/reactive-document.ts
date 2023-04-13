import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore'
import { deserializeFirestoreDate } from '../serializer'
import { NuxtVuexModule } from './util'

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
