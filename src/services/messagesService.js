/**
 * 💬 Serviço de Mensagens - IF Wave
 * 
 * Gerencia conversas, mensagens e funcionalidades de chat
 */

class MessagesService {
  constructor() {
    this.conversations = new Map()
    this.messages = new Map()
    this.listeners = new Set()
    this.typingUsers = new Map()
    this.messageQueue = []
    this.isOnline = navigator.onLine
    
    // Configurações
    this.maxMessageLength = 1000
    this.typingTimeout = 3000
    this.messageRetryAttempts = 3
    this.attachmentMaxSize = 10 * 1024 * 1024 // 10MB
    
    this.init()
  }

  init() {
    // Carregar dados do localStorage
    this.loadConversations()
    this.loadMessages()
    
    // Monitorar conexão
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processMessageQueue()
      this.emit('connectionStatusChanged', { online: true })
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
      this.emit('connectionStatusChanged', { online: false })
    })
  }

  // === GERENCIAMENTO DE CONVERSAS ===

  getConversations(userId) {
    const conversations = JSON.parse(localStorage.getItem(`ifwave_conversations_${userId}`) || '[]')
    return conversations
      .map(conv => ({
        ...conv,
        lastMessageTime: this.formatMessageTime(conv.timestamp),
        unreadCount: this.getUnreadCount(conv.id, userId)
      }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
  }

  createConversation(participants, type = 'direct', metadata = {}) {
    const conversationId = this.generateConversationId(participants, type)
    
    const conversation = {
      id: conversationId,
      type, // 'direct', 'group'
      participants: participants.map(p => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        role: p.role || 'member'
      })),
      metadata: {
        title: metadata.title || '',
        description: metadata.description || '',
        avatar: metadata.avatar || '',
        createdBy: metadata.createdBy || participants[0].id,
        ...metadata
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastMessage: null,
      settings: {
        notifications: true,
        soundEnabled: true,
        autoDownload: true
      }
    }

    // Salvar para cada participante
    participants.forEach(participant => {
      this.saveConversationForUser(conversation, participant.id)
    })

    this.emit('conversationCreated', { conversation })
    return conversation
  }

  saveConversationForUser(conversation, userId) {
    const userConversations = this.getConversations(userId)
    const existingIndex = userConversations.findIndex(c => c.id === conversation.id)
    
    if (existingIndex >= 0) {
      userConversations[existingIndex] = conversation
    } else {
      userConversations.unshift(conversation)
    }
    
    localStorage.setItem(`ifwave_conversations_${userId}`, JSON.stringify(userConversations))
  }

  updateConversation(conversationId, updates) {
    // Atualizar para todos os participantes
    const conversation = this.getConversationById(conversationId)
    if (!conversation) return null

    const updatedConversation = { ...conversation, ...updates, updatedAt: Date.now() }
    
    conversation.participants.forEach(participant => {
      this.saveConversationForUser(updatedConversation, participant.id)
    })

    this.emit('conversationUpdated', { conversationId, updates })
    return updatedConversation
  }

  deleteConversation(conversationId, userId) {
    const userConversations = this.getConversations(userId)
    const filteredConversations = userConversations.filter(c => c.id !== conversationId)
    
    localStorage.setItem(`ifwave_conversations_${userId}`, JSON.stringify(filteredConversations))
    
    // Deletar mensagens relacionadas
    localStorage.removeItem(`ifwave_messages_${conversationId}`)
    
    this.emit('conversationDeleted', { conversationId, userId })
  }

  // === GERENCIAMENTO DE MENSAGENS ===

  getMessages(conversationId, limit = 50, offset = 0) {
    const messages = JSON.parse(localStorage.getItem(`ifwave_messages_${conversationId}`) || '[]')
    return messages
      .slice(offset, offset + limit)
      .map(msg => ({
        ...msg,
        formattedTime: this.formatMessageTime(msg.timestamp),
        isEdited: msg.editedAt > 0
      }))
  }

  sendMessage(conversationId, senderId, content, type = 'text', attachments = []) {
    const messageId = this.generateMessageId()
    
    const message = {
      id: messageId,
      conversationId,
      senderId,
      type, // 'text', 'image', 'audio', 'video', 'file', 'system'
      content,
      attachments,
      timestamp: Date.now(),
      editedAt: 0,
      status: this.isOnline ? 'sending' : 'queued',
      reactions: {},
      mentions: this.extractMentions(content),
      replyTo: null,
      metadata: {}
    }

    if (this.isOnline) {
      this.deliverMessage(message)
    } else {
      this.messageQueue.push(message)
    }

    this.saveMessage(message)
    this.updateConversationLastMessage(conversationId, message)
    
    this.emit('messageSent', { message })
    return message
  }

  deliverMessage(message) {
    // Simular envio (em produção conectaria com WebSocket/API)
    setTimeout(() => {
      message.status = 'delivered'
      this.updateMessage(message.id, { status: 'delivered' })
      
      // Simular recebimento após um tempo
      setTimeout(() => {
        message.status = 'read'
        this.updateMessage(message.id, { status: 'read' })
      }, Math.random() * 2000 + 1000)
    }, Math.random() * 1000 + 500)
  }

  updateMessage(messageId, updates) {
    // Encontrar a mensagem e atualizar
    const conversations = JSON.parse(localStorage.getItem('ifwave_conversations') || '[]')
    
    for (const conv of conversations) {
      const messages = this.getMessages(conv.id)
      const messageIndex = messages.findIndex(m => m.id === messageId)
      
      if (messageIndex >= 0) {
        messages[messageIndex] = { ...messages[messageIndex], ...updates }
        localStorage.setItem(`ifwave_messages_${conv.id}`, JSON.stringify(messages))
        
        this.emit('messageUpdated', { messageId, updates })
        break
      }
    }
  }

  deleteMessage(messageId, conversationId) {
    const messages = this.getMessages(conversationId)
    const filteredMessages = messages.filter(m => m.id !== messageId)
    
    localStorage.setItem(`ifwave_messages_${conversationId}`, JSON.stringify(filteredMessages))
    this.emit('messageDeleted', { messageId, conversationId })
  }

  editMessage(messageId, conversationId, newContent) {
    const messages = this.getMessages(conversationId)
    const messageIndex = messages.findIndex(m => m.id === messageId)
    
    if (messageIndex >= 0) {
      messages[messageIndex].content = newContent
      messages[messageIndex].editedAt = Date.now()
      
      localStorage.setItem(`ifwave_messages_${conversationId}`, JSON.stringify(messages))
      this.emit('messageEdited', { messageId, newContent })
    }
  }

  // === FUNCIONALIDADES AVANÇADAS ===

  addReaction(messageId, conversationId, userId, emoji) {
    const messages = this.getMessages(conversationId)
    const messageIndex = messages.findIndex(m => m.id === messageId)
    
    if (messageIndex >= 0) {
      const message = messages[messageIndex]
      if (!message.reactions[emoji]) {
        message.reactions[emoji] = []
      }
      
      if (!message.reactions[emoji].includes(userId)) {
        message.reactions[emoji].push(userId)
      }
      
      localStorage.setItem(`ifwave_messages_${conversationId}`, JSON.stringify(messages))
      this.emit('reactionAdded', { messageId, emoji, userId })
    }
  }

  removeReaction(messageId, conversationId, userId, emoji) {
    const messages = this.getMessages(conversationId)
    const messageIndex = messages.findIndex(m => m.id === messageId)
    
    if (messageIndex >= 0) {
      const message = messages[messageIndex]
      if (message.reactions[emoji]) {
        message.reactions[emoji] = message.reactions[emoji].filter(id => id !== userId)
        if (message.reactions[emoji].length === 0) {
          delete message.reactions[emoji]
        }
      }
      
      localStorage.setItem(`ifwave_messages_${conversationId}`, JSON.stringify(messages))
      this.emit('reactionRemoved', { messageId, emoji, userId })
    }
  }

  startTyping(conversationId, userId) {
    if (!this.typingUsers.has(conversationId)) {
      this.typingUsers.set(conversationId, new Set())
    }
    
    this.typingUsers.get(conversationId).add(userId)
    this.emit('userStartedTyping', { conversationId, userId })
    
    // Auto-stop typing após timeout
    setTimeout(() => {
      this.stopTyping(conversationId, userId)
    }, this.typingTimeout)
  }

  stopTyping(conversationId, userId) {
    if (this.typingUsers.has(conversationId)) {
      this.typingUsers.get(conversationId).delete(userId)
      this.emit('userStoppedTyping', { conversationId, userId })
    }
  }

  getTypingUsers(conversationId) {
    return Array.from(this.typingUsers.get(conversationId) || [])
  }

  // === BUSCA E FILTROS ===

  searchMessages(query, conversationId = null, filters = {}) {
    const results = []
    const searchTerm = query.toLowerCase()
    
    if (conversationId) {
      // Buscar em uma conversa específica
      const messages = this.getMessages(conversationId)
      results.push(...messages.filter(msg => 
        this.messageMatchesSearch(msg, searchTerm, filters)
      ))
    } else {
      // Buscar em todas as conversas
      const conversations = this.getAllConversations()
      conversations.forEach(conv => {
        const messages = this.getMessages(conv.id)
        results.push(...messages.filter(msg => 
          this.messageMatchesSearch(msg, searchTerm, filters)
        ))
      })
    }
    
    return results.sort((a, b) => b.timestamp - a.timestamp)
  }

  messageMatchesSearch(message, searchTerm, filters) {
    // Busca no conteúdo
    const contentMatch = message.content.toLowerCase().includes(searchTerm)
    
    // Aplicar filtros
    if (filters.type && message.type !== filters.type) return false
    if (filters.senderId && message.senderId !== filters.senderId) return false
    if (filters.dateFrom && message.timestamp < filters.dateFrom) return false
    if (filters.dateTo && message.timestamp > filters.dateTo) return false
    
    return contentMatch
  }

  // === UTILITÁRIOS ===

  generateConversationId(participants, type) {
    if (type === 'direct' && participants.length === 2) {
      const ids = participants.map(p => p.id).sort()
      return `direct_${ids[0]}_${ids[1]}`
    }
    return `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  formatMessageTime(timestamp) {
    const now = new Date()
    const messageDate = new Date(timestamp)
    const diffMs = now - messageDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Agora'
    if (diffMins < 60) return `${diffMins}min`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays === 1) return 'Ontem'
    if (diffDays < 7) return `${diffDays}d`
    
    return messageDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: diffDays > 365 ? '2-digit' : undefined
    })
  }

  extractMentions(content) {
    const mentionRegex = /@(\w+)/g
    const mentions = []
    let match
    
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1])
    }
    
    return mentions
  }

  processMessageQueue() {
    if (!this.isOnline || this.messageQueue.length === 0) return
    
    const messagesToSend = [...this.messageQueue]
    this.messageQueue = []
    
    messagesToSend.forEach(message => {
      message.status = 'sending'
      this.deliverMessage(message)
    })
  }

  // === HELPERS PRIVADOS ===

  saveMessage(message) {
    const messages = this.getMessages(message.conversationId)
    messages.unshift(message)
    localStorage.setItem(`ifwave_messages_${message.conversationId}`, JSON.stringify(messages))
  }

  updateConversationLastMessage(conversationId, message) {
    const conversation = this.getConversationById(conversationId)
    if (conversation) {
      this.updateConversation(conversationId, {
        lastMessage: message.content,
        timestamp: message.timestamp
      })
    }
  }

  getConversationById(conversationId) {
    // Buscar em todas as conversas de usuários
    const users = JSON.parse(localStorage.getItem('ifwave_users') || '[]')
    
    for (const user of users) {
      const userConversations = this.getConversations(user.id)
      const conversation = userConversations.find(c => c.id === conversationId)
      if (conversation) return conversation
    }
    
    return null
  }

  getAllConversations() {
    const allConversations = []
    const users = JSON.parse(localStorage.getItem('ifwave_users') || '[]')
    
    users.forEach(user => {
      const userConversations = this.getConversations(user.id)
      allConversations.push(...userConversations)
    })
    
    return allConversations
  }

  getUnreadCount(conversationId, userId) {
    const messages = this.getMessages(conversationId)
    return messages.filter(msg => 
      msg.senderId !== userId && 
      msg.status !== 'read'
    ).length
  }

  loadConversations() {
    // Carregar conversas do localStorage se necessário
  }

  loadMessages() {
    // Carregar mensagens do localStorage se necessário
  }

  // === SISTEMA DE EVENTOS ===

  on(event, callback) {
    this.listeners.add({ event, callback })
  }

  off(event, callback) {
    this.listeners.delete({ event, callback })
  }

  emit(event, data) {
    this.listeners.forEach(listener => {
      if (listener.event === event) {
        listener.callback(data)
      }
    })
  }
}

// Singleton
const messagesService = new MessagesService()
export default messagesService
