<template>
  <div>
    <!-- Lista de mensagens -->
    <div class="messages-container" v-if="!selectedChat">
      <!-- Verificação se o usuário está logado -->
      <div v-if="!currentUser || !currentUser.id" class="loading-state">
        <div class="loading-icon">
          <IconComponent name="messages" :size="64" />
        </div>
        <h3>Carregando...</h3>
        <p>Aguarde enquanto carregamos suas mensagens.</p>
      </div>

      <!-- Conteúdo principal (só mostra se usuário estiver logado) -->
      <div v-else>
        <!-- Header da tela de mensagens -->
        <div class="messages-header">
          <h2 class="messages-title">Mensagens</h2>
          <div class="header-actions">
            <button class="action-btn" title="Nova mensagem" @click="showNewMessage = true">
              <IconComponent name="edit" :size="20" />
            </button>
            <button class="action-btn" title="Configurações">
              <IconComponent name="settings" :size="20" />
            </button>
          </div>
        </div>

        <!-- Barra de pesquisa -->
        <div class="search-bar">
          <div class="search-input-container">
            <IconComponent name="search" :size="16" class="search-icon" />
            <input 
              type="text" 
              placeholder="Pesquisar conversas..." 
              v-model="searchQuery"
              class="search-input"
            />
          </div>
        </div>

        <!-- Seção de conversas ativas -->
        <div class="active-conversations" v-if="activeChats.length > 0">
          <h3 class="section-title">Conversas Ativas</h3>
          <div class="chat-list">
            <div 
              v-for="chat in filteredChats" 
              :key="chat.id"
              class="chat-item"
              :class="{ 'unread': chat.unread }"
              @click="openChat(chat)"
            >
              <div class="chat-avatar">
                <img :src="chat.avatar" :alt="chat.name" />
                <span v-if="chat.online" class="online-indicator"></span>
              </div>
              <div class="chat-info">
                <div class="chat-header">
                  <span class="chat-name">{{ chat.name }}</span>
                  <span class="chat-course">{{ chat.course }}</span>
                  <span class="chat-time">{{ chat.lastMessageTime }}</span>
                </div>
                <div class="chat-preview">
                  <span class="last-message">{{ chat.lastMessage }}</span>
                  <span v-if="chat.unreadCount > 0" class="unread-badge">{{ chat.unreadCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Seção de usuários disponíveis -->
        <div class="available-users" v-if="availableUsers.length > 0">
          <h3 class="section-title">Usuários Disponíveis</h3>
          <div class="user-list">
            <div 
              v-for="user in availableUsers" 
              :key="user.id"
              class="user-item"
              @click="startChatWith(user)"
            >
              <div class="user-avatar">
                <img :src="user.avatar" :alt="user.name" />
                <span v-if="user.online" class="online-indicator"></span>
              </div>
              <div class="user-info">
                <div class="user-header">
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-course">{{ user.course }}</span>
                </div>
                <div class="user-details">
                  <span class="user-campus">{{ user.campus }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vazio -->
        <div v-if="!hasAnyConversations && availableUsers.length === 0" class="empty-state">
          <div class="empty-icon">
            <IconComponent name="messages" :size="64" />
          </div>
          <h3 class="empty-title">Nenhuma conversa ainda</h3>
          <p class="empty-description">
            Comece uma conversa com seus colegas de classe cadastrados.
          </p>
          <button class="start-chat-btn" @click="showNewMessage = true">
            <IconComponent name="edit" :size="20" />
            Iniciar conversa
          </button>
        </div>

        <!-- Estado quando não há conversas ativas mas há usuários disponíveis -->
        <div v-else-if="!hasAnyConversations && availableUsers.length > 0" class="welcome-state">
          <div class="welcome-icon">
            <IconComponent name="messages" :size="48" />
          </div>
          <h3>Bem-vindo às Mensagens!</h3>
          <p>Você pode iniciar uma conversa com qualquer usuário cadastrado abaixo.</p>
        </div>

        <!-- Modal de nova mensagem -->
        <div v-if="showNewMessage" class="modal-overlay" @click="showNewMessage = false">
          <div class="new-message-modal" @click.stop>
            <div class="modal-header">
              <h3>Nova Conversa</h3>
              <button @click="showNewMessage = false" class="close-btn">
                <IconComponent name="close" :size="20" />
              </button>
            </div>
            <div class="modal-content">
              <div class="search-contacts">
                <div class="search-input-container">
                  <IconComponent name="search" :size="16" class="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Pesquisar por nome, curso ou campus..." 
                    v-model="newMessageQuery"
                    class="contact-search"
                    @input="filterContacts"
                  />
                </div>
              </div>
              <div class="contact-suggestions">
                <h4>
                  <IconComponent name="group" :size="18" />
                  Usuários Disponíveis ({{ filteredContacts.length }})
                </h4>
                <div class="suggestion-list" v-if="filteredContacts.length > 0">
                  <div 
                    v-for="contact in filteredContacts" 
                    :key="contact.id"
                    class="suggestion-item"
                    @click="selectContact(contact)"
                  >
                    <img :src="contact.avatar" :alt="contact.name" class="suggestion-avatar" />
                    <div class="suggestion-info">
                      <span class="suggestion-name">{{ contact.name }}</span>
                      <span class="suggestion-detail">{{ contact.course }}</span>
                      <span class="suggestion-campus">{{ contact.campus }}</span>
                    </div>
                    <div class="suggestion-actions">
                      <span v-if="contact.online" class="online-indicator" title="Online"></span>
                      <button class="start-chat-btn-small" title="Iniciar conversa">
                        <IconComponent name="messages" :size="16" />
                      </button>
                    </div>
                  </div>
                </div>
                <div v-else class="no-results">
                  <div class="no-results-icon">
                    <IconComponent name="search" :size="32" />
                  </div>
                  <p v-if="newMessageQuery">Nenhum usuário encontrado para "{{ newMessageQuery }}"</p>
                  <p v-else>Nenhum usuário disponível para conversar</p>
                  <small>Tente pesquisar por nome, curso ou campus</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tela de Chat -->
    <ChatScreen 
      v-if="selectedChat"
      :chatUser="selectedChat"
      :currentUser="currentUser"
      @back="backToMessages"
      @view-profile="viewProfile"
      @user-blocked="handleUserBlocked"
      @user-status-change="handleUserStatusChange"
      @message-sent="handleMessageSent"
    />
  </div>
</template>

<script>
import IconComponent from './IconComponent.vue'
import ChatScreen from './ChatScreen.vue'

export default {
  name: 'MessagesScreen',
  components: {
    IconComponent,
    ChatScreen
  },
  props: {
    currentUser: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      searchQuery: '',
      showNewMessage: false,
      newMessageQuery: '',
      selectedChat: null,
      activeChats: [],
      availableUsers: []
    }
  },
  computed: {
    filteredChats() {
      if (!this.searchQuery) return this.activeChats
      return this.activeChats.filter(chat => 
        chat.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        chat.course.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    },
    
    filteredContacts() {
      let contacts = this.availableUsers.filter(user => {
        // Verificar se currentUser existe e tem id antes de comparar
        const currentUserId = this.currentUser && this.currentUser.id ? this.currentUser.id : null
        return currentUserId && user.id !== currentUserId && // Não mostrar o próprio usuário
               !this.isBlocked(user.id) // Não mostrar usuários bloqueados
      })
      
      if (this.newMessageQuery) {
        contacts = contacts.filter(contact =>
          contact.name.toLowerCase().includes(this.newMessageQuery.toLowerCase()) ||
          contact.course.toLowerCase().includes(this.newMessageQuery.toLowerCase()) ||
          contact.campus.toLowerCase().includes(this.newMessageQuery.toLowerCase())
        )
      }
      
      return contacts
    },
    
    hasAnyConversations() {
      return this.activeChats.length > 0
    }
  },
  mounted() {
    // Verificar se currentUser está disponível antes de carregar dados
    if (this.currentUser && this.currentUser.id) {
      this.loadRegisteredUsers()
      this.loadActiveConversations()
    } else {
      // Se não há usuário logado, aguardar um pouco e tentar novamente
      setTimeout(() => {
        if (this.currentUser && this.currentUser.id) {
          this.loadRegisteredUsers()
          this.loadActiveConversations()
        }
      }, 500)
    }
  },
  methods: {
    loadRegisteredUsers() {
      // Carregar todos os usuários cadastrados do localStorage
      const users = JSON.parse(localStorage.getItem('ifwave_users') || '[]')
      
      this.availableUsers = users
        .filter(user => user && typeof user === 'object' && user.id) // Filtrar apenas objetos válidos com id
        .map(user => ({
          ...user,
          online: Math.random() > 0.5, // Simular status online
          avatar: user.avatar || this.generateAvatar(user.name || 'Usuário')
        }))
        .filter(user => {
          // Verificar se currentUser existe e tem id antes de comparar
          return this.currentUser && this.currentUser.id && user.id !== this.currentUser.id
        })
    },

    loadActiveConversations() {
      // Carregar conversas ativas do localStorage
      const conversations = JSON.parse(localStorage.getItem('ifwave_conversations') || '[]')
      
      this.activeChats = conversations.map(conv => {
        // Buscar dados atualizados do usuário
        const user = this.availableUsers.find(u => u.id === conv.userId)
        if (user) {
          return {
            ...conv,
            name: user.name,
            course: user.course,
            campus: user.campus,
            avatar: user.avatar,
            online: user.online
          }
        }
        return conv
      }).filter(conv => conv && !this.isBlocked(conv.userId))
      
      // Ordenar por timestamp mais recente
      this.activeChats.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    },

    generateAvatar(name) {
      const avatars = [
        'https://images.unsplash.com/photo-1494790108755-2616b612b750?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
      ]
      // Usar o hash do nome para escolher um avatar consistente
      const hash = name.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
      }, 0)
      return avatars[Math.abs(hash) % avatars.length]
    },

    isBlocked(userId) {
      const blockedUsers = JSON.parse(localStorage.getItem('ifwave_blocked_users') || '[]')
      return blockedUsers.includes(userId)
    },

    openChat(chat) {
      // Buscar dados completos do usuário
      const user = this.availableUsers.find(u => u.id === chat.userId) || {
        id: chat.userId,
        name: chat.name,
        course: chat.course,
        campus: chat.campus || 'IFMT',
        avatar: chat.avatar,
        online: chat.online || false
      }
      
      this.selectedChat = user
      
      // Marcar conversa como lida
      this.markAsRead(chat.id)
    },

    startChatWith(user) {
      this.selectedChat = user
    },

    selectContact(contact) {
      this.showNewMessage = false
      this.newMessageQuery = ''
      
      // Verificar se já existe uma conversa com este usuário
      const existingChat = this.activeChats.find(chat => chat.userId === contact.id)
      
      if (existingChat) {
        // Abrir conversa existente
        this.selectedChat = contact
        this.markAsRead(existingChat.id)
      } else {
        // Criar nova conversa
        this.createNewConversation(contact)
        this.selectedChat = contact
      }
    },

    createNewConversation(contact) {
      const conversations = JSON.parse(localStorage.getItem('ifwave_conversations') || '[]')
      const chatId = `chat_${this.currentUser.id}_${contact.id}`
      
      const newConversation = {
        id: chatId,
        userId: contact.id,
        name: contact.name,
        avatar: contact.avatar,
        course: contact.course,
        campus: contact.campus,
        lastMessage: '',
        lastMessageTime: '',
        timestamp: Date.now(),
        unread: false,
        unreadCount: 0,
        online: contact.online || false
      }
      
      conversations.unshift(newConversation) // Adicionar no início
      localStorage.setItem('ifwave_conversations', JSON.stringify(conversations))
      this.loadActiveConversations()
    },

    markAsRead(chatId) {
      const conversations = JSON.parse(localStorage.getItem('ifwave_conversations') || '[]')
      const conv = conversations.find(c => c.id === chatId)
      if (conv) {
        conv.unread = false
        conv.unreadCount = 0
        localStorage.setItem('ifwave_conversations', JSON.stringify(conversations))
        this.loadActiveConversations()
      }
    },

    handleUserBlocked() {
      // Remover usuário da lista e fechar chat
      this.selectedChat = null
      this.loadActiveConversations()
      this.loadRegisteredUsers()
    },

    handleUserStatusChange(data) {
      // Atualizar status online do usuário
      const user = this.availableUsers.find(u => u.id === data.userId)
      if (user) {
        user.online = data.online
      }
      
      const chat = this.activeChats.find(c => c.userId === data.userId)
      if (chat) {
        chat.online = data.online
      }
    },

    viewProfile(user) {
      // Emitir evento para o componente pai navegar para o perfil
      this.$emit('view-profile', user)
    },

    backToMessages() {
      this.selectedChat = null
      // Recarregar conversas para mostrar atualizações
      this.loadActiveConversations()
    },

    handleMessageSent(data) {
      // Atualizar lista de conversas quando mensagem é enviada
      setTimeout(() => {
        this.loadActiveConversations()
      }, 100)
      
      // Exibir notificação de sucesso (opcional)
      console.log('Mensagem enviada para:', data.recipient.name)
    },

    filterContacts() {
      // Este método é chamado automaticamente pelo computed filteredContacts
      // Mas pode ser usado para ações adicionais quando o usuário digita
    },
  },
  
  watch: {
    // Atualizar conversas quando houver mudanças
    '$route'() {
      this.loadActiveConversations()
    }
  }
}
</script>

<style scoped>
.messages-container {
  background: var(--background);
  color: var(--foreground);
  min-height: 100vh;
  font-family: 'Roboto', 'Open Sans', Arial, sans-serif;
}

/* Header */
.messages-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--card);
}

.messages-title {
  font-size: 1.5em;
  font-weight: bold;
  color: var(--primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--primary);
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--background);
  transform: scale(1.1);
}

/* Barra de pesquisa */
.search-bar {
  padding: 16px 20px;
  background: var(--card);
  border-bottom: 1px solid var(--border);
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--foreground);
  opacity: 0.6;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid var(--border);
  border-radius: 24px;
  background: var(--background);
  color: var(--foreground);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: var(--primary);
}

/* Seções */
.section-title {
  font-size: 1.1em;
  font-weight: 600;
  color: var(--primary);
  margin: 20px 20px 12px 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--verde-energia);
}

/* Lista de conversas */
.chat-list, .group-list, .teacher-list, .user-list {
  padding: 0 8px;
}

.chat-item, .group-item, .teacher-item, .user-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin: 4px 0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--card);
}

.chat-item:hover, .group-item:hover, .teacher-item:hover, .user-item:hover {
  background: var(--background);
  transform: translateX(4px);
}

.chat-item.unread {
  background: linear-gradient(90deg, var(--card) 0%, rgba(46, 204, 113, 0.1) 100%);
  border-left: 3px solid var(--verde-energia);
}

/* Avatares */
.chat-avatar, .teacher-avatar, .user-avatar {
  position: relative;
  margin-right: 16px;
}

.chat-avatar img, .teacher-avatar img, .user-avatar img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border);
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: var(--verde-energia);
  border: 2px solid var(--card);
  border-radius: 50%;
}

.group-avatar {
  position: relative;
  margin-right: 16px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.group-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--azul-ifmt), var(--roxo-inovador));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.group-notification {
  position: absolute;
  top: 0;
  right: 0;
  width: 12px;
  height: 12px;
  background: var(--amarelo-alegria);
  border: 2px solid var(--card);
  border-radius: 50%;
}

.teacher-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border: 2px solid var(--card);
  border-radius: 50%;
}

.teacher-status.available {
  background: var(--verde-energia);
}

.teacher-status.busy {
  background: #e74c3c;
}

.teacher-status.away {
  background: var(--amarelo-alegria);
}

/* Informações */
.chat-info, .group-info, .teacher-info, .user-info {
  flex: 1;
  min-width: 0;
}

.chat-header, .group-header, .teacher-header, .user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.chat-name, .group-name, .teacher-name, .user-name {
  font-weight: 600;
  color: var(--foreground);
  font-size: 15px;
}

.chat-course, .group-members, .teacher-department, .user-course {
  font-size: 12px;
  color: var(--primary);
  font-weight: 500;
}

.chat-time, .last-activity, .office-hours {
  font-size: 12px;
  color: var(--foreground);
  opacity: 0.7;
}

.chat-preview, .group-preview, .teacher-details, .user-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.last-message, .group-subject, .teacher-subject, .user-campus {
  font-size: 14px;
  color: var(--foreground);
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.unread-badge {
  background: var(--verde-energia);
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

/* Estado vazio */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--foreground);
}

.empty-icon {
  color: var(--primary);
  opacity: 0.5;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 1.3em;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--primary);
}

.empty-description {
  font-size: 14px;
  opacity: 0.7;
  margin-bottom: 30px;
  line-height: 1.5;
}

.start-chat-btn {
  background: linear-gradient(135deg, var(--azul-ifmt), var(--verde-energia));
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.start-chat-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 61, 124, 0.3);
}

/* Modal de nova mensagem */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.new-message-modal {
  background: var(--card);
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: var(--primary);
  font-size: 1.2em;
}

.close-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--foreground);
  border-radius: 50%;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: var(--background);
}

.modal-content {
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.contact-search {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: 24px;
  background: var(--background);
  color: var(--foreground);
  font-size: 14px;
  outline: none;
  margin-bottom: 20px;
}

.contact-search:focus {
  border-color: var(--primary);
}

.contact-suggestions {
  margin-top: 8px;
}

.contact-suggestions h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--foreground);
  font-size: 0.9em;
  margin-bottom: 12px;
  padding: 0 4px;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.suggestion-item:hover {
  background: var(--background-hover);
  border-color: var(--primary-light);
  transform: translateY(-1px);
}

.suggestion-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
  border: 2px solid var(--border);
}

.suggestion-info {
  display: flex;
  flex-direction: column;
}

.suggestion-name {
  font-weight: 600;
  color: var(--foreground);
  font-size: 14px;
}

.suggestion-detail {
  font-size: 12px;
  color: var(--primary);
  opacity: 0.8;
}

.suggestion-campus {
  font-size: 11px;
  color: var(--foreground);
  opacity: 0.6;
}

.suggestion-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.start-chat-btn-small {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.start-chat-btn-small:hover {
  background: var(--primary-dark);
  transform: scale(1.1);
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: var(--foreground-muted);
}

.no-results-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-results p {
  margin-bottom: 4px;
  color: var(--foreground);
}

.no-results small {
  color: var(--foreground-muted);
  font-size: 0.8em;
}

/* Estado de boas-vindas */
.welcome-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--foreground-muted);
}

.welcome-state .welcome-icon {
  margin-bottom: 16px;
  color: var(--primary);
}

.welcome-state h3 {
  color: var(--foreground);
  margin-bottom: 8px;
  font-size: 1.2em;
}

.welcome-state p {
  color: var(--foreground-muted);
  font-size: 0.9em;
  line-height: 1.5;
}

/* Responsividade */
@media (max-width: 500px) {
  .messages-header {
    padding: 12px 16px;
  }
  
  .search-bar {
    padding: 12px 16px;
  }
  
  .section-title {
    margin: 16px 16px 8px 16px;
    font-size: 1em;
  }
  
  .chat-item, .group-item, .teacher-item {
    padding: 10px 12px;
  }
  
  .chat-avatar img, .teacher-avatar img {
    width: 42px;
    height: 42px;
  }
  
  .group-icon {
    width: 42px;
    height: 42px;
  }
}
</style>