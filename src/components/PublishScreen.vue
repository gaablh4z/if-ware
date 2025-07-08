
<template>
  <div class="publish-container">
    <header class="publish-header">
      <h2>📝 Nova Publicação</h2>
      <p>Compartilhe algo interessante com seus colegas do IFMT</p>
    </header>

    <!-- Seletor de Tipo de Conteúdo -->
    <div class="content-type-selector">
      <button 
        @click="contentType = 'post'"
        :class="{ active: contentType === 'post' }"
        class="type-btn"
      >
        📝 Post
      </button>
      <button 
        @click="contentType = 'poll'"
        :class="{ active: contentType === 'poll' }"
        class="type-btn"
      >
        🗳️ Enquete
      </button>
      <button 
        @click="contentType = 'story'"
        :class="{ active: contentType === 'story' }"
        class="type-btn"
      >
        📱 Story
      </button>
    </div>

    <!-- Formulário de Post -->
    <div v-if="contentType === 'post'" class="publish-form">
      <div class="form-group">
        <label for="postText">O que você está pensando?</label>
        <textarea 
          id="postText"
          v-model="postText" 
          placeholder="Escreva algo interessante sobre seus estudos, projetos ou experiências no IFMT..."
          rows="4"
          maxlength="500"
          class="post-textarea"
        ></textarea>
        <div class="char-count">{{ postText.length }}/500</div>
      </div>

      <div class="form-group">
        <label>📷 Adicionar Imagem (opcional)</label>
        <div class="image-upload">
          <input 
            type="file" 
            id="imageUpload" 
            @change="handleImageUpload" 
            accept="image/*"
            style="display: none;"
          >
          <button 
            type="button" 
            @click="$refs.imageInput.click()" 
            class="upload-btn"
            ref="imageInput"
          >
            <span v-if="!selectedImage">🖼️ Escolher Imagem</span>
            <span v-else>✏️ Trocar Imagem</span>
          </button>
          
          <div v-if="selectedImage" class="image-preview">
            <img :src="selectedImage" alt="Preview" class="preview-img">
            <button @click="removeImage" class="remove-btn">❌</button>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>🏷️ Categoria</label>
        <select v-model="selectedCategory" class="category-select">
          <option value="">Selecione uma categoria</option>
          <option value="academico">📚 Acadêmico</option>
          <option value="projeto">💻 Projeto</option>
          <option value="evento">📅 Evento</option>
          <option value="dica">💡 Dica</option>
          <option value="conquista">🏆 Conquista</option>
          <option value="duvida">❓ Dúvida</option>
          <option value="geral">💬 Geral</option>
        </select>
      </div>

      <div class="form-actions">
        <button 
          @click="saveDraft" 
          class="btn btn-secondary"
          :disabled="!postText.trim()"
        >
          💾 Salvar Rascunho
        </button>
        <button 
          @click="publishPost" 
          class="btn btn-primary"
          :disabled="!postText.trim() || isPublishing"
        >
          <span v-if="isPublishing">📤 Publicando...</span>
          <span v-else>🚀 Publicar</span>
        </button>
      </div>
    </div>

    <!-- Criador de Enquete -->
    <div v-if="contentType === 'poll'" class="poll-creator-container">
      <PollCreator @poll-created="handlePollCreated" @close="contentType = 'post'" />
    </div>

    <!-- Criador de Story -->
    <div v-if="contentType === 'story'" class="story-creator-container">
      <StoriesCreator @story-created="handleStoryCreated" @close="contentType = 'post'" />
    </div>

    <!-- Preview do Post -->
    <div v-if="postText.trim()" class="post-preview">
      <h3>👀 Prévia da Publicação</h3>
      <div class="preview-card">
        <div class="preview-header">
          <div class="user-info">
            <div class="avatar">{{ getUserInitials() }}</div>
            <div class="user-details">
              <div class="username">Você</div>
              <div class="timestamp">agora</div>
            </div>
          </div>
          <div v-if="selectedCategory" class="category-badge">
            {{ getCategoryLabel(selectedCategory) }}
          </div>
        </div>
        <div class="preview-content">
          {{ postText }}
        </div>
        <div v-if="selectedImage" class="preview-image">
          <img :src="selectedImage" alt="Imagem do post">
        </div>
        <div class="preview-actions">
          <span class="action-btn">❤️ Curtir</span>
          <span class="action-btn">💬 Comentar</span>
          <span class="action-btn">📤 Compartilhar</span>
        </div>
      </div>
    </div>

    <!-- Rascunhos Salvos -->
    <div v-if="drafts.length > 0" class="drafts-section">
      <h3>📄 Rascunhos Salvos</h3>
      <div class="drafts-list">
        <div 
          v-for="(draft, index) in drafts" 
          :key="index"
          class="draft-item"
        >
          <div class="draft-content">
            <p>{{ draft.text.substring(0, 100) }}{{ draft.text.length > 100 ? '...' : '' }}</p>
            <small>Salvo em: {{ formatDate(draft.savedAt) }}</small>
          </div>
          <div class="draft-actions">
            <button @click="loadDraft(index)" class="btn-small">✏️ Editar</button>
            <button @click="deleteDraft(index)" class="btn-small btn-danger">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensagem de Status -->
    <div v-if="statusMessage" :class="['status-message', statusType]">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script>
import PollCreator from './PollCreator.vue'
import StoriesCreator from './StoriesCreator.vue'

export default {
  name: 'PublishScreen',
  components: {
    PollCreator,
    StoriesCreator
  },
  data() {
    return {
      contentType: 'post', // post, poll, story
      postText: '',
      selectedImage: null,
      selectedCategory: '',
      isPublishing: false,
      statusMessage: '',
      statusType: 'success',
      drafts: []
    }
  },
  mounted() {
    this.loadDrafts()
  },
  methods: {
    handleImageUpload(event) {
      const file = event.target.files[0]
      if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          this.showStatus('Imagem muito grande. Máximo 5MB.', 'error')
          return
        }
        
        const reader = new FileReader()
        reader.onload = (e) => {
          this.selectedImage = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },

    removeImage() {
      this.selectedImage = null
    },

    async publishPost() {
      this.isPublishing = true
      
      try {
        // Simula API call
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const post = {
          id: Date.now(),
          text: this.postText,
          image: this.selectedImage,
          category: this.selectedCategory,
          timestamp: new Date().toISOString(),
          likes: 0,
          comments: []
        }
        
        // Salva no localStorage (simulando banco)
        const posts = JSON.parse(localStorage.getItem('ifwave_posts') || '[]')
        posts.unshift(post)
        localStorage.setItem('ifwave_posts', JSON.stringify(posts))
        
        this.showStatus('✅ Publicação criada com sucesso!', 'success')
        this.clearForm()
        
        // Emite evento para atualizar o feed
        this.$emit('post-created', post)
        
      } catch (error) {
        this.showStatus('❌ Erro ao publicar. Tente novamente.', 'error')
      } finally {
        this.isPublishing = false
      }
    },

    saveDraft() {
      const draft = {
        text: this.postText,
        image: this.selectedImage,
        category: this.selectedCategory,
        savedAt: new Date().toISOString()
      }
      
      this.drafts.unshift(draft)
      this.saveDraftsToStorage()
      this.showStatus('💾 Rascunho salvo!', 'success')
    },

    loadDraft(index) {
      const draft = this.drafts[index]
      this.postText = draft.text
      this.selectedImage = draft.image
      this.selectedCategory = draft.category
      this.showStatus('📝 Rascunho carregado!', 'success')
    },

    deleteDraft(index) {
      this.drafts.splice(index, 1)
      this.saveDraftsToStorage()
      this.showStatus('🗑️ Rascunho excluído!', 'success')
    },

    loadDrafts() {
      const saved = localStorage.getItem('ifwave_drafts')
      if (saved) {
        this.drafts = JSON.parse(saved)
      }
    },

    saveDraftsToStorage() {
      localStorage.setItem('ifwave_drafts', JSON.stringify(this.drafts))
    },

    clearForm() {
      this.postText = ''
      this.selectedImage = null
      this.selectedCategory = ''
    },

    getUserInitials() {
      const user = JSON.parse(localStorage.getItem('ifwave_current_user') || '{}')
      if (user.name) {
        return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      }
      return 'EU'
    },

    getCategoryLabel(category) {
      const labels = {
        academico: '📚 Acadêmico',
        projeto: '💻 Projeto',
        evento: '📅 Evento',
        dica: '💡 Dica',
        conquista: '🏆 Conquista',
        duvida: '❓ Dúvida',
        geral: '💬 Geral'
      }
      return labels[category] || category
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleString('pt-BR')
    },

    showStatus(message, type) {
      this.statusMessage = message
      this.statusType = type
      setTimeout(() => {
        this.statusMessage = ''
      }, 3000)
    },

    handlePollCreated(poll) {
      // Salva a enquete no localStorage
      const polls = JSON.parse(localStorage.getItem('if_wave_polls') || '[]')
      polls.unshift(poll)
      localStorage.setItem('if_wave_polls', JSON.stringify(polls))
      
      this.showStatus('🗳️ Enquete criada com sucesso!', 'success')
      this.contentType = 'post'
      
      // Emite evento para atualizar o feed
      this.$emit('content-created', { type: 'poll', data: poll })
    },

    handleStoryCreated(story) {
      this.showStatus('📱 Story criado com sucesso!', 'success')
      this.contentType = 'post'
      
      // Emite evento para atualizar o feed
      this.$emit('content-created', { type: 'story', data: story })
    }
  }
}
</script>

<style scoped>
.publish-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #ffffff;
  min-height: 100vh;
}

.publish-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
}

.publish-header h2 {
  color: #2d3748;
  margin: 0 0 10px 0;
  font-size: 1.8em;
}

.publish-header p {
  color: #718096;
  margin: 0;
}

.content-type-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  background: #f7fafc;
  padding: 15px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.type-btn {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #4a5568;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.type-btn:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.type-btn.active {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.poll-creator-container,
.story-creator-container {
  background: #f7fafc;
  border-radius: 15px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  margin-bottom: 25px;
}

.publish-form {
  background: #f7fafc;
  padding: 25px;
  border-radius: 15px;
  border: 1px solid #e2e8f0;
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2d3748;
}

.post-textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.post-textarea:focus {
  outline: none;
  border-color: #4299e1;
}

.char-count {
  text-align: right;
  font-size: 0.85em;
  color: #718096;
  margin-top: 5px;
}

.image-upload {
  margin-top: 10px;
}

.upload-btn {
  background: #4299e1;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.upload-btn:hover {
  background: #3182ce;
}

.image-preview {
  position: relative;
  margin-top: 15px;
  display: inline-block;
}

.preview-img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
}

.remove-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 12px;
}

.category-select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  box-sizing: border-box;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 25px;
}

.btn {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.btn-primary {
  background: #4299e1;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3182ce;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover:not(:disabled) {
  background: #cbd5e0;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.post-preview {
  margin-bottom: 25px;
}

.post-preview h3 {
  color: #2d3748;
  margin-bottom: 15px;
}

.preview-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  background: #4299e1;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.username {
  font-weight: 600;
  color: #2d3748;
}

.timestamp {
  font-size: 0.85em;
  color: #718096;
}

.category-badge {
  background: #e6fffa;
  color: #2c7a7b;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 500;
}

.preview-content {
  margin-bottom: 15px;
  line-height: 1.6;
  color: #2d3748;
}

.preview-image img {
  max-width: 100%;
  border-radius: 10px;
  margin-bottom: 15px;
}

.preview-actions {
  display: flex;
  gap: 20px;
  border-top: 1px solid #e2e8f0;
  padding-top: 15px;
}

.action-btn {
  color: #718096;
  font-size: 0.9em;
  cursor: pointer;
}

.drafts-section {
  margin-bottom: 25px;
}

.drafts-section h3 {
  color: #2d3748;
  margin-bottom: 15px;
}

.draft-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.draft-content p {
  margin: 0 0 5px 0;
  color: #2d3748;
}

.draft-content small {
  color: #718096;
}

.draft-actions {
  display: flex;
  gap: 8px;
}

.btn-small {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.85em;
  cursor: pointer;
  background: #e2e8f0;
  color: #4a5568;
}

.btn-small:hover {
  background: #cbd5e0;
}

.btn-danger {
  background: #feb2b2;
  color: #c53030;
}

.btn-danger:hover {
  background: #fc8181;
}

.status-message {
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  margin-top: 20px;
}

.status-message.success {
  background: #c6f6d5;
  color: #2f855a;
  border: 1px solid #9ae6b4;
}

.status-message.error {
  background: #fed7d7;
  color: #c53030;
  border: 1px solid #feb2b2;
}

/* Responsividade Avançada */
@media (max-width: 1024px) {
  .publish-container {
    max-width: 100%;
    padding: clamp(16px, 4vw, 24px);
  }
}

@media (max-width: 768px) {
  .publish-container {
    padding: 12px;
  }
  
  .publish-header h2 {
    font-size: clamp(1.5rem, 5vw, 2rem);
  }
  
  .content-type-selector {
    flex-direction: column;
    gap: 8px;
  }
  
  .type-btn {
    width: 100%;
    padding: 12px;
    font-size: 16px;
  }
  
  .post-textarea {
    min-height: 120px;
    font-size: 16px; /* Evita zoom no iOS */
  }
  
  .form-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .btn {
    width: 100%;
    padding: 14px;
    font-size: 16px;
  }
  
  .draft-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
  }
  
  .draft-actions {
    width: 100%;
    justify-content: flex-end;
    gap: 8px;
  }
  
  .btn-small {
    padding: 8px 12px;
    font-size: 14px;
  }
  
  .preview-card {
    margin: 0 -12px;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
  
  .image-preview {
    max-width: 100%;
  }
  
  .preview-img {
    max-width: 100%;
    max-height: 250px;
  }
}

@media (max-width: 480px) {
  .publish-container {
    padding: 8px;
  }
  
  .publish-header {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .publish-header h2 {
    font-size: 1.5rem;
    margin-bottom: 8px;
  }
  
  .publish-header p {
    font-size: 14px;
  }
  
  .content-type-selector {
    margin-bottom: 20px;
  }
  
  .type-btn {
    padding: 14px;
    font-size: 15px;
  }
  
  .post-textarea {
    font-size: 16px;
    padding: 14px;
  }
  
  .category-select {
    font-size: 16px;
    padding: 12px;
  }
  
  .upload-btn {
    width: 100%;
    padding: 14px;
    margin-bottom: 12px;
  }
  
  .char-count {
    font-size: 13px;
  }
  
  .draft-content p {
    font-size: 14px;
    line-height: 1.4;
  }
  
  .draft-content small {
    font-size: 12px;
  }
}
</style>