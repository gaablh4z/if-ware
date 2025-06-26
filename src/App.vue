<template>
  <div id="app">
    <div class="header">
      <h1>IF Wave</h1>
      <div class="header-controls">
        <button v-if="currentUser && currentUser.role === 'admin' && currentScreen === 'feed'" @click="openAdmin" class="admin-btn">
          🛡️ Admin
        </button>
        <button v-if="currentUser && currentScreen === 'feed'" @click="logout" class="logout-btn">
          🚪 Sair
        </button>
        <button @click="toggleDarkMode" class="dark-btn">🌙 Alternar tema</button>
      </div>
    </div>
    
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
    <FeedPosts 
      v-else-if="currentScreen === 'feed'" 
      :current-user="currentUser"
    />
  </div>
</template>

<script>
import RegisterForm from './components/RegisterForm.vue'
import LoginForm from './components/LoginForm.vue'
import FeedPosts from './components/Feed.vue'
import AdminPanel from './admin/components/AdminPanel.vue'

export default {
  name: 'App',
  components: {
    RegisterForm,
    LoginForm,
    FeedPosts,
    AdminPanel
  },
  data() {
    return {
      currentScreen: 'login',
      currentUser: null
    }
  },
  mounted() {
    // Verifica se há usuário logado ao carregar a aplicação
    this.checkSession()
    
    // Criar usuário admin de exemplo se não existir
    this.createAdminUser()
  },
  methods: {
    checkSession() {
      const userData = localStorage.getItem('ifwave_current_user')
      if (userData) {
        try {
          this.currentUser = JSON.parse(userData)
          this.currentScreen = 'feed'
        } catch (error) {
          // Se há erro no JSON, limpa os dados corrompidos
          localStorage.removeItem('ifwave_current_user')
        }
      }
    },
    
    handleLogin(userData) {
      this.currentUser = userData
      this.goToFeed()
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
      this.currentScreen = 'login'
    },
    
    goToFeed() {
      this.currentScreen = 'feed'
    },
    
    toggleDarkMode() {
      document.body.classList.toggle('dark-mode')
    },
    
    openAdmin() {
      // Alternar para tela do painel admin
      this.currentScreen = 'admin'
    },
    
    goBackFromAdmin() {
      this.currentScreen = 'feed'
    },
    
    handleRegistration(userData) {
      // Usuário foi cadastrado e logado automaticamente
      this.currentUser = userData
      this.goToFeed()
      
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
            theme: 'light',
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
    },
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
}

#app {
  text-align: center;
  margin-top: 40px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  margin-bottom: 20px;
}

.header h1 {
  margin: 0;
  flex-grow: 1;
}

.header-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.dark-btn, .logout-btn, .admin-btn {
  background: var(--primary);
  color: var(--branco-puro);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.admin-btn {
  background: var(--special);
}

.admin-btn:hover {
  background: #7239ca;
}

.dark-btn:hover {
  background: var(--roxo-inovador);
}

.logout-btn {
  background: #ed4956;
}

.logout-btn:hover {
  background: #c73e47;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .header-controls {
    justify-content: center;
  }
  
  .dark-btn, .logout-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>