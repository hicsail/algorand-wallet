import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router';
import { IonicVue } from '@ionic/vue';
import './main.css'
import '@capacitor-community/camera-preview'

const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(createPinia());

router.isReady().then(() => {
  app.mount('#app');
});