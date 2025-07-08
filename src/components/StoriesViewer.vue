<template>
  <div class="stories-viewer" v-if="visible">
    <div class="stories-overlay" @click="closeStories">
      <div class="stories-container" @click.stop>
        <!-- Header com informações do usuário -->
        <div class="story-header">
          <div class="user-info">
            <img :src="currentStory.user.avatar" :alt="currentStory.user.name" class="user-avatar">
            <div class="user-details">
              <h3>{{ currentStory.user.name }}</h3>
              <span class="story-time">{{ formatTime(currentStory.timestamp) }}</span>
            </div>
          </div>
          <button @click="closeStories" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <!-- Barra de progresso -->
        <div class="progress-container">
          <div 
            v-for="(story, index) in userStories" 
            :key="index"
            class="progress-bar"
            :class="{ 
              'completed': index < currentStoryIndex,
              'active': index === currentStoryIndex,
              'pending': index > currentStoryIndex
            }"
          >
            <div 
              class="progress-fill" 
              :style="{ width: getProgressWidth(index) + '%' }"
            ></div>
          </div>
        </div>

        <!-- Conteúdo do story -->
        <div class="story-content">
          <img 
            v-if="currentStory.type === 'image'"
            :src="currentStory.content" 
            :alt="'Story de ' + currentStory.user.name"
            class="story-media"
          >
          <video 
            v-else-if="currentStory.type === 'video'"
            :src="currentStory.content"
            class="story-media"
            autoplay
            muted
            @ended="nextStory"
          ></video>
          
          <!-- Texto sobreposto se houver -->
          <div v-if="currentStory.text" class="story-text">
            {{ currentStory.text }}
          </div>
        </div>

        <!-- Controles de navegação -->
        <div class="story-controls">
          <button 
            @click="previousStory" 
            class="nav-btn prev-btn"
            :disabled="currentStoryIndex === 0"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
          
          <button 
            @click="nextStory" 
            class="nav-btn next-btn"
            :disabled="currentStoryIndex === userStories.length - 1"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>
        </div>

        <!-- Área de interação -->
        <div class="story-interaction">
          <div class="story-actions">
            <button @click="likeStory" class="action-btn like-btn" :class="{ liked: currentStory.liked }">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              {{ currentStory.likes || 0 }}
            </button>
            
            <button @click="shareStory" class="action-btn share-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
              </svg>
            </button>
          </div>

          <!-- Input para responder ao story -->
          <div class="story-reply">
            <input 
              v-model="replyText"
              @keyup.enter="sendReply"
              placeholder="Responder ao story..."
              class="reply-input"
            >
            <button @click="sendReply" class="send-btn" :disabled="!replyText.trim()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Lista de visualizadores (apenas para stories próprios) -->
        <div v-if="isOwnStory && showViewers" class="story-viewers">
          <h4>Visualizado por {{ currentStory.viewers?.length || 0 }} pessoas</h4>
          <div class="viewers-list">
            <div 
              v-for="viewer in currentStory.viewers" 
              :key="viewer.id"
              class="viewer-item"
            >
              <img :src="viewer.avatar" :alt="viewer.name" class="viewer-avatar">
              <span>{{ viewer.name }}</span>
              <span class="viewed-time">{{ formatTime(viewer.viewedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StoriesViewer',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    stories: {
      type: Array,
      default: () => []
    },
    initialStoryIndex: {
      type: Number,
      default: 0
    },
    currentUser: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      currentStoryIndex: 0,
      progress: 0,
      timer: null,
      replyText: '',
      showViewers: false,
      storyDuration: 5000, // 5 segundos por story
    }
  },
  computed: {
    userStories() {
      return this.stories || []
    },
    currentStory() {
      return this.userStories[this.currentStoryIndex] || {}
    },
    isOwnStory() {
      return this.currentStory.user?.id === this.currentUser.id
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.startStoryTimer()
        this.markAsViewed()
      } else {
        this.stopStoryTimer()
      }
    },
    currentStoryIndex() {
      this.progress = 0
      this.markAsViewed()
      if (this.visible) {
        this.startStoryTimer()
      }
    }
  },
  mounted() {
    this.currentStoryIndex = this.initialStoryIndex
    if (this.visible) {
      this.startStoryTimer()
      this.markAsViewed()
    }
  },
  beforeUnmount() {
    this.stopStoryTimer()
  },
  methods: {
    startStoryTimer() {
      this.stopStoryTimer()
      
      // Timer para progresso visual
      this.timer = setInterval(() => {
        this.progress += (100 / this.storyDuration) * 100
        
        if (this.progress >= 100) {
          this.nextStory()
        }
      }, 100)
    },
    
    stopStoryTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    
    nextStory() {
      if (this.currentStoryIndex < this.userStories.length - 1) {
        this.currentStoryIndex++
        this.progress = 0
      } else {
        this.closeStories()
      }
    },
    
    previousStory() {
      if (this.currentStoryIndex > 0) {
        this.currentStoryIndex--
        this.progress = 0
      }
    },
    
    closeStories() {
      this.stopStoryTimer()
      this.$emit('close')
    },
    
    getProgressWidth(index) {
      if (index < this.currentStoryIndex) return 100
      if (index === this.currentStoryIndex) return this.progress
      return 0
    },
    
    likeStory() {
      this.$emit('like-story', {
        storyId: this.currentStory.id,
        userId: this.currentUser.id
      })
      
      // Toggle like localmente
      if (this.currentStory.liked) {
        this.currentStory.likes = (this.currentStory.likes || 1) - 1
      } else {
        this.currentStory.likes = (this.currentStory.likes || 0) + 1
      }
      this.currentStory.liked = !this.currentStory.liked
    },
    
    shareStory() {
      this.$emit('share-story', {
        storyId: this.currentStory.id,
        userId: this.currentUser.id
      })
      
      // Implementar compartilhamento
      if (navigator.share) {
        navigator.share({
          title: `Story de ${this.currentStory.user.name}`,
          url: window.location.href
        })
      }
    },
    
    sendReply() {
      if (!this.replyText.trim()) return
      
      this.$emit('reply-story', {
        storyId: this.currentStory.id,
        userId: this.currentUser.id,
        message: this.replyText.trim()
      })
      
      this.replyText = ''
      
      // Feedback visual
      this.$emit('show-message', 'Resposta enviada!')
    },
    
    markAsViewed() {
      if (this.currentStory.id && !this.isOwnStory) {
        this.$emit('view-story', {
          storyId: this.currentStory.id,
          userId: this.currentUser.id
        })
      }
    },
    
    formatTime(timestamp) {
      const now = new Date()
      const storyTime = new Date(timestamp)
      const diff = now - storyTime
      
      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(diff / (1000 * 60 * 60))
      
      if (minutes < 60) {
        return `${minutes}min`
      } else if (hours < 24) {
        return `${hours}h`
      } else {
        return `${Math.floor(hours / 24)}d`
      }
    }
  }
}
</script>

<style scoped>
.stories-viewer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.9);
}

.stories-overlay {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.stories-container {
  max-width: 400px;
  width: 100%;
  height: 90vh;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.story-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details h3 {
  margin: 0;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.story-time {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.progress-container {
  display: flex;
  gap: 2px;
  padding: 8px 15px;
  position: absolute;
  top: 50px;
  left: 0;
  right: 0;
  z-index: 10;
}

.progress-bar {
  flex: 1;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 1px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: white;
  transition: width 0.1s linear;
}

.progress-bar.completed .progress-fill {
  width: 100% !important;
}

.story-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: #000;
}

.story-media {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 0;
}

.story-text {
  position: absolute;
  bottom: 120px;
  left: 15px;
  right: 15px;
  color: white;
  font-size: 16px;
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  padding: 10px;
  border-radius: 8px;
}

.story-controls {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  pointer-events: none;
}

.nav-btn {
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  pointer-events: auto;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.story-interaction {
  background: linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%);
  padding: 15px;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.story-actions {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.action-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  transition: color 0.2s;
}

.action-btn:hover {
  color: #ff6b6b;
}

.like-btn.liked {
  color: #ff6b6b;
}

.story-reply {
  display: flex;
  gap: 10px;
  align-items: center;
}

.reply-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 8px 15px;
  color: white;
  font-size: 14px;
}

.reply-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.reply-input:focus {
  outline: none;
  border-color: #667eea;
}

.send-btn {
  background: #667eea;
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #5a6fd8;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.story-viewers {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px 12px 0 0;
  padding: 20px;
  max-height: 50%;
  overflow-y: auto;
}

.viewers-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.viewer-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.viewer-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.viewed-time {
  margin-left: auto;
  color: #666;
  font-size: 12px;
}

/* Responsividade Avançada */
@media (max-width: 1024px) {
  .stories-container {
    max-width: 90%;
    max-height: 90%;
  }
}

@media (max-width: 768px) {
  .stories-overlay {
    padding: 0;
  }
  
  .stories-container {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    max-width: none;
    max-height: none;
  }
  
  .story-header {
    padding: 12px 16px;
    backdrop-filter: blur(10px);
    background: rgba(0, 0, 0, 0.3);
  }
  
  .user-info {
    gap: 10px;
  }
  
  .story-avatar {
    width: 36px;
    height: 36px;
  }
  
  .user-details h4 {
    font-size: 14px;
  }
  
  .story-time {
    font-size: 12px;
  }
  
  .close-stories {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
  
  .story-content {
    height: calc(100vh - 140px);
  }
  
  .story-image,
  .story-video {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
  
  .story-text-overlay {
    padding: 20px;
    font-size: 16px;
  }
  
  .story-controls {
    padding: 16px;
    gap: 12px;
  }
  
  .nav-btn {
    width: 44px;
    height: 44px;
    font-size: 20px;
  }
  
  .story-input {
    font-size: 16px; /* Evita zoom no iOS */
    padding: 12px 50px 12px 16px;
  }
  
  .send-reply {
    width: 40px;
    height: 40px;
  }
  
  .progress-bars {
    padding: 0 16px;
    gap: 3px;
  }
  
  .progress-bar {
    height: 3px;
  }
  
  .viewers-overlay {
    border-radius: 16px 16px 0 0;
    padding: 16px;
    max-height: 60%;
  }
  
  .viewers-list {
    gap: 12px;
  }
  
  .viewer-item {
    padding: 8px 0;
  }
  
  .viewer-avatar {
    width: 32px;
    height: 32px;
  }
  
  .viewed-time {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .story-header {
    padding: 10px 12px;
  }
  
  .story-avatar {
    width: 32px;
    height: 32px;
  }
  
  .user-details h4 {
    font-size: 13px;
  }
  
  .story-time {
    font-size: 11px;
  }
  
  .close-stories {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
  
  .story-content {
    height: calc(100vh - 120px);
  }
  
  .story-text-overlay {
    padding: 16px;
    font-size: 14px;
    line-height: 1.4;
  }
  
  .story-controls {
    padding: 12px;
    gap: 8px;
  }
  
  .nav-btn {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
  
  .story-input {
    font-size: 16px;
    padding: 10px 45px 10px 12px;
    border-radius: 20px;
  }
  
  .send-reply {
    width: 36px;
    height: 36px;
    right: 6px;
  }
  
  .progress-bars {
    padding: 0 12px;
    gap: 2px;
  }
  
  .progress-bar {
    height: 2px;
    border-radius: 1px;
  }
  
  .viewers-overlay {
    padding: 12px;
    max-height: 50%;
  }
  
  .viewers-overlay h3 {
    font-size: 16px;
    margin-bottom: 12px;
  }
  
  .viewer-item {
    gap: 8px;
    padding: 6px 0;
  }
  
  .viewer-avatar {
    width: 28px;
    height: 28px;
  }
  
  .viewer-item span {
    font-size: 13px;
  }
  
  .viewed-time {
    font-size: 10px;
  }
}

/* Otimizações para toque */
@media (hover: none) and (pointer: coarse) {
  .nav-btn,
  .close-stories,
  .send-reply {
    min-height: 44px;
    min-width: 44px;
  }
  
  .viewer-item {
    min-height: 44px;
    align-items: center;
  }
}

/* Modo paisagem */
@media (max-width: 768px) and (orientation: landscape) {
  .story-content {
    height: calc(100vh - 100px);
  }
  
  .story-header {
    padding: 8px 16px;
  }
  
  .story-controls {
    padding: 8px 16px;
  }
  
  .viewers-overlay {
    max-height: 70%;
  }
  
  .story-text {
    bottom: 100px;
  }
}
</style>
