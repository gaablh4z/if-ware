<template>
  <div class="stories-creator" v-if="visible">
    <div class="creator-overlay" @click="closeCreator">
      <div class="creator-container" @click.stop>
        <div class="creator-header">
          <h2>Criar Story</h2>
          <button @click="closeCreator" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div class="creator-content">
          <!-- Upload de mídia -->
          <div class="media-upload" v-if="!selectedMedia">
            <div class="upload-area" @click="triggerFileInput" @drop="handleDrop" @dragover.prevent>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
              </svg>
              <p>Clique ou arraste uma foto/vídeo</p>
              <small>JPEG, PNG, MP4 - Máx 10MB</small>
            </div>
            
            <input 
              ref="fileInput"
              type="file"
              accept="image/*,video/*"
              @change="handleFileSelect"
              style="display: none"
            >
            
            <!-- Opções rápidas -->
            <div class="quick-options">
              <button @click="openCamera" class="option-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 15.5c1.93 0 3.5-1.57 3.5-3.5s-1.57-3.5-3.5-3.5-3.5 1.57-3.5 3.5 1.57 3.5 3.5 3.5zM17.5 9c.83 0 1.5-.67 1.5-1.5S18.33 6 17.5 6 16 6.67 16 7.5 16.67 9 17.5 9zM12 7c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5zM12 2l3.09 2.26L18 2l1.09 3.09L22 4l-1.91 2.91L22 10l-3.09 1.09L18 14l-2.91-1.91L12 14l-1.09-3.09L8 12l1.91-2.91L8 6l3.09-1.09L12 2z"/>
                </svg>
                Câmera
              </button>
              
              <button @click="createTextStory" class="option-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 4v3h5.5v12h3V7H19V4z"/>
                </svg>
                Texto
              </button>
            </div>
          </div>

          <!-- Preview da mídia -->
          <div class="media-preview" v-if="selectedMedia">
            <div class="preview-container">
              <img 
                v-if="mediaType === 'image'"
                :src="mediaPreview" 
                alt="Preview"
                class="preview-media"
              >
              
              <video 
                v-else-if="mediaType === 'video'"
                :src="mediaPreview"
                class="preview-media"
                controls
                muted
              ></video>
              
              <div v-else-if="mediaType === 'text'" class="text-story-preview" :style="textStoryStyle">
                <p>{{ storyText }}</p>
              </div>
              
              <!-- Overlay de texto -->
              <div class="text-overlay" v-if="mediaType !== 'text'">
                <textarea 
                  v-model="storyText"
                  placeholder="Adicione um texto..."
                  class="text-input"
                  maxlength="200"
                ></textarea>
              </div>
            </div>
            
            <!-- Ferramentas de edição -->
            <div class="editing-tools">
              <!-- Cor do texto para story de texto -->
              <div v-if="mediaType === 'text'" class="color-picker">
                <h4>Cor de fundo:</h4>
                <div class="color-options">
                  <div 
                    v-for="color in backgroundColors"
                    :key="color"
                    class="color-option"
                    :style="{ background: color }"
                    @click="selectBackgroundColor(color)"
                    :class="{ active: selectedBgColor === color }"
                  ></div>
                </div>
              </div>
              
              <!-- Duração personalizada -->
              <div class="duration-selector">
                <h4>Duração:</h4>
                <select v-model="storyDuration" class="duration-select">
                  <option value="3">3 segundos</option>
                  <option value="5">5 segundos</option>
                  <option value="7">7 segundos</option>
                  <option value="10">10 segundos</option>
                </select>
              </div>
              
              <!-- Privacidade -->
              <div class="privacy-selector">
                <h4>Privacidade:</h4>
                <select v-model="storyPrivacy" class="privacy-select">
                  <option value="public">Público</option>
                  <option value="friends">Apenas amigos</option>
                  <option value="close-friends">Amigos próximos</option>
                </select>
              </div>
            </div>
            
            <!-- Botões de ação -->
            <div class="action-buttons">
              <button @click="resetMedia" class="btn-secondary">
                Voltar
              </button>
              <button @click="publishStory" class="btn-primary" :disabled="!canPublish">
                <span v-if="publishing">Publicando...</span>
                <span v-else>Publicar Story</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Camera modal -->
        <div v-if="showCamera" class="camera-modal">
          <div class="camera-container">
            <video ref="videoElement" autoplay muted class="camera-video"></video>
            <canvas ref="canvasElement" style="display: none;"></canvas>
            
            <div class="camera-controls">
              <button @click="closeCamera" class="camera-btn secondary">
                Cancelar
              </button>
              <button @click="capturePhoto" class="camera-btn primary">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="3.2"/>
                  <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                </svg>
              </button>
              <button @click="switchCamera" class="camera-btn secondary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM9.5 8c.83 0 1.5.67 1.5 1.5S10.33 11 9.5 11 8 10.33 8 9.5 8.67 8 9.5 8zM17 15.5c0 .83-.67 1.5-1.5 1.5h-7c-.83 0-1.5-.67-1.5-1.5v-.5h10v.5z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StoriesCreator',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    currentUser: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      selectedMedia: null,
      mediaPreview: null,
      mediaType: null,
      storyText: '',
      storyDuration: 5,
      storyPrivacy: 'public',
      publishing: false,
      showCamera: false,
      cameraStream: null,
      facingMode: 'user', // 'user' para frontal, 'environment' para traseira
      selectedBgColor: '#667eea',
      backgroundColors: [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
        '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3',
        '#ff9a9e', '#fecfef', '#ffeaa7', '#fab1a0'
      ]
    }
  },
  computed: {
    canPublish() {
      return this.selectedMedia && !this.publishing && 
             (this.mediaType === 'text' ? this.storyText.trim() : true)
    },
    textStoryStyle() {
      return {
        background: this.selectedBgColor,
        color: this.getContrastColor(this.selectedBgColor)
      }
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        this.processFile(file)
      }
    },
    
    handleDrop(event) {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (file) {
        this.processFile(file)
      }
    },
    
    processFile(file) {
      // Validar arquivo
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        this.$emit('show-error', 'Arquivo muito grande. Máximo 10MB.')
        return
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm']
      if (!validTypes.includes(file.type)) {
        this.$emit('show-error', 'Tipo de arquivo não suportado.')
        return
      }
      
      this.selectedMedia = file
      this.mediaType = file.type.startsWith('image/') ? 'image' : 'video'
      
      // Criar preview
      const reader = new FileReader()
      reader.onload = (e) => {
        this.mediaPreview = e.target.result
      }
      reader.readAsDataURL(file)
    },
    
    async openCamera() {
      this.showCamera = true
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: this.facingMode },
          audio: false
        })
        
        this.cameraStream = stream
        this.$refs.videoElement.srcObject = stream
      } catch (error) {
        console.error('Erro ao acessar câmera:', error)
        this.$emit('show-error', 'Não foi possível acessar a câmera.')
        this.closeCamera()
      }
    },
    
    closeCamera() {
      this.showCamera = false
      if (this.cameraStream) {
        this.cameraStream.getTracks().forEach(track => track.stop())
        this.cameraStream = null
      }
    },
    
    capturePhoto() {
      const video = this.$refs.videoElement
      const canvas = this.$refs.canvasElement
      const context = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      context.drawImage(video, 0, 0)
      
      canvas.toBlob((blob) => {
        this.selectedMedia = blob
        this.mediaType = 'image'
        this.mediaPreview = canvas.toDataURL()
        this.closeCamera()
      }, 'image/jpeg', 0.8)
    },
    
    switchCamera() {
      this.facingMode = this.facingMode === 'user' ? 'environment' : 'user'
      this.closeCamera()
      this.openCamera()
    },
    
    createTextStory() {
      this.selectedMedia = true
      this.mediaType = 'text'
      this.storyText = ''
    },
    
    selectBackgroundColor(color) {
      this.selectedBgColor = color
    },
    
    getContrastColor(hexColor) {
      // Converte hex para RGB
      const r = parseInt(hexColor.slice(1, 3), 16)
      const g = parseInt(hexColor.slice(3, 5), 16)
      const b = parseInt(hexColor.slice(5, 7), 16)
      
      // Calcula luminância
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
      
      return luminance > 0.5 ? '#000000' : '#ffffff'
    },
    
    resetMedia() {
      this.selectedMedia = null
      this.mediaPreview = null
      this.mediaType = null
      this.storyText = ''
    },
    
    async publishStory() {
      if (!this.canPublish) return
      
      this.publishing = true
      
      try {
        const storyData = {
          id: Date.now().toString(),
          user: {
            id: this.currentUser.id,
            name: this.currentUser.name,
            avatar: this.currentUser.avatar || '/default-avatar.png'
          },
          type: this.mediaType,
          content: this.mediaType === 'text' ? null : this.mediaPreview,
          text: this.storyText,
          backgroundColor: this.mediaType === 'text' ? this.selectedBgColor : null,
          duration: this.storyDuration * 1000,
          privacy: this.storyPrivacy,
          timestamp: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
          likes: 0,
          viewers: [],
          replies: []
        }
        
        // Salvar no localStorage (em produção seria uma API)
        const existingStories = JSON.parse(localStorage.getItem('ifwave_stories') || '[]')
        existingStories.unshift(storyData)
        localStorage.setItem('ifwave_stories', JSON.stringify(existingStories))
        
        this.$emit('story-created', storyData)
        this.$emit('show-success', 'Story publicado com sucesso!')
        
        this.closeCreator()
        
      } catch (error) {
        console.error('Erro ao publicar story:', error)
        this.$emit('show-error', 'Erro ao publicar story. Tente novamente.')
      } finally {
        this.publishing = false
      }
    },
    
    closeCreator() {
      this.resetMedia()
      this.closeCamera()
      this.$emit('close')
    }
  },
  
  beforeUnmount() {
    this.closeCamera()
  }
}
</script>

<style scoped>
.stories-creator {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.9);
}

.creator-overlay {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.creator-container {
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.creator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.creator-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
}

.creator-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.media-upload {
  text-align: center;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 12px;
  padding: 40px 20px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 20px;
}

.upload-area:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.upload-area svg {
  color: #999;
  margin-bottom: 10px;
}

.upload-area p {
  margin: 10px 0 5px;
  font-size: 16px;
  color: #333;
}

.upload-area small {
  color: #666;
  font-size: 12px;
}

.quick-options {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.option-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px;
  background: #f8f9ff;
  border: 1px solid #e1e5f7;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  min-width: 80px;
}

.option-btn:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.media-preview {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-container {
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-media {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
}

.text-story-preview {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  position: relative;
}

.text-story-preview p {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  padding: 20px;
  margin: 0;
  word-break: break-word;
}

.text-overlay {
  position: absolute;
  bottom: 15px;
  left: 15px;
  right: 15px;
}

.text-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  color: white;
  font-size: 16px;
  resize: none;
  min-height: 40px;
  max-height: 120px;
}

.text-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.text-input:focus {
  outline: none;
  background: rgba(0, 0, 0, 0.8);
}

.editing-tools {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.editing-tools h4 {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.color-picker .color-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: #333;
  transform: scale(1.2);
}

.duration-select,
.privacy-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  width: 200px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-secondary {
  padding: 10px 20px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #eee;
}

.btn-primary {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.camera-modal {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000;
  display: flex;
  flex-direction: column;
}

.camera-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.camera-video {
  flex: 1;
  width: 100%;
  object-fit: cover;
}

.camera-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.8);
}

.camera-btn {
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-btn.primary {
  width: 70px;
  height: 70px;
}

.camera-btn.secondary {
  width: 50px;
  height: 50px;
}

.camera-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* Responsividade */
@media (max-width: 768px) {
  .creator-overlay {
    padding: 0;
  }
  
  .creator-container {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    max-height: none;
  }
  
  .quick-options {
    flex-direction: column;
    align-items: center;
  }
  
  .option-btn {
    flex-direction: row;
    width: 100%;
    max-width: 200px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn-secondary,
  .btn-primary {
    width: 100%;
  }
}
</style>
