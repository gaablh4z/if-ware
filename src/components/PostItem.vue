<template>
  <div class="post">
    <!-- Header do post -->
    <div class="post-header">
      <span class="avatar">{{ user.charAt(0).toUpperCase() }}</span>
      <div class="user-info">
        <span class="username">{{ user }}</span>
        <span v-if="location" class="location">{{ location }}</span>
      </div>
      <div class="post-time">{{ formatTime(timestamp) }}</div>
    </div>

    <!-- Imagem do post -->
    <LazyImage
      v-if="image"
      :src="image"
      :alt="caption || 'Post image'"
      class="post-image"
      :show-skeleton="true"
      :progressive="true"
      :clickable="true"
      object-fit="cover"
      @load="handleImageLoad"
      @error="handleImageError"
      @click="handleImageClick"
    />

    <!-- Ações do post (like, comment, share) -->
    <div class="post-actions">
      <LikeButton 
        :post-id="postId"
        :user-id="currentUserId"
        :show-reactions="enableReactions"
        class="action-button"
      />
      
      <button 
        @click="toggleComments" 
        class="action-button comment-button"
        title="Comentar"
      >
        <i class="far fa-comment"></i>
        <span v-if="commentCount > 0">{{ commentCount }}</span>
      </button>
      
      <button 
        @click="sharePost" 
        class="action-button share-button"
        title="Compartilhar"
      >
        <i class="far fa-paper-plane"></i>
      </button>
      
      <SaveButton 
        :post="postData"
        :size="'medium'"
        class="action-button"
        @saveToggled="handleSaveToggled"
        @error="handleSaveError"
      />
    </div>

    <!-- Caption do post -->
    <div class="post-caption">
      <span class="username">{{ user }}</span>
      <span class="caption-text">{{ caption }}</span>
      
      <!-- Hashtags -->
      <div v-if="hashtags.length > 0" class="hashtags">
        <span 
          v-for="tag in hashtags" 
          :key="tag"
          @click="searchHashtag(tag)"
          class="hashtag"
        >
          #{{ tag }}
        </span>
      </div>
    </div>

    <!-- Comentários completos -->
    <CommentSection
      v-if="showComments"
      :post-id="postId"
      :current-user="currentUserObj"
      :initial-load="5"
      :load-increment="5"
      :allow-edit="true"
      :allow-delete="true"
      :show-stats="false"
      @comment-added="handleCommentAdded"
      @comment-edited="handleCommentEdited"
      @comment-deleted="handleCommentDeleted"
      @comment-reported="handleCommentReported"
      @comment-liked="handleCommentLiked"
      @reply-added="handleReplyAdded"
    />
  </div>
</template>

<script>
import LikeButton from './LikeButton.vue';
import CommentSection from './CommentSection.vue';
import SaveButton from './SaveButton.vue';
import LazyImage from './LazyImage.vue';

export default {
  name: 'PostItem',
  components: {
    LikeButton,
    CommentSection,
    SaveButton,
    LazyImage
  },
  props: {
    postId: {
      type: String,
      default: () => 'post_' + Date.now()
    },
    user: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: null
    },
    caption: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: null
    },
    timestamp: {
      type: [String, Date],
      default: () => new Date()
    },
    enableReactions: {
      type: Boolean,
      default: false
    },
    initialComments: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      currentUserId: localStorage.getItem('currentUserId') || 'user1',
      showComments: false,
      comments: [...this.initialComments],
      newComment: '',
      commentsToShow: 3,
      imageError: false
    };
  },
  computed: {
    hashtags() {
      if (!this.caption) return [];
      const matches = this.caption.match(/#[\w\u00C0-\u017F]+/g);
      return matches ? matches.map(tag => tag.substring(1)) : [];
    },
    
    commentCount() {
      return this.comments.length;
    },
    
    visibleComments() {
      return this.comments.slice(0, this.commentsToShow);
    },
    
    currentUserObj() {
      return {
        id: this.currentUserId,
        name: localStorage.getItem('currentUserName') || 'Usuário'
      };
    },

    postData() {
      return {
        id: this.postId,
        content: this.caption,
        author: {
          name: this.user,
          avatar: null
        },
        timestamp: this.timestamp,
        image: this.image,
        likes: 0, // Isso seria obtido do serviço real
        comments: this.commentCount
      };
    }
  },
  mounted() {
    // Componente iniciado
  },
  methods: {
    // Formata timestamp
    formatTime(timestamp) {
      if (!timestamp) return '';
      
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'agora';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short' 
      });
    },

    // Toggle comentários
    toggleComments() {
      this.showComments = !this.showComments;
    },

    // Adiciona comentário
    addComment() {
      if (!this.newComment.trim()) return;
      
      const comment = {
        id: Date.now(),
        user: this.currentUserId,
        text: this.newComment.trim(),
        timestamp: new Date().toISOString()
      };
      
      this.comments.push(comment);
      this.newComment = '';
      
      // Salva comentários no localStorage
      this.saveComments();
      
      // Emite evento para outros componentes
      this.$emit('comment-added', {
        postId: this.postId,
        comment
      });
    },

    // Carrega mais comentários
    loadMoreComments() {
      this.commentsToShow += 5;
    },

    // Compartilha post
    sharePost() {
      // Implementação básica de compartilhamento
      if (navigator.share) {
        navigator.share({
          title: `Post de ${this.user}`,
          text: this.caption,
          url: window.location.href
        });
      } else {
        // Fallback: copia link
        const url = `${window.location.origin}/post/${this.postId}`;
        navigator.clipboard.writeText(url).then(() => {
          alert('Link copiado para a área de transferência!');
        });
      }
      
      this.$emit('post-shared', this.postId);
    },

    // Salva/remove post dos salvos
    // Lidar com salvamento de post
    handleSaveToggled(event) {
      this.$emit('post-saved', {
        postId: event.postId,
        saved: event.isSaved
      });
    },

    handleSaveError(error) {
      console.error('Erro ao salvar post:', error);
      // Aqui você pode mostrar uma mensagem de erro para o usuário
    },

    // Lidar com carregamento de imagem
    handleImageLoad(imageInfo) {
      this.imageError = false;
      this.$emit('image-loaded', imageInfo);
    },

    handleImageError(errorInfo) {
      this.imageError = true;
      console.error('Erro ao carregar imagem do post:', errorInfo);
    },

    handleImageClick(event) {
      this.$emit('image-clicked', {
        postId: this.postId,
        image: this.image,
        event
      });
    },

    // Busca hashtag
    searchHashtag(tag) {
      this.$emit('hashtag-clicked', tag);
    },

    // Salva comentários
    saveComments() {
      const storageKey = `comments_${this.postId}`;
      localStorage.setItem(storageKey, JSON.stringify(this.comments));
    },

    // Carrega comentários salvos
    loadComments() {
      const storageKey = `comments_${this.postId}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        this.comments = JSON.parse(stored);
      }
    },

    // Novos handlers para CommentSection
    handleCommentAdded(data) {
      this.$emit('comment-added', data);
    },

    handleCommentEdited(data) {
      this.$emit('comment-edited', data);
    },

    handleCommentDeleted(data) {
      this.$emit('comment-deleted', data);
    },

    handleCommentReported(data) {
      this.$emit('comment-reported', data);
    },

    handleCommentLiked(data) {
      this.$emit('comment-liked', data);
    },

    handleReplyAdded(data) {
      this.$emit('reply-added', data);
    }
  }
}
</script>

<style scoped>
.post {
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  margin-bottom: 24px;
  background: #fff;
  box-sizing: border-box;
  overflow: hidden;
}

/* Header */
.post-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  justify-content: space-between;
}

.avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(45deg, #833ab4, #fd1d1d, #fcb045);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 600;
  color: #262626;
  font-size: 14px;
  line-height: 1.2;
}

.location {
  font-size: 12px;
  color: #8e8e8e;
  margin-top: 2px;
}

.post-time {
  font-size: 12px;
  color: #8e8e8e;
}

/* Imagem */
.post-image {
  width: 100%;
  display: block;
  margin: 0;
  max-height: 400px;
  object-fit: cover;
  background-color: #fafafa;
}

/* Ações */
.post-actions {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  gap: 16px;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #262626;
  font-size: 24px;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: #f5f5f5;
  transform: scale(1.05);
}

.action-button i {
  font-size: inherit;
}

.action-button span {
  font-size: 12px;
  font-weight: 600;
  margin-left: 4px;
}

.comment-button:hover {
  color: #0095f6;
}

.share-button:hover {
  color: #00ba7c;
}

.save-button:hover {
  color: #ffa726;
}

.save-button.saved {
  color: #ffa726;
}

/* Caption */
.post-caption {
  padding: 0 16px 12px;
  font-size: 14px;
  line-height: 1.4;
}

.caption-text {
  color: #262626;
  margin-left: 8px;
}

.hashtags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hashtag {
  color: #0095f6;
  cursor: pointer;
  font-weight: 600;
  transition: color 0.2s ease;
}

.hashtag:hover {
  color: #1877f2;
  text-decoration: underline;
}

/* Comentários */
.comments-section {
  border-top: 1px solid #efefef;
  padding: 16px;
}

.comment {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.4;
}

.comment-user {
  font-weight: 600;
  color: #262626;
  margin-right: 8px;
  flex-shrink: 0;
}

.comment-text {
  color: #262626;
  flex: 1;
  word-break: break-word;
}

.comment-time {
  font-size: 12px;
  color: #8e8e8e;
  margin-left: 12px;
  flex-shrink: 0;
}

.load-more-comments {
  background: none;
  border: none;
  color: #8e8e8e;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 0;
  transition: color 0.2s ease;
}

.load-more-comments:hover {
  color: #262626;
}

/* Input de comentário */
.comment-input {
  display: flex;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #efefef;
  gap: 12px;
}

.comment-field {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #262626;
  background: transparent;
  resize: none;
}

.comment-field::placeholder {
  color: #8e8e8e;
}

.comment-submit {
  background: none;
  border: none;
  color: #0095f6;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.comment-submit:hover:not(:disabled) {
  background-color: rgba(0, 149, 246, 0.1);
}

.comment-submit:disabled {
  color: #c7c7c7;
  cursor: not-allowed;
}

/* Responsividade */
@media (max-width: 768px) {
  .post {
    border-radius: 0;
    margin-bottom: 16px;
    border-left: none;
    border-right: none;
  }
  
  .post-header {
    padding: 12px;
  }
  
  .post-image {
    max-height: 300px;
  }
  
  .post-actions {
    padding: 6px 12px;
    gap: 12px;
  }
  
  .action-button {
    font-size: 20px;
    padding: 6px;
  }
  
  .post-caption {
    padding: 0 12px 8px;
    font-size: 13px;
  }
  
  .comments-section {
    padding: 12px;
  }
  
  .comment-input {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .post-actions {
    gap: 8px;
  }
  
  .action-button {
    font-size: 18px;
    padding: 4px;
  }
  
  .action-button span {
    font-size: 11px;
  }
}

/* Animações */
@keyframes likeAnimation {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.action-button.liked {
  animation: likeAnimation 0.3s ease-in-out;
}

/* Estados especiais */
.post.highlighted {
  border-color: #0095f6;
  box-shadow: 0 0 0 1px #0095f6;
}

.post.saved-post {
  background-color: #fffaf0;
}

/* Erro de imagem */
.post-image[src=""],
.post-image:not([src]) {
  display: none;
}
</style>