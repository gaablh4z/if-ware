import { createApp } from 'vue'
import App from './App.vue'
import realTimeService from './services/realTimeService.js'
import { ResponsivePlugin } from './utils/responsive.js'

// Importar utilitários CSS responsivos
import './assets/css/responsive-utilities.css'

const app = createApp(App)

// Disponibiliza o realTimeService globalmente
app.config.globalProperties.$realTime = realTimeService

// Plugin de responsividade
app.use(ResponsivePlugin)

app.mount('#app')
