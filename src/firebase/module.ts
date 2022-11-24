import { IEasyFirestoreModule } from 'vuex-easy-firestore/types/declarations'
import { VuexModule } from 'vuex-class-component/dist/interfaces'
import { createModule, extractVuexModule } from 'vuex-class-component'
import { deserializeFirestoreDate } from './serializer'

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

export const extractModule = (module: any) => ({
  ...Object.values(extractVuexModule(module))[0],
  ...(module.configuration && module.configuration)
})
