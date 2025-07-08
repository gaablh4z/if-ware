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
/* Container principal responsivo */
.form-container {
  width: 100%;
  max-width: clamp(320px, 90vw, 400px);
  margin: clamp(16px, 5vw, 40px) auto;
  padding: clamp(20px, 5vw, 32px);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: clamp(8px, 2vw, 16px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  color: var(--foreground);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Título responsivo */
.form-container h2 {
  text-align: center;
  margin-bottom: clamp(20px, 5vw, 32px);
  font-size: clamp(1.5rem, 5vw, 2rem);
  font-weight: 700;
  color: var(--primary);
  line-height: 1.2;
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
  padding: clamp(12px, 3vw, 16px);
  border: 1px solid var(--border);
  border-radius: clamp(6px, 1.5vw, 8px);
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
  box-shadow: 0 0 0 2px rgba(0, 61, 124, 0.1);
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
  box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.1);
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
}

/* Botão de submit responsivo */
.submit-btn {
  width: 100%;
  padding: clamp(12px, 3.5vw, 16px);
  background: var(--primary);
  color: var(--branco-puro);
  border: none;
  border-radius: clamp(6px, 1.5vw, 8px);
  font-size: clamp(14px, 3.5vw, 16px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: clamp(44px, 10vw, 52px);
  margin-top: clamp(8px, 2vw, 12px);
  font-family: inherit;
  outline: none;
}

.submit-btn:hover:not(:disabled) {
  background: var(--secondary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 61, 124, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 61, 124, 0.2);
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
  gap: 8px;
}

.loading::before {
  content: '';
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Link de cadastro */
.link-btn {
  background: none;
  color: var(--primary);
  border: none;
  margin-top: clamp(16px, 4vw, 24px);
  text-decoration: none;
  cursor: pointer;
  font-size: clamp(13px, 3vw, 14px);
  width: 100%;
  padding: clamp(8px, 2vw, 12px) 0;
  transition: all 0.2s ease;
  border-radius: clamp(4px, 1vw, 6px);
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
  margin-top: clamp(16px, 4vw, 20px);
  padding: clamp(12px, 3vw, 16px);
  border-radius: clamp(6px, 1.5vw, 8px);
  font-size: clamp(13px, 3vw, 14px);
  text-align: center;
  line-height: 1.4;
  font-weight: 500;
  border: 1px solid transparent;
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
    margin: 12px;
    padding: 20px 16px;
    border-radius: 12px;
    max-width: none;
  }

  .form-container h2 {
    font-size: 1.5rem;
    margin-bottom: 24px;
  }

  input {
    padding: 14px 12px;
    font-size: 16px; /* Evita zoom no iOS */
  }

  .submit-btn {
    padding: 14px;
    font-size: 16px;
    min-height: 48px;
  }

  .link-btn {
    padding: 12px 0;
    font-size: 14px;
  }
}

/* Mobile Landscape */
@media (max-width: 767.98px) and (orientation: landscape) {
  .form-container {
    margin: 8px auto;
    padding: 16px 20px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .form-container h2 {
    font-size: 1.4rem;
    margin-bottom: 16px;
  }

  form {
    gap: 12px;
  }

  input, .submit-btn {
    padding: 10px 14px;
  }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 991.98px) {
  .form-container {
    max-width: 450px;
    padding: 32px;
    margin: 40px auto;
  }

  .form-container h2 {
    font-size: 1.75rem;
  }

  input {
    font-size: 15px;
    padding: 14px 16px;
  }

  .submit-btn {
    font-size: 15px;
    padding: 14px;
  }
}

/* Desktop */
@media (min-width: 992px) {
  .form-container {
    max-width: 480px;
    padding: 40px;
    margin: 60px auto;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }

  .form-container h2 {
    font-size: 2rem;
    margin-bottom: 32px;
  }

  input {
    font-size: 16px;
    padding: 16px;
  }

  .submit-btn {
    font-size: 16px;
    padding: 16px;
    min-height: 52px;
  }

  .link-btn {
    font-size: 14px;
    padding: 12px 0;
  }

  /* Hover effects only on desktop */
  .submit-btn:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 61, 124, 0.3);
  }
}

/* High DPI displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .form-container {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.06);
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .form-container {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
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

  .loading::before {
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