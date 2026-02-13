import { createI18n } from 'vue-i18n'
import zhTW from './zh-TW.js'
import en from './en.js'

const STORAGE_KEY = 'flip7-locale'

function detectLocale() {
  // 1. 先看 localStorage 有無使用者選擇
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved && (saved === 'zh-TW' || saved === 'en')) {
    return saved
  }

  // 2. 從瀏覽器語系偵測
  const browserLang = navigator.language || navigator.userLanguage || 'en'
  if (browserLang.startsWith('zh')) {
    return 'zh-TW'
  }
  return 'en'
}

const i18n = createI18n({
  legacy: false, // Composition API 模式
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: {
    'zh-TW': zhTW,
    en,
  },
})

// 切換語系時自動存入 localStorage
export function setLocale(locale) {
  i18n.global.locale.value = locale
  localStorage.setItem(STORAGE_KEY, locale)
  document.documentElement.lang = locale === 'zh-TW' ? 'zh-Hant' : 'en'
}

export default i18n
