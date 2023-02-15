import { defineStore } from 'pinia';

export const walletStore = defineStore('globals', {
  state: () => {
    return {
      $password: "",
      $publicKey: ""
    }
  },
  getters: {
    getPassword: (state: {
      $password: string
    }): string => state.$password,
    getPublicKey: (state: {
      $publicKey: string
    }): string => state.$publicKey,
  },
  actions: {
    setPassword(password: string): void {
      this.$password = password
    },
    setPublicKey(publicKey: string): void {
      this.$publicKey = publicKey
    }
  }
})
