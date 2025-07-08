// Definição dos modelos para o painel administrativo
export const models = {
  // Modelo de Usuários
  users: {
    name: 'Usuários',
    icon: 'profile',
    fields: {
      id: { type: 'text', label: 'ID', readonly: true, primary: true },
      name: { type: 'text', label: 'Nome Completo', required: true },
      email: { type: 'email', label: 'E-mail', required: true, unique: true },
      course: { type: 'text', label: 'Curso', required: true },
      campus: { type: 'text', label: 'Campus', required: true },
      passwordHash: { type: 'password', label: 'Senha', required: true },
      avatar: { type: 'url', label: 'URL do Avatar' },
      isActive: { type: 'boolean', label: 'Ativo', default: true },
      isVerified: { type: 'boolean', label: 'Verificado', default: false },
      role: { 
        type: 'select', 
        label: 'Perfil', 
        options: ['student', 'teacher', 'admin'], 
        default: 'student' 
      },
      bio: { type: 'textarea', label: 'Biografia' },
      phone: { type: 'tel', label: 'Telefone' },
      birthDate: { type: 'date', label: 'Data de Nascimento' },
      createdAt: { type: 'datetime', label: 'Criado em', readonly: true },
      lastLogin: { type: 'datetime', label: 'Último Login', readonly: true }
    },
    listDisplay: ['name', 'email', 'course', 'campus', 'role', 'isActive', 'createdAt'],
    listFilter: ['role', 'campus', 'isActive', 'isVerified'],
    searchFields: ['name', 'email', 'course'],
    ordering: ['-createdAt']
  },

  // Modelo de Posts
  posts: {
    name: 'Posts',
    icon: 'publish',
    fields: {
      id: { type: 'text', label: 'ID', readonly: true, primary: true },
      userId: { type: 'foreignkey', label: 'Autor', model: 'users', required: true },
      content: { type: 'textarea', label: 'Conteúdo', required: true },
      image: { type: 'url', label: 'URL da Imagem' },
      type: { 
        type: 'select', 
        label: 'Tipo', 
        options: ['text', 'image', 'video', 'link'], 
        default: 'text' 
      },
      isPublic: { type: 'boolean', label: 'Público', default: true },
      isPromoted: { type: 'boolean', label: 'Promovido', default: false },
      likesCount: { type: 'number', label: 'Curtidas', readonly: true, default: 0 },
      commentsCount: { type: 'number', label: 'Comentários', readonly: true, default: 0 },
      sharesCount: { type: 'number', label: 'Compartilhamentos', readonly: true, default: 0 },
      tags: { type: 'text', label: 'Tags (separadas por vírgula)' },
      location: { type: 'text', label: 'Localização' },
      createdAt: { type: 'datetime', label: 'Criado em', readonly: true },
      updatedAt: { type: 'datetime', label: 'Atualizado em', readonly: true }
    },
    listDisplay: ['content', 'userId', 'type', 'isPublic', 'likesCount', 'commentsCount', 'createdAt'],
    listFilter: ['type', 'isPublic', 'isPromoted'],
    searchFields: ['content', 'tags'],
    ordering: ['-createdAt']
  },

  // Modelo de Comentários
  comments: {
    name: 'Comentários',
    icon: 'comment',
    fields: {
      id: { type: 'text', label: 'ID', readonly: true, primary: true },
      postId: { type: 'foreignkey', label: 'Post', model: 'posts', required: true },
      userId: { type: 'foreignkey', label: 'Autor', model: 'users', required: true },
      content: { type: 'textarea', label: 'Comentário', required: true },
      parentId: { type: 'foreignkey', label: 'Resposta a', model: 'comments' },
      likesCount: { type: 'number', label: 'Curtidas', readonly: true, default: 0 },
      isHidden: { type: 'boolean', label: 'Oculto', default: false },
      createdAt: { type: 'datetime', label: 'Criado em', readonly: true },
      updatedAt: { type: 'datetime', label: 'Atualizado em', readonly: true }
    },
    listDisplay: ['content', 'userId', 'postId', 'likesCount', 'isHidden', 'createdAt'],
    listFilter: ['isHidden'],
    searchFields: ['content'],
    ordering: ['-createdAt']
  },

  // Modelo de Mensagens
  messages: {
    name: 'Mensagens',
    icon: 'messages',
    fields: {
      id: { type: 'text', label: 'ID', readonly: true, primary: true },
      senderId: { type: 'foreignkey', label: 'Remetente', model: 'users', required: true },
      receiverId: { type: 'foreignkey', label: 'Destinatário', model: 'users', required: true },
      conversationId: { type: 'text', label: 'ID da Conversa', required: true },
      content: { type: 'textarea', label: 'Mensagem', required: true },
      type: { 
        type: 'select', 
        label: 'Tipo', 
        options: ['text', 'image', 'file', 'voice'], 
        default: 'text' 
      },
      isRead: { type: 'boolean', label: 'Lida', default: false },
      isDeleted: { type: 'boolean', label: 'Deletada', default: false },
      attachmentUrl: { type: 'url', label: 'URL do Anexo' },
      createdAt: { type: 'datetime', label: 'Enviada em', readonly: true }
    },
    listDisplay: ['content', 'senderId', 'receiverId', 'type', 'isRead', 'createdAt'],
    listFilter: ['type', 'isRead', 'isDeleted'],
    searchFields: ['content'],
    ordering: ['-createdAt']
  },

  // Modelo de Curtidas
  likes: {
    name: 'Curtidas',
    icon: 'heart',
    fields: {
      id: { type: 'text', label: 'ID', readonly: true, primary: true },
      userId: { type: 'foreignkey', label: 'Usuário', model: 'users', required: true },
      targetId: { type: 'text', label: 'ID do Alvo', required: true },
      targetType: { 
        type: 'select', 
        label: 'Tipo do Alvo', 
        options: ['post', 'comment'], 
        required: true 
      },
      createdAt: { type: 'datetime', label: 'Curtido em', readonly: true }
    },
    listDisplay: ['userId', 'targetType', 'targetId', 'createdAt'],
    listFilter: ['targetType'],
    searchFields: ['targetId'],
    ordering: ['-createdAt']
  },

  // Modelo de Seguidores
  follows: {
    name: 'Seguidores',
    icon: 'group',
    fields: {
      id: { type: 'text', label: 'ID', readonly: true, primary: true },
      followerId: { type: 'foreignkey', label: 'Seguidor', model: 'users', required: true },
      followingId: { type: 'foreignkey', label: 'Seguindo', model: 'users', required: true },
      createdAt: { type: 'datetime', label: 'Seguindo desde', readonly: true }
    },
    listDisplay: ['followerId', 'followingId', 'createdAt'],
    searchFields: [],
    ordering: ['-createdAt']
  },

  // Modelo de Notificações
  notifications: {
    name: 'Notificações',
    icon: 'notifications',
    fields: {
      id: { type: 'text', label: 'ID', readonly: true, primary: true },
      userId: { type: 'foreignkey', label: 'Usuário', model: 'users', required: true },
      type: { 
        type: 'select', 
        label: 'Tipo', 
        options: ['like', 'comment', 'follow', 'message', 'mention'], 
        required: true 
      },
      title: { type: 'text', label: 'Título', required: true },
      message: { type: 'textarea', label: 'Mensagem', required: true },
      data: { type: 'json', label: 'Dados Extras' },
      isRead: { type: 'boolean', label: 'Lida', default: false },
      createdAt: { type: 'datetime', label: 'Criada em', readonly: true }
    },
    listDisplay: ['title', 'userId', 'type', 'isRead', 'createdAt'],
    listFilter: ['type', 'isRead'],
    searchFields: ['title', 'message'],
    ordering: ['-createdAt']
  },

  // Modelo de Relatórios
  reports: {
    name: 'Denúncias',
    icon: 'block',
    fields: {
      id: { type: 'text', label: 'ID', readonly: true, primary: true },
      reporterId: { type: 'foreignkey', label: 'Denunciante', model: 'users', required: true },
      targetId: { type: 'text', label: 'ID do Alvo', required: true },
      targetType: { 
        type: 'select', 
        label: 'Tipo do Alvo', 
        options: ['user', 'post', 'comment'], 
        required: true 
      },
      reason: { 
        type: 'select', 
        label: 'Motivo', 
        options: ['spam', 'harassment', 'inappropriate', 'fake', 'violence', 'other'], 
        required: true 
      },
      description: { type: 'textarea', label: 'Descrição' },
      status: { 
        type: 'select', 
        label: 'Status', 
        options: ['pending', 'reviewing', 'resolved', 'dismissed'], 
        default: 'pending' 
      },
      adminNotes: { type: 'textarea', label: 'Notas do Admin' },
      createdAt: { type: 'datetime', label: 'Denunciado em', readonly: true },
      resolvedAt: { type: 'datetime', label: 'Resolvido em', readonly: true }
    },
    listDisplay: ['reporterId', 'targetType', 'reason', 'status', 'createdAt'],
    listFilter: ['targetType', 'reason', 'status'],
    searchFields: ['description'],
    ordering: ['-createdAt']
  }
}

// Configuração global do admin
export const adminConfig = {
  title: 'IF Wave Admin',
  subtitle: 'Painel Administrativo da Rede Social',
  version: '1.0.0',
  itemsPerPage: 20,
  maxItemsPerPage: 100,
  dateFormat: 'DD/MM/YYYY HH:mm'
  // theme removido
}
