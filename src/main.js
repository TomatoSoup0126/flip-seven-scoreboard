import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@globalhive/vuejs-tour/dist/style.css'
import i18n from './i18n/index.js'
import App from './App.vue'
import './assets/variables.css'

// Set initial html lang attribute based on detected locale
const detectedLocale = i18n.global.locale.value
document.documentElement.lang = detectedLocale === 'zh-TW' ? 'zh-Hant' : 'en'

const app = createApp(App)
app.use(createPinia())
app.use(i18n)
app.mount('#app')
