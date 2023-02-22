import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router';
import { IonicVue } from '@ionic/vue';
import './main.css'
import { initializeSQLite } from '@/utils/sqliteInit';

window.addEventListener("DOMContentLoaded", async () => {
  const app = createApp(App)
    .use(IonicVue)
    .use(router)
    .use(createPinia());

  initializeSQLite();

  router.isReady().then(() => {
    app.mount('#app');
  });
});