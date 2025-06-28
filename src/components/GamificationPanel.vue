<template>
  <div class="gamification-panel">
    <!-- Header com pontos e nível -->
    <div class="game-header">
      <div class="level-info">
        <div class="level-badge" :style="{ backgroundColor: currentBadge.color }">
          <span class="level-icon">{{ currentBadge.icon }}</span>
          <span class="level-number">{{ gameData.level }}</span>
        </div>
        <div class="level-details">
          <h3>{{ currentBadge.name }}</h3>
          <p>{{ gameData.totalPoints }} pontos</p>
        </div>
      </div>
      <button @click="showLeaderboard = !showLeaderboard" class="leaderboard-btn">
        🏆 Ranking
      </button>
    </div>

    <!-- Barra de progresso do nível -->
    <div class="level-progress-container">
      <div class="progress-info">
        <span>Nível {{ levelProgress.currentLevel }}</span>
        <span v-if="nextBadge">{{ levelProgress.pointsToNextLevel }} para {{ nextBadge.name }}</span>
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: levelProgress.levelProgress + '%' }"
        ></div>
      </div>
    </div>

    <!-- Conquistas recentes -->
    <div v-if="recentAchievements.length > 0" class="recent-achievements">
      <h4>🎉 Conquistas Recentes</h4>
      <div class="achievements-list">
        <div 
          v-for="achievement in recentAchievements" 
          :key="achievement.id"
          class="achievement-item"
        >
          <span class="achievement-icon">{{ achievement.icon }}</span>
          <div class="achievement-info">
            <strong>{{ achievement.name }}</strong>
            <p>{{ achievement.description }}</p>
            <span class="points">+{{ achievement.points }} pontos</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Estatísticas -->
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-icon">📝</span>
        <span class="stat-value">{{ gameData.stats.postsCreated }}</span>
        <span class="stat-label">Posts</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">❤️</span>
        <span class="stat-value">{{ gameData.stats.likesReceived }}</span>
        <span class="stat-label">Curtidas</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">📱</span>
        <span class="stat-value">{{ gameData.stats.storiesCreated }}</span>
        <span class="stat-label">Stories</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">🗳️</span>
        <span class="stat-value">{{ gameData.stats.pollsCreated }}</span>
        <span class="stat-label">Enquetes</span>
      </div>
    </div>

    <!-- Badges coletadas -->
    <div class="badges-section">
      <h4>🏅 Badges</h4>
      <div class="badges-grid">
        <div 
          v-for="badge in allBadges" 
          :key="badge.id"
          class="badge-item"
          :class="{ unlocked: gameData.badges.includes(badge.id) }"
          :title="badge.description"
        >
          <span class="badge-icon">{{ badge.icon }}</span>
          <span class="badge-name">{{ badge.name }}</span>
          <span v-if="!gameData.badges.includes(badge.id)" class="badge-points">
            {{ badge.minPoints }} pts
          </span>
        </div>
      </div>
    </div>

    <!-- Ranking (Modal) -->
    <div v-if="showLeaderboard" class="leaderboard-modal" @click="showLeaderboard = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>🏆 Ranking</h3>
          <button @click="showLeaderboard = false" class="close-btn">&times;</button>
        </div>
        
        <div class="ranking-tabs">
          <button 
            v-for="tab in rankingTabs" 
            :key="tab.id"
            @click="currentRankingTab = tab.id"
            :class="{ active: currentRankingTab === tab.id }"
            class="tab-btn"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="ranking-list">
          <div 
            v-for="(player, index) in currentRanking" 
            :key="player.userId"
            class="ranking-item"
            :class="{ 'current-user': player.userId === currentUserId }"
          >
            <span class="position">{{ index + 1 }}°</span>
            <span class="username">{{ player.username }}</span>
            <span class="points">{{ player.points }} pts</span>
            <span class="level">Nv{{ player.level }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import gamificationService from '../services/gamificationService.js'

export default {
  name: 'GamificationPanel',
  props: {
    userId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      gameData: {},
      currentBadge: {},
      nextBadge: null,
      levelProgress: {},
      recentAchievements: [],
      allBadges: [],
      showLeaderboard: false,
      currentRankingTab: 'total',
      rankingTabs: [
        { id: 'total', label: 'Geral' },
        { id: 'weekly', label: 'Semanal' },
        { id: 'monthly', label: 'Mensal' }
      ],
      rankings: {
        total: [],
        weekly: [],
        monthly: []
      },
      currentUserId: 1
    }
  },
  computed: {
    currentRanking() {
      return this.rankings[this.currentRankingTab] || []
    }
  },
  methods: {
    loadGameData() {
      this.gameData = gamificationService.getUserGameData(this.userId)
      this.currentBadge = gamificationService.getCurrentBadge(this.userId)
      this.nextBadge = gamificationService.getNextBadge(this.userId)
      this.levelProgress = gamificationService.getLevelProgress(this.userId)
      this.allBadges = gamificationService.getBadges()
      this.currentUserId = gamificationService.getCurrentUserId()
      
      // Simula conquistas recentes (últimas 3)
      this.recentAchievements = gamificationService.getAchievements()
        .filter(achievement => this.gameData.achievements.includes(achievement.id))
        .slice(-3)
    },
    loadRankings() {
      this.rankings.total = gamificationService.getLeaderboard('total', 10)
      this.rankings.weekly = gamificationService.getLeaderboard('weekly', 10)
      this.rankings.monthly = gamificationService.getLeaderboard('monthly', 10)
    },
    simulateAction(action) {
      // Para demonstração
      gamificationService.processAction(action, this.userId)
      this.loadGameData()
    }
  },
  mounted() {
    this.loadGameData()
    this.loadRankings()

    // Escuta eventos de gamificação
    window.addEventListener('gamification', (event) => {
      const { type, data } = event.detail
      
      if (type === 'pointsAdded' || type === 'newAchievements' || type === 'newBadges') {
        this.loadGameData()
        this.loadRankings()
      }
    })
  }
}
</script>

<style scoped>
.gamification-panel {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.level-badge {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  position: relative;
}

.level-icon {
  font-size: 20px;
}

.level-number {
  font-size: 12px;
  position: absolute;
  bottom: 8px;
}

.level-details h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.level-details p {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 14px;
}

.leaderboard-btn {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.leaderboard-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.level-progress-container {
  margin-bottom: 25px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.progress-bar {
  height: 8px;
  background: #e1e8ed;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.recent-achievements {
  margin-bottom: 25px;
}

.recent-achievements h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.achievement-icon {
  font-size: 24px;
}

.achievement-info {
  flex: 1;
}

.achievement-info strong {
  color: #333;
  font-size: 14px;
}

.achievement-info p {
  margin: 2px 0;
  color: #666;
  font-size: 12px;
}

.points {
  color: #667eea;
  font-weight: 600;
  font-size: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 25px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.stat-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.badges-section h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid #e1e8ed;
  text-align: center;
  transition: all 0.2s ease;
  opacity: 0.5;
}

.badge-item.unlocked {
  opacity: 1;
  border-color: #667eea;
  background: #f0f7ff;
}

.badge-item:hover {
  transform: translateY(-2px);
}

.badge-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.badge-name {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.badge-points {
  font-size: 10px;
  color: #666;
}

.leaderboard-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 5px;
}

.ranking-tabs {
  display: flex;
  padding: 0 20px;
  border-bottom: 1px solid #eee;
}

.tab-btn {
  background: none;
  border: none;
  padding: 15px 20px;
  cursor: pointer;
  color: #666;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.ranking-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: background-color 0.2s ease;
}

.ranking-item:hover {
  background: #f8f9fa;
}

.ranking-item.current-user {
  background: #f0f7ff;
  border: 2px solid #667eea;
}

.position {
  font-weight: bold;
  color: #667eea;
  min-width: 30px;
}

.username {
  flex: 1;
  font-weight: 500;
  color: #333;
}

.points {
  color: #666;
  font-size: 14px;
}

.level {
  background: #667eea;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

/* Responsivo */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .badges-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .game-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .modal-content {
    width: 95%;
    margin: 10px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .ranking-item {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .level-info {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
}
</style>
