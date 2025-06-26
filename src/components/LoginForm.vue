<template>
  <div class="form-container">
    <h2>Login - IF Wave</h2>
    <form @submit.prevent="login">
      <div class="input-group">
        <input 
          v-model="email" 
          type="email" 
          placeholder="E-mail institucional" 
          required 
          :class="{ 'error': errors.email }"
          @blur="validateEmail"
        />
        <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
      </div>
      
      <div class="input-group">
        <input 
          v-model="password" 
          type="password" 
          placeholder="Senha" 
          required 
          :class="{ 'error': errors.password }"
          @blur="validatePassword"
        />
        <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
      </div>
      
      <button type="submit" :disabled="isLoading || !isFormValid" class="submit-btn">
        <span v-if="isLoading" class="loading">Entrando...</span>
        <span v-else>Entrar</span>
      </button>
    </form>
    
    <button class="link-btn" @click="$emit('go-register')">
      Não tem conta? Cadastre-se
    </button>
    
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginForm',
  data() {
    return {
      email: '',
      password: '',
      message: '',
      messageType: '',
      isLoading: false,
      errors: {
        email: '',
        password: ''
      }
    }
  },
  computed: {
    isFormValid() {
      return this.email && 
             this.password && 
             !this.errors.email && 
             !this.errors.password &&
             this.isInstitutionalEmail(this.email)
    }
  },
  methods: {
    isInstitutionalEmail(email) {
      const institutionalDomains = [
        '@estudante.ifmt.edu.br',
        '@professor.ifmt.edu.br',
        '@ifmt.edu.br'
      ]
      return institutionalDomains.some(domain => email.endsWith(domain))
    },

    validateEmail() {
      this.errors.email = ''
      
      if (!this.email) {
        this.errors.email = 'E-mail é obrigatório'
        return false
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.email)) {
        this.errors.email = 'E-mail inválido'
        return false
      }
      
      if (!this.isInstitutionalEmail(this.email)) {
        this.errors.email = 'Use apenas e-mail institucional do IFMT'
        return false
      }
      
      return true
    },

    validatePassword() {
      this.errors.password = ''
      
      if (!this.password) {
        this.errors.password = 'Senha é obrigatória'
        return false
      }
      
      if (this.password.length < 6) {
        this.errors.password = 'Senha deve ter pelo menos 6 caracteres'
        return false
      }
      
      return true
    },

    // Simula hash de senha (apenas para demonstração)
    hashPassword(password) {
      // Em produção, use uma biblioteca de hash real como bcrypt
      let hash = 0
      for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Converte para 32bit integer
      }
      return Math.abs(hash).toString(16)
    },

    // Simula verificação no banco de dados
    findUserByEmail(email) {
      const users = JSON.parse(localStorage.getItem('ifwave_users') || '[]')
      return users.find(user => user.email === email)
    },

    // Verifica se a senha está correta
    verifyPassword(inputPassword, storedPasswordHash) {
      const inputHash = this.hashPassword(inputPassword)
      return inputHash === storedPasswordHash
    },

    async login() {
      // Reset de erros e mensagens
      this.errors = { email: '', password: '' }
      this.message = ''
      
      // Validação dos campos
      const emailValid = this.validateEmail()
      const passwordValid = this.validatePassword()
      
      if (!emailValid || !passwordValid) {
        return
      }
      
      this.isLoading = true
      
      try {
        // Simula delay de requisição
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Verifica se o usuário existe
        const user = this.findUserByEmail(this.email)
        
        if (!user) {
          this.message = 'E-mail não encontrado. Verifique ou crie uma conta.'
          this.messageType = 'error'
          this.errors.email = 'Usuário não cadastrado'
          this.isLoading = false
          return
        }
        
        // Verifica a senha
        if (!this.verifyPassword(this.password, user.passwordHash)) {
          this.message = 'Senha incorreta. Tente novamente.'
          this.messageType = 'error'
          this.errors.password = 'Senha incorreta'
          this.isLoading = false
          return
        }
        
        // Login bem-sucedido
        this.message = `Bem-vindo(a), ${user.name}!`
        this.messageType = 'success'
        
        // Salva sessão do usuário
        localStorage.setItem('ifwave_current_user', JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          course: user.course,
          campus: user.campus,
          loginTime: new Date().toISOString()
        }))
        
        // Redireciona após 1.5 segundos
        setTimeout(() => {
          this.$emit('logged-in', user)
        }, 1500)
        
      } catch (error) {
        this.message = 'Erro interno. Tente novamente.'
        this.messageType = 'error'
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
.form-container {
  background: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  padding: 24px 16px;
  max-width: 320px;
  margin: 32px auto;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #262626;
  font-size: 1.2em;
  font-weight: 600;
}

.input-group {
  margin-bottom: 16px;
}

input {
  display: block;
  width: 100%;
  padding: 12px;
  border: 1px solid #dbdbdb;
  border-radius: 6px;
  font-size: 14px;
  background: #fafafa;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #0095f6;
  background: #fff;
}

input.error {
  border-color: #ed4956;
  background: #fff5f5;
}

.error-msg {
  display: block;
  color: #ed4956;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.3;
}

.submit-btn {
  background: #0095f6;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 12px 0;
  width: 100%;
  font-weight: 600;
  font-size: 14px;
  margin-top: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.submit-btn:hover:not(:disabled) {
  background: #0077c2;
}

.submit-btn:disabled {
  background: #b2dffc;
  cursor: not-allowed;
}

.loading {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.loading:before {
  content: '';
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.link-btn {
  background: none;
  color: #0095f6;
  border: none;
  margin-top: 16px;
  text-decoration: none;
  cursor: pointer;
  font-size: 13px;
  width: 100%;
  padding: 8px 0;
  transition: color 0.2s ease;
}

.link-btn:hover {
  color: #0077c2;
  text-decoration: underline;
}

.message {
  margin-top: 16px;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  text-align: center;
  line-height: 1.4;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 480px) {
  .form-container {
    margin: 16px;
    max-width: none;
  }
}
</style>