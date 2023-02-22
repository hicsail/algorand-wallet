<template>
    <ion-page>
        <ion-header :translucent="true">
        </ion-header>
    
        <ion-content :fullscreen="true">
            <div id="container">
                <div class="main-content">
                  <h1>Hello Tractor</h1>
                  <p class="copy-all">{{ mnemonic }}</p>
                  <h1>Public Address:</h1>
                  <p class="copy-all">{{ publicAddress }}</p>
                  <h1>Algos</h1>
                  <p>{{ algo_amt }}</p>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonPage } from '@ionic/vue';
import { defineComponent } from 'vue';
import { walletStore } from '@/store/global';
import * as algosdk from 'algosdk';
import { TESTNET } from '@/utils/endpoints';
import { XAPITOKEN } from '@/utils/apiToken';

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
      mnemonic: '',
      keypair: null,
      master: null,
      publicAddress: '',
      private_key: '',
      algo_amt: 10,
      algodClient: null,
      account: null
    }
  },
  methods: {
    createWallet: async function(): Promise<void> {
        this.account = algosdk.generateAccount();
        this.mnemonic = algosdk.secretKeyToMnemonic(this.account.sk);
        this.publicAddress = this.account.addr;

        const psToken = {
            'X-API-Key': XAPITOKEN
        };
        const rpcServer = TESTNET.endpoint;
        const rpcPort = '';

        this.algodClient = new algosdk.Algodv2(psToken, rpcServer, rpcPort);
        this.algoBalance()
    },
    algoBalance: async function(): Promise<void> {
      let accountInfo = await this.algodClient.accountInformation(this.account.addr).do();
      this.algo_amt = accountInfo.amount;
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
.copy-all {
  -webkit-user-select: all;  /* Chrome all / Safari all */
  -moz-user-select: all;     /* Firefox all */
  -ms-user-select: all;      /* IE 10+ */
  user-select: all;   
}

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
