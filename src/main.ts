import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { IonicVue } from '@ionic/vue'
import { App as CapacitorApp } from '@capacitor/app'

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
import '@ionic/vue/css/palettes/dark.system.css'

/* Theme variables */
import './theme/variables.css'

const app = createApp(App)
  .use(IonicVue)
  .use(router)

router.isReady().then(() => {
CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
  console.log('Deep link recibido:', url)

  if (!url) return

  if (url.startsWith('finmind://callback')) {
    const parsedUrl = new URL(url)
    const status = parsedUrl.searchParams.get('status')

    if (status === 'connected') {
      await router.push('/tabs/tab1?bank=connected')
      return
    }

    if (status === 'error') {
      await router.push('/tabs/tab1?bank=error')
      return
    }
  }
})

  app.mount('#app')
})