import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { IonicVue } from '@ionic/vue'
import { App as CapacitorApp } from '@capacitor/app'

import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'
import '@ionic/vue/css/palettes/dark.system.css'
import './theme/variables.css'

const app = createApp(App)
  .use(IonicVue)
  .use(router)

router.isReady().then(() => {
  CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
    console.log('Deep link recibido:', url)

    if (!url) return
    if (!url.startsWith('finmind://callback')) return

    const parsedUrl = new URL(url)
    const status = parsedUrl.searchParams.get('status')
    const message = parsedUrl.searchParams.get('message')

    await router.push({
      path: '/inicio',
      query: {
        ...(status ? { status } : {}),
        ...(message ? { message } : {})
      }
    })
  })

  app.mount('#app')
})