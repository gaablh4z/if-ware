// Utilitário para configurar usuário admin e dados de exemplo
import { adminDataService } from '../services/dataService.js'

export function createAdminUser() {
  const users = adminDataService.getAll('users')
  
  // Verificar se já existe um admin
  const existingAdmin = users.find(user => user.role === 'admin')
  if (existingAdmin) {
    console.log('Usuário admin já existe:', existingAdmin.email)
    return existingAdmin
  }

  // Criar usuário admin
  const adminUser = {
    name: 'Administrador',
    email: 'admin@ifmt.edu.br',
    username: 'admin',
    password: 'admin123', // Em produção, deve ser hasheado
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
    permissions: ['read', 'write', 'delete', 'admin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const created = adminDataService.create('users', adminUser)
  console.log('Usuário admin criado:', created)
  return created
}

export function createSampleData() {
  // Criar usuários de exemplo
  const sampleUsers = [
    {
      name: 'João Silva',
      email: 'joao@ifmt.edu.br',
      username: 'joao.silva',
      role: 'student',
      course: 'Informática',
      campus: 'Cuiabá',
      bio: 'Estudante de informática apaixonado por tecnologia',
      isActive: true
    },
    {
      name: 'Maria Santos',
      email: 'maria@ifmt.edu.br', 
      username: 'maria.santos',
      role: 'teacher',
      course: 'Matemática',
      campus: 'Várzea Grande',
      bio: 'Professora de matemática',
      isActive: true
    },
    {
      name: 'Pedro Costa',
      email: 'pedro@ifmt.edu.br',
      username: 'pedro.costa', 
      role: 'student',
      course: 'Eletrônica',
      campus: 'Rondonópolis',
      bio: 'Futuro engenheiro eletrônico',
      isActive: true
    }
  ]

  const users = adminDataService.getAll('users')
  sampleUsers.forEach(userData => {
    const exists = users.find(u => u.email === userData.email)
    if (!exists) {
      const user = {
        ...userData,
        password: 'senha123',
        avatar: null,
        emailVerified: true,
        preferences: {
          theme: 'light',
          notifications: true,
          privacy: 'public'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      adminDataService.create('users', user)
    }
  })

  // Criar posts de exemplo
  const existingPosts = adminDataService.getAll('posts')
  if (existingPosts.length === 0) {
    const allUsers = adminDataService.getAll('users')
    const samplePosts = [
      {
        content: 'Bem-vindos ao IF Wave! 🎉 Nossa nova rede social acadêmica.',
        userId: allUsers[0]?.id,
        type: 'text',
        likesCount: 15,
        commentsCount: 3,
        isPublic: true
      },
      {
        content: 'Acabei de terminar meu projeto de TCC. Que alívio! 📚',
        userId: allUsers[1]?.id,
        type: 'text', 
        likesCount: 8,
        commentsCount: 2,
        isPublic: true
      },
      {
        content: 'Alguém mais animado para a feira de ciências? 🔬',
        userId: allUsers[2]?.id,
        type: 'text',
        likesCount: 12,
        commentsCount: 5,
        isPublic: true
      }
    ]

    samplePosts.forEach(postData => {
      if (postData.userId) {
        const post = {
          ...postData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        adminDataService.create('posts', post)
      }
    })
  }

  // Criar comentários de exemplo
  const existingComments = adminDataService.getAll('comments')
  if (existingComments.length === 0) {
    const posts = adminDataService.getAll('posts')
    const allUsers = adminDataService.getAll('users')
    
    if (posts.length > 0 && allUsers.length > 1) {
      const sampleComments = [
        {
          content: 'Parabéns pela iniciativa!',
          userId: allUsers[1]?.id,
          postId: posts[0]?.id
        },
        {
          content: 'Muito legal! Vou usar bastante.',
          userId: allUsers[2]?.id, 
          postId: posts[0]?.id
        },
        {
          content: 'Boa sorte na defesa!',
          userId: allUsers[0]?.id,
          postId: posts[1]?.id
        }
      ]

      sampleComments.forEach(commentData => {
        if (commentData.userId && commentData.postId) {
          const comment = {
            ...commentData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          adminDataService.create('comments', comment)
        }
      })
    }
  }

  console.log('Dados de exemplo criados com sucesso!')
}

export function setupAdmin() {
  console.log('Configurando administrador e dados de exemplo...')
  
  // Criar usuário admin
  const admin = createAdminUser()
  
  // Criar dados de exemplo
  createSampleData()
  
  console.log('Setup concluído!')
  return admin
}
