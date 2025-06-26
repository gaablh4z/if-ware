// Utilitário para gerenciar dados de teste do IF Wave
// Execute no console do navegador (F12)

const IFWaveTestUtils = {
  // Limpar todos os usuários cadastrados
  clearAllUsers() {
    localStorage.removeItem('ifwave_users')
    localStorage.removeItem('ifwave_current_user')
    console.log('✅ Todos os usuários foram removidos')
  },

  // Listar todos os usuários cadastrados
  listUsers() {
    const users = JSON.parse(localStorage.getItem('ifwave_users') || '[]')
    console.table(users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      course: user.course,
      campus: user.campus,
      createdAt: new Date(user.createdAt).toLocaleString()
    })))
  },

  // Ver usuário logado atualmente
  getCurrentUser() {
    const user = JSON.parse(localStorage.getItem('ifwave_current_user') || 'null')
    if (user) {
      console.log('👤 Usuário logado:', user)
    } else {
      console.log('❌ Nenhum usuário logado')
    }
  },

  // Criar usuários de teste
  createTestUsers() {
    const testUsers = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao.silva@estudante.ifmt.edu.br',
        course: 'Técnico em Informática',
        campus: 'Cuiabá - Octayde Jorge da Silva',
        passwordHash: '4f7d2c5', // senha: "123456"
        createdAt: new Date().toISOString()
      },
      {
        id: '2', 
        name: 'Maria Santos',
        email: 'maria.santos@professor.ifmt.edu.br',
        course: 'Docente - Informática',
        campus: 'Cuiabá - Octayde Jorge da Silva',
        passwordHash: 'f2d4a6b', // senha: "senha123"
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Pedro Oliveira',
        email: 'pedro.oliveira@estudante.ifmt.edu.br',
        course: 'Técnico em Redes',
        campus: 'Várzea Grande',
        passwordHash: '6b8c9d2', // senha: "pedro456"
        createdAt: new Date().toISOString()
      }
    ]

    localStorage.setItem('ifwave_users', JSON.stringify(testUsers))
    console.log('✅ Usuários de teste criados!')
    console.log('📋 Credenciais de teste:')
    console.log('   - joao.silva@estudante.ifmt.edu.br / 123456')
    console.log('   - maria.santos@professor.ifmt.edu.br / senha123')
    console.log('   - pedro.oliveira@estudante.ifmt.edu.br / pedro456')
  },

  // Logout do usuário atual
  logout() {
    localStorage.removeItem('ifwave_current_user')
    console.log('✅ Logout realizado')
    window.location.reload()
  },

  // Simular hash de uma senha
  hashPassword(password) {
    let hash = 0
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16)
  },

  // Mostrar ajuda
  help() {
    console.log(`
🔧 IF Wave Test Utils - Comandos Disponíveis:

📋 Gerenciamento de Usuários:
  IFWaveTestUtils.listUsers()       - Lista todos os usuários
  IFWaveTestUtils.getCurrentUser()  - Mostra usuário logado
  IFWaveTestUtils.clearAllUsers()   - Remove todos os usuários
  IFWaveTestUtils.createTestUsers() - Cria usuários de teste

🔐 Autenticação:
  IFWaveTestUtils.logout()          - Faz logout do usuário atual
  IFWaveTestUtils.hashPassword(pwd) - Calcula hash de uma senha

ℹ️  Ajuda:
  IFWaveTestUtils.help()            - Mostra esta ajuda

Exemplo de uso:
  IFWaveTestUtils.createTestUsers()
  IFWaveTestUtils.listUsers()
    `)
  }
}

// Mostrar ajuda inicial
IFWaveTestUtils.help()

// Disponibilizar globalmente
window.IFWaveTestUtils = IFWaveTestUtils
