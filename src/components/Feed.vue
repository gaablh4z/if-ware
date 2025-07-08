<template>
  <div class="feed-container">
    <!-- Conteúdo principal simplificado -->
    <main class="main-content">
      <transition name="fade" mode="out-in">
        <div :key="currentTab" class="content-wrapper">
          <HomeScreen v-if="currentTab === 'home'" :posts="posts" :current-user="currentUser" />
          <SearchScreen v-else-if="currentTab === 'search'" />
          <PublishScreen v-else-if="currentTab === 'publish'" />
          <MessagesScreen v-else-if="currentTab === 'messages'" :current-user="currentUser" />
          <ProfileScreen v-else-if="currentTab === 'profile'" :current-user="currentUser" />
          <NotificationsScreen 
            v-else-if="currentTab === 'notifications'" 
            :notifications="notificacoes" 
            @back="goBack" 
          />
        </div>
      </transition>
    </main>
  </div>
</template>

<script>
import HomeScreen from './HomeScreen.vue'
import SearchScreen from './SearchScreen.vue'
import PublishScreen from './PublishScreen.vue'
import MessagesScreen from './MessagesScreen.vue'
import ProfileScreen from './ProfileScreen.vue'
import NotificationsScreen from './NotificationsScreen.vue'
// import ThemeSelector removido

export default {
  name: 'FeedPosts',
  props: {
    currentUser: {
      type: Object,
      default: () => null
    }
  },
  components: {
    HomeScreen,
    SearchScreen,
    PublishScreen,
    MessagesScreen,
    ProfileScreen,
    NotificationsScreen,
    // ThemeSelector removido
  },
  data() {
    return {
      currentTab: 'home',
      previousTab: 'home', // Para rastrear a tela anterior
      posts: [
        {
          user: 'ana_silva',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
          caption: 'Curtindo o dia!'
        },
        {
          user: 'joao_p',
          image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
          caption: 'Vista incrível!'
        }
      ],
      notificacoesNaoLidas: 3,
      notificacoes: [
        {
          id: 1,
          type: 'like',
          username: 'ana.silva',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          read: false,
          preview: 'https://picsum.photos/50/50?random=10'
        },
        {
          id: 2,
          type: 'comment',
          username: 'carlos.pereira',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          read: false,
          comment: 'Excelente trabalho!',
          preview: 'https://picsum.photos/50/50?random=11'
        },
        {
          id: 3,
          type: 'follow',
          username: 'lucia.ferreira',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
          read: true,
          following: false
        }
      ]
    }
  },
  methods: {
    goBack() {
      this.currentTab = this.previousTab
    },
    
    navigateToTab(tabName) {
      this.currentTab = tabName;
    }
  },
  watch: {
    currentTab(newTab, oldTab) {
      // Atualiza a aba anterior apenas se não estivermos voltando das notificações
      if (newTab !== 'notifications' && oldTab !== 'notifications') {
        this.previousTab = oldTab
      }
    }
  }
}
</script>

<style scoped>
/* Transições suaves */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Container principal - layout moderno */
.feed-container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  background: var(--background);
  min-height: 100vh;
  box-sizing: border-box;
  position: relative;
  color: var(--foreground);
  display: flex;
  flex-direction: column;
}

/* Header ultra minimalista */
.feed-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
  padding: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  width: 100%; /* Ocupa toda a largura */
}

.logo {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  font-size: 1.5rem;
  color: var(--primary);
  font-weight: 700;
  letter-spacing: -0.5px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Botão de notificação minimalista */
.notification-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--foreground);
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

.notification-btn:hover {
  background: var(--border);
  color: var(--primary);
}

.notification-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 16px;
  height: 16px;
  background: #ff3040;
  color: white;
  border-radius: 50%;
  font-size: 0.65rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Layout principal com sidebar - ocupa toda a tela */
.main-layout {
  display: flex;
  flex: 1;
  width: 100%;
  min-height: calc(100vh - 70px);
}

/* Sidebar para desktop - largura fixa */
.sidebar {
  width: 280px;
  min-height: calc(100vh - 70px);
  background: var(--background);
  border-right: 1px solid var(--border);
  position: sticky;
  top: 70px;
  padding: 20px 0;
  display: none; /* Oculto por padrão, mostra no desktop */
  flex-shrink: 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 24px;
}

.sidebar-btn {
  background: none;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--foreground);
  cursor: pointer;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 400;
  width: 100%;
  text-align: left;
}

.sidebar-btn:hover {
  background: var(--border);
}

.sidebar-btn.active {
  color: var(--primary);
  background: rgba(0, 61, 124, 0.1);
  font-weight: 600;
}

.sidebar-btn.publish {
  color: var(--primary);
  font-weight: 600;
}

.sidebar-btn.publish:hover {
  background: rgba(0, 61, 124, 0.1);
}

.sidebar-label {
  font-size: 1rem;
  line-height: 1;
}

/* Conteúdo principal - ocupa toda a largura restante */
.main-content {
  flex: 1;
  background: var(--background);
  min-height: calc(100vh - 70px);
  padding-bottom: 80px; /* Espaço para mobile navbar */
  width: 100%;
  max-width: none; /* Remove limitação de largura */
}

.main-content.no-navbar {
  padding-bottom: 0;
}

.content-wrapper {
  width: 100%;
}

/* Bottom navbar (apenas mobile) */
.bottom-navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 65px;
  z-index: 100;
  box-shadow: 0 -1px 10px rgba(0, 0, 0, 0.1);
  padding: 0 env(safe-area-inset-left) env(safe-area-inset-bottom) env(safe-area-inset-right);
}

.nav-btn {
  background: none;
  border: none;
  outline: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #65676b;
  cursor: pointer;
  flex: 1;
  max-width: 120px;
  padding: 8px 12px;
  transition: all 0.2s ease;
  border-radius: 8px;
  position: relative;
  text-decoration: none;
}

.nav-btn:active, .nav-btn:focus {
  background: var(--border);
}

.nav-btn:hover {
  color: var(--primary);
}

.nav-btn.active {
  color: var(--primary);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.nav-label {
  font-size: 0.7rem;
  font-weight: 500;
  text-align: center;
  line-height: 1;
  margin-top: 2px;
}

.publish {
  color: var(--primary);
}

.publish .nav-icon {
  background: var(--primary);
  color: white;
  border-radius: 50%;
  padding: 8px;
  margin-bottom: 4px;
}

.publish:hover .nav-icon {
  background: var(--secondary);
  transform: scale(1.05);
}

.bottom-navbar.hidden {
  transform: translateY(100%);
  opacity: 0;
  pointer-events: none;
}

/* Media queries responsivos e modernos */

/* Mobile first - design limpo */
@media (max-width: 767px) {
  .header-content {
    padding: 12px 16px;
  }

  .logo {
    font-size: 1.3rem;
  }

  .notification-btn {
    width: 36px;
    height: 36px;
    padding: 8px;
  }

  .main-layout {
    flex-direction: column;
  }

  .sidebar {
    display: none; /* Oculto no mobile */
  }

  .main-content {
    border-left: none;
    border-right: none;
    max-width: 100%;
    padding-bottom: 75px;
  }

  .bottom-navbar {
    height: 60px;
    padding: 0 16px;
    display: flex; /* Visível no mobile */
  }

  .nav-btn {
    padding: 6px 8px;
    max-width: 100px;
  }

  .nav-label {
    font-size: 0.65rem;
  }
}

/* Landscape mobile - mais sutil */
@media (max-width: 767px) and (orientation: landscape) {
  .feed-header {
    padding: 0;
  }

  .header-content {
    padding: 8px 16px;
  }

  .bottom-navbar {
    height: 50px;
  }

  .nav-label {
    display: none;
  }

  .nav-btn {
    padding: 4px;
  }

  .main-content {
    padding-bottom: 60px;
  }
}

/* Tablet - transição para desktop */
@media (min-width: 768px) and (max-width: 1023px) {
  .main-content {
    padding: 10px 20px;
  }

  .sidebar {
    display: none; /* Ainda oculto no tablet */
  }

  .bottom-navbar {
    display: flex;
  }
}

/* Desktop - experiência completa com sidebar */
@media (min-width: 1024px) {
  .sidebar {
    display: block; /* Visível no desktop */
  }

  .main-content {
    padding-bottom: 20px; /* Remove espaço do bottom navbar */
    padding: 20px 40px; /* Adiciona padding interno */
  }

  .bottom-navbar {
    display: none; /* Oculto no desktop */
  }

  .header-content {
    padding: 16px 24px;
  }

  .feed-header {
    border-left: none;
    border-right: none;
  }
}

/* Large desktop - layout expandido para tela inteira */
@media (min-width: 1400px) {
  .sidebar {
    width: 320px;
  }

  .sidebar-nav {
    padding: 0 32px;
  }

  .sidebar-btn {
    padding: 16px 20px;
    font-size: 1.1rem;
  }

  .main-content {
    padding: 20px 60px; /* Mais padding para telas grandes */
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .feed-header {
    background: rgba(24, 25, 26, 0.85);
  }
  
  .bottom-navbar {
    background: rgba(24, 25, 26, 0.9);
  }

  .sidebar {
    background: var(--background);
  }
}

/* Animações e transições especiais */
.sidebar-btn,
.nav-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-content {
  transition: padding-bottom 0.3s ease;
}

/* Estados de hover mais elegantes */
.sidebar-btn:hover,
.nav-btn:hover {
  transform: translateY(-1px);
}

.notification-btn:hover {
  transform: scale(1.05);
}
</style>