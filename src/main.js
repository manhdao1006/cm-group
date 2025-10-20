import { createPinia } from 'pinia'
import { createApp } from 'vue'

import preventDevTools from '@/utils/preventDevTools'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'leaflet/dist/leaflet.css'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import App from './App.vue'
import router from './router'

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
  preventDevTools();
}

app.mount('#app')
