<template>
  <div 
    :class="[
      'comment-item',
      { 
        'is-reply': isReply,
        'is-deleted': comment.isDeleted,
        'is-hidden': comment.isHidden,
        'is-editing': isEditing,
        'is-reported': comment.reported
      }
    ]"
  >
    <!-- Avatar e informações do usuário -->
    <div class="comment-header">
      <div class="user-avatar">
        {{ getUserInitial(comment.userId) }}
      </div>
      
      <div class="user-info">
        <span class="username">{{ getUserName(comment.userId) }}</span>
        <span class="timestamp">{{ formatTimestamp(comment.timestamp) }}</span>
        <span v-if="comment.edited" class="edited-indicator">
          <i class="fas fa-edit"></i>
          editado
        </span>
      </div>
      
      <!-- Menu de ações -->
      <div class="comment-actions">
        <button
          v-if="canEdit"
          @click="startEdit"
          class="action-btn"
          title="Editar"
        >
          <i class="fas fa-edit"></i>
        </button>
        
        <button
          v-if="canDelete"
          @click="deleteComment"
          class="action-btn delete"
          title="Excluir"
        >
          <i class="fas fa-trash"></i>
        </button>
        
        <button
          v-if="!isOwnComment"
          @click="toggleReportMenu"
          class="action-btn report"
          title="Reportar"
        >
          <i class="fas fa-flag"></i>
        </button>
      </div>
    </div>

    <!-- Conteúdo do comentário -->
    <div class="comment-content">
      <!-- Modo de visualização -->
      <div v-if="!isEditing" class="comment-text">
        <p v-if="!comment.isDeleted">{{ comment.text }}</p>
        <p v-else class="deleted-text">
          <i class="fas fa-ban"></i>
          [Comentário removido]
        </p>
      </div>
      
      <!-- Modo de edição -->
      <div v-else class="edit-section">
        <textarea
          v-model="editText"
          @keydown.enter.exact.prevent="saveEdit"
          @keydown.escape="cancelEdit"
          class="edit-input"
          placeholder="Edite seu comentário..."
          maxlength="1000"
        ></textarea>
        
        <div class="edit-actions">
          <span class="char-counter">{{ editText.length }}/1000</span>
          
          <div class="edit-buttons">
            <button @click="cancelEdit" class="btn-cancel">
              {{ $t ? $t('common.cancel') : 'Cancelar' }}
            </button>
            <button 
              @click="saveEdit" 
              :disabled="!canSaveEdit"
              class="btn-save"
            >
              {{ $t ? $t('common.save') : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Ações do comentário (like, reply) -->
    <div v-if="!comment.isDeleted" class="comment-interactions">
      <!-- Botão de like -->
      <button
        @click="toggleLike"
        :class="['interaction-btn', 'like-btn', { liked: isLiked }]"
      >
        <i :class="isLiked ? 'fas fa-heart' : 'far fa-heart'"></i>
        <span v-if="comment.likes > 0">{{ comment.likes }}</span>
      </button>
      
      <!-- Botão de responder -->
      <button
        v-if="!isReply && showReplies"
        @click="toggleReplyInput"
        class="interaction-btn reply-btn"
      >
        <i class="fas fa-reply"></i>
        {{ $t ? $t('comments.reply') : 'Responder' }}
      </button>
      
      <!-- Contador de respostas -->
      <span v-if="replyCount > 0" class="reply-count">
        {{ replyCount }} {{ replyCount === 1 ? 
          ($t ? $t('comments.reply') : 'resposta') : 
          ($t ? $t('comments.replies') : 'respostas')
        }}
      </span>
    </div>

    <!-- Input de resposta -->
    <div v-if="showReplyInput && !isReply" class="reply-input-section">
      <div class="user-avatar small">
        {{ currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U' }}
      </div>
      
      <div class="reply-input-container">
        <textarea
          v-model="replyText"
          @keydown.enter.exact.prevent="submitReply"
          @keydown.escape="cancelReply"
          :placeholder="$t ? $t('comments.replyPlaceholder') : 'Escreva uma resposta...'"
          class="reply-input"
          maxlength="1000"
        ></textarea>
        
        <div class="reply-actions">
          <span class="char-counter">{{ replyText.length }}/1000</span>
          
          <div class="reply-buttons">
            <button @click="cancelReply" class="btn-cancel">
              {{ $t ? $t('common.cancel') : 'Cancelar' }}
            </button>
            <button 
              @click="submitReply" 
              :disabled="!canSubmitReply"
              class="btn-reply"
            >
              {{ $t ? $t('comments.reply') : 'Responder' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu de report -->
    <div v-if="showReportMenu" class="report-menu">
      <h4>{{ $t ? $t('comments.reportReason') : 'Por que você está reportando?' }}</h4>
      
      <div class="report-options">
        <button
          v-for="reason in reportReasons"
          :key="reason.value"
          @click="submitReport(reason.value)"
          class="report-option"
        >
          <i :class="reason.icon"></i>
          {{ reason.label }}
        </button>
      </div>
      
      <button @click="showReportMenu = false" class="btn-cancel">
        {{ $t ? $t('common.cancel') : 'Cancelar' }}
      </button>
    </div>

    <!-- Respostas aninhadas -->
    <div v-if="showReplies && comment.replies && comment.replies.length > 0" class="replies-section">
      <CommentItem
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply"
        :post-id="postId"
        :current-user="currentUser"
        :is-reply="true"
        :show-replies="false"
        :allow-edit="allowEdit"
        :allow-delete="allowDelete"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @report="$emit('report', $event)"
        @like="$emit('like', $event)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommentItem',
  props: {
    comment: {
      type: Object,
      required: true
    },
    postId: {
      type: String,
      required: true
    },
    currentUser: {
      type: Object,
      required: true
    },
    isReply: {
      type: Boolean,
      default: false
    },
    showReplies: {
      type: Boolean,
      default: true
    },
    allowEdit: {
      type: Boolean,
      default: true
    },
    allowDelete: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isEditing: false,
      editText: '',
      showReplyInput: false,
      replyText: '',
      showReportMenu: false,
      isLiked: false,
      reportReasons: [
        {
          value: 'spam',
          label: this.$t ? this.$t('comments.reportSpam') : 'Spam',
          icon: 'fas fa-exclamation-triangle'
        },
        {
          value: 'harassment',
          label: this.$t ? this.$t('comments.reportHarassment') : 'Assédio',
          icon: 'fas fa-user-slash'
        },
        {
          value: 'hate',
          label: this.$t ? this.$t('comments.reportHate') : 'Discurso de ódio',
          icon: 'fas fa-heart-broken'
        },
        {
          value: 'inappropriate',
          label: this.$t ? this.$t('comments.reportInappropriate') : 'Conteúdo inadequado',
          icon: 'fas fa-eye-slash'
        },
        {
          value: 'other',
          label: this.$t ? this.$t('comments.reportOther') : 'Outro',
          icon: 'fas fa-ellipsis-h'
        }
      ]
    };
  },
  computed: {
    isOwnComment() {
      return this.comment.userId === this.currentUser.id;
    },
    
    canEdit() {
      return this.allowEdit && this.isOwnComment && !this.comment.isDeleted;
    },
    
    canDelete() {
      return this.allowDelete && this.isOwnComment && !this.comment.isDeleted;
    },
    
    canSaveEdit() {
      return this.editText.trim().length > 0 && 
             this.editText.trim() !== this.comment.text &&
             this.editText.length <= 1000;
    },
    
    canSubmitReply() {
      return this.replyText.trim().length > 0 && this.replyText.length <= 1000;
    },
    
    replyCount() {
      return this.comment.replies ? this.comment.replies.length : 0;
    }
  },
  mounted() {
    this.loadLikeStatus();
  },
  methods: {
    // Inicia edição
    startEdit() {
      this.isEditing = true;
      this.editText = this.comment.text;
      
      this.$nextTick(() => {
        const textarea = this.$el.querySelector('.edit-input');
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        }
      });
    },
    
    // Salva edição
    saveEdit() {
      if (!this.canSaveEdit) return;
      
      this.$emit('edit', {
        commentId: this.comment.id,
        newText: this.editText.trim()
      });
      
      this.cancelEdit();
    },
    
    // Cancela edição
    cancelEdit() {
      this.isEditing = false;
      this.editText = '';
    },
    
    // Deleta comentário
    deleteComment() {
      this.$emit('delete', this.comment.id);
    },
    
    // Toggle input de resposta
    toggleReplyInput() {
      this.showReplyInput = !this.showReplyInput;
      
      if (this.showReplyInput) {
        this.$nextTick(() => {
          const textarea = this.$el.querySelector('.reply-input');
          if (textarea) textarea.focus();
        });
      } else {
        this.replyText = '';
      }
    },
    
    // Submete resposta
    submitReply() {
      if (!this.canSubmitReply) return;
      
      this.$emit('reply', {
        parentCommentId: this.comment.id,
        text: this.replyText.trim()
      });
      
      this.cancelReply();
    },
    
    // Cancela resposta
    cancelReply() {
      this.showReplyInput = false;
      this.replyText = '';
    },
    
    // Toggle like
    toggleLike() {
      this.isLiked = !this.isLiked;
      this.$emit('like', this.comment.id);
    },
    
    // Carrega status de like
    loadLikeStatus() {
      // Implementar verificação de like usando likeService
      // this.isLiked = likeService.isLiked(`comment_${this.comment.id}`, this.currentUser.id);
    },
    
    // Toggle menu de report
    toggleReportMenu() {
      this.showReportMenu = !this.showReportMenu;
    },
    
    // Submete report
    submitReport(reason) {
      this.$emit('report', {
        commentId: this.comment.id,
        reason
      });
      
      this.showReportMenu = false;
    },
    
    // Helpers
    getUserName(userId) {
      // Em um app real, isso viria de um store de usuários
      return userId === this.currentUser.id ? 
        this.currentUser.name : 
        `Usuário ${userId.substr(-4)}`;
    },
    
    getUserInitial(userId) {
      const name = this.getUserName(userId);
      return name.charAt(0).toUpperCase();
    },
    
    formatTimestamp(timestamp) {
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
    }
  }
};
</script>

<style scoped>
.comment-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-item.is-reply {
  margin-left: 32px;
  padding-left: 16px;
  border-left: 2px solid #e0e0e0;
}

.comment-item.is-deleted {
  opacity: 0.6;
}

.comment-item.is-hidden {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 12px;
}

.comment-item.is-editing {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
}

.comment-item.is-reported {
  border-left: 3px solid #ed4956;
}

/* Header */
.comment-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.user-avatar {
  width: 24px;
  height: 24px;
  background: linear-gradient(45deg, #833ab4, #fd1d1d, #fcb045);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 10px;
  flex-shrink: 0;
}

.user-avatar.small {
  width: 20px;
  height: 20px;
  font-size: 9px;
}

.user-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.username {
  font-weight: 600;
  font-size: 13px;
  color: #262626;
}

.timestamp {
  font-size: 11px;
  color: #8e8e8e;
}

.edited-indicator {
  font-size: 11px;
  color: #8e8e8e;
  display: flex;
  align-items: center;
  gap: 3px;
}

.comment-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #8e8e8e;
  font-size: 11px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f0f0f0;
  color: #262626;
}

.action-btn.delete:hover {
  color: #ed4956;
  background: #ffedf0;
}

.action-btn.report:hover {
  color: #ff9800;
  background: #fff8e1;
}

/* Conteúdo */
.comment-content {
  margin-bottom: 8px;
}

.comment-text p {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  color: #262626;
  word-break: break-word;
}

.deleted-text {
  color: #8e8e8e !important;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Edição */
.edit-section {
  margin: 8px 0;
}

.edit-input {
  width: 100%;
  min-height: 60px;
  max-height: 120px;
  padding: 8px 12px;
  border: 1px solid #dbdbdb;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  background: white;
}

.edit-input:focus {
  outline: none;
  border-color: #0095f6;
}

.edit-actions,
.reply-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.char-counter {
  font-size: 11px;
  color: #8e8e8e;
}

.edit-buttons,
.reply-buttons {
  display: flex;
  gap: 8px;
}

.btn-cancel,
.btn-save,
.btn-reply {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
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

.btn-save,
.btn-reply {
  background: #0095f6;
  color: white;
}

.btn-save:hover,
.btn-reply:hover {
  background: #1877f2;
}

.btn-save:disabled,
.btn-reply:disabled {
  background: #c7c7c7;
  cursor: not-allowed;
}

/* Interações */
.comment-interactions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 4px;
}

.interaction-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #8e8e8e;
  padding: 4px 0;
  transition: color 0.2s;
}

.interaction-btn:hover {
  color: #262626;
}

.like-btn.liked {
  color: #ed4956;
}

.like-btn.liked i {
  animation: heartBeat 0.6s ease-in-out;
}

.reply-count {
  font-size: 12px;
  color: #8e8e8e;
}

/* Input de resposta */
.reply-input-section {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.reply-input-container {
  flex: 1;
}

.reply-input {
  width: 100%;
  min-height: 40px;
  max-height: 80px;
  padding: 6px 10px;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
  background: white;
}

.reply-input:focus {
  outline: none;
  border-color: #0095f6;
}

/* Menu de report */
.report-menu {
  background: white;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  padding: 16px;
  margin-top: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.report-menu h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #262626;
}

.report-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.report-option {
  background: none;
  border: 1px solid #dbdbdb;
  padding: 8px 12px;
  border-radius: 6px;
  text-align: left;
  cursor: pointer;
  font-size: 13px;
  color: #262626;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.report-option:hover {
  background: #f5f5f5;
  border-color: #c7c7c7;
}

/* Respostas */
.replies-section {
  margin-top: 12px;
}

/* Animações */
@keyframes heartBeat {
  0% { transform: scale(1); }
  25% { transform: scale(1.2); }
  50% { transform: scale(1); }
  75% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* Responsividade */
@media (max-width: 768px) {
  .comment-item.is-reply {
    margin-left: 20px;
    padding-left: 12px;
  }
  
  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .comment-actions {
    flex-direction: column;
  }
  
  .edit-actions,
  .reply-actions {
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }
  
  .report-menu {
    padding: 12px;
  }
}
</style>
