<template>
  <div class="feed-container">
    <header class="feed-header">
      <span class="logo">Velo</span>
      <div class="header-controls">
        <ThemeSelector :expandable="true" />
        <span
          v-if="currentTab !== 'profile' && currentTab !== 'notifications'"
          class="notification-icon"
          title="Notificações"
          @click="currentTab = 'notifications'"
        >
          <img 
            :src="require('@/assets/icons/notifications.svg')" 
            alt="Notificações"
            width="28" 
            height="28" 
            style="object-fit: contain; filter: currentColor;"
          />
          <span
            v-if="notificacoesNaoLidas > 0"
            class="badge"
            :class="{
              urgente: notificacaoUrgente,
              positiva: notificacaoPositiva
            }"
          >{{ notificacoesNaoLidas }}</span>
        </span>
      </div>
    </header>
    <transition name="fade" mode="out-in">
      <main :key="currentTab" :class="{ 'no-navbar': currentTab === 'notifications' }">
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
      </main>
    </transition>
    <nav class="bottom-navbar" :class="{ 'hidden': currentTab === 'notifications' }">
      <button class="nav-btn" title="Início" @click="currentTab = 'home'">
        <span class="nav-icon">
          <IconComponent name="home" :size="24" />
        </span>
        <span class="nav-label">Início</span>
      </button>
      <button class="nav-btn" title="Buscar" @click="currentTab = 'search'">
        <span class="nav-icon">
          <IconComponent name="search" :size="24" />
        </span>
        <span class="nav-label">Buscar</span>
      </button>
      <button class="nav-btn publish" title="Publicar" @click="currentTab = 'publish'">
        <span class="nav-icon">
          <IconComponent name="publish" :size="24" />
        </span>
        <span class="nav-label">Publicar</span>
      </button>
      <button class="nav-btn" title="Mensagens" @click="currentTab = 'messages'">
        <span class="nav-icon">
          <IconComponent name="messages" :size="24" />
        </span>
        <span class="nav-label">Mensagem</span>
      </button>
      <button class="nav-btn" title="Perfil" @click="currentTab = 'profile'">
        <span class="nav-icon">
          <IconComponent name="profile" :size="24" />
        </span>
        <span class="nav-label">Perfil</span>
      </button>
    </nav>
  </div>
</template>

<script>
import HomeScreen from './HomeScreen.vue'
import SearchScreen from './SearchScreen.vue'
import PublishScreen from './PublishScreen.vue'
import MessagesScreen from './MessagesScreen.vue'
import ProfileScreen from './ProfileScreen.vue'
import NotificationsScreen from './NotificationsScreen.vue'
import IconComponent from './IconComponent.vue'
import ThemeSelector from './ThemeSelector.vue'

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
    IconComponent,
    ThemeSelector
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
      notificacoesNaoLidas: 3, // Altere para testar
      notificacaoUrgente: false, // true para badge vermelho
      notificacaoPositiva: true, // true para badge verde
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
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.feed-container {
  max-width: 400px;
  margin: 0 auto;
  background: var(--card);
  border: 1px solid var(--border);
  min-height: 100vh;
  box-sizing: border-box;
  position: relative;
  color: var(--foreground);
}
.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--background);
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo {
  font-family: 'Arial Black', Arial, sans-serif;
  font-size: 1.5em;
  color: var(--primary);
}
.notification-icon {
  margin-left: auto;
  cursor: pointer;
  color: var(--primary);
  transition: all 0.3s ease;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 12px;
}
.notification-icon:hover {
  color: var(--accent);
  background: var(--background);
  transform: scale(1.05);
}
.badge {
  position: absolute;
  top: -6px;
  right: -10px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--accent);
  color: #fff;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--card);
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  z-index: 10;
  transition: background 0.2s;
}
.badge.urgente {
  background: #e74c3c; /* vermelho */
}
.badge.positiva {
  background: var(--verde-energia); /* verde */
}
main {
  padding: 16px 0;
  padding-bottom: 70px; /* espaço para a navbar */
}

main.no-navbar {
  padding-bottom: 0; /* remove espaço quando navbar está escondida */
}

/* Navbar inferior */
.bottom-navbar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100vw;
  max-width: 400px;
  margin: 0 auto;
  background: var(--card);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 56px;
  z-index: 100;
}
.nav-btn {
  background: none;
  border: none;
  outline: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--foreground);
  cursor: pointer;
  flex: 1;
  padding: 8px 4px;
  transition: all 0.3s ease;
  border-radius: 12px;
  position: relative;
}
.nav-btn:active, .nav-btn:focus {
  background: var(--background);
}
.nav-btn:hover {
  background: var(--background);
  transform: translateY(-2px);
}
.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}
.nav-label {
  font-size: 0.75em;
  font-weight: 500;
  letter-spacing: 0.5px;
}
.publish {
  color: var(--primary);
  font-weight: bold;
}

.bottom-navbar.hidden {
  display: none;
}

/* Responsividade */
@media (max-width: 500px) {
  .feed-container {
    max-width: 100vw;
    border: none;
    color: var(--foreground);
  }
  .feed-header {
    padding: 10px 6px;
  }
  main {
    padding: 8px 0;
    padding-bottom: 70px;
  }
  .bottom-navbar {
    max-width: 100vw;
  }
}
</style>