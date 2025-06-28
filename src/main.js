import { createApp } from 'vue'
import App from './App.vue'
import realTimeService from './services/realTimeService.js'

const app = createApp(App)

// Disponibiliza o realTimeService globalmente
app.config.globalProperties.$realTime = realTimeService

app.mount('#app')
