<template>
  <div class="stories-ring-container">
    <div class="stories-header">
      <h3>Stories</h3>
      <button @click="openStoriesCreator" class="create-story-btn">
        <span>+</span>
        Criar Story
      </button>
    </div>
    
    <div class="stories-ring" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
      <!-- Meu Story -->
      <div class="story-item my-story" @click="openStoriesCreator">
        <div class="story-avatar-wrapper">
          <div class="story-avatar" :style="{ backgroundImage: `url(${currentUser?.avatar || '/default-avatar.png'})` }">
            <div class="add-story-icon">+</div>
          </div>
        </div>
        <span class="story-username">Seu Story</span>
      </div>

      <!-- Stories dos outros usuários -->
      <div 
        v-for="story in storiesWithUsers" 
        :key="story.id"
        class="story-item"
        @click="openStory(story)"
      >
        <div class="story-avatar-wrapper" :class="{ viewed: story.viewed, new: !story.viewed }">
          <div 
            class="story-avatar" 
            :style="{ backgroundImage: `url(${story.user?.avatar || '/default-avatar.png'})` }"
          ></div>
          <div v-if="!story.viewed" class="new-indicator"></div>
        </div>
        <span class="story-username">{{ story.user?.username || 'Usuário' }}</span>
      </div>
    </div>

    <!-- Modal do Stories Creator -->
    <div v-if="showStoriesCreator" class="modal-overlay" @click="closeStoriesCreator">
      <div class="modal-content" @click.stop>
        <StoriesCreator @close="closeStoriesCreator" @story-created="onStoryCreated" />
      </div>
    </div>

    <!-- Modal do Stories Viewer -->
    <div v-if="showStoriesViewer" class="modal-overlay" @click="closeStoriesViewer">
      <div class="modal-content stories-viewer-modal" @click.stop>
        <StoriesViewer 
          :stories="currentStoryGroup" 
          :current-index="currentStoryIndex"
          @close="closeStoriesViewer" 
          @finished="closeStoriesViewer"
        />
      </div>
    </div>
  </div>
</template>

<script>
import StoriesCreator from './StoriesCreator.vue'
import StoriesViewer from './StoriesViewer.vue'

export default {
  name: 'StoriesRing',
  components: {
    StoriesCreator,
    StoriesViewer
  },
  props: {
    currentUser: {
      type: Object,
      default: () => ({ username: 'você', avatar: null })
    }
  },
  data() {
    return {
      showStoriesCreator: false,
      showStoriesViewer: false,
      currentStoryGroup: [],
      currentStoryIndex: 0,
      touchStartX: 0,
      touchEndX: 0,
      stories: [
        {
          id: 1,
          userId: 2,
          content: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=500&fit=crop',
            text: 'Bom dia! ☀️'
          },
          timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 horas atrás
          expiresAt: Date.now() + 22 * 60 * 60 * 1000, // Expira em 22 horas
          viewed: false,
          likes: 15,
          views: 47
        },
        {
          id: 2,
          userId: 3,
          content: {
            type: 'text',
            text: 'Trabalhando no novo projeto! 💪',
            backgroundColor: '#ff6b6b'
          },
          timestamp: Date.now() - 4 * 60 * 60 * 1000, // 4 horas atrás
          expiresAt: Date.now() + 20 * 60 * 60 * 1000,
          viewed: true,
          likes: 8,
          views: 23
        },
        {
          id: 3,
          userId: 4,
          content: {
            type: 'video',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_1mb.mp4',
            text: 'Passeio na praia 🏖️'
          },
          timestamp: Date.now() - 6 * 60 * 60 * 1000,
          expiresAt: Date.now() + 18 * 60 * 60 * 1000,
          viewed: false,
          likes: 32,
          views: 89
        }
      ],
      users: [
        { id: 2, username: 'maria_silva', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face' },
        { id: 3, username: 'joao_dev', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
        { id: 4, username: 'ana_costa', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' }
      ]
    }
  },
  computed: {
    activeStories() {
      return this.stories.filter(story => story.expiresAt > Date.now())
    },
    storiesWithUsers() {
      return this.activeStories.map(story => ({
        ...story,
        user: this.users.find(user => user.id === story.userId)
      }))
    }
  },
  methods: {
    openStoriesCreator() {
      this.showStoriesCreator = true
    },
    closeStoriesCreator() {
      this.showStoriesCreator = false
    },
    openStory(story) {
      // Agrupa stories do mesmo usuário
      const userStories = this.storiesWithUsers.filter(s => s.userId === story.userId)
      this.currentStoryGroup = userStories
      this.currentStoryIndex = userStories.findIndex(s => s.id === story.id)
      this.showStoriesViewer = true
      
      // Marca como visualizada
      story.viewed = true
      this.saveStoriesToStorage()
    },
    closeStoriesViewer() {
      this.showStoriesViewer = false
      this.currentStoryGroup = []
      this.currentStoryIndex = 0
    },
    onStoryCreated(newStory) {
      // Adiciona nova story à lista
      const storyWithId = {
        ...newStory,
        id: Date.now(),
        userId: this.currentUser.id || 1,
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
        viewed: false,
        likes: 0,
        views: 0
      }
      this.stories.unshift(storyWithId)
      this.saveStoriesToStorage()
      this.closeStoriesCreator()
    },
    saveStoriesToStorage() {
      localStorage.setItem('if_wave_stories', JSON.stringify(this.stories))
    },
    loadStoriesFromStorage() {
      const saved = localStorage.getItem('if_wave_stories')
      if (saved) {
        this.stories = JSON.parse(saved)
      }
    },
    onTouchStart(e) {
      this.touchStartX = e.touches[0].clientX
    },
    onTouchMove(e) {
      this.touchEndX = e.touches[0].clientX
    },
    onTouchEnd() {
      const diff = this.touchStartX - this.touchEndX
      const threshold = 50
      
      if (Math.abs(diff) > threshold) {
        const storiesContainer = this.$el.querySelector('.stories-ring')
        if (diff > 0) {
          // Swipe left - scroll right
          storiesContainer.scrollLeft += 200
        } else {
          // Swipe right - scroll left
          storiesContainer.scrollLeft -= 200
        }
      }
    }
  },
  mounted() {
    this.loadStoriesFromStorage()
    
    // Remove stories expiradas a cada minuto
    setInterval(() => {
      const now = Date.now()
      this.stories = this.stories.filter(story => story.expiresAt > now)
      this.saveStoriesToStorage()
    }, 60000)
  }
}
</script>

<style scoped>
.stories-ring-container {
  background: white;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.stories-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.stories-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.create-story-btn {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
}

.create-story-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.create-story-btn span {
  font-size: 16px;
  font-weight: bold;
}

.stories-ring {
  display: flex;
  padding: 15px 20px;
  gap: 15px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
}

.stories-ring::-webkit-scrollbar {
  display: none;
}

.story-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
  gap: 8px;
  transition: transform 0.2s ease;
}

.story-item:hover {
  transform: scale(1.05);
}

.story-avatar-wrapper {
  position: relative;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  transition: all 0.3s ease;
}

.story-avatar-wrapper.viewed {
  background: #ddd;
}

.story-avatar-wrapper.new {
  background: linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcf7f, #4ecdc4, #45b7d1);
  background-size: 300% 300%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.story-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-color: #f0f0f0;
  border: 3px solid white;
  position: relative;
  overflow: hidden;
}

.my-story .story-avatar {
  background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-story-icon {
  color: white;
  font-size: 24px;
  font-weight: bold;
}

.new-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: #ff4757;
  border: 2px solid white;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.story-username {
  font-size: 12px;
  color: #333;
  font-weight: 500;
  text-align: center;
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  animation: modalSlideUp 0.3s ease;
}

.stories-viewer-modal {
  background: black;
  max-width: 400px;
  border-radius: 20px;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsivo */
@media (max-width: 768px) {
  .stories-header {
    padding: 12px 15px;
  }
  
  .stories-ring {
    padding: 12px 15px;
  }
  
  .story-avatar-wrapper {
    width: 60px;
    height: 60px;
  }
  
  .story-username {
    font-size: 11px;
    max-width: 60px;
  }
  
  .modal-content {
    width: 95%;
    margin: 10px;
  }
}

@media (max-width: 480px) {
  .create-story-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .create-story-btn span {
    font-size: 14px;
  }
  
  .stories-header h3 {
    font-size: 16px;
  }
}
</style>
