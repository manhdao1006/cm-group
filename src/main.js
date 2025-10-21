import { createPinia } from 'pinia'
import { createApp, watch } from 'vue'

import preventDevTools from '@/utils/preventDevTools'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'leaflet/dist/leaflet.css'
import { createI18n } from 'vue-i18n'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import App from './App.vue'
import en from './locales/en'
import vi from './locales/vi'
import router from './router'

const i18n = createI18n({
  legacy: false,
  locale: 'vi',
  fallbackLocale: 'en',
  messages: { vi, en },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Toast, {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
})

// eslint-disable-next-line no-undef
if (process.env.NODE_ENV === 'production') {
  preventDevTools()
}

app.use(i18n)

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = i18n.global.t(to.meta.title)
  }
})

watch(
  () => i18n.global.locale.value,
  () => {
    const currentRoute = router.currentRoute.value
    if (currentRoute.meta.title) {
      document.title = i18n.global.t(currentRoute.meta.title)
    }
  },
)

app.mount('#app')
