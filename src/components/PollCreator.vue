<template>
  <div class="poll-creator">
    <div class="creator-header">
      <h3>Criar Enquete</h3>
      <button @click="$emit('close')" class="close-btn">&times;</button>
    </div>

    <div class="creator-content">
      <!-- Pergunta da Enquete -->
      <div class="question-section">
        <label>Pergunta</label>
        <textarea 
          v-model="question" 
          placeholder="Digite sua pergunta..."
          maxlength="280"
          rows="3"
        ></textarea>
        <div class="char-count">{{ 280 - question.length }} caracteres restantes</div>
      </div>

      <!-- Opções da Enquete -->
      <div class="options-section">
        <label>Opções</label>
        <div 
          v-for="(option, index) in options" 
          :key="index"
          class="option-input"
        >
          <input 
            v-model="options[index]" 
            :placeholder="`Opção ${index + 1}`"
            maxlength="80"
          />
          <button 
            v-if="options.length > 2"
            @click="removeOption(index)"
            class="remove-option-btn"
          >
            &times;
          </button>
        </div>
        
        <button 
          v-if="options.length < 4"
          @click="addOption"
          class="add-option-btn"
        >
          + Adicionar Opção
        </button>
      </div>

      <!-- Configurações -->
      <div class="settings-section">
        <div class="setting-item">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="settings.allowMultiple"
            />
            <span class="checkmark"></span>
            Permitir múltiplas escolhas
          </label>
        </div>

        <div class="setting-item">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="settings.showResults"
            />
            <span class="checkmark"></span>
            Mostrar resultados em tempo real
          </label>
        </div>

        <div class="setting-item">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="settings.anonymous"
            />
            <span class="checkmark"></span>
            Votação anônima
          </label>
        </div>

        <div class="setting-item">
          <label>Duração da enquete</label>
          <select v-model="settings.duration">
            <option value="1">1 hora</option>
            <option value="6">6 horas</option>
            <option value="24">1 dia</option>
            <option value="168">7 dias</option>
            <option value="720">30 dias</option>
          </select>
        </div>
      </div>

      <!-- Preview -->
      <div v-if="isValidPoll" class="preview-section">
        <h4>Preview</h4>
        <div class="poll-preview">
          <div class="preview-question">{{ question }}</div>
          <div class="preview-options">
            <div 
              v-for="(option, index) in validOptions" 
              :key="index"
              class="preview-option"
            >
              <div class="option-bar">
                <span class="option-text">{{ option }}</span>
                <span class="option-percentage">0%</span>
              </div>
              <div class="option-progress">
                <div class="progress-bar" :style="{ width: '0%' }"></div>
              </div>
            </div>
          </div>
          <div class="preview-meta">
            <span>0 votos</span>
            <span>Expira em {{ settings.duration }}h</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Ações -->
    <div class="creator-actions">
      <button @click="$emit('close')" class="cancel-btn">Cancelar</button>
      <button 
        @click="createPoll" 
        :disabled="!isValidPoll"
        class="create-btn"
        :class="{ disabled: !isValidPoll }"
      >
        Criar Enquete
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PollCreator',
  data() {
    return {
      question: '',
      options: ['', ''],
      settings: {
        allowMultiple: false,
        showResults: true,
        anonymous: false,
        duration: 24 // horas
      }
    }
  },
  computed: {
    validOptions() {
      return this.options.filter(option => option.trim())
    },
    isValidPoll() {
      return this.question.trim() && 
             this.validOptions.length >= 2 && 
             this.validOptions.every(option => option.length <= 80)
    }
  },
  methods: {
    addOption() {
      if (this.options.length < 4) {
        this.options.push('')
      }
    },
    removeOption(index) {
      if (this.options.length > 2) {
        this.options.splice(index, 1)
      }
    },
    createPoll() {
      if (!this.isValidPoll) return

      const poll = {
        id: Date.now(),
        question: this.question.trim(),
        options: this.validOptions.map(option => ({
          text: option.trim(),
          votes: 0,
          voters: []
        })),
        settings: { ...this.settings },
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.settings.duration * 60 * 60 * 1000).toISOString(),
        totalVotes: 0,
        createdBy: 'current_user', // Será substituído pelo ID do usuário atual
        active: true
      }

      this.$emit('poll-created', poll)
      this.resetForm()
    },
    resetForm() {
      this.question = ''
      this.options = ['', '']
      this.settings = {
        allowMultiple: false,
        showResults: true,
        anonymous: false,
        duration: 24
      }
    }
  }
}
</script>

<style scoped>
.poll-creator {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.creator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.creator-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.creator-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.question-section {
  margin-bottom: 25px;
}

.question-section label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
}

.question-section textarea {
  width: 100%;
  border: 2px solid #e1e8ed;
  border-radius: 12px;
  padding: 12px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s ease;
}

.question-section textarea:focus {
  outline: none;
  border-color: #667eea;
}

.char-count {
  font-size: 12px;
  color: #666;
  text-align: right;
  margin-top: 5px;
}

.options-section {
  margin-bottom: 25px;
}

.options-section label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  font-size: 14px;
}

.option-input {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.option-input input {
  flex: 1;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.option-input input:focus {
  outline: none;
  border-color: #667eea;
}

.remove-option-btn {
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-option-btn:hover {
  background: #ff3742;
  transform: scale(1.1);
}

.add-option-btn {
  background: #f8f9fa;
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 10px;
  width: 100%;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.add-option-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
  color: #495057;
}

.settings-section {
  margin-bottom: 25px;
}

.setting-item {
  margin-bottom: 15px;
}

.setting-item label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  cursor: pointer;
  position: relative;
  padding-left: 30px;
  margin-bottom: 0 !important;
}

.checkbox-label input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  position: absolute;
  left: 0;
  width: 20px;
  height: 20px;
  background: #fff;
  border: 2px solid #ddd;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.checkbox-label input:checked + .checkmark {
  background: #667eea;
  border-color: #667eea;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label input:checked + .checkmark:after {
  display: block;
}

.setting-item select {
  width: 100%;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.setting-item select:focus {
  outline: none;
  border-color: #667eea;
}

.preview-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
}

.preview-section h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.poll-preview {
  background: white;
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #e1e8ed;
}

.preview-question {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.preview-option {
  margin-bottom: 10px;
}

.option-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.option-text {
  font-size: 14px;
  color: #333;
}

.option-percentage {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
}

.option-progress {
  height: 8px;
  background: #e1e8ed;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.preview-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  font-size: 12px;
  color: #666;
}

.creator-actions {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

.cancel-btn,
.create-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #f8f9fa;
  color: #666;
  border: 2px solid #e1e8ed;
}

.cancel-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.create-btn {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.create-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.create-btn.disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Responsivo */
@media (max-width: 768px) {
  .poll-creator {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .creator-header,
  .creator-content,
  .creator-actions {
    padding: 15px;
  }
  
  .creator-header h3 {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .creator-actions {
    flex-direction: column;
  }
  
  .option-input {
    flex-direction: column;
    align-items: stretch;
    gap: 5px;
  }
  
  .remove-option-btn {
    align-self: flex-end;
  }
}
</style>
