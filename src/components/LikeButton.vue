<template>
  <div class="like-button-container">
    <!-- Botão de Like Simples -->
    <button 
      v-if="!showReactions"
      @click="handleLike"
      :class="[
        'like-button',
        { 'liked': isLiked, 'animated': isAnimating }
      ]"
      :disabled="isLoading"
    >
      <i class="like-icon" :class="likeIcon"></i>
      <span v-if="showCount && totalLikes > 0" class="like-count">
        {{ formatCount(totalLikes) }}
      </span>
    </button>

    <!-- Sistema de Reações Múltiplas -->
    <div v-else class="reactions-container">
      <!-- Botão principal com reação atual -->
      <button 
        @click="toggleReactionPanel"
        :class="[
          'reaction-button',
          { 'has-reaction': currentReaction }
        ]"
      >
        <i 
          v-if="currentReaction" 
          :class="getReactionIcon(currentReaction)"
          class="reaction-icon"
        ></i>
        <i v-else class="fas fa-heart reaction-icon"></i>
        <span v-if="showCount && totalReactions > 0" class="reaction-count">
          {{ formatCount(totalReactions) }}
        </span>
      </button>

      <!-- Painel de reações -->
      <transition name="reactions-slide">
        <div v-if="showReactionPanel" class="reactions-panel">
          <button
            v-for="reaction in availableReactions"
            :key="reaction.type"
            @click="selectReaction(reaction.type)"
            :class="[
              'reaction-option',
              { 'selected': currentReaction === reaction.type }
            ]"
            :title="reaction.label"
          >
            <i :class="reaction.icon"></i>
          </button>
        </div>
      </transition>
    </div>

    <!-- Tooltip com informações dos likes -->
    <div 
      v-if="showTooltip && (isHovered || showReactionPanel)" 
      class="like-tooltip"
    >
      <div v-if="!showReactions && totalLikes > 0">
        <strong>{{ formatCount(totalLikes) }}</strong> 
        {{ totalLikes === 1 ? 'curtida' : 'curtidas' }}
      </div>
      <div v-else-if="showReactions">
        <div 
          v-for="stat in filteredReactionStats" 
          :key="stat.type"
          class="reaction-stat"
        >
          <i :class="getReactionIcon(stat.type)"></i>
          <span>{{ formatCount(stat.count) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import likeService from '@/services/likeService';

export default {
  name: 'LikeButton',
  props: {
    postId: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      default: () => localStorage.getItem('currentUserId') || 'user1'
    },
    showCount: {
      type: Boolean,
      default: true
    },
    showReactions: {
      type: Boolean,
      default: false
    },
    showTooltip: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: 'medium', // small, medium, large
      validator: value => ['small', 'medium', 'large'].includes(value)
    }
  },
  data() {
    return {
      isLiked: false,
      totalLikes: 0,
      currentReaction: null,
      reactionStats: {},
      totalReactions: 0,
      isLoading: false,
      isAnimating: false,
      isHovered: false,
      showReactionPanel: false,
      availableReactions: [
        { type: 'like', icon: 'fas fa-heart', label: 'Curtir', color: '#e91e63' },
        { type: 'love', icon: 'fas fa-heart', label: 'Amei', color: '#ff5722' },
        { type: 'laugh', icon: 'fas fa-laugh', label: 'Haha', color: '#ffc107' },
        { type: 'wow', icon: 'fas fa-surprise', label: 'Uau', color: '#ff9800' },
        { type: 'sad', icon: 'fas fa-sad-tear', label: 'Triste', color: '#2196f3' },
        { type: 'angry', icon: 'fas fa-angry', label: 'Grr', color: '#f44336' }
      ]
    };
  },
    computed: {
    likeIcon() {
      if (this.isLiked) {
        return 'fas fa-heart liked';
      }
      return 'far fa-heart';
    },
    
    // Filtra reações que têm contagem > 0
    filteredReactionStats() {
      return Object.entries(this.reactionStats)
        .filter(([, count]) => count > 0)
        .map(([type, count]) => ({ type, count }));
    }
  },
  mounted() {
    this.loadLikeStatus();
    this.listenToLikeUpdates();
  },
  beforeUnmount() {
    this.removeLikeListeners();
  },
  methods: {
    // Carrega status atual de likes
    loadLikeStatus() {
      if (this.showReactions) {
        this.loadReactionStatus();
      } else {
        this.isLiked = likeService.isLiked(this.postId, this.userId);
        this.totalLikes = likeService.getLikes(this.postId);
      }
    },

    // Carrega status de reações
    loadReactionStatus() {
      this.reactionStats = likeService.getReactionStats(this.postId);
      this.totalReactions = Object.values(this.reactionStats).reduce((sum, count) => sum + count, 0);
      
      // Verifica se usuário tem reação atual
      const userReactionKey = `${this.userId}_${this.postId}_reaction`;
      const userReaction = likeService.userLikes[userReactionKey];
      this.currentReaction = userReaction ? userReaction.type : null;
    },

    // Manipula clique no like simples
    handleLike() {
      if (this.isLoading) return;

      this.isLoading = true;
      this.isAnimating = true;

      try {
        const result = likeService.toggleLike(this.postId, this.userId);
        
        if (result) {
          this.isLiked = result.liked;
          this.totalLikes = result.totalLikes;
          
          // Animação de feedback
          if (result.liked) {
            this.showLikeAnimation();
          }
        }
      } catch (error) {
        console.error('Erro ao curtir post:', error);
      } finally {
        this.isLoading = false;
        setTimeout(() => {
          this.isAnimating = false;
        }, 300);
      }
    },

    // Manipula reações múltiplas
    selectReaction(reactionType) {
      if (this.isLoading) return;

      this.isLoading = true;

      try {
        const result = likeService.toggleReaction(this.postId, this.userId, reactionType);
        
        if (result) {
          this.currentReaction = reactionType;
          this.reactionStats = result.allReactions;
          this.totalReactions = Object.values(this.reactionStats).reduce((sum, count) => sum + count, 0);
          this.showReactionPanel = false;
          
          this.showReactionAnimation(reactionType);
        }
      } catch (error) {
        console.error('Erro ao reagir ao post:', error);
      } finally {
        this.isLoading = false;
      }
    },

    // Toggle do painel de reações
    toggleReactionPanel() {
      this.showReactionPanel = !this.showReactionPanel;
    },

    // Obtém ícone da reação
    getReactionIcon(type) {
      const reaction = this.availableReactions.find(r => r.type === type);
      return reaction ? reaction.icon : 'fas fa-heart';
    },

    // Formata contagem
    formatCount(count) {
      if (count < 1000) return count.toString();
      if (count < 1000000) return (count / 1000).toFixed(1) + 'k';
      return (count / 1000000).toFixed(1) + 'M';
    },

    // Animação de like
    showLikeAnimation() {
      // Cria coração flutuante
      const heart = document.createElement('div');
      heart.innerHTML = '❤️';
      heart.className = 'floating-heart';
      this.$el.appendChild(heart);
      
      setTimeout(() => {
        if (heart.parentNode) {
          heart.parentNode.removeChild(heart);
        }
      }, 1000);
    },

    // Animação de reação
    showReactionAnimation(reactionType) {
      const reaction = this.availableReactions.find(r => r.type === reactionType);
      if (!reaction) return;

      const emoji = this.getReactionEmoji(reactionType);
      const element = document.createElement('div');
      element.innerHTML = emoji;
      element.className = 'floating-reaction';
      this.$el.appendChild(element);
      
      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }, 1000);
    },

    // Obtém emoji da reação
    getReactionEmoji(type) {
      const emojis = {
        like: '❤️',
        love: '😍',
        laugh: '😂',
        wow: '😮',
        sad: '😢',
        angry: '😠'
      };
      return emojis[type] || '❤️';
    },

    // Escuta atualizações de likes
    listenToLikeUpdates() {
      window.addEventListener('likeUpdate', this.handleLikeUpdate);
    },

    // Remove listeners
    removeLikeListeners() {
      window.removeEventListener('likeUpdate', this.handleLikeUpdate);
    },

    // Manipula atualizações externas de likes
    handleLikeUpdate(event) {
      const { postId, totalLikes } = event.detail;
      
      if (postId === this.postId) {
        if (!this.showReactions) {
          this.totalLikes = totalLikes;
          // Não atualiza isLiked pois pode ser de outro usuário
        } else {
          this.loadReactionStatus();
        }
      }
    }
  }
};
</script>

<style scoped>
.like-button-container {
  position: relative;
  display: inline-block;
}

/* Botão de like simples */
.like-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  color: #666;
}

.like-button:hover {
  background-color: #f5f5f5;
  border-color: #ccc;
}

.like-button.liked {
  color: #e91e63;
  border-color: #e91e63;
  background-color: rgba(233, 30, 99, 0.1);
}

.like-button.liked .like-icon {
  color: #e91e63;
  animation: heartBeat 0.6s ease-in-out;
}

.like-button.animated {
  animation: likeButton 0.3s ease-in-out;
}

/* Sistema de reações */
.reactions-container {
  position: relative;
}

.reaction-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
}

.reaction-button:hover {
  background-color: #f5f5f5;
}

.reaction-button.has-reaction {
  color: #e91e63;
  border-color: #e91e63;
  background-color: rgba(233, 30, 99, 0.1);
}

.reactions-panel {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 2rem;
  padding: 0.5rem;
  display: flex;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-bottom: 0.5rem;
}

.reaction-option {
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.reaction-option:hover {
  background-color: #f5f5f5;
  transform: scale(1.2);
}

.reaction-option.selected {
  background-color: #e91e63;
  color: white;
}

/* Tooltip */
.like-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  white-space: nowrap;
  margin-bottom: 0.5rem;
  z-index: 1001;
}

.like-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #333;
}

.reaction-stat {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin: 0.2rem 0;
}

/* Animações */
@keyframes heartBeat {
  0% { transform: scale(1); }
  25% { transform: scale(1.3); }
  50% { transform: scale(1); }
  75% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes likeButton {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.floating-heart,
.floating-reaction {
  position: absolute;
  top: -1rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  pointer-events: none;
  animation: floatUp 1s ease-out forwards;
  z-index: 1000;
}

@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-3rem) scale(1.5);
  }
}

/* Transições do painel de reações */
.reactions-slide-enter-active,
.reactions-slide-leave-active {
  transition: all 0.3s ease;
}

.reactions-slide-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(10px) scale(0.8);
}

.reactions-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px) scale(0.8);
}

/* Tamanhos */
.like-button-container.small .like-button,
.like-button-container.small .reaction-button {
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
}

.like-button-container.large .like-button,
.like-button-container.large .reaction-button {
  padding: 0.7rem 1.4rem;
  font-size: 1.1rem;
}

/* Responsividade */
@media (max-width: 768px) {
  .like-button,
  .reaction-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
  
  .reactions-panel {
    padding: 0.3rem;
    gap: 0.3rem;
  }
  
  .reaction-option {
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }
}
</style>
