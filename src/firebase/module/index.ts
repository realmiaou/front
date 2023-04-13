import { createModule, extractVuexModule } from 'vuex-class-component'

export const NuxtVuexModule = (namespaced: string) =>
  createModule({ target: 'nuxt', namespaced })

export const extractModule = (module: any) => ({
  ...Object.values(extractVuexModule(module))[0],
  ...(module.configuration && module.configuration)
})

export * from './reactive-collection'
export * from './reactive-document'
