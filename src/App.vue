<template>
  <div id="app">
    <!-- Navbar lateral expansível -->
    <nav class="navbar" :class="{ 'navbar-expanded': isNavbarExpanded }">
      <!-- Botão toggle -->
      <button 
        class="navbar-toggle" 
        @click="toggleNavbar"
        :title="isNavbarExpanded ? 'Recolher menu' : 'Expandir menu'"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>

      <!-- Logo/Brand -->
      <div class="navbar-brand">
        <div class="brand-icon">🌊</div>
        <span class="brand-text" v-show="isNavbarExpanded">IF Wave</span>
      </div>

      <!-- Menu items -->
      <div class="navbar-menu">
        <!-- Mostrar apenas se estiver logado -->
        <template v-if="currentUser">
          <div class="navbar-item" @click="goToHome" :class="{ active: currentScreen === 'home' }">
            <span class="navbar-icon">🏠</span>
            <span class="item-text" v-show="isNavbarExpanded">Início</span>
          </div>
          
          <div class="navbar-item" @click="goToSearch" :class="{ active: currentScreen === 'search' }">
            <span class="navbar-icon">🔍</span>
            <span class="item-text" v-show="isNavbarExpanded">Buscar</span>
          </div>
          
          <div class="navbar-item publish-item" @click="goToPublish" :class="{ active: currentScreen === 'publish' }">
            <span class="navbar-icon">📷</span>
            <span class="item-text" v-show="isNavbarExpanded">Publicar</span>
          </div>
          
          <div class="navbar-item" @click="goToMessages" :class="{ active: currentScreen === 'messages' }">
            <span class="navbar-icon">💬</span>
            <span class="item-text" v-show="isNavbarExpanded">Mensagens</span>
          </div>
          
          <div class="navbar-item" @click="goToNotifications" :class="{ active: currentScreen === 'notifications' }">
            <span class="navbar-icon">🔔</span>
            <span class="item-text" v-show="isNavbarExpanded">Notificações</span>
            <span
              v-if="notificacoesNaoLidas > 0"
              class="notification-badge"
            >{{ notificacoesNaoLidas }}</span>
          </div>
          
          <div class="navbar-item" @click="goToProfile" :class="{ active: currentScreen === 'profile' }">
            <span class="navbar-icon">👤</span>
            <span class="item-text" v-show="isNavbarExpanded">Perfil</span>
          </div>
          
          <!-- Admin item (apenas para admins) -->
          <div 
            v-if="currentUser.role === 'admin'" 
            class="navbar-item" 
            @click="openAdmin" 
            :class="{ active: currentScreen === 'admin' }"
          >
            <span class="navbar-icon">⚙️</span>
            <span class="item-text" v-show="isNavbarExpanded">Admin</span>
          </div>
        </template>
        
        <!-- Mostrar apenas se NÃO estiver logado -->
        <template v-else>
          <div class="navbar-item" @click="goToLogin" :class="{ active: currentScreen === 'login' }">
            <span class="navbar-icon">🔒</span>
            <span class="item-text" v-show="isNavbarExpanded">Login</span>
          </div>
          
          <div class="navbar-item" @click="goToRegister" :class="{ active: currentScreen === 'register' }">
            <span class="navbar-icon">✏️</span>
            <span class="item-text" v-show="isNavbarExpanded">Cadastrar</span>
          </div>
        </template>
      </div>

      <!-- User info e logout (apenas se logado) -->
      <div v-if="currentUser" class="navbar-bottom">
        <div class="navbar-user">
          <div class="user-avatar">{{ currentUser.name.charAt(0).toUpperCase() }}</div>
          <div class="user-info" v-show="isNavbarExpanded">
            <div class="user-name">{{ currentUser.name }}</div>
            <div class="user-email">{{ currentUser.email }}</div>
          </div>
        </div>
        
        <div class="navbar-item logout-item" @click="logout">
          <span class="navbar-icon">🚪</span>
          <span class="item-text" v-show="isNavbarExpanded">Sair</span>
        </div>
      </div>
    </nav>

    <!-- Overlay para fechar navbar no mobile -->
    <div 
      v-if="isNavbarExpanded && isMobile" 
      class="navbar-overlay" 
      @click="closeNavbar"
    ></div>

    <!-- Conteúdo principal -->
    <main class="main-content" :class="{ 'main-content-shifted': isNavbarExpanded && !isMobile }">
      <AdminPanel 
        v-if="currentScreen === 'admin'"
        @back="goBackFromAdmin"
      />
      <RegisterForm 
        v-else-if="currentScreen === 'register'" 
        @go-login="currentScreen = 'login'" 
        @registered="handleRegistration" 
      />
      <LoginForm 
        v-else-if="currentScreen === 'login'" 
        @go-register="currentScreen = 'register'" 
        @logged-in="handleLogin" 
      />
      <!-- Telas internas da aplicação com verificação de currentUser -->
      <div v-else-if="currentUser" class="authenticated-content">
        <KeepAlive>
          <HomeScreen 
            v-if="currentScreen === 'home'" 
            :posts="posts" 
            :current-user="currentUser" 
          />
          <SearchScreen 
            v-else-if="currentScreen === 'search'" 
          />
          <PublishScreen 
            v-else-if="currentScreen === 'publish'" 
          />
          <MessagesScreen 
            v-else-if="currentScreen === 'messages'" 
            :current-user="currentUser" 
          />
          <ProfileScreen 
            v-else-if="currentScreen === 'profile'" 
            :current-user="currentUser" 
          />
          <NotificationsScreen 
            v-else-if="currentScreen === 'notifications'" 
            :notifications="notificacoes" 
            @back="goToHome" 
          />
          <!-- Fallback para Feed (manter compatibilidade) -->
          <FeedPosts 
            v-else-if="currentScreen === 'feed'" 
            :current-user="currentUser"
          />
        </KeepAlive>
      </div>
      <!-- Estado de carregamento -->
      <div v-else class="loading-state">
        <div class="loading-content">
          <div class="brand-icon">🌊</div>
          <h2>IF Wave</h2>
          <p>Carregando...</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import RegisterForm from './components/RegisterForm.vue'
import LoginForm from './components/LoginForm.vue'
import FeedPosts from './components/Feed.vue'
import AdminPanel from './admin/components/AdminPanel.vue'
import HomeScreen from './components/HomeScreen.vue'
import SearchScreen from './components/SearchScreen.vue'
import PublishScreen from './components/PublishScreen.vue'
import MessagesScreen from './components/MessagesScreen.vue'
import ProfileScreen from './components/ProfileScreen.vue'
import NotificationsScreen from './components/NotificationsScreen.vue'

export default {
  name: 'App',
  components: {
    RegisterForm,
    LoginForm,
    FeedPosts,
    AdminPanel,
    HomeScreen,
    SearchScreen,
    PublishScreen,
    MessagesScreen,
    ProfileScreen,
    NotificationsScreen
  },
  data() {
    return {
      currentScreen: 'login',
      currentUser: null,
      isNavbarExpanded: false,
      isMobile: false,
      posts: [],
      notificacoes: [],
      notificacoesNaoLidas: 0
    }
  },
  mounted() {
    // Verifica se há usuário logado ao carregar a aplicação
    this.checkSession()
    
    // Criar usuário admin de exemplo se não existir
    this.createAdminUser()
    
    // TEMPORÁRIO: Para teste, vamos simular um usuário logado
    if (!this.currentUser) {
      console.log('Simulando login automático para teste...')
      this.currentUser = {
        id: 'test-user',
        name: 'Usuário Teste',
        email: 'teste@ifmt.edu.br',
        username: 'teste',
        role: 'student',
        course: 'Informática',
        campus: 'Cuiabá'
      }
      this.currentScreen = 'home'
      console.log('Usuário teste logado:', this.currentUser)
    }
    
    // Detectar se é mobile
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
    
    // Aguardar um tick para garantir que o componente está montado
    this.$nextTick(() => {
      if (this.currentUser) {
        this.loadUserData()
      }
    })
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile)
  },
  methods: {
    // Métodos da navbar
    toggleNavbar() {
      console.log('toggleNavbar chamado, estado atual:', this.isNavbarExpanded)
      this.isNavbarExpanded = !this.isNavbarExpanded
      console.log('Novo estado navbar:', this.isNavbarExpanded)
    },
    
    closeNavbar() {
      this.isNavbarExpanded = false
    },
    
    checkMobile() {
      this.isMobile = window.innerWidth < 768
      // Fechar navbar automaticamente no mobile quando redimensionar
      if (this.isMobile) {
        this.isNavbarExpanded = false
      }
    },
    
    // Métodos de navegação
    goToHome() {
      console.log('goToHome chamado, currentUser:', this.currentUser)
      if (this.currentUser) {
        this.currentScreen = 'home'
        console.log('Navegando para home, currentScreen:', this.currentScreen)
        if (this.isMobile) this.closeNavbar()
      }
    },
    
    goToSearch() {
      console.log('goToSearch chamado, currentUser:', this.currentUser)
      if (this.currentUser) {
        this.currentScreen = 'search'
        console.log('Navegando para search, currentScreen:', this.currentScreen)
        if (this.isMobile) this.closeNavbar()
      }
    },
    
    goToRegister() {
      console.log('goToRegister chamado')
      this.currentScreen = 'register'
      console.log('Navegando para register, currentScreen:', this.currentScreen)
      if (this.isMobile) this.closeNavbar()
    },
    
    goToPublish() {
      console.log('goToPublish chamado, currentUser:', this.currentUser)
      if (this.currentUser) {
        this.currentScreen = 'publish'
        console.log('Navegando para publish, currentScreen:', this.currentScreen)
        if (this.isMobile) this.closeNavbar()
      }
    },
    
    goToProfile() {
      console.log('goToProfile chamado, currentUser:', this.currentUser)
      if (this.currentUser) {
        this.currentScreen = 'profile'
        console.log('Navegando para profile, currentScreen:', this.currentScreen)
        if (this.isMobile) this.closeNavbar()
      }
    },
    
    goToMessages() {
      console.log('goToMessages chamado, currentUser:', this.currentUser)
      if (this.currentUser) {
        this.currentScreen = 'messages'
        console.log('Navegando para messages, currentScreen:', this.currentScreen)
        if (this.isMobile) this.closeNavbar()
      }
    },
    
    goToNotifications() {
      console.log('goToNotifications chamado, currentUser:', this.currentUser)
      if (this.currentUser) {
        this.currentScreen = 'notifications'
        console.log('Navegando para notifications, currentScreen:', this.currentScreen)
        if (this.isMobile) this.closeNavbar()
      }
    },
    
    checkSession() {
      const userData = localStorage.getItem('ifwave_current_user')
      if (userData) {
        try {
          this.currentUser = JSON.parse(userData)
          this.currentScreen = 'home'  // Ir para home em vez de feed
          this.loadUserData()
        } catch (error) {
          // Se há erro no JSON, limpa os dados corrompidos
          localStorage.removeItem('ifwave_current_user')
        }
      }
    },
    
    loadUserData() {
      // Carregar posts
      this.posts = JSON.parse(localStorage.getItem('ifwave_posts') || '[]')
      
      // Carregar notificações
      this.notificacoes = JSON.parse(localStorage.getItem('ifwave_notifications') || '[]')
      this.notificacoesNaoLidas = this.notificacoes.filter(n => !n.read).length
    },
    
    handleLogin(userData) {
      this.currentUser = userData
      this.goToHome()
      this.loadUserData()
    },
    
    logout() {
      this.currentUser = null
      localStorage.removeItem('ifwave_current_user')
      this.currentScreen = 'login'
      
      // Feedback visual do logout
      setTimeout(() => {
        alert('Logout realizado com sucesso!')
      }, 100)
    },
    
    goToLogin() {
      console.log('goToLogin chamado')
      this.currentScreen = 'login'
      console.log('Navegando para login, currentScreen:', this.currentScreen)
      if (this.isMobile) this.closeNavbar()
    },
    
    goToFeed() {
      this.currentScreen = 'home'  // Redirecionar para home
      if (this.isMobile) this.closeNavbar()
    },
    
    // toggleDarkMode removido
    
    openAdmin() {
      // Alternar para tela do painel admin
      this.currentScreen = 'admin'
      if (this.isMobile) this.closeNavbar()
    },
    
    goBackFromAdmin() {
      this.currentScreen = 'home'  // Voltar para home
    },
    
    handleRegistration(userData) {
      // Usuário foi cadastrado e logado automaticamente
      this.currentUser = userData
      this.goToHome()  // Ir para home
      this.loadUserData()
      
      // Verificar se os dados estão realmente salvos
      const savedUser = JSON.parse(localStorage.getItem('ifwave_current_user') || 'null')
      if (!savedUser) {
        console.warn('Usuário não encontrado no localStorage após registro')
        // Recriar dados se necessário
        localStorage.setItem('ifwave_current_user', JSON.stringify(userData))
      }
    },
    
    createAdminUser() {
      // Criar usuário admin se não existir
      const users = JSON.parse(localStorage.getItem('ifwave_users') || '[]')
      const adminExists = users.find(user => user.role === 'admin')
      
      if (!adminExists) {
        const adminUser = {
          id: 'admin-' + Date.now(),
          name: 'Administrador',
          email: 'admin@ifmt.edu.br',
          username: 'admin',
          password: 'admin123',
          role: 'admin',
          course: 'Administração',
          campus: 'Cuiabá',
          bio: 'Administrador do sistema IF Wave',
          avatar: null,
          isActive: true,
          emailVerified: true,
          preferences: {
            // theme removido
            notifications: true,
            privacy: 'public'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        users.push(adminUser)
        localStorage.setItem('ifwave_users', JSON.stringify(users))
        console.log('Usuário admin criado:', adminUser.email)
        
        // Criar dados de exemplo
        this.createSampleData()
      }
    },
    
    createSampleData() {
      // Criar usuários de exemplo
      const users = JSON.parse(localStorage.getItem('ifwave_users') || '[]')
      const sampleUsers = [
        {
          id: 'user-1',
          name: 'João Silva',
          email: 'joao@ifmt.edu.br',
          username: 'joao.silva',
          password: 'senha123',
          role: 'student',
          course: 'Informática',
          campus: 'Cuiabá',
          bio: 'Estudante de informática',
          isActive: true,
          emailVerified: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'user-2', 
          name: 'Maria Santos',
          email: 'maria@ifmt.edu.br',
          username: 'maria.santos',
          password: 'senha123',
          role: 'teacher',
          course: 'Matemática',
          campus: 'Várzea Grande',
          bio: 'Professora de matemática',
          isActive: true,
          emailVerified: true,
          createdAt: new Date().toISOString()
        }
      ]
      
      sampleUsers.forEach(user => {
        if (!users.find(u => u.email === user.email)) {
          users.push(user)
        }
      })
      localStorage.setItem('ifwave_users', JSON.stringify(users))
      
      // Criar posts de exemplo
      const posts = JSON.parse(localStorage.getItem('ifwave_posts') || '[]')
      if (posts.length === 0) {
        const samplePosts = [
          {
            id: 'post-1',
            content: 'Bem-vindos ao IF Wave! 🎉',
            userId: 'user-1',
            type: 'text',
            likesCount: 15,
            commentsCount: 3,
            isPublic: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'post-2',
            content: 'Terminei meu TCC! 📚',
            userId: 'user-2',
            type: 'text',
            likesCount: 8,
            commentsCount: 2,
            isPublic: true,
            createdAt: new Date().toISOString()
          }
        ]
        localStorage.setItem('ifwave_posts', JSON.stringify(samplePosts))
      }
      
      console.log('Dados de exemplo criados!')
    }
  }
}
</script>

<style>
:root {
  --azul-ifmt: #003D7C;
  --verde-energia: #2ECC71;
  --amarelo-alegria: #F1C40F;
  --roxo-inovador: #8E44AD;
  --branco-puro: #FFFFFF;
  --preto-profundo: #000000;

  --background: var(--branco-puro);
  --foreground: var(--preto-profundo);
  --card: #fff;
  --border: #dbdbdb;
  --primary: var(--azul-ifmt);
  --secondary: var(--verde-energia);
  --accent: var(--amarelo-alegria);
  --special: var(--roxo-inovador);

  /* Variáveis responsivas */
  --container-max-width: 1200px;
  --container-padding: 20px;
  --header-height: 60px;
  --border-radius: 8px;
  --box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Reset e configurações básicas */
* {
  box-sizing: border-box;
}

html {
  font-size: 16px;
  line-height: 1.6;
}

body.dark-mode {
  --background: #18191a;
  --foreground: #f5f6fa;
  --card: #242526;
  --border: #333;
}

body {
  background: var(--background);
  color: var(--foreground);
  transition: background 0.3s, color 0.3s;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  display: flex;
  width: 100%;
  padding: 0;
}

/* Navbar lateral */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 60px;
  background: var(--card);
  border-right: 1px solid var(--border);
  box-shadow: var(--box-shadow);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: width 0.3s ease;
  overflow: hidden;
}

.navbar-expanded {
  width: 250px;
}

/* Botão toggle */
.navbar-toggle {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 15px;
  transition: background 0.2s;
}

.navbar-toggle:hover {
  background: var(--border);
}

.hamburger-line {
  width: 20px;
  height: 2px;
  background: var(--foreground);
  margin: 2px 0;
  transition: 0.3s;
  border-radius: 2px;
}

/* Brand/Logo */
.navbar-brand {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid var(--border);
  min-height: 60px;
}

.brand-icon {
  font-size: 24px;
  margin-right: 12px;
  min-width: 30px;
  text-align: center;
}

.brand-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  white-space: nowrap;
}

/* Menu */
.navbar-menu {
  flex: 1;
  padding: 10px 0;
}

.navbar-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  transition: background 0.2s;
  border-radius: 0 25px 25px 0;
  margin: 2px 5px 2px 0;
  min-height: 48px;
}

.navbar-item:hover {
  background: var(--border);
}

.navbar-item.active {
  background: var(--primary);
  color: white;
}

.navbar-item .icon {
  font-size: 20px;
  margin-right: 12px;
  min-width: 30px;
  text-align: center;
}

.navbar-item .navbar-icon {
  font-size: 20px;
  margin-right: 12px;
  min-width: 30px;
  text-align: center;
  pointer-events: none;
}

.navbar-item .item-text {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.navbar-item .notification-badge {
  position: absolute;
  top: 8px;
  right: 15px;
  background: #ff4757;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  min-width: 16px;
  text-align: center;
}

.navbar-item.publish-item {
  background: var(--primary);
  color: white;
  margin: 10px 5px 10px 0;
}

.navbar-item.publish-item:hover {
  background: var(--azul-ifmt);
  opacity: 0.9;
}

/* Bottom section */
.navbar-bottom {
  border-top: 1px solid var(--border);
  padding: 10px 0;
}

.navbar-user {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  margin-bottom: 5px;
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  margin-right: 12px;
  min-width: 30px;
}

.user-info {
  overflow: hidden;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 11px;
  color: var(--foreground);
  opacity: 0.7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-item {
  color: #ed4956;
}

.logout-item:hover {
  background: rgba(237, 73, 86, 0.1);
}

/* Overlay para mobile */
.navbar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;
}

/* Conteúdo principal */
.main-content {
  flex: 1;
  margin-left: 60px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
}

.main-content-shifted {
  margin-left: 250px;
}

/* Media queries para responsividade */

/* Mobile First - Extra Small devices (portrait phones, less than 576px) */
@media (max-width: 767.98px) {
  .navbar {
    width: 0;
    transform: translateX(-100%);
  }
  
  .navbar-expanded {
    width: 280px;
    transform: translateX(0);
  }
  
  .navbar-overlay {
    display: block;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .main-content-shifted {
    margin-left: 0;
  }
  
  /* Botão toggle sempre visível no mobile */
  .navbar-toggle {
    position: fixed;
    top: 10px;
    left: 10px;
    z-index: 1001;
    background: var(--card);
    border-radius: 8px;
    box-shadow: var(--box-shadow);
    width: 45px;
    height: 45px;
  }
}

/* Small devices (landscape phones, 576px and up) */
@media (min-width: 576px) and (max-width: 767.98px) {
  :root {
    --container-padding: 16px;
  }
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) and (max-width: 991.98px) {
  :root {
    --container-padding: 18px;
  }
  
  .navbar-expanded {
    width: 220px;
  }
  
  .main-content-shifted {
    margin-left: 220px;
  }
}

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) and (max-width: 1199.98px) {
  :root {
    --container-padding: 20px;
  }
}

/* Extra large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) {
  :root {
    --container-padding: 24px;
  }
}

/* High DPI displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  /* Estilos para telas de alta resolução */
}

/* Acessibilidade - Motion reduction */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Impressão */
@media print {
  /* Estilos para impressão */
}

/* Estado de carregamento */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--background);
}

.loading-content {
  text-align: center;
  max-width: 300px;
}

.loading-content .brand-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.loading-content h2 {
  color: var(--primary);
  margin: 16px 0 8px 0;
  font-size: 24px;
  font-weight: 700;
}

.loading-content p {
  color: var(--foreground);
  opacity: 0.7;
  margin: 0;
}

/* Container para conteúdo autenticado */
.authenticated-content {
  width: 100%;
  min-height: 100vh;
}
</style>