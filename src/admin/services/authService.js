// Serviço de autenticação para o painel admin
export class AdminAuthService {
  constructor() {
    this.sessionKey = 'ifwave_admin_session'
    this.adminCredentials = {
      username: 'admin',
      password: 'admin123', // Em produção, use hash e salt
      permissions: ['read', 'write', 'delete', 'admin']
    }
  }

  // Fazer login
  login(username, password) {
    if (username === this.adminCredentials.username && password === this.adminCredentials.password) {
      const session = {
        username,
        permissions: this.adminCredentials.permissions,
        loginTime: new Date().toISOString(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
      }
      
      localStorage.setItem(this.sessionKey, JSON.stringify(session))
      return { success: true, session }
    }
    
    return { success: false, error: 'Credenciais inválidas' }
  }

  // Fazer logout
  logout() {
    localStorage.removeItem(this.sessionKey)
    return true
  }

  // Verificar se está autenticado
  isAuthenticated() {
    const session = this.getSession()
    if (!session) return false
    
    // Verificar se a sessão expirou
    if (new Date() > new Date(session.expires)) {
      this.logout()
      return false
    }
    
    return true
  }

  // Obter sessão atual
  getSession() {
    try {
      const sessionData = localStorage.getItem(this.sessionKey)
      return sessionData ? JSON.parse(sessionData) : null
    } catch {
      return null
    }
  }

  // Verificar permissão
  hasPermission(permission) {
    const session = this.getSession()
    if (!session) return false
    
    return session.permissions.includes(permission) || session.permissions.includes('admin')
  }

  // Renovar sessão
  renewSession() {
    const session = this.getSession()
    if (session) {
      session.expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      localStorage.setItem(this.sessionKey, JSON.stringify(session))
      return true
    }
    return false
  }
}

// Instância única do serviço
export const adminAuthService = new AdminAuthService()
