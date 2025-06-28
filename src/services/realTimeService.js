/**
 * 🔄 Serviço de Real-time Updates - IF Wave
 * 
 * Gerencia conexões WebSocket e atualizações em tempo real
 */

class RealTimeService {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 5000
    this.listeners = new Map()
    this.connectionStatus = 'disconnected' // disconnected, connecting, connected
    this.messageQueue = []
    this.heartbeatInterval = null
    this.lastHeartbeat = null
  }

  // Conecta ao servidor WebSocket
  connect(websocketUrl = 'ws://localhost:8080/ws', authToken = null) {
    // TODO: Usar websocketUrl e authToken quando implementar WebSocket real
    console.log('📡 Preparando conexão para:', websocketUrl, authToken ? 'com token' : 'sem token')
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('🔄 WebSocket já está conectado')
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      try {
        this.connectionStatus = 'connecting'
        this.emit('connectionStatusChanged', this.connectionStatus)

        // TODO: Implementar conexão WebSocket real quando disponível
        // Por enquanto, simula conexão

        // Simula conexão WebSocket (para desenvolvimento)
        this.simulateConnection()
        resolve()

        // Código real do WebSocket (descomentado quando houver servidor)
        /*
        const wsUrl = token ? `${url}?token=${token}` : url
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log('✅ WebSocket conectado')
          this.connectionStatus = 'connected'
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.processMessageQueue()
          this.emit('connectionStatusChanged', this.connectionStatus)
          resolve()
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data))
        }

        this.ws.onclose = (event) => {
          console.log('❌ WebSocket desconectado:', event.code, event.reason)
          this.connectionStatus = 'disconnected'
          this.stopHeartbeat()
          this.emit('connectionStatusChanged', this.connectionStatus)
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.error('❌ Erro no WebSocket:', error)
          reject(error)
        }
        */

      } catch (error) {
        console.error('❌ Erro ao conectar WebSocket:', error)
        this.connectionStatus = 'disconnected'
        this.emit('connectionStatusChanged', this.connectionStatus)
        reject(error)
      }
    })
  }

  // Simula conexão para desenvolvimento (remove quando houver servidor real)
  simulateConnection() {
    setTimeout(() => {
      this.connectionStatus = 'connected'
      this.emit('connectionStatusChanged', this.connectionStatus)
      console.log('🔄 Simulando conexão WebSocket (modo desenvolvimento)')
      
      // Simula atualizações em tempo real
      this.startSimulation()
    }, 1000)
  }

  // Simula atualizações em tempo real (para desenvolvimento)
  startSimulation() {
    // Simula novos posts a cada 30 segundos
    setInterval(() => {
      this.emit('newPost', {
        id: Date.now(),
        user: 'Demo User',
        content: `Post simulado em tempo real - ${new Date().toLocaleTimeString()}`,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: []
      })
    }, 30000)

    // Simula notificações a cada 45 segundos
    setInterval(() => {
      this.emit('newNotification', {
        id: Date.now(),
        type: 'like',
        message: 'Alguém curtiu seu post!',
        timestamp: new Date().toISOString(),
        read: false
      })
    }, 45000)

    // Simula atualizações de presença a cada 20 segundos
    setInterval(() => {
      this.emit('userPresenceUpdate', {
        userId: Math.floor(Math.random() * 100),
        status: Math.random() > 0.5 ? 'online' : 'offline',
        lastSeen: new Date().toISOString()
      })
    }, 20000)
  }

  // Desconecta do WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.connectionStatus = 'disconnected'
    this.stopHeartbeat()
    this.emit('connectionStatusChanged', this.connectionStatus)
  }

  // Envia mensagem
  send(type, data) {
    const message = {
      type,
      data,
      timestamp: new Date().toISOString(),
      id: this.generateId()
    }

    if (this.connectionStatus === 'connected' && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      // Adiciona à fila se não estiver conectado
      this.messageQueue.push(message)
      console.log('📝 Mensagem adicionada à fila:', type)
    }
  }

  // Processa fila de mensagens
  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      this.ws.send(JSON.stringify(message))
      console.log('📤 Mensagem da fila enviada:', message.type)
    }
  }

  // Trata mensagens recebidas
  handleMessage(message) {
    console.log('📥 Mensagem recebida:', message)

    switch (message.type) {
      case 'heartbeat':
        this.lastHeartbeat = new Date()
        break
      case 'newPost':
        this.emit('newPost', message.data)
        break
      case 'postUpdate':
        this.emit('postUpdate', message.data)
        break
      case 'newComment':
        this.emit('newComment', message.data)
        break
      case 'newLike':
        this.emit('newLike', message.data)
        break
      case 'newMessage':
        this.emit('newMessage', message.data)
        break
      case 'userTyping':
        this.emit('userTyping', message.data)
        break
      case 'userStoppedTyping':
        this.emit('userStoppedTyping', message.data)
        break
      case 'userPresenceUpdate':
        this.emit('userPresenceUpdate', message.data)
        break
      case 'newNotification':
        this.emit('newNotification', message.data)
        break
      case 'pollVote':
        this.emit('pollVote', message.data)
        break
      case 'storyUpdate':
        this.emit('storyUpdate', message.data)
        break
      default:
        console.log('❓ Tipo de mensagem desconhecido:', message.type)
    }
  }

  // Inicia heartbeat
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('heartbeat', { timestamp: new Date().toISOString() })
      }
    }, 30000) // A cada 30 segundos
  }

  // Para heartbeat
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  // Agenda reconexão
  scheduleReconnect() {
    this.reconnectAttempts++
    console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
    
    setTimeout(() => {
      this.connect()
    }, this.reconnectInterval * this.reconnectAttempts)
  }

  // Sistema de eventos
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`❌ Erro no listener do evento ${event}:`, error)
        }
      })
    }
  }

  // Métodos específicos para diferentes funcionalidades

  // Chat em tempo real
  sendMessage(chatId, message) {
    this.send('sendMessage', {
      chatId,
      message,
      userId: this.getCurrentUserId()
    })
  }

  startTyping(chatId) {
    this.send('startTyping', {
      chatId,
      userId: this.getCurrentUserId()
    })
  }

  stopTyping(chatId) {
    this.send('stopTyping', {
      chatId,
      userId: this.getCurrentUserId()
    })
  }

  // Posts em tempo real
  createPost(post) {
    this.send('createPost', post)
  }

  likePost(postId) {
    this.send('likePost', {
      postId,
      userId: this.getCurrentUserId()
    })
  }

  commentPost(postId, comment) {
    this.send('commentPost', {
      postId,
      comment,
      userId: this.getCurrentUserId()
    })
  }

  // Enquetes em tempo real
  votePoll(pollId, optionIndexes) {
    this.send('votePoll', {
      pollId,
      optionIndexes,
      userId: this.getCurrentUserId()
    })
  }

  // Stories em tempo real
  viewStory(storyId) {
    this.send('viewStory', {
      storyId,
      userId: this.getCurrentUserId()
    })
  }

  // Presença de usuário
  updatePresence(status) {
    this.send('updatePresence', {
      userId: this.getCurrentUserId(),
      status, // online, away, busy, offline
      timestamp: new Date().toISOString()
    })
  }

  // Notificações
  markNotificationAsRead(notificationId) {
    this.send('markNotificationRead', {
      notificationId,
      userId: this.getCurrentUserId()
    })
  }

  // Utilitários
  getCurrentUserId() {
    const user = JSON.parse(localStorage.getItem('ifwave_current_user') || '{}')
    return user.id || 1
  }

  generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9)
  }

  getConnectionStatus() {
    return this.connectionStatus
  }

  isConnected() {
    return this.connectionStatus === 'connected'
  }

  // Estatísticas
  getStats() {
    return {
      connectionStatus: this.connectionStatus,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
      lastHeartbeat: this.lastHeartbeat,
      listeners: Array.from(this.listeners.keys())
    }
  }
}

// Singleton instance
const realTimeService = new RealTimeService()

// Auto-conecta quando o serviço é carregado
if (typeof window !== 'undefined') {
  // Conecta automaticamente em desenvolvimento
  realTimeService.connect().catch(console.error)

  // Limpa conexão quando a página é fechada
  window.addEventListener('beforeunload', () => {
    realTimeService.disconnect()
  })

  // Reconecta quando a rede volta
  window.addEventListener('online', () => {
    if (!realTimeService.isConnected()) {
      realTimeService.connect().catch(console.error)
    }
  })
}

export default realTimeService
