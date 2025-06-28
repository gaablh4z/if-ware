<template>
  <div class="notifications-container">
    <!-- Header -->
    <header class="notifications-header">
      <button class="back-btn" @click="$emit('back')" title="Voltar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="header-title">Atividade</h1>
      <div class="header-actions">
        <button class="action-btn" title="Marcar todas como lidas">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- Content -->
    <div class="notifications-content">
      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Notifications List -->
      <div class="notifications-list">
        <!-- Today Section -->
        <div v-if="todayNotifications.length > 0" class="time-section">
          <h3 class="section-title">Hoje</h3>
          <div class="notifications-group">
            <div
              v-for="notification in todayNotifications"
              :key="notification.id"
              :class="['notification-item', { unread: !notification.read }]"
              @click="markAsRead(notification)"
            >
              <div class="notification-avatar">
                <div v-if="notification.type === 'like'" class="action-icon like-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <div v-else-if="notification.type === 'comment'" class="action-icon comment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div v-else-if="notification.type === 'follow'" class="action-icon follow-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div v-else-if="notification.type === 'mention'" class="action-icon mention-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.54 0 3-.32 4.24-.9L16 21l-.45-.08L15.11 20C17.96 18.14 20 15.28 20 12c0-4.41-3.59-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <img v-else :src="notification.avatar || getDefaultAvatar(notification.username)" :alt="notification.username" class="user-avatar">
              </div>
              
              <div class="notification-content">
                <div class="notification-text">
                  <span class="username">{{ notification.username }}</span>
                  <span class="action-text">{{ getActionText(notification) }}</span>
                  <span class="time">{{ getRelativeTime(notification.timestamp) }}</span>
                </div>
                
                <div v-if="notification.preview" class="notification-preview">
                  <img :src="notification.preview" :alt="'Preview'" class="preview-image">
                </div>
              </div>

              <div v-if="notification.type === 'follow'" class="notification-action">
                <button v-if="!notification.following" class="follow-btn" @click.stop="followUser(notification)">
                  Seguir
                </button>
                <button v-else class="following-btn" @click.stop="unfollowUser(notification)">
                  Seguindo
                </button>
              </div>

              <div v-if="!notification.read" class="unread-indicator"></div>
            </div>
          </div>
        </div>

        <!-- This Week Section -->
        <div v-if="thisWeekNotifications.length > 0" class="time-section">
          <h3 class="section-title">Esta semana</h3>
          <div class="notifications-group">
            <div
              v-for="notification in thisWeekNotifications"
              :key="notification.id"
              :class="['notification-item', { unread: !notification.read }]"
              @click="markAsRead(notification)"
            >
              <div class="notification-avatar">
                <div v-if="notification.type === 'like'" class="action-icon like-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <div v-else-if="notification.type === 'comment'" class="action-icon comment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div v-else-if="notification.type === 'follow'" class="action-icon follow-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <img v-else :src="notification.avatar || getDefaultAvatar(notification.username)" :alt="notification.username" class="user-avatar">
              </div>
              
              <div class="notification-content">
                <div class="notification-text">
                  <span class="username">{{ notification.username }}</span>
                  <span class="action-text">{{ getActionText(notification) }}</span>
                  <span class="time">{{ getRelativeTime(notification.timestamp) }}</span>
                </div>
                
                <div v-if="notification.preview" class="notification-preview">
                  <img :src="notification.preview" :alt="'Preview'" class="preview-image">
                </div>
              </div>

              <div v-if="notification.type === 'follow'" class="notification-action">
                <button v-if="!notification.following" class="follow-btn" @click.stop="followUser(notification)">
                  Seguir
                </button>
                <button v-else class="following-btn" @click.stop="unfollowUser(notification)">
                  Seguindo
                </button>
              </div>

              <div v-if="!notification.read" class="unread-indicator"></div>
            </div>
          </div>
        </div>

        <!-- Older Section -->
        <div v-if="olderNotifications.length > 0" class="time-section">
          <h3 class="section-title">Anteriores</h3>
          <div class="notifications-group">
            <div
              v-for="notification in olderNotifications"
              :key="notification.id"
              :class="['notification-item', { unread: !notification.read }]"
              @click="markAsRead(notification)"
            >
              <div class="notification-avatar">
                <img :src="notification.avatar || getDefaultAvatar(notification.username)" :alt="notification.username" class="user-avatar">
              </div>
              
              <div class="notification-content">
                <div class="notification-text">
                  <span class="username">{{ notification.username }}</span>
                  <span class="action-text">{{ getActionText(notification) }}</span>
                  <span class="time">{{ getRelativeTime(notification.timestamp) }}</span>
                </div>
              </div>

              <div v-if="!notification.read" class="unread-indicator"></div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredNotifications.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <h3 class="empty-title">Nenhuma notificação ainda</h3>
          <p class="empty-description">Quando alguém curtir, comentar ou seguir você, aparecerá aqui.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotificationsScreen',
  props: {
    notifications: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      activeTab: 'all',
      tabs: [
        { id: 'all', label: 'Todas' },
        { id: 'likes', label: 'Curtidas' },
        { id: 'comments', label: 'Comentários' },
        { id: 'follows', label: 'Seguidores' }
      ],
      mockNotifications: [
        {
          id: 1,
          type: 'like',
          username: 'ana.silva',
          avatar: null,
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
          read: false,
          preview: 'https://picsum.photos/50/50?random=1'
        },
        {
          id: 2,
          type: 'comment',
          username: 'pedro.costa',
          avatar: null,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
          read: false,
          comment: 'Muito legal esse projeto!',
          preview: 'https://picsum.photos/50/50?random=2'
        },
        {
          id: 3,
          type: 'follow',
          username: 'maria.santos',
          avatar: null,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4h ago
          read: true,
          following: false
        },
        {
          id: 4,
          type: 'mention',
          username: 'joao.oliveira',
          avatar: null,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: true,
          post: 'Novo projeto no GitHub!'
        },
        {
          id: 5,
          type: 'like',
          username: 'carla.lima',
          avatar: null,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          read: true,
          preview: 'https://picsum.photos/50/50?random=3'
        },
        {
          id: 6,
          type: 'comment',
          username: 'rafael.souza',
          avatar: null,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
          read: true,
          comment: 'Parabéns pelo código!',
          preview: 'https://picsum.photos/50/50?random=4'
        }
      ]
    }
  },
  computed: {
    allNotifications() {
      return [...this.mockNotifications, ...this.notifications].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )
    },
    
    filteredNotifications() {
      let filtered = this.allNotifications

      if (this.activeTab !== 'all') {
        const typeMap = {
          'likes': ['like'],
          'comments': ['comment'],
          'follows': ['follow']
        }
        filtered = filtered.filter(n => typeMap[this.activeTab]?.includes(n.type))
      }

      return filtered
    },
    
    todayNotifications() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      return this.filteredNotifications.filter(n => {
        const notifDate = new Date(n.timestamp)
        notifDate.setHours(0, 0, 0, 0)
        return notifDate.getTime() === today.getTime()
      })
    },
    
    thisWeekNotifications() {
      const today = new Date()
      const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
      const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
      
      return this.filteredNotifications.filter(n => {
        const notifDate = new Date(n.timestamp)
        return notifDate >= weekStart && notifDate <= yesterday
      })
    },
    
    olderNotifications() {
      const today = new Date()
      const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
      
      return this.filteredNotifications.filter(n => {
        const notifDate = new Date(n.timestamp)
        return notifDate < weekStart
      })
    }
  },
  methods: {
    getDefaultAvatar(username) {
      // Gera um avatar baseado no nome do usuário
      const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8', 'F7DC6F', 'BB8FCE', '85C1E9']
      const colorIndex = username.length % colors.length
      const initials = username.split('.').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      
      return `https://ui-avatars.com/api/?name=${initials}&background=${colors[colorIndex]}&color=fff&size=44&format=svg`
    },
    
    getActionText(notification) {
      switch (notification.type) {
        case 'like':
          return 'curtiu sua publicação.'
        case 'comment':
          return `comentou: "${notification.comment || 'Comentário interessante!'}"`
        case 'follow':
          return 'começou a seguir você.'
        case 'mention':
          return `mencionou você em: "${notification.post || 'uma publicação'}"`
        default:
          return 'interagiu com você.'
      }
    },
    
    getRelativeTime(timestamp) {
      const now = new Date()
      const time = new Date(timestamp)
      const diffInSeconds = Math.floor((now - time) / 1000)
      
      if (diffInSeconds < 60) {
        return 'agora'
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        return `${minutes}min`
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `${hours}h`
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400)
        return `${days}d`
      } else {
        const weeks = Math.floor(diffInSeconds / 604800)
        return `${weeks}sem`
      }
    },
    
    markAsRead(notification) {
      notification.read = true
      // Aqui você pode fazer uma chamada para a API para marcar como lida
      this.$emit('notification-read', notification)
    },
    
    followUser(notification) {
      notification.following = true
      // Aqui você pode fazer uma chamada para a API para seguir o usuário
      this.$emit('follow-user', notification.username)
    },
    
    unfollowUser(notification) {
      notification.following = false
      // Aqui você pode fazer uma chamada para a API para deixar de seguir
      this.$emit('unfollow-user', notification.username)
    }
  }
}
</script>

<style scoped>
.notifications-container {
  min-height: 100vh;
  background: #ffffff;
  color: #262626;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* Header */
.notifications-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 60px;
  background: #ffffff;
  border-bottom: 1px solid #dbdbdb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #262626;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: #f5f5f5;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #262626;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #f5f5f5;
}

/* Content */
.notifications-content {
  padding-bottom: 80px;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  background: #ffffff;
  border-bottom: 1px solid #dbdbdb;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  background: none;
  border: none;
  padding: 16px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #8e8e8e;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
  min-width: max-content;
}

.tab-btn.active {
  color: #262626;
  border-bottom-color: #262626;
}

.tab-btn:hover {
  color: #262626;
}

/* Notifications List */
.notifications-list {
  background: #ffffff;
}

.time-section {
  margin-bottom: 24px;
}

.section-title {
  padding: 16px 16px 8px 16px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.notifications-group {
  background: #ffffff;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #efefef;
}

.notification-item:hover {
  background-color: #fafafa;
}

.notification-item.unread {
  background-color: #f8f9fa;
}

.notification-item:last-child {
  border-bottom: none;
}

/* Avatar */
.notification-avatar {
  width: 44px;
  height: 44px;
  margin-right: 12px;
  position: relative;
  flex-shrink: 0;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #dbdbdb;
}

.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.like-icon {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
}

.comment-icon {
  background: linear-gradient(45deg, #0095f6, #005bb5);
  color: white;
}

.follow-icon {
  background: linear-gradient(45deg, #833ab4, #6a1b9a);
  color: white;
}

.mention-icon {
  background: linear-gradient(45deg, #f39c12, #e67e22);
  color: white;
}

/* Content */
.notification-content {
  flex: 1;
  min-width: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.notification-text {
  flex: 1;
  min-width: 0;
}

.username {
  font-weight: 600;
  color: #262626;
  margin-right: 4px;
}

.action-text {
  color: #262626;
  font-size: 14px;
  line-height: 18px;
  margin-right: 4px;
}

.time {
  color: #8e8e8e;
  font-size: 12px;
  white-space: nowrap;
  display: block;
  margin-top: 2px;
}

/* Preview */
.notification-preview {
  margin-left: 12px;
  flex-shrink: 0;
}

.preview-image {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #dbdbdb;
}

/* Actions */
.notification-action {
  margin-left: 12px;
  flex-shrink: 0;
}

.follow-btn {
  background: #0095f6;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.follow-btn:hover {
  background: #1877f2;
}

.following-btn {
  background: #ffffff;
  color: #262626;
  border: 1px solid #dbdbdb;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.following-btn:hover {
  background: #f5f5f5;
}

/* Unread Indicator */
.unread-indicator {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: #0095f6;
  border-radius: 50%;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  text-align: center;
  min-height: 50vh;
}

.empty-icon {
  color: #c7c7c7;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 22px;
  font-weight: 300;
  color: #262626;
  margin: 0 0 8px 0;
}

.empty-description {
  font-size: 14px;
  color: #8e8e8e;
  margin: 0;
  line-height: 18px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .notifications-header {
    padding: 0 12px;
    height: 56px;
  }
  
  .header-title {
    font-size: 18px;
  }
  
  .tab-btn {
    padding: 12px 16px;
    font-size: 13px;
  }
  
  .notification-item {
    padding: 10px 12px;
  }
  
  .notification-avatar {
    width: 40px;
    height: 40px;
    margin-right: 10px;
  }
  
  .user-avatar,
  .action-icon {
    width: 40px;
    height: 40px;
  }
  
  .preview-image {
    width: 40px;
    height: 40px;
  }
  
  .section-title {
    padding: 12px 12px 6px 12px;
    font-size: 15px;
  }
  
  .action-text {
    font-size: 13px;
  }
  
  .follow-btn,
  .following-btn {
    padding: 5px 12px;
    font-size: 13px;
  }
}

/* Dark Mode Support (opcional) */
@media (prefers-color-scheme: dark) {
  .notifications-container {
    background: #000000;
    color: #ffffff;
  }
  
  .notifications-header {
    background: #000000;
    border-bottom-color: #262626;
  }
  
  .back-btn,
  .action-btn,
  .header-title {
    color: #ffffff;
  }
  
  .back-btn:hover,
  .action-btn:hover {
    background-color: #1a1a1a;
  }
  
  .filter-tabs {
    background: #000000;
    border-bottom-color: #262626;
  }
  
  .tab-btn {
    color: #a8a8a8;
  }
  
  .tab-btn.active,
  .tab-btn:hover {
    color: #ffffff;
    border-bottom-color: #ffffff;
  }
  
  .notifications-list,
  .notifications-group {
    background: #000000;
  }
  
  .notification-item {
    border-bottom-color: #262626;
  }
  
  .notification-item:hover {
    background-color: #1a1a1a;
  }
  
  .notification-item.unread {
    background-color: #0d1117;
  }
  
  .user-avatar {
    border-color: #262626;
  }
  
  .username,
  .action-text,
  .section-title {
    color: #ffffff;
  }
  
  .time {
    color: #a8a8a8;
  }
  
  .preview-image {
    border-color: #262626;
  }
  
  .following-btn {
    background: #000000;
    color: #ffffff;
    border-color: #262626;
  }
  
  .following-btn:hover {
    background: #1a1a1a;
  }
  
  .empty-icon {
    color: #525252;
  }
  
  .empty-title {
    color: #ffffff;
  }
  
  .empty-description {
    color: #a8a8a8;
  }
}
</style>