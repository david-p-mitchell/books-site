import type { App } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

export default function (app: App) {
  app.use(PrimeVue as any, {
    theme: {
      preset: Aura
    }
  })
}
