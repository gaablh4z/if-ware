<template>
  <div class="admin-container">
    <!-- Login Screen -->
    <div v-if="!isAuthenticated" class="admin-login">
      <div class="login-card">
        <div class="login-header">
          <h1>🛡️ IF Wave Admin</h1>
          <p>Painel Administrativo</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label>Usuário:</label>
            <input 
              v-model="loginData.username" 
              type="text" 
              placeholder="admin"
              required
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label>Senha:</label>
            <input 
              v-model="loginData.password" 
              type="password" 
              placeholder="admin123"
              required
              class="form-control"
            />
          </div>
          
          <button type="submit" :disabled="isLoggingIn" class="btn btn-primary">
            {{ isLoggingIn ? 'Entrando...' : 'Entrar' }}
          </button>
          
          <div v-if="loginError" class="alert alert-danger">
            {{ loginError }}
          </div>
        </form>
        
        <div class="login-help">
          <small>
            <strong>Credenciais padrão:</strong><br>
            Usuário: admin<br>
            Senha: admin123
          </small>
        </div>
      </div>
    </div>

    <!-- Admin Dashboard -->
    <div v-else class="admin-dashboard">
      <!-- Header -->
      <header class="admin-header">
        <div class="header-left">
          <h1>🛡️ IF Wave Admin</h1>
          <span class="version">v1.0.0</span>
        </div>
        
        <div class="header-right">
          <span class="user-info">
            👤 {{ session.username }}
          </span>
          <button @click="handleLogout" class="btn btn-outline">
            Sair
          </button>
        </div>
      </header>

      <!-- Navigation -->
      <nav class="admin-nav">
        <div class="nav-section">
          <h3>📊 Dashboard</h3>
          <button 
            @click="currentView = 'dashboard'" 
            :class="{ active: currentView === 'dashboard' }"
            class="nav-item"
          >
            📈 Visão Geral
          </button>
        </div>

        <div class="nav-section">
          <h3>📋 Modelos</h3>
          <button 
            v-for="(model, key) in models" 
            :key="key"
            @click="selectModel(key)" 
            :class="{ active: currentModel === key }"
            class="nav-item"
          >
            <IconComponent :name="model.icon" :size="16" />
            {{ model.name }}
          </button>
        </div>

        <div class="nav-section">
          <h3>🔧 Ferramentas</h3>
          <button 
            @click="currentView = 'tools'" 
            :class="{ active: currentView === 'tools' }"
            class="nav-item"
          >
            🛠️ Utilitários
          </button>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="admin-main">
        <!-- Dashboard -->
        <AdminDashboard 
          v-if="currentView === 'dashboard'"
          :models="models"
          :dataService="dataService"
          @selectModel="selectModel"
        />

        <!-- Model List/Edit -->
        <AdminModelView 
          v-else-if="currentView === 'model' && currentModel"
          :modelName="currentModel"
          :model="models[currentModel]"
          :dataService="dataService"
          @back="currentView = 'dashboard'"
        />

        <!-- Tools -->
        <AdminTools 
          v-else-if="currentView === 'tools'"
          :models="models"
          :dataService="dataService"
        />
      </main>
    </div>
  </div>
</template>

<script>
import { models, adminConfig } from '../models/index.js'
import { adminDataService } from '../services/dataService.js'
import { adminAuthService } from '../services/authService.js'
import { setupAdmin } from '../utils/setupAdmin.js'
import IconComponent from '../../components/IconComponent.vue'
import AdminDashboard from './AdminDashboard.vue'
import AdminModelView from './AdminModelView.vue'
import AdminTools from './AdminTools.vue'

export default {
  name: 'AdminPanel',
  components: {
    IconComponent,
    AdminDashboard,
    AdminModelView,
    AdminTools
  },
  data() {
    return {
      models,
      config: adminConfig,
      dataService: adminDataService,
      authService: adminAuthService,
      isAuthenticated: false,
      session: null,
      currentView: 'dashboard', // dashboard, model, tools
      currentModel: null,
      
      // Login
      loginData: {
        username: '',
        password: ''
      },
      isLoggingIn: false,
      loginError: ''
    }
  },
  mounted() {
    this.initializeAdmin()
    this.checkAuth()
  },
  methods: {
    initializeAdmin() {
      // Verificar se é a primeira execução e configurar dados
      const users = this.dataService.getAll('users')
      if (users.length === 0) {
        console.log('Primeira execução detectada. Configurando dados iniciais...')
        setupAdmin()
      }
    },

    checkAuth() {
      this.isAuthenticated = this.authService.isAuthenticated()
      if (this.isAuthenticated) {
        this.session = this.authService.getSession()
      }
    },

    async handleLogin() {
      this.isLoggingIn = true
      this.loginError = ''
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simular delay
        
        const result = this.authService.login(this.loginData.username, this.loginData.password)
        
        if (result.success) {
          this.isAuthenticated = true
          this.session = result.session
          this.loginData = { username: '', password: '' }
        } else {
          this.loginError = result.error
        }
      } catch (error) {
        this.loginError = 'Erro interno. Tente novamente.'
      } finally {
        this.isLoggingIn = false
      }
    },

    handleLogout() {
      if (confirm('Tem certeza que deseja sair?')) {
        this.authService.logout()
        this.isAuthenticated = false
        this.session = null
        this.currentView = 'dashboard'
        this.currentModel = null
      }
    },

    selectModel(modelKey) {
      this.currentModel = modelKey
      this.currentView = 'model'
    }
  }
}
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background: #f8f9fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Login Styles */
.admin-login {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 2em;
}

.login-header p {
  margin: 0;
  color: #666;
}

.login-form .form-group {
  margin-bottom: 20px;
}

.login-form label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: #007bff;
  color: white;
  width: 100%;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.alert {
  padding: 12px;
  border-radius: 6px;
  margin-top: 15px;
}

.alert-danger {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.login-help {
  text-align: center;
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #666;
}

/* Dashboard Styles */
.admin-dashboard {
  display: grid;
  grid-template-areas: 
    "header header"
    "nav main";
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
}

.admin-header {
  grid-area: header;
  background: white;
  border-bottom: 1px solid #e1e5e9;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h1 {
  margin: 0;
  font-size: 1.5em;
  color: #333;
}

.version {
  background: #e9ecef;
  color: #6c757d;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  color: #666;
  font-weight: 500;
}

.btn-outline {
  background: transparent;
  color: #007bff;
  border: 2px solid #007bff;
}

.btn-outline:hover {
  background: #007bff;
  color: white;
}

.admin-nav {
  grid-area: nav;
  background: #343a40;
  color: white;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 30px;
}

.nav-section h3 {
  padding: 0 20px;
  margin: 0 0 10px 0;
  font-size: 0.9em;
  color: #adb5bd;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 20px;
  background: none;
  border: none;
  color: #adb5bd;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.nav-item:hover {
  background: #495057;
  color: white;
}

.nav-item.active {
  background: #007bff;
  color: white;
}

.admin-main {
  grid-area: main;
  padding: 20px;
  overflow-y: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-dashboard {
    grid-template-areas: 
      "header"
      "nav"
      "main";
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr;
  }
  
  .admin-nav {
    max-height: 200px;
    overflow-y: auto;
  }
  
  .nav-section {
    margin-bottom: 15px;
  }
}
</style>
