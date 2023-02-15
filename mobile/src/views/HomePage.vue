<template>
    <ion-page>
        <ion-header :translucent="true">
        </ion-header>
    
        <ion-content :fullscreen="true">
            <div id="container">
                <div class="main-content">
                  <h1>Hello Tractor</h1>
                  <p>{{ mnemonic }}</p>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonPage } from '@ionic/vue';
import { defineComponent } from 'vue';
import * as Bip39 from 'bip39';
import { walletStore } from '@/store/global';

/* eslint-disable */
// const CryptoJS = require('crypto-js');
// const SHA256 = require('crypto-js/sha256');

export default defineComponent({
  name: 'HomePage',
  setup() {
    const store = walletStore()
    return {
        store
    }
  },
  components: {
    IonContent,
    IonHeader,
    IonPage
  },
  data() {
    return {
      mnemonic: Bip39.generateMnemonic(),
    }
  },
  methods: {
    createWallet: async function(): Promise<void> {
        this.mnemonic = Bip39.generateMnemonic()
        this.seed = Bip39.mnemonicToSeedSync(this.mnemonic).slice(0, 32)
    }
  },
  computed: {
    
  },
  created() {
      this.createWallet()
      this.setEventListeners()
      this.setState()
  }
});
</script>

<style scoped>
#container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  
  color: #8c8c8c;
  
  margin: 0;
}

#container a {
  text-decoration: none;
}

.flex-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: inherit;
}

.parent-container {
    height: inherit;
    width: 100%;
    background: #181818;
}

.unlock-container {
    display: flex;
    flex-direction: column;
    width: inherit;
    position: relative
}

.view-container {
    display: flex;
    flex-flow: column;
    width: 100%;
    margin-bottom: 3em;
    margin-top: 1em;
}

.view-container-scroll {
    width: 100%;
    overflow: scroll;
    flex-grow: 1
}
</style>
