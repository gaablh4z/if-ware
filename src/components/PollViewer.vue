<template>
  <div class="poll-viewer" :class="{ 'results-mode': showResults }">
    <!-- Cabeçalho da Enquete -->
    <div class="poll-header">
      <div class="poll-author">
        <div class="author-avatar" :style="{ backgroundImage: `url(${poll.author?.avatar || '/default-avatar.png'})` }"></div>
        <div class="author-info">
          <span class="author-name">{{ poll.author?.username || 'Usuário' }}</span>
          <span class="poll-time">{{ formatTime(poll.createdAt) }}</span>
        </div>
      </div>
      <div class="poll-status" :class="{ expired: isExpired, active: !isExpired }">
        <span v-if="isExpired">Expirada</span>
        <span v-else>{{ timeRemaining }}</span>
      </div>
    </div>

    <!-- Pergunta da Enquete -->
    <div class="poll-question">
      {{ poll.question }}
    </div>

    <!-- Opções da Enquete -->
    <div class="poll-options">
      <div 
        v-for="(option, index) in poll.options" 
        :key="index"
        class="poll-option"
        :class="{ 
          selected: selectedOptions.includes(index),
          voted: hasVoted,
          'show-results': showResults,
          disabled: isExpired || (hasVoted && !poll.settings.allowMultiple)
        }"
        @click="!isExpired && (!hasVoted || poll.settings.allowMultiple) && toggleOption(index)"
      >
        <!-- Modo Votação -->
        <div v-if="!showResults" class="option-content">
          <div class="option-selector">
            <input 
              :type="poll.settings.allowMultiple ? 'checkbox' : 'radio'"
              :checked="selectedOptions.includes(index)"
              readonly
            />
          </div>
          <span class="option-text">{{ option.text }}</span>
        </div>

        <!-- Modo Resultados -->
        <div v-else class="option-results">
          <div class="option-bar">
            <div class="option-info">
              <span class="option-text">{{ option.text }}</span>
              <span class="option-stats">
                <span class="percentage">{{ getPercentage(option.votes) }}%</span>
                <span class="votes">{{ option.votes }} {{ option.votes === 1 ? 'voto' : 'votos' }}</span>
              </span>
            </div>
          </div>
          <div class="option-progress">
            <div 
              class="progress-bar" 
              :style="{ 
                width: getPercentage(option.votes) + '%',
                background: getOptionColor(index)
              }"
            ></div>
          </div>
          <div v-if="userVoted(index)" class="user-voted-indicator">✓</div>
        </div>
      </div>
    </div>

    <!-- Ações da Enquete -->
    <div class="poll-actions">
      <div class="poll-meta">
        <span class="total-votes">{{ poll.totalVotes }} {{ poll.totalVotes === 1 ? 'voto' : 'votos' }}</span>
        <button 
          v-if="!showResults && poll.settings.showResults"
          @click="toggleResults"
          class="toggle-results-btn"
        >
          Ver resultados
        </button>
        <button 
          v-else-if="showResults && !isExpired"
          @click="toggleResults"
          class="toggle-results-btn"
        >
          Voltar para votação
        </button>
      </div>

      <div class="poll-controls">
        <button 
          v-if="!hasVoted && !isExpired && selectedOptions.length > 0"
          @click="submitVote"
          class="vote-btn"
          :disabled="selectedOptions.length === 0"
        >
          Votar
        </button>
        
        <button 
          v-if="hasVoted && !isExpired && poll.settings.allowMultiple"
          @click="changeVote"
          class="change-vote-btn"
        >
          Alterar voto
        </button>

        <button @click="sharePoll" class="share-btn" title="Compartilhar enquete">
          📤
        </button>
      </div>
    </div>

    <!-- Lista de Votantes (se não for anônima) -->
    <div v-if="showVoters && !poll.settings.anonymous" class="voters-list">
      <h4>Quem votou:</h4>
      <div class="voters">
        <div 
          v-for="voter in getUniqueVoters()" 
          :key="voter.id"
          class="voter"
          :title="voter.username"
        >
          <div class="voter-avatar" :style="{ backgroundImage: `url(${voter.avatar || '/default-avatar.png'})` }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PollViewer',
  props: {
    poll: {
      type: Object,
      required: true
    },
    currentUser: {
      type: Object,
      default: () => ({ id: 1, username: 'você', avatar: null })
    }
  },
  data() {
    return {
      selectedOptions: [],
      showResults: false,
      showVoters: false,
      currentTime: new Date()
    }
  },
  computed: {
    isExpired() {
      return new Date(this.poll.expiresAt) < this.currentTime
    },
    hasVoted() {
      return this.poll.options.some(option => 
        option.voters.some(voter => voter.id === this.currentUser.id)
      )
    },
    timeRemaining() {
      const now = this.currentTime
      const expires = new Date(this.poll.expiresAt)
      const diff = expires - now

      if (diff <= 0) return 'Expirada'

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 24) {
        const days = Math.floor(hours / 24)
        return `${days}d ${hours % 24}h restantes`
      } else if (hours > 0) {
        return `${hours}h ${minutes}m restantes`
      } else {
        return `${minutes}m restantes`
      }
    },
    userVotes() {
      return this.poll.options
        .map((option, index) => ({ index, voters: option.voters }))
        .filter(option => option.voters.some(voter => voter.id === this.currentUser.id))
        .map(option => option.index)
    }
  },
  methods: {
    toggleOption(index) {
      if (this.poll.settings.allowMultiple) {
        const optionIndex = this.selectedOptions.indexOf(index)
        if (optionIndex > -1) {
          this.selectedOptions.splice(optionIndex, 1)
        } else {
          this.selectedOptions.push(index)
        }
      } else {
        this.selectedOptions = [index]
      }
    },
    submitVote() {
      if (this.selectedOptions.length === 0 || this.isExpired) return

      // Emite evento com os dados do voto para o componente pai
      this.$emit('vote', {
        pollId: this.poll.id,
        optionIndexes: this.selectedOptions,
        user: this.currentUser
      })

      // Mostra resultados automaticamente
      if (this.poll.settings.showResults) {
        this.showResults = true
      }
    },
    changeVote() {
      // Emite evento para alterar voto
      this.$emit('change-vote', {
        pollId: this.poll.id,
        user: this.currentUser
      })

      this.selectedOptions = []
      this.showResults = false
    },
    toggleResults() {
      this.showResults = !this.showResults
    },
    getPercentage(votes) {
      if (this.poll.totalVotes === 0) return 0
      return Math.round((votes / this.poll.totalVotes) * 100)
    },
    getOptionColor(index) {
      const colors = [
        'linear-gradient(45deg, #667eea, #764ba2)',
        'linear-gradient(45deg, #f093fb, #f5576c)',
        'linear-gradient(45deg, #4facfe, #00f2fe)',
        'linear-gradient(45deg, #43e97b, #38f9d7)'
      ]
      return colors[index % colors.length]
    },
    userVoted(optionIndex) {
      if (this.poll.settings.anonymous) return false
      return this.poll.options[optionIndex].voters.some(voter => voter.id === this.currentUser.id)
    },
    getUniqueVoters() {
      const allVoters = []
      this.poll.options.forEach(option => {
        option.voters.forEach(voter => {
          if (!allVoters.find(v => v.id === voter.id)) {
            allVoters.push(voter)
          }
        })
      })
      return allVoters
    },
    formatTime(timeString) {
      const time = new Date(timeString)
      const now = new Date()
      const diff = now - time

      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))

      if (days > 0) return `${days}d`
      if (hours > 0) return `${hours}h`
      if (minutes > 0) return `${minutes}m`
      return 'agora'
    },
    sharePoll() {
      if (navigator.share) {
        navigator.share({
          title: 'Enquete: ' + this.poll.question,
          text: `Vote nesta enquete: ${this.poll.question}`,
          url: window.location.href
        })
      } else {
        // Fallback para cópia do link
        navigator.clipboard.writeText(window.location.href)
        // Aqui você pode adicionar um toast/notificação
        alert('Link da enquete copiado!')
      }
    },
    savePollToStorage() {
      // Método removido - agora o componente pai gerencia o estado
    }
  },
  mounted() {
    // Atualiza o tempo a cada minuto
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date()
    }, 60000)

    // Define resultados visíveis se a enquete expirou
    if (this.isExpired || this.hasVoted) {
      this.showResults = true
    }

    // Pré-seleciona votos do usuário
    this.selectedOptions = this.userVotes
  },
  beforeUnmount() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval)
    }
  }
}
</script>

<style scoped>
.poll-viewer {
  background: white;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.poll-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.poll-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-color: #f0f0f0;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.poll-time {
  font-size: 12px;
  color: #666;
}

.poll-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.poll-status.active {
  background: #e8f5e8;
  color: #2d7d32;
}

.poll-status.expired {
  background: #ffeaa7;
  color: #d63031;
}

.poll-question {
  padding: 20px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.poll-options {
  padding: 0 20px;
}

.poll-option {
  margin-bottom: 12px;
  border: 2px solid #e1e8ed;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  position: relative;
}

.poll-option:not(.disabled):hover {
  border-color: #667eea;
  transform: translateY(-1px);
}

.poll-option.selected {
  border-color: #667eea;
  background: #f8f9ff;
}

.poll-option.voted {
  cursor: default;
}

.poll-option.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.option-content {
  display: flex;
  align-items: center;
  padding: 15px;
  gap: 12px;
}

.option-selector input[type="radio"],
.option-selector input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.option-text {
  font-size: 16px;
  color: #333;
  flex: 1;
}

.option-results {
  padding: 15px;
  position: relative;
}

.option-bar {
  margin-bottom: 8px;
}

.option-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.option-stats {
  display: flex;
  gap: 10px;
  font-size: 14px;
}

.percentage {
  font-weight: 600;
  color: #667eea;
}

.votes {
  color: #666;
}

.option-progress {
  height: 8px;
  background: #e1e8ed;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
  position: relative;
}

.user-voted-indicator {
  position: absolute;
  top: 15px;
  right: 15px;
  color: #667eea;
  font-size: 18px;
  font-weight: bold;
}

.poll-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid #eee;
  flex-wrap: wrap;
  gap: 10px;
}

.poll-meta {
  display: flex;
  align-items: center;
  gap: 15px;
}

.total-votes {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.toggle-results-btn {
  background: none;
  border: none;
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.toggle-results-btn:hover {
  background: #f8f9ff;
}

.poll-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.vote-btn,
.change-vote-btn {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.vote-btn:hover:not(:disabled),
.change-vote-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.vote-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.change-vote-btn {
  background: #ff6b6b;
}

.change-vote-btn:hover {
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

.share-btn {
  background: #f8f9fa;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
}

.share-btn:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.voters-list {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  background: #f8f9fa;
}

.voters-list h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
}

.voters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.voter {
  display: flex;
  align-items: center;
}

.voter-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-color: #ddd;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

/* Responsivo */
@media (max-width: 768px) {
  .poll-question {
    font-size: 16px;
    padding: 15px;
  }
  
  .poll-options {
    padding: 0 15px;
  }
  
  .poll-actions {
    padding: 12px 15px;
    flex-direction: column;
    align-items: stretch;
  }
  
  .poll-meta,
  .poll-controls {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .option-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .option-stats {
    justify-content: flex-start;
  }
  
  .poll-controls {
    flex-direction: column;
    width: 100%;
  }
  
  .vote-btn,
  .change-vote-btn {
    width: 100%;
  }
}
</style>
