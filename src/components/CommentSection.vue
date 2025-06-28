<template>
  <div class="comment-section">
    <!-- Header da seção de comentários -->
    <div class="comments-header">
      <h4 class="comments-title">
        Comentários
        <span class="comment-count">({{ totalComments }})</span>
      </h4>
      
      <!-- Controles de ordenação -->
      <div class="sort-controls">
        <select v-model="sortBy" @change="loadComments" class="sort-select">
          <option value="timestamp">Mais recentes</option>
          <option value="likes">Mais curtidos</option>
          <option value="replies">Mais respondidos</option>
        </select>
      </div>
    </div>

    <!-- Input para novo comentário -->
    <div class="comment-input-section">
      <div class="user-avatar">
        {{ currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U' }}
      </div>
      
      <div class="comment-input-container">
        <textarea
          v-model="newCommentText"
          @keydown.enter.exact.prevent="addComment"
          @keydown.ctrl.enter.exact="addComment"
          placeholder="Escreva um comentário..."
          class="comment-input"
          :disabled="isSubmitting"
          maxlength="1000"
        ></textarea>
        
        <div class="input-actions">
          <span class="char-counter" :class="{ warning: charCount > 900 }">
            {{ charCount }}/1000
          </span>
          
          <button
            @click="addComment"
            :disabled="!canSubmit"
            class="submit-btn"
          >
            <i class="fas fa-paper-plane"></i>
            Publicar
          </button>
        </div>
      </div>
    </div>

    <!-- Lista de comentários -->
    <div class="comments-list">
      <transition-group name="comment" tag="div">
        <CommentItem
          v-for="comment in visibleComments"
          :key="comment.id"
          :comment="comment"
          :post-id="postId"
          :current-user="currentUser"
          :show-replies="true"
          :allow-edit="allowEdit"
          :allow-delete="allowDelete"
          @reply="handleReply"
          @edit="handleEdit"
          @delete="handleDelete"
          @report="handleReport"
          @like="handleCommentLike"
        />
      </transition-group>
    </div>

    <!-- Botão "Carregar mais" -->
    <div v-if="hasMoreComments" class="load-more-section">
      <button
        @click="loadMoreComments"
        :disabled="isLoadingMore"
        class="load-more-btn"
      >
        <i v-if="isLoadingMore" class="fas fa-spinner fa-spin"></i>
        <i v-else class="fas fa-chevron-down"></i>
        {{ isLoadingMore ? 
          'Carregando...' : 
          `Carregar mais (${remainingComments})`
        }}
      </button>
    </div>

    <!-- Seção de estatísticas (opcional) -->
    <div v-if="showStats && commentStats" class="comment-stats">
      <div class="stats-item">
        <i class="fas fa-comments"></i>
        <span>{{ commentStats.totalWithReplies }} total</span>
      </div>
      
      <div v-if="commentStats.mostLikedComment" class="stats-item">
        <i class="fas fa-heart"></i>
        <span>Mais curtido: {{ commentStats.mostLikedComment.likes }}</span>
      </div>
      
      <div class="stats-item">
        <i class="fas fa-users"></i>
        <span>{{ Object.keys(commentStats.topCommenters).length }} participantes</span>
      </div>
    </div>

    <!-- Modal de confirmação para deletar -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="delete-modal" @click.stop>
        <h3>Confirmar exclusão</h3>
        <p>Esta ação não pode ser desfeita.</p>
        
        <div class="modal-actions">
          <button @click="cancelDelete" class="btn-cancel">
            Cancelar
          </button>
          <button @click="confirmDelete" class="btn-delete">
            Excluir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import commentService from '@/services/commentService';
import likeService from '@/services/likeService';
import CommentItem from './CommentItem.vue';

export default {
  name: 'CommentSection',
  components: {
    CommentItem
  },
  props: {
    postId: {
      type: String,
      required: true
    },
    currentUser: {
      type: Object,
      default: () => ({
        id: localStorage.getItem('currentUserId') || 'user1',
        name: localStorage.getItem('currentUserName') || 'Usuário'
      })
    },
    initialLoad: {
      type: Number,
      default: 10
    },
    loadIncrement: {
      type: Number,
      default: 5
    },
    allowEdit: {
      type: Boolean,
      default: true
    },
    allowDelete: {
      type: Boolean,
      default: true
    },
    showStats: {
      type: Boolean,
      default: false
    },
    autoFocus: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      comments: [],
      newCommentText: '',
      isSubmitting: false,
      isLoadingMore: false,
      sortBy: 'timestamp',
      sortOrder: 'asc',
      currentOffset: 0,
      totalComments: 0,
      commentStats: null,
      showDeleteModal: false,
      commentToDelete: null
    };
  },
  computed: {
    charCount() {
      return this.newCommentText.length;
    },
    
    canSubmit() {
      return this.newCommentText.trim().length > 0 && 
             !this.isSubmitting && 
             this.charCount <= 1000;
    },
    
    visibleComments() {
      return this.comments.slice(0, this.currentOffset + this.initialLoad);
    },
    
    hasMoreComments() {
      return this.comments.length > this.visibleComments.length;
    },
    
    remainingComments() {
      return this.comments.length - this.visibleComments.length;
    }
  },
  mounted() {
    this.loadComments();
    this.loadStats();
    this.setupEventListeners();
    
    if (this.autoFocus) {
      this.$nextTick(() => {
        const input = this.$el.querySelector('.comment-input');
        if (input) input.focus();
      });
    }
  },
  beforeUnmount() {
    this.removeEventListeners();
  },
  methods: {
    // Carrega comentários
    async loadComments() {
      try {
        const options = {
          limit: 100, // Carrega todos e pagina no frontend
          sortBy: this.sortBy,
          order: this.sortOrder,
          includeReplies: true
        };
        
        this.comments = commentService.getComments(this.postId, options);
        this.totalComments = this.comments.reduce((count, comment) => {
          return count + 1 + (comment.replies ? comment.replies.length : 0);
        }, 0);
        
      } catch (error) {
        console.error('Erro ao carregar comentários:', error);
        this.showError('Erro ao carregar comentários');
      }
    },

    // Carrega estatísticas
    loadStats() {
      if (this.showStats) {
        this.commentStats = commentService.getCommentStats(this.postId);
      }
    },

    // Adiciona novo comentário
    async addComment() {
      if (!this.canSubmit) return;

      this.isSubmitting = true;

      try {
        const comment = commentService.addComment(
          this.postId,
          this.currentUser.id,
          this.newCommentText
        );

        // Adiciona à lista local
        this.comments.push(comment);
        this.totalComments++;
        
        // Limpa input
        this.newCommentText = '';
        
        // Emite evento para componente pai
        this.$emit('comment-added', {
          postId: this.postId,
          comment
        });

        // Recarrega estatísticas
        this.loadStats();

        this.showSuccess('Comentário publicado!');
        
      } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        this.showError('Erro ao publicar comentário');
      } finally {
        this.isSubmitting = false;
      }
    },

    // Carrega mais comentários
    loadMoreComments() {
      this.currentOffset += this.loadIncrement;
    },

    // Manipula resposta a comentário
    handleReply(data) {
      const { parentCommentId, text } = data;
      
      try {
        const reply = commentService.addComment(
          this.postId,
          this.currentUser.id,
          text,
          parentCommentId
        );

        // Encontra comentário pai e adiciona resposta
        const parentComment = this.comments.find(c => c.id === parentCommentId);
        if (parentComment) {
          if (!parentComment.replies) {
            parentComment.replies = [];
          }
          parentComment.replies.push(reply);
          this.totalComments++;
        }

        this.$emit('reply-added', {
          postId: this.postId,
          parentCommentId,
          reply
        });

        this.loadStats();
        this.showSuccess('Resposta publicada!');
        
      } catch (error) {
        console.error('Erro ao responder comentário:', error);
        this.showError('Erro ao publicar resposta');
      }
    },

    // Manipula edição de comentário
    handleEdit(data) {
      const { commentId, newText } = data;
      
      try {
        const updatedComment = commentService.editComment(
          this.postId,
          commentId,
          newText,
          this.currentUser.id
        );

        // Atualiza na lista local
        this.updateCommentInList(commentId, updatedComment);

        this.$emit('comment-edited', {
          postId: this.postId,
          commentId,
          newText
        });

        this.showSuccess('Comentário editado!');
        
      } catch (error) {
        console.error('Erro ao editar comentário:', error);
        this.showError('Erro ao editar comentário');
      }
    },

    // Manipula exclusão de comentário
    handleDelete(commentId) {
      this.commentToDelete = commentId;
      this.showDeleteModal = true;
    },

    confirmDelete() {
      if (!this.commentToDelete) return;

      try {
        commentService.deleteComment(
          this.postId,
          this.commentToDelete,
          this.currentUser.id
        );

        // Atualiza na lista local
        this.updateCommentInList(this.commentToDelete, { 
          text: '[Comentário removido]',
          isDeleted: true 
        });

        this.$emit('comment-deleted', {
          postId: this.postId,
          commentId: this.commentToDelete
        });

        this.showSuccess('Comentário excluído!');
        
      } catch (error) {
        console.error('Erro ao excluir comentário:', error);
        this.showError('Erro ao excluir comentário');
      } finally {
        this.cancelDelete();
      }
    },

    cancelDelete() {
      this.showDeleteModal = false;
      this.commentToDelete = null;
    },

    // Manipula report de comentário
    handleReport(data) {
      const { commentId, reason } = data;
      
      try {
        commentService.reportComment(
          this.postId,
          commentId,
          this.currentUser.id,
          reason
        );

        this.$emit('comment-reported', {
          postId: this.postId,
          commentId,
          reason
        });

        this.showSuccess('Comentário reportado!');
        
      } catch (error) {
        console.error('Erro ao reportar comentário:', error);
        this.showError('Erro ao reportar comentário');
      }
    },

    // Manipula like em comentário
    handleCommentLike(commentId) {
      try {
        const result = likeService.toggleLike(
          `comment_${commentId}`,
          this.currentUser.id
        );

        // Atualiza likes na lista local
        this.updateCommentInList(commentId, { 
          likes: result.totalLikes 
        });

        this.$emit('comment-liked', {
          postId: this.postId,
          commentId,
          liked: result.liked,
          totalLikes: result.totalLikes
        });
        
      } catch (error) {
        console.error('Erro ao curtir comentário:', error);
      }
    },

    // Atualiza comentário na lista local
    updateCommentInList(commentId, updates) {
      const updateComment = (comment) => {
        if (comment.id === commentId) {
          Object.assign(comment, updates);
          return true;
        }
        
        if (comment.replies) {
          return comment.replies.some(updateComment);
        }
        
        return false;
      };

      this.comments.some(updateComment);
    },

    // Event listeners
    setupEventListeners() {
      window.addEventListener('commentUpdate', this.handleCommentUpdate);
    },

    removeEventListeners() {
      window.removeEventListener('commentUpdate', this.handleCommentUpdate);
    },

    handleCommentUpdate(event) {
      const { postId } = event.detail;
      
      if (postId === this.postId) {
        // Recarrega comentários quando há atualizações externas
        this.loadComments();
        this.loadStats();
      }
    },

    // Helpers para notificações
    showSuccess(message) {
      // Implementar sistema de notificação
      console.log('✅', message);
    },

    showError(message) {
      // Implementar sistema de notificação
      console.error('❌', message);
    }
  }
};
</script>

<style scoped>
.comment-section {
  border-top: 1px solid #efefef;
  padding: 16px;
  background: #fff;
}

/* Header */
.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.comments-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.comment-count {
  font-weight: 400;
  color: #8e8e8e;
}

.sort-controls {
  display: flex;
  align-items: center;
}

.sort-select {
  padding: 4px 8px;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
  font-size: 12px;
  background: white;
  cursor: pointer;
}

/* Input de comentário */
.comment-input-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(45deg, #833ab4, #fd1d1d, #fcb045);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.comment-input-container {
  flex: 1;
}

.comment-input {
  width: 100%;
  min-height: 60px;
  max-height: 120px;
  padding: 12px;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  background: #fafafa;
  transition: border-color 0.2s, background-color 0.2s;
}

.comment-input:focus {
  outline: none;
  border-color: #0095f6;
  background: white;
}

.comment-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.char-counter {
  font-size: 12px;
  color: #8e8e8e;
}

.char-counter.warning {
  color: #ed4956;
  font-weight: 600;
}

.submit-btn {
  background: #0095f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #1877f2;
}

.submit-btn:disabled {
  background: #c7c7c7;
  cursor: not-allowed;
}

/* Lista de comentários */
.comments-list {
  margin-bottom: 16px;
}

/* Carregar mais */
.load-more-section {
  text-align: center;
  margin: 16px 0;
}

.load-more-btn {
  background: none;
  border: 1px solid #dbdbdb;
  padding: 8px 16px;
  border-radius: 6px;
  color: #8e8e8e;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 auto;
  transition: all 0.2s;
}

.load-more-btn:hover:not(:disabled) {
  background: #f5f5f5;
  color: #262626;
}

/* Estatísticas */
.comment-stats {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  margin-top: 16px;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8e8e8e;
}

.stats-item i {
  font-size: 14px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.delete-modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.delete-modal h3 {
  margin: 0 0 12px 0;
  color: #262626;
  font-size: 18px;
}

.delete-modal p {
  margin: 0 0 20px 0;
  color: #8e8e8e;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-delete {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f5f5f5;
  color: #262626;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-delete {
  background: #ed4956;
  color: white;
}

.btn-delete:hover {
  background: #c1333e;
}

/* Animações */
.comment-enter-active,
.comment-leave-active {
  transition: all 0.3s ease;
}

.comment-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.comment-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Responsividade */
@media (max-width: 768px) {
  .comment-section {
    padding: 12px;
  }
  
  .comments-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .comment-input {
    min-height: 50px;
    font-size: 16px; /* Evita zoom no iOS */
  }
  
  .input-actions {
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }
  
  .comment-stats {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
