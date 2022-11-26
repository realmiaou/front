# `@miaou/front` Front utilities for NuxtJs, EasyFirestore, Firebase

This library use the library: `firebase`, `moment`, `vuex-class-component`, `vuex-easy-firestore`,

## Install

```bash
yarn add --exact @miaou/front
```

## Documentation
### Firebase

#### Functions
Use: `moment`

Firebase provide a front SDK to interact with firebase functions. This snippet allow to simplify and strongly type the front.

##### Usage
```typescript
   return await functions<LastNewsQuery>(
      this.$store.app.$fire.functions,
      'news-query-lastNews'
    )(this.$store.$i18n.locale as Locale)

```

##### Best practices
- If Using Nuxtjs this snippet should be used inside store module. Store modules are the gateway to the external world of your front
- When building a Firesbase/Nuxtjs app, I use a mono repo, it's mean that backend code (firebase functions) and frontend code (NuxtJs) are on the same folder. It's simplify a lot of life cycle development (Setup, CI/CD, unify typings...).

```typescript

// [backend] Firebase functions
import {PhoneNumber} from "@miaou/types/lib/user";
export type SavePhoneNumberCommand = (phoneNumber: PhoneNumber) => Promise<boolean>
export const savePhoneNumber = https.onCall(async (data: any, { auth }: CallableContext) => {
    //...
}

// [frontend] Firebase functions
const result = await functions<SavePhoneNumberCommand>(
    this.$store.app.$fire.functions, // Firebase functions instance
    'savePhoneNumber'
)(payload)
```

### Vuex

To use one of the module below, you should use `extractModule` to import them.

### Module with `vuex-class-component`
#### Simple
```typescript
export class User extends NuxtVuexModule('user') {
    @action
    savePhoneNumber(payload: Parameter<SavePhoneNumberCommand>) {
        return functions<SavePhoneNumberCommand>(
            this.$store.app.$fire.functions, // Firebase functions instance
            'savePhoneNumber'
        )(payload)
    }
}

export default extractModule(Owner)
```

#### Firestore

Module that bring simple tooling to connect to firestore collection.
- `fetchAll = (...queryConstraints: QueryConstraint[]) => Promise<D[]`
- `fetchById = (id: D['id']) => Promise<D>`
- `fetchIds = () => Promise<D['id'][]> `
- `D is definition of collection entity`

```typescript
export class Users extends NuxtFirebaseVuexModule<User>( // User generic type
    'users', // Nuxt module namespace
    'users' // Firestore collection path
) {
    @action
    fetchBy({ isActive } : { isActive: boolean}) {
        return super.fetchAll(
            where('isActive', '==', isActive),
            orderBy('updatedAt', 'desc'),
            limit(50)
        )
    }
}

export default extractModule(Users)
```

#### EasyFirestore 

EasyFirestore module strongly typed
- `openDBChannel = () => Promise<D[]`
- `fetchById = (id: D['id']) => void`
- `fetchAndAdd = () => Promise<D[]> `
- `D is definition of collection entity`

```typescript
export class Users extends NuxtEasyVuexModule<User>(
    'users', // Module namespace
    {
        firestorePath: 'users',
        sync: { where: [['createdBy.id', '==', '{userId}']] },
    } // EasyFirestore configuration
) {
    @action
    async fetchFiles() {
        await super.openDBChannel()
    }
}

export default extractModule(Users)
```

### Firestore Helper

Helper function that bring simple tooling to connect to firestore collection with date converter and strong typing.
- `fetchAll = (...queryConstraints: QueryConstraint[]) => Promise<D[]`
- `fetchById = (id: D['id']) => Promise<D>`
- `fetchIds = () => Promise<D['id'][]> `
- `D is definition of collection entity`

```typescript
import { action } from 'vuex-class-component'
import {
  extractModule,
  fetchAll,
  fetchById,
  fetchIds,
  NuxtVuexModule,
} from '@miaou/front'
import { UserId } from '@miaou/types'
import { User } from '~/functions/src/user/index.type'

export class Test extends NuxtVuexModule('test') {
  @action
  async fetchAll() {
    return await fetchAll<User>(this.$store.$firestore, 'users')
  }

  @action
  async fetchById() {
    return await fetchById<User>(
      this.$store.$firestore,
      'users',
      '9iGToNNGosLuImncBlSx7eguDyVw' as UserId
    )
  }

  @action
  async fetchIds() {
    return await fetchIds<User>(this.$store.$firestore, 'users')
  }
}

export default extractModule(Test)

```

### Cache Decorator

```typescript
export class Referential extends NuxtVuexModule('referential') {
  @action
  @cacheable() // Here
  findAllCity() {
    //....
  }
}

export default extractModule(Referential)
```

#### Settings
- `expireAtInSecond : number` default: 15 minutes
- `isDebug: boolean` default: false, if true console.log will be displayed

---
## Development

### How to use

```
yarn install
```

### Test

You can use `yarn link` to debug the module

### Release commit semantic

The release is automated by release-semantic plugin. When merge to master:
- Generate tag version
- Automate library versioning based on commit history
- Generate changelog based on commit history

```text
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: animations|bazel|benchpress|common|compiler|compiler-cli|core|ect.
  │
  └─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|test
```

###### Usage

```text
fix: testing patch releases
```

```text
feat: testing minor releases
```

```text
feat: testing major releases

BREAKING CHANGE: This is a breaking change.
```
