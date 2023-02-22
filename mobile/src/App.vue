<template>
	<ion-app>
		<ion-router-outlet />
	</ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { defineComponent } from 'vue';
import { App } from '@capacitor/app';
import * as storage from '@/utils/capacitorStorage';
import { walletStore } from '@/store/global';

export default defineComponent({
	name: 'App',
	setup() {
		const store = walletStore()
		return {
			store
		}
	},
	data() {
		return {
			window: 1
		}
	},
	methods: {
	},
	components: {
		IonApp,
		IonRouterOutlet
	},
	created() {
		App.addListener('appStateChange', ({ isActive }) => {
			console.log('App state changed. Is active?', isActive);
			if(isActive) {
				//pull current host information from kotlin
				console.log('(App.vue) - appStateChange: update pinia with new host information')
			}
		});

		App.addListener('appUrlOpen', data => {
			console.log('App opened with URL:', data);
		});

		App.addListener('appRestoredResult', data => {
			console.log('Restored state:', data);
			if(data) {
				//pull current host information from kotlin
				console.log('(App.vue) - appRestoredResult: update pinia with new host information')
			}
		});

		// TODO: Remove, but need for clean tests
		storage.clear()
	}
});
</script>