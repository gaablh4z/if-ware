<template>
  <div class="form-container">
    <h2>Cadastro - IF Wave</h2>
    <form @submit.prevent="register">
      <div class="input-group">
        <input 
          v-model="name" 
          type="text" 
          placeholder="Nome completo" 
          required 
          :class="{ 'error': errors.name }"
        />
        <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
      </div>
      
      <div class="input-group">
        <input 
          v-model="email" 
          type="email" 
          placeholder="E-mail institucional (@estudante.ifmt.edu.br)" 
          required 
          :class="{ 'error': errors.email }"
        />
        <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
      </div>
      
      <div class="input-group">
        <input 
          v-model="course" 
          type="text" 
          placeholder="Curso (ex: Técnico em Informática)" 
          required 
          :class="{ 'error': errors.course }"
        />
        <span v-if="errors.course" class="error-msg">{{ errors.course }}</span>
      </div>
      
      <div class="input-group">
        <input 
          v-model="campus" 
          type="text" 
          placeholder="Campus (ex: Cuiabá - Octayde Jorge da Silva)" 
          required 
          :class="{ 'error': errors.campus }"
        />
        <span v-if="errors.campus" class="error-msg">{{ errors.campus }}</span>
      </div>
      
      <div class="input-group">
        <input 
          v-model="password" 
          type="password" 
          placeholder="Senha (mínimo 6 caracteres)" 
          required 
          :class="{ 'error': errors.password }"
        />
        <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
      </div>
      
      <div class="input-group">
        <input 
          v-model="confirmPassword" 
          type="password" 
          placeholder="Confirme a senha" 
          required 
          :class="{ 'error': errors.confirmPassword }"
        />
        <span v-if="errors.confirmPassword" class="error-msg">{{ errors.confirmPassword }}</span>
      </div>
      
      <button type="submit" :disabled="isLoading" class="submit-btn">
        <span v-if="isLoading" class="loading">Cadastrando...</span>
        <span v-else>Cadastrar</span>
      </button>
    </form>
    
    <button class="link-btn" @click="$emit('go-login')">
      Já tem conta? Entrar
    </button>
    
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterForm',
  data() {
    return {
      name: '',
      email: '',
      course: '',
      campus: '',
      password: '',
      confirmPassword: '',
      message: '',
      messageType: 'success', // 'success' ou 'error'
      isLoading: false,
      errors: {}
    }
  },
  methods: {
    async register() {
      this.clearErrors()
      
      if (!this.validateForm()) {
        return
      }
      
      this.isLoading = true
      
      try {
        // Simula delay de API
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Verifica se o usuário já existe
        if (this.userExists(this.email)) {
          this.showError('Este e-mail já está cadastrado!')
          return
        }
        
        // Cadastra o usuário
        this.saveUser()
        this.showSuccess(`Usuário ${this.name} cadastrado com sucesso!`)
        
        // Emitir evento com dados do usuário para login automático
        setTimeout(() => {
          const newUser = {
            id: Date.now().toString(),
            name: this.name,
            email: this.email,
            course: this.course,
            campus: this.campus
          }
          this.$emit('registered', newUser)
        }, 1500)
        
      } catch (error) {
        this.showError('Erro interno. Tente novamente.')
      } finally {
        this.isLoading = false
      }
    },
    
    validateForm() {
      let isValid = true
      
      // Validação do nome
      if (this.name.length < 3) {
        this.errors.name = 'Nome deve ter pelo menos 3 caracteres'
        isValid = false
      }
      
      // Validação do e-mail
      if (!this.isValidEmail(this.email)) {
        this.errors.email = 'E-mail inválido'
        isValid = false
      } else if (!this.isInstitutionalEmail(this.email)) {
        this.errors.email = 'Use seu e-mail institucional (@estudante.ifmt.edu.br)'
        isValid = false
      }
      
      // Validação do curso
      if (this.course.length < 3) {
        this.errors.course = 'Informe seu curso'
        isValid = false
      }
      
      // Validação do campus
      if (this.campus.length < 3) {
        this.errors.campus = 'Informe seu campus'
        isValid = false
      }
      
      // Validação da senha
      if (this.password.length < 6) {
        this.errors.password = 'Senha deve ter pelo menos 6 caracteres'
        isValid = false
      }
      
      // Validação da confirmação de senha
      if (this.password !== this.confirmPassword) {
        this.errors.confirmPassword = 'Senhas não coincidem'
        isValid = false
      }
      
      return isValid
    },
    
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },
    
    isInstitutionalEmail(email) {
      const institutionalDomains = [
        '@estudante.ifmt.edu.br',
        '@professor.ifmt.edu.br',
        '@ifmt.edu.br'
      ]
      return institutionalDomains.some(domain => email.endsWith(domain))
    },
    
    userExists(email) {
      const users = JSON.parse(localStorage.getItem('ifwave_users') || '[]')
      return users.some(user => user.email === email)
    },
    
    saveUser() {
      try {
        const users = JSON.parse(localStorage.getItem('ifwave_users') || '[]')
        const newUser = {
          id: Date.now().toString(),
          name: this.name,
          email: this.email,
          course: this.course,
          campus: this.campus,
          passwordHash: this.hashPassword(this.password), // Compatível com LoginForm
          createdAt: new Date().toISOString()
        }
        
        users.push(newUser)
        
        // Salvar com verificação
        localStorage.setItem('ifwave_users', JSON.stringify(users))
        
        // Verificar se foi salvo corretamente
        const savedUsers = JSON.parse(localStorage.getItem('ifwave_users') || '[]')
        const userWasSaved = savedUsers.find(u => u.email === this.email)
        
        if (!userWasSaved) {
          throw new Error('Falha ao salvar usuário')
        }
        
        // Logar automaticamente o usuário após cadastro bem-sucedido
        const currentUser = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          course: newUser.course,
          campus: newUser.campus,
          loginTime: new Date().toISOString()
        }
        
        localStorage.setItem('ifwave_current_user', JSON.stringify(currentUser))
        
        console.log('Usuário cadastrado e logado automaticamente:', newUser.email)
        
      } catch (error) {
        console.error('Erro ao salvar usuário:', error)
        throw error
      }
    },
    
    hashPassword(password) {
      // Mesmo sistema de hash usado no LoginForm para compatibilidade
      let hash = 0
      for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Converte para 32bit integer
      }
      return Math.abs(hash).toString(16)
    },
    
    clearErrors() {
      this.errors = {}
      this.message = ''
    },
    
    showSuccess(msg) {
      this.message = msg
      this.messageType = 'success'
    },
    
    showError(msg) {
      this.message = msg
      this.messageType = 'error'
    }
  }
}
</script>

<style scoped>
.form-container {
  background: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 12px;
  padding: 32px 24px;
  max-width: 380px;
  margin: 32px auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

h2 {
  text-align: center;
  color: #262626;
  margin-bottom: 24px;
  font-weight: 600;
}

.input-group {
  margin-bottom: 16px;
}

input {
  display: block;
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #0095f6;
  box-shadow: 0 0 0 2px rgba(0, 149, 246, 0.1);
}

input.error {
  border-color: #ed4956;
  background-color: #fef7f7;
}

.error-msg {
  color: #ed4956;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.submit-btn {
  width: 100%;
  background: #0095f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: #1877f2;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  background: #c7c7c7;
  cursor: not-allowed;
  transform: none;
}

.loading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.loading::after {
  content: '';
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.link-btn {
  display: block;
  width: 100%;
  background: none;
  border: none;
  color: #0095f6;
  text-align: center;
  padding: 12px;
  margin-top: 16px;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.3s ease;
}

.link-btn:hover {
  color: #1877f2;
  text-decoration: underline;
}

.message {
  padding: 12px;
  border-radius: 8px;
  margin-top: 16px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
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

/* Responsividade */
@media (max-width: 480px) {
  .form-container {
    margin: 16px;
    padding: 24px 16px;
    max-width: none;
  }
}
</style>
