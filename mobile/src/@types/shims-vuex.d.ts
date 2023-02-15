import { Store } from 'store'

declare module '@vue/runtime-core' {
  interface State {
    password: string,
    passwordSaltSHA256: string
  }

  interface ComponentCustomProperties {
    $store: Store<T>;
  }
}