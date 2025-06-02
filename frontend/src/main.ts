import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
// import 'primevue/resources/themes/md-light-indigo/theme.css'
// import 'primevue/resources/primevue.min.css' //core css
import 'primeicons/primeicons.css' //icons
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
// app.use(PrimeVue, {
//   theme: {
//     preset: Aura,
//   },
// })

// app.use(ToastService)
// app.use(ConfirmationService)

app.mount('#app')
