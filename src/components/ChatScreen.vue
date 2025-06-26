<template>
  <div class="chat-container">
    <!-- Header do Chat -->
    <div class="chat-header">
      <button class="back-btn" @click="$emit('back')">
        <IconComponent name="back" :size="20" />
      </button>
      <div class="chat-user-info">
        <img :src="chatUser.avatar" :alt="chatUser.name" class="chat-avatar" />
        <div class="user-details">
          <h3 class="user-name">{{ chatUser.name }}</h3>
          <span class="user-status" :class="{ online: chatUser.online }">
            {{ chatUser.online ? 'Online' : 'Offline' }}
          </span>
        </div>
      </div>
      <div class="chat-actions">
        <button class="action-btn" @click="toggleUserInfo">
          <IconComponent name="menu" :size="20" />
        </button>
      </div>
    </div>

    <!-- Área de mensagens -->
    <div class="messages-area" ref="messagesArea">
      <div v-for="message in messages" :key="message.id" class="message" :class="{ 'my-message': message.isOwn }">
        <div class="message-bubble">
          <p class="message-text">{{ message.text }}</p>
          <div class="message-info">
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            <span v-if="message.isOwn && message.status" class="message-status" :class="message.status">
              <IconComponent 
                :name="getStatusIcon(message.status)" 
                :size="12" 
                v-if="message.status !== 'sending'"
              />
              <div v-else class="sending-spinner"></div>
            </span>
          </div>
        </div>
      </div>
      <div v-if="isTyping" class="typing-indicator">
        <div class="typing-bubble">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Input de mensagem -->
    <div class="message-input-area">
      <div class="input-container">
        <button class="attachment-btn" @click="showAttachmentOptions = !showAttachmentOptions">
          <IconComponent name="attach" :size="20" />
        </button>
        <input 
          type="text" 
          v-model="newMessage" 
          @keyup.enter="sendMessage"
          @input="handleTyping"
          placeholder="Digite uma mensagem..."
          class="message-input"
          maxlength="500"
        />
        <button 
          class="send-btn" 
          @click="sendMessage" 
          :disabled="!newMessage.trim()"
          :class="{ active: newMessage.trim() }"
        >
          <IconComponent name="send" :size="20" />
        </button>
      </div>
      
      <!-- Opções de anexo -->
      <div v-if="showAttachmentOptions" class="attachment-options">
        <button class="attachment-option" @click="selectImage">
          <IconComponent name="image" :size="16" />
          Imagem
        </button>
        <button class="attachment-option" @click="selectDocument">
          <IconComponent name="document" :size="16" />
          Documento
        </button>
      </div>
    </div>

    <!-- Info do usuário (lateral) -->
    <div v-if="showUserInfo" class="user-info-panel" @click.self="toggleUserInfo">
      <div class="user-info-content">
        <button class="close-info-btn" @click="toggleUserInfo">
          <IconComponent name="close" :size="20" />
        </button>
        
        <div class="user-profile">
          <img :src="chatUser.avatar" :alt="chatUser.name" class="profile-avatar" />
          <h3>{{ chatUser.name }}</h3>
          <p>{{ chatUser.course }}</p>
          <p>{{ chatUser.campus }}</p>
        </div>

        <div class="user-actions">
          <button class="action-item" @click="viewProfile">
            <IconComponent name="profile" :size="18" />
            Ver perfil
          </button>
          <button class="action-item" @click="muteConversation">
            <IconComponent name="mute" :size="18" />
            {{ isMuted ? 'Desmutar' : 'Mutar' }} conversa
          </button>
          <button class="action-item danger" @click="blockUser">
            <IconComponent name="block" :size="18" />
            Bloquear usuário
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import IconComponent from './IconComponent.vue'

export default {
  name: 'ChatScreen',
  components: {
    IconComponent
  },
  props: {
    chatUser: {
      type: Object,
      required: true
    },
    currentUser: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      newMessage: '',
      showAttachmentOptions: false,
      showUserInfo: false,
      isTyping: false,
      isMuted: false,
      typingTimeout: null,
      messages: []
    }
  },
  mounted() {
    this.loadMessages()
    this.scrollToBottom()
    // Simular status online do usuário
    this.simulateUserActivity()
  },
  methods: {
    loadMessages() {
      // Carregar mensagens do localStorage ou simular algumas
      const chatId = this.getChatId()
      const savedMessages = localStorage.getItem(`ifwave_chat_${chatId}`)
      
      if (savedMessages) {
        this.messages = JSON.parse(savedMessages)
      } else {
        // Simular algumas mensagens iniciais
        this.messages = [
          {
            id: 1,
            text: 'Oi! Como está indo com os estudos?',
            timestamp: Date.now() - 3600000, // 1 hora atrás
            isOwn: false,
            status: 'read'
          },
          {
            id: 2,
            text: 'Oi! Está indo bem, obrigado por perguntar. E você?',
            timestamp: Date.now() - 3300000, // 55 min atrás
            isOwn: true,
            status: 'read'
          },
          {
            id: 3,
            text: 'Também está bem! Você viu o trabalho que o professor passou?',
            timestamp: Date.now() - 3000000, // 50 min atrás
            isOwn: false,
            status: 'read'
          }
        ]
        this.saveMessages()
      }
    },

    getChatId() {
      // Gerar ID único para a conversa baseado nos IDs dos usuários
      const ids = [this.currentUser.id, this.chatUser.id].sort()
      return `${ids[0]}_${ids[1]}`
    },

    saveMessages() {
      const chatId = this.getChatId()
      localStorage.setItem(`ifwave_chat_${chatId}`, JSON.stringify(this.messages))
      
      // Atualizar última mensagem na lista de conversas
      this.updateLastMessage()
    },

    updateLastMessage() {
      if (this.messages.length === 0) return
      
      const lastMessage = this.messages[this.messages.length - 1]
      const conversations = JSON.parse(localStorage.getItem('ifwave_conversations') || '[]')
      const chatId = this.getChatId()
      
      const existingConv = conversations.find(conv => conv.id === chatId)
      const conversationData = {
        id: chatId,
        userId: this.chatUser.id,
        name: this.chatUser.name,
        avatar: this.chatUser.avatar,
        course: this.chatUser.course,
        lastMessage: lastMessage.text,
        lastMessageTime: this.formatTime(lastMessage.timestamp),
        timestamp: lastMessage.timestamp,
        unread: !lastMessage.isOwn,
        unreadCount: !lastMessage.isOwn ? 1 : 0,
        online: this.chatUser.online
      }
      
      if (existingConv) {
        Object.assign(existingConv, conversationData)
      } else {
        conversations.push(conversationData)
      }
      
      // Ordenar por timestamp mais recente
      conversations.sort((a, b) => b.timestamp - a.timestamp)
      
      localStorage.setItem('ifwave_conversations', JSON.stringify(conversations))
    },

    sendMessage() {
      if (!this.newMessage.trim()) return

      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: this.newMessage.trim(),
        timestamp: Date.now(),
        isOwn: true,
        status: 'sending',
        senderId: this.currentUser.id,
        receiverId: this.chatUser.id
      }

      this.messages.push(message)
      this.newMessage = ''
      this.scrollToBottom()

      // Simular envio
      setTimeout(() => {
        message.status = 'sent'
        this.saveMessages()
        this.updateLastMessage()
        
        // Notificar sobre nova mensagem
        this.$emit('message-sent', {
          chatId: this.getChatId(),
          message: message,
          recipient: this.chatUser
        })
        
        // Simular resposta automática às vezes (apenas para demonstração)
        if (Math.random() > 0.7) {
          this.simulateReply()
        }
      }, 1000)

      // Simular entrega
      setTimeout(() => {
        if (message.status === 'sent') {
          message.status = 'delivered'
          this.saveMessages()
        }
      }, 2000)

      // Simular leitura
      setTimeout(() => {
        if (message.status === 'delivered') {
          message.status = 'read'
          this.saveMessages()
        }
      }, 5000)
    },

    simulateReply() {
      const replies = [
        'Entendi! 👍',
        'Obrigado pela informação!',
        'Vamos nos falar depois',
        'Perfeito! 😊',
        'Combinado',
        'Pode deixar!',
        'Beleza',
        'Ok, valeu!',
        'Ótima ideia!',
        'Vou pensar sobre isso',
        'Me conta mais depois',
        'Legal! 🙂'
      ]

      setTimeout(() => {
        this.isTyping = true
        
        setTimeout(() => {
          this.isTyping = false
          const reply = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text: replies[Math.floor(Math.random() * replies.length)],
            timestamp: Date.now(),
            isOwn: false,
            status: 'delivered',
            senderId: this.chatUser.id,
            receiverId: this.currentUser.id
          }
          
          this.messages.push(reply)
          this.scrollToBottom()
          this.saveMessages()
          this.updateLastMessage()
          
          // Simular leitura da resposta
          setTimeout(() => {
            reply.status = 'read'
            this.saveMessages()
          }, 2000)
        }, 1500 + Math.random() * 2000) // Tempo variável de digitação
      }, 500 + Math.random() * 1500) // Tempo antes de começar a digitar
    },

    handleTyping() {
      // Simular indicador de digitação
      clearTimeout(this.typingTimeout)
      this.typingTimeout = setTimeout(() => {
        // Parar de mostrar "digitando"
      }, 1000)
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const messagesArea = this.$refs.messagesArea
        if (messagesArea) {
          messagesArea.scrollTop = messagesArea.scrollHeight
        }
      })
    },

    formatTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diffInHours = (now - date) / (1000 * 60 * 60)
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      } else if (diffInHours < 168) { // 7 dias
        return date.toLocaleDateString('pt-BR', { 
          weekday: 'short',
          hour: '2-digit', 
          minute: '2-digit' 
        })
      } else {
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }
    },

    getStatusIcon(status) {
      switch (status) {
        case 'sent': return 'check'
        case 'delivered': return 'check-double'
        case 'read': return 'check-double'
        default: return 'check'
      }
    },

    toggleUserInfo() {
      this.showUserInfo = !this.showUserInfo
    },

    simulateUserActivity() {
      // Simular mudanças de status online/offline usando uma variável local
      setInterval(() => {
        // Emitir evento para o componente pai atualizar o status
        this.$emit('user-status-change', {
          userId: this.chatUser.id,
          online: Math.random() > 0.3
        })
      }, 30000) // A cada 30 segundos
    },

    viewProfile() {
      this.$emit('view-profile', this.chatUser)
    },

    muteConversation() {
      this.isMuted = !this.isMuted
      // Salvar preferência no localStorage
      const chatId = this.getChatId()
      localStorage.setItem(`ifwave_muted_${chatId}`, this.isMuted.toString())
    },

    blockUser() {
      if (confirm(`Tem certeza que deseja bloquear ${this.chatUser.name}?`)) {
        // Implementar lógica de bloqueio
        const blockedUsers = JSON.parse(localStorage.getItem('ifwave_blocked_users') || '[]')
        if (!blockedUsers.includes(this.chatUser.id)) {
          blockedUsers.push(this.chatUser.id)
          localStorage.setItem('ifwave_blocked_users', JSON.stringify(blockedUsers))
        }
        this.$emit('user-blocked', this.chatUser)
      }
    },

    selectImage() {
      // Implementar seleção de imagem
      this.showAttachmentOptions = false
    },

    selectDocument() {
      // Implementar seleção de documento
      this.showAttachmentOptions = false
    }
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--background);
  position: relative;
}

/* Header do Chat */
.chat-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--card);
  border-bottom: 1px solid var(--border);
  gap: 12px;
}

.back-btn {
  background: none;
  border: none;
  color: var(--foreground);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s;
}

.back-btn:hover {
  background: var(--background);
}

.chat-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--foreground);
}

.user-status {
  font-size: 12px;
  color: #8e8e8e;
}

.user-status.online {
  color: #44b883;
}

.chat-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  color: var(--foreground);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s;
}

.action-btn:hover {
  background: var(--background);
}

/* Área de mensagens */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  justify-content: flex-start;
}

.message.my-message {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  background: var(--card);
  border: 1px solid var(--border);
}

.my-message .message-bubble {
  background: #0095f6;
  color: white;
  border: none;
}

.message-text {
  margin: 0 0 4px 0;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-info {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
}

.my-message .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.message-status {
  display: flex;
  align-items: center;
}

.message-status.read {
  color: #0095f6;
}

.sending-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Indicador de digitação */
.typing-indicator {
  display: flex;
  justify-content: flex-start;
}

.typing-bubble {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 12px 16px;
}

.typing-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: #8e8e8e;
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite both;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

/* Input de mensagem */
.message-input-area {
  background: var(--card);
  border-top: 1px solid var(--border);
  padding: 12px 16px;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.attachment-btn {
  background: none;
  border: none;
  color: var(--foreground);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s;
}

.attachment-btn:hover {
  background: var(--background);
}

.message-input {
  flex: 1;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 10px 16px;
  background: var(--background);
  color: var(--foreground);
  font-size: 14px;
  outline: none;
  resize: none;
}

.message-input:focus {
  border-color: #0095f6;
}

.send-btn {
  background: #e0e0e0;
  border: none;
  color: #8e8e8e;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  transition: all 0.2s;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn.active {
  background: #0095f6;
  color: white;
}

.send-btn:disabled {
  cursor: not-allowed;
}

/* Opções de anexo */
.attachment-options {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  padding: 8px;
  background: var(--background);
  border-radius: 12px;
}

.attachment-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--foreground);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.attachment-option:hover {
  background: var(--background);
}

/* Painel de informações do usuário */
.user-info-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.user-info-content {
  width: 300px;
  height: 100%;
  background: var(--card);
  padding: 20px;
  overflow-y: auto;
}

.close-info-btn {
  background: none;
  border: none;
  color: var(--foreground);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  float: right;
  margin-bottom: 20px;
}

.user-profile {
  text-align: center;
  margin-bottom: 30px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 12px;
}

.user-profile h3 {
  margin: 0 0 8px 0;
  color: var(--foreground);
}

.user-profile p {
  margin: 4px 0;
  color: #8e8e8e;
  font-size: 14px;
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--foreground);
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.action-item:hover {
  background: var(--card);
}

.action-item.danger {
  color: #e74c3c;
}

@media (max-width: 480px) {
  .user-info-content {
    width: 280px;
  }
  
  .message-bubble {
    max-width: 85%;
  }
}
</style>
