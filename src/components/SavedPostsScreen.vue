<template>
  <div class="saved-posts-screen">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <h1 class="title">
          <svg class="header-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          Posts Salvos
        </h1>
        <p class="subtitle">{{ savedPosts.length }} post{{ savedPosts.length !== 1 ? 's' : '' }} salvo{{ savedPosts.length !== 1 ? 's' : '' }}</p>
      </div>

      <!-- Ações do header -->
      <div class="header-actions">
        <div class="filter-container">
          <select v-model="currentFilter" @change="applyFilter" class="filter-select">
            <option value="all">Todos</option>
            <option value="recent">Mais recentes</option>
            <option value="popular">Mais populares</option>
            <option value="oldest">Mais antigos</option>
          </select>
        </div>

        <div class="action-buttons">
          <button 
            @click="exportSaved" 
            class="action-btn export-btn"
            :disabled="savedPosts.length === 0"
            title="Exportar posts salvos"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>

          <button 
            @click="triggerImport" 
            class="action-btn import-btn"
            title="Importar posts salvos"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17,8 12,3 7,8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </button>

          <button 
            v-if="savedPosts.length > 0"
            @click="showClearConfirm = true" 
            class="action-btn clear-btn"
            title="Limpar todos os salvos"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6"/>
              <path d="M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Estatísticas -->
    <div v-if="savedPosts.length > 0" class="statistics">
      <div class="stat-card">
        <span class="stat-value">{{ statistics.total }}</span>
        <span class="stat-label">Posts</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ statistics.totalLikes }}</span>
        <span class="stat-label">Curtidas</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ statistics.totalComments }}</span>
        <span class="stat-label">Comentários</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ statistics.averageLikes }}</span>
        <span class="stat-label">Média de curtidas</span>
      </div>
    </div>

    <!-- Lista de posts -->
    <div class="posts-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Carregando posts salvos...</p>
      </div>

      <div v-else-if="filteredPosts.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
        <h3>Nenhum post salvo</h3>
        <p>Posts que você salvar aparecerão aqui para acesso rápido.</p>
        <button @click="$emit('navigate', 'feed')" class="cta-button">
          Explorar posts
        </button>
      </div>

      <div v-else class="posts-grid">
        <div 
          v-for="post in filteredPosts" 
          :key="post.id"
          class="saved-post-card"
        >
          <!-- Post content -->
          <div class="post-content">
            <div class="post-header">
              <div class="author-info">
                <img 
                  :src="post.author?.avatar || '/default-avatar.png'"
                  :alt="post.author?.name"
                  class="author-avatar"
                />
                <div class="author-details">
                  <span class="author-name">{{ post.author?.name || 'Usuário' }}</span>
                  <span class="post-date">{{ formatDate(post.timestamp) }}</span>
                </div>
              </div>

              <div class="post-actions">
                <button 
                  @click="removeSavedPost(post.id)"
                  class="remove-btn"
                  title="Remover dos salvos"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="post-text">{{ post.content }}</div>

            <div v-if="post.image" class="post-image">
              <img :src="post.image" :alt="post.content" />
            </div>

            <div class="post-meta">
              <div class="saved-date">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                Salvo em {{ formatDate(post.savedAt) }}
              </div>
              
              <div class="post-stats">
                <span class="stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {{ post.likes || 0 }}
                </span>
                <span class="stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  {{ post.comments || 0 }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmação para limpar -->
    <div v-if="showClearConfirm" class="modal-overlay" @click="showClearConfirm = false">
      <div class="modal" @click.stop>
        <h3>Limpar todos os posts salvos?</h3>
        <p>Esta ação não pode ser desfeita. Todos os {{ savedPosts.length }} posts salvos serão removidos.</p>
        <div class="modal-actions">
          <button @click="showClearConfirm = false" class="btn-secondary">
            Cancelar
          </button>
          <button @click="clearAllSaved" class="btn-danger">
            Sim, limpar tudo
          </button>
        </div>
      </div>
    </div>

    <!-- Input de arquivo escondido -->
    <input 
      ref="fileInput"
      type="file"
      accept=".json"
      @change="handleImport"
      style="display: none"
    />
  </div>
</template>

<script>
import savedService from '@/services/savedService';

export default {
  name: 'SavedPostsScreen',
  data() {
    return {
      savedPosts: [],
      filteredPosts: [],
      currentFilter: 'all',
      loading: true,
      showClearConfirm: false,
      statistics: {
        total: 0,
        totalLikes: 0,
        totalComments: 0,
        averageLikes: 0,
        averageComments: 0,
        mostSavedAuthor: null
      }
    };
  },
  mounted() {
    this.loadSavedPosts();
    savedService.addListener(this.onSavedPostsChanged);
  },
  beforeUnmount() {
    savedService.removeListener(this.onSavedPostsChanged);
  },
  methods: {
    loadSavedPosts() {
      this.loading = true;
      setTimeout(() => {
        this.savedPosts = savedService.getSavedPosts();
        this.applyFilter();
        this.updateStatistics();
        this.loading = false;
      }, 500);
    },

    applyFilter() {
      this.filteredPosts = savedService.getSavedPostsByFilter(this.currentFilter);
    },

    updateStatistics() {
      this.statistics = savedService.getStatistics();
    },

    onSavedPostsChanged() {
      this.loadSavedPosts();
    },

    removeSavedPost(postId) {
      savedService.removeSavedPost(postId);
    },

    clearAllSaved() {
      savedService.clearAllSaved();
      this.showClearConfirm = false;
    },

    exportSaved() {
      savedService.exportSavedPosts();
    },

    triggerImport() {
      this.$refs.fileInput.click();
    },

    async handleImport(event) {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const imported = await savedService.importSavedPosts(file);
        alert(`${imported} posts importados com sucesso!`);
      } catch (error) {
        alert(`Erro ao importar: ${error.message}`);
      }

      // Limpar input
      event.target.value = '';
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMinutes = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMinutes < 1) return 'Agora';
      if (diffMinutes < 60) return `${diffMinutes}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }
};
</script>

<style scoped>
.saved-posts-screen {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

/* Header */
.header {
  margin-bottom: 2rem;
}

.header-content {
  margin-bottom: 1rem;
}

.title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
}

.header-icon {
  width: 28px;
  height: 28px;
  color: #2563eb;
}

.subtitle {
  color: #6b7280;
  margin: 0;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  font-size: 0.9rem;
  min-width: 150px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f3f4f6;
}

.action-btn svg {
  width: 20px;
  height: 20px;
}

.clear-btn:hover {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #dc2626;
}

/* Estatísticas */
.statistics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2563eb;
}

.stat-label {
  font-size: 0.8rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Loading & Empty states */
.loading-state, .empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #9ca3af;
  margin: 0 auto 1rem;
}

.cta-button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.cta-button:hover {
  background: #1d4ed8;
}

/* Posts grid */
.posts-grid {
  display: grid;
  gap: 1rem;
}

.saved-post-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.2s;
}

.saved-post-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.post-content {
  padding: 1rem;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: #1f2937;
}

.post-date {
  font-size: 0.8rem;
  color: #6b7280;
}

.remove-btn {
  padding: 0.25rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #fef2f2;
  color: #dc2626;
}

.remove-btn svg {
  width: 16px;
  height: 16px;
}

.post-text {
  margin-bottom: 0.75rem;
  line-height: 1.6;
  color: #374151;
}

.post-image {
  margin-bottom: 0.75rem;
}

.post-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 0.5rem;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
}

.saved-date {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: #6b7280;
}

.saved-date svg {
  width: 14px;
  height: 14px;
}

.post-stats {
  display: flex;
  gap: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: #6b7280;
}

.stat svg {
  width: 14px;
  height: 14px;
}

/* Modal */
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

.modal {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  max-width: 400px;
  width: 90%;
}

.modal h3 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.modal p {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-secondary, .btn-danger {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary {
  background: white;
  color: #374151;
}

.btn-secondary:hover {
  background: #f3f4f6;
}

.btn-danger {
  background: #dc2626;
  color: white;
  border-color: #dc2626;
}

.btn-danger:hover {
  background: #b91c1c;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsivo */
@media (max-width: 768px) {
  .saved-posts-screen {
    padding: 0.5rem;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .statistics {
    grid-template-columns: repeat(2, 1fr);
  }

  .post-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
