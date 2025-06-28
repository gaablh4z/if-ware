<template>
  <button 
    @click="toggleSave"
    :class="[
      'save-button',
      { 'saved': isSaved, 'saving': isLoading }
    ]"
    :disabled="isLoading"
    :title="isSaved ? 'Remover dos salvos' : 'Salvar post'"
    :aria-label="isSaved ? 'Remover dos salvos' : 'Salvar post'"
  >
    <transition name="icon-transition" mode="out-in">
      <svg 
        v-if="isLoading"
        key="loading"
        class="icon loading"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
      <svg 
        v-else-if="isSaved"
        key="saved"
        class="icon saved"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      <svg 
        v-else
        key="unsaved"
        class="icon unsaved"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
    </transition>
    
    <span v-if="showLabel" class="save-label">
      {{ isSaved ? 'Salvo' : 'Salvar' }}
    </span>
  </button>
</template>

<script>
import savedService from '@/services/savedService';

export default {
  name: 'SaveButton',
  props: {
    post: {
      type: Object,
      required: true
    },
    showLabel: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'medium', // small, medium, large
      validator: value => ['small', 'medium', 'large'].includes(value)
    }
  },
  data() {
    return {
      isLoading: false,
      isSaved: false
    };
  },
  mounted() {
    this.updateSavedStatus();
    savedService.addListener(this.onSavedPostsChanged);
  },
  beforeUnmount() {
    savedService.removeListener(this.onSavedPostsChanged);
  },
  methods: {
    async toggleSave() {
      if (this.isLoading) return;

      this.isLoading = true;

      try {
        // Simular delay para melhor UX
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const newSavedState = savedService.toggleSavePost(this.post);
        this.isSaved = newSavedState;

        // Emitir evento para componente pai
        this.$emit('saveToggled', {
          postId: this.post.id,
          isSaved: newSavedState
        });

        // Feedback visual/sonoro
        this.showFeedback(newSavedState);

      } catch (error) {
        console.error('Erro ao salvar/remover post:', error);
        this.$emit('error', error);
      } finally {
        this.isLoading = false;
      }
    },

    updateSavedStatus() {
      this.isSaved = savedService.isPostSaved(this.post.id);
    },

    onSavedPostsChanged() {
      this.updateSavedStatus();
    },

    showFeedback(isSaved) {
      // Animação de feedback
      const button = this.$el;
      button.classList.add('feedback-animation');
      
      setTimeout(() => {
        button.classList.remove('feedback-animation');
      }, 300);

      // Mensagem de toast (opcional)
      if (this.$toast) {
        const message = isSaved ? 
          'Post salvo com sucesso!' : 
          'Post removido dos salvos';
        
        this.$toast.success(message, {
          duration: 2000,
          position: 'bottom-center'
        });
      }
    }
  },
  watch: {
    'post.id': {
      handler() {
        this.updateSavedStatus();
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
.save-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: none;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;
  font-size: 0.9rem;
}

.save-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #333;
}

.save-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.save-button.saved {
  color: #2563eb;
}

.save-button.saved:hover {
  background-color: rgba(37, 99, 235, 0.1);
}

.save-button.saving {
  color: #666;
}

/* Tamanhos */
.save-button.small {
  padding: 0.25rem;
  font-size: 0.8rem;
}

.save-button.small .icon {
  width: 16px;
  height: 16px;
}

.save-button.medium .icon {
  width: 20px;
  height: 20px;
}

.save-button.large {
  padding: 0.75rem;
  font-size: 1rem;
}

.save-button.large .icon {
  width: 24px;
  height: 24px;
}

/* Ícones */
.icon {
  stroke-width: 2;
  transition: all 0.2s ease;
}

.icon.loading {
  animation: spin 1s linear infinite;
}

.icon.saved {
  fill: currentColor;
  stroke: currentColor;
}

.icon.unsaved {
  fill: none;
  stroke: currentColor;
}

/* Animações */
.icon-transition-enter-active,
.icon-transition-leave-active {
  transition: all 0.2s ease;
}

.icon-transition-enter-from,
.icon-transition-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.feedback-animation {
  animation: saveAnimation 0.3s ease;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes saveAnimation {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* Label */
.save-label {
  font-weight: 500;
  user-select: none;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .save-button {
    color: #a1a1aa;
  }

  .save-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #e4e4e7;
  }

  .save-button.saved {
    color: #60a5fa;
  }

  .save-button.saved:hover {
    background-color: rgba(96, 165, 250, 0.2);
  }
}

/* Responsivo */
@media (max-width: 768px) {
  .save-button {
    padding: 0.4rem;
  }
  
  .save-label {
    display: none;
  }
}
</style>
