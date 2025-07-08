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
/* Container principal responsivo */
.form-container {
  width: 100%;
  max-width: clamp(340px, 90vw, 460px);
  margin: clamp(16px, 4vw, 32px) auto;
  padding: clamp(20px, 5vw, 36px);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: clamp(12px, 3vw, 20px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  color: var(--foreground);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Título responsivo */
h2 {
  text-align: center;
  color: var(--primary);
  font-size: clamp(1.5rem, 5vw, 2.25rem);
  font-weight: 700;
  margin-bottom: clamp(20px, 5vw, 32px);
  line-height: 1.2;
  letter-spacing: -0.5px;
}

/* Formulário */
form {
  display: flex;
  flex-direction: column;
  gap: clamp(16px, 4vw, 20px);
}

/* Grupos de input */
.input-group {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Inputs responsivos */
input {
  width: 100%;
  padding: clamp(14px, 3.5vw, 18px);
  border: 1px solid var(--border);
  border-radius: clamp(8px, 2vw, 12px);
  background: var(--background);
  color: var(--foreground);
  font-size: clamp(14px, 3.5vw, 16px);
  line-height: 1.5;
  transition: all 0.3s ease;
  box-sizing: border-box;
  outline: none;
  font-family: inherit;
}

input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 61, 124, 0.1);
  transform: translateY(-1px);
}

input:hover:not(:focus) {
  border-color: var(--secondary);
}

input.error {
  border-color: #e74c3c;
  background: rgba(231, 76, 60, 0.05);
}

input.error:focus {
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

/* Placeholder responsivo */
input::placeholder {
  color: var(--text-muted, #9ca3af);
  font-size: clamp(13px, 3vw, 15px);
  opacity: 0.7;
}

/* Mensagens de erro */
.error-msg {
  color: #e74c3c;
  font-size: clamp(12px, 2.5vw, 13px);
  font-weight: 500;
  margin-top: 4px;
  padding-left: 4px;
  display: block;
  line-height: 1.3;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Botão de submit responsivo */
.submit-btn {
  width: 100%;
  padding: clamp(14px, 4vw, 18px);
  background: var(--primary);
  color: var(--branco-puro);
  border: none;
  border-radius: clamp(8px, 2vw, 12px);
  font-size: clamp(15px, 3.5vw, 17px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: clamp(48px, 11vw, 56px);
  margin-top: clamp(8px, 2vw, 16px);
  font-family: inherit;
  outline: none;
}

.submit-btn:hover:not(:disabled) {
  background: var(--secondary);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 61, 124, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 3px 8px rgba(0, 61, 124, 0.2);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

/* Loading spinner */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.loading::after {
  content: '';
  width: 18px;
  height: 18px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Link de login */
.link-btn {
  background: none;
  color: var(--primary);
  border: none;
  margin-top: clamp(20px, 5vw, 28px);
  text-decoration: none;
  cursor: pointer;
  font-size: clamp(14px, 3.5vw, 15px);
  width: 100%;
  padding: clamp(12px, 3vw, 16px) 0;
  transition: all 0.2s ease;
  border-radius: clamp(6px, 1.5vw, 8px);
  font-weight: 500;
  font-family: inherit;
  outline: none;
}

.link-btn:hover {
  color: var(--secondary);
  background: rgba(0, 61, 124, 0.05);
  text-decoration: underline;
}

.link-btn:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Mensagens de feedback */
.message {
  margin-top: clamp(16px, 4vw, 24px);
  padding: clamp(14px, 3.5vw, 18px);
  border-radius: clamp(8px, 2vw, 12px);
  font-size: clamp(13px, 3vw, 15px);
  text-align: center;
  line-height: 1.4;
  font-weight: 500;
  border: 1px solid transparent;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.success {
  background: rgba(46, 204, 113, 0.1);
  color: #27ae60;
  border-color: rgba(46, 204, 113, 0.3);
}

.message.error {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border-color: rgba(231, 76, 60, 0.3);
}

/* Media queries para breakpoints específicos */

/* Mobile Portrait */
@media (max-width: 479.98px) {
  .form-container {
    margin: 8px;
    padding: 20px 16px;
    border-radius: 16px;
    max-width: none;
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }

  input {
    padding: 16px 14px;
    font-size: 16px; /* Evita zoom no iOS */
  }

  .submit-btn {
    padding: 16px;
    font-size: 16px;
    min-height: 52px;
  }

  .link-btn {
    padding: 14px 0;
    font-size: 15px;
  }

  form {
    gap: 18px;
  }
}

/* Mobile Landscape */
@media (max-width: 767.98px) and (orientation: landscape) {
  .form-container {
    margin: 4px auto;
    padding: 16px 24px;
    max-height: 95vh;
    overflow-y: auto;
  }

  h2 {
    font-size: 1.4rem;
    margin-bottom: 16px;
  }

  form {
    gap: 14px;
  }

  input, .submit-btn {
    padding: 12px 16px;
  }

  .link-btn {
    margin-top: 16px;
  }
}

/* Tablet Portrait */
@media (min-width: 768px) and (max-width: 991.98px) {
  .form-container {
    max-width: 500px;
    padding: 36px;
    margin: 32px auto;
  }

  h2 {
    font-size: 1.875rem;
  }

  input {
    font-size: 15px;
    padding: 16px 18px;
  }

  .submit-btn {
    font-size: 16px;
    padding: 16px;
  }
}

/* Desktop */
@media (min-width: 992px) {
  .form-container {
    max-width: 540px;
    padding: 44px;
    margin: 48px auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  }

  h2 {
    font-size: 2.25rem;
    margin-bottom: 36px;
  }

  input {
    font-size: 16px;
    padding: 18px;
  }

  .submit-btn {
    font-size: 17px;
    padding: 18px;
    min-height: 56px;
  }

  .link-btn {
    font-size: 15px;
    padding: 16px 0;
  }

  /* Hover effects only on desktop */
  .submit-btn:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 61, 124, 0.3);
  }

  input:hover:not(:focus) {
    transform: translateY(-1px);
  }
}

/* Large Desktop */
@media (min-width: 1200px) {
  .form-container {
    max-width: 600px;
    padding: 48px;
  }
}

/* High DPI displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .form-container {
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08), 0 6px 24px rgba(0, 0, 0, 0.06);
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .form-container {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .submit-btn, .link-btn, input {
    transition: none;
  }

  .submit-btn:hover:not(:disabled) {
    transform: none;
  }

  .loading::after {
    animation: none;
  }

  .error-msg, .message {
    animation: none;
  }
}

/* Focus visible */
@supports selector(:focus-visible) {
  input:focus {
    outline: none;
  }

  input:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
}

/* Print styles */
@media print {
  .form-container {
    box-shadow: none;
    border: 1px solid #000;
    margin: 0;
    padding: 20px;
  }

  .submit-btn, .link-btn {
    display: none;
  }
}
</style>
