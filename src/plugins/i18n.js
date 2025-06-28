import { createI18n } from 'vue-i18n'
import ptBr from '../locales/pt-br.json'
import en from '../locales/en.json'
import es from '../locales/es.json'

// Detecta idioma do navegador
function getDefaultLocale() {
  const browserLang = navigator.language.toLowerCase()
  
  if (browserLang.startsWith('pt')) return 'pt-br'
  if (browserLang.startsWith('es')) return 'es'
  if (browserLang.startsWith('en')) return 'en'
  
  // Verifica idioma salvo no localStorage
  const savedLang = localStorage.getItem('if_wave_language')
  if (savedLang && ['pt-br', 'en', 'es'].includes(savedLang)) {
    return savedLang
  }
  
  // Padrão português brasileiro
  return 'pt-br'
}

// Configuração do i18n
const i18n = createI18n({
  legacy: false, // usa Composition API
  locale: getDefaultLocale(),
  fallbackLocale: 'pt-br',
  globalInjection: true,
  messages: {
    'pt-br': ptBr,
    'en': en,
    'es': es
  }
})

// Função para alterar idioma
export function setLanguage(lang) {
  if (['pt-br', 'en', 'es'].includes(lang)) {
    i18n.global.locale.value = lang
    localStorage.setItem('if_wave_language', lang)
    document.documentElement.lang = lang
    
    // Atualiza título da página
    const titles = {
      'pt-br': 'IF Wave - Rede Social Educacional',
      'en': 'IF Wave - Educational Social Network',
      'es': 'IF Wave - Red Social Educativa'
    }
    document.title = titles[lang]
  }
}

// Lista de idiomas disponíveis
export const availableLanguages = [
  {
    code: 'pt-br',
    name: 'Português (Brasil)',
    flag: '🇧🇷'
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸'
  }
]

// Função para obter idioma atual
export function getCurrentLanguage() {
  return i18n.global.locale.value
}

// Função para obter direção do texto (para idiomas RTL futuros)
export function getTextDirection(lang = null) {
  const currentLang = lang || getCurrentLanguage()
  // Todos os idiomas atuais são LTR
  // Para árabe/hebraico seria 'rtl'
  return 'ltr'
}

// Função para formatar números baseado no idioma
export function formatNumber(number, options = {}) {
  const locale = getCurrentLanguage()
  
  const localeMap = {
    'pt-br': 'pt-BR',
    'en': 'en-US',
    'es': 'es-ES'
  }
  
  return new Intl.NumberFormat(localeMap[locale], options).format(number)
}

// Função para formatar datas baseado no idioma
export function formatDate(date, options = {}) {
  const locale = getCurrentLanguage()
  
  const localeMap = {
    'pt-br': 'pt-BR',
    'en': 'en-US',
    'es': 'es-ES'
  }
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  }
  
  return new Intl.DateTimeFormat(localeMap[locale], defaultOptions).format(new Date(date))
}

// Função para formatar tempo relativo ("há 2 horas")
export function formatRelativeTime(date) {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now - then) / 1000)
  
  const locale = getCurrentLanguage()
  const t = i18n.global.t
  
  if (diffInSeconds < 60) {
    return t('notifications.timeAgo.now')
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? 
      t('notifications.timeAgo.minute') : 
      `${diffInMinutes}${t('notifications.timeAgo.minutes')}`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return diffInHours === 1 ? 
      t('notifications.timeAgo.hour') : 
      `${diffInHours}${t('notifications.timeAgo.hours')}`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return diffInDays === 1 ? 
      t('notifications.timeAgo.day') : 
      `${diffInDays}${t('notifications.timeAgo.days')}`
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return diffInWeeks === 1 ? 
      t('notifications.timeAgo.week') : 
      `${diffInWeeks}${t('notifications.timeAgo.weeks')}`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return diffInMonths === 1 ? 
      t('notifications.timeAgo.month') : 
      `${diffInMonths}${t('notifications.timeAgo.months')}`
  }
  
  const diffInYears = Math.floor(diffInDays / 365)
  return diffInYears === 1 ? 
    t('notifications.timeAgo.year') : 
    `${diffInYears}${t('notifications.timeAgo.years')}`
}

// Plugin para adicionar métodos globais
export const i18nPlugin = {
  install(app) {
    app.config.globalProperties.$setLanguage = setLanguage
    app.config.globalProperties.$getCurrentLanguage = getCurrentLanguage
    app.config.globalProperties.$formatNumber = formatNumber
    app.config.globalProperties.$formatDate = formatDate
    app.config.globalProperties.$formatRelativeTime = formatRelativeTime
    app.config.globalProperties.$availableLanguages = availableLanguages
  }
}

// Define idioma inicial
setLanguage(getDefaultLocale())

export default i18n
