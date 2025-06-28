/**
 * 🎮 Sistema de Gamificação - IF Wave
 * 
 * Gerencia pontos, badges, rankings e achievements
 */

class GamificationService {
  constructor() {
    this.achievements = this.getAchievements()
    this.pointsConfig = this.getPointsConfig()
    this.badges = this.getBadges()
  }

  // Configuração de pontos por ação
  getPointsConfig() {
    return {
      createPost: 10,
      likePost: 2,
      commentPost: 5,
      sharePost: 3,
      createStory: 8,
      viewStory: 1,
      createPoll: 15,
      votePoll: 3,
      dailyLogin: 5,
      profileComplete: 50,
      firstPost: 25,
      firstLike: 10,
      firstComment: 15,
      firstFollow: 20
    }
  }

  // Lista de achievements disponíveis
  getAchievements() {
    return [
      {
        id: 'first_post',
        name: 'Primeira Publicação',
        description: 'Publique seu primeiro post',
        icon: '📝',
        points: 25,
        category: 'social'
      },
      {
        id: 'early_bird',
        name: 'Madrugador',
        description: 'Faça login por 7 dias consecutivos',
        icon: '🌅',
        points: 100,
        category: 'engagement'
      },
      {
        id: 'social_butterfly',
        name: 'Borboleta Social',
        description: 'Receba 50 curtidas',
        icon: '🦋',
        points: 200,
        category: 'social'
      },
      {
        id: 'storyteller',
        name: 'Contador de Histórias',
        description: 'Crie 10 stories',
        icon: '📱',
        points: 150,
        category: 'content'
      },
      {
        id: 'pollster',
        name: 'Pesquisador',
        description: 'Crie 5 enquetes',
        icon: '🗳️',
        points: 120,
        category: 'content'
      },
      {
        id: 'explorer',
        name: 'Explorador',
        description: 'Visite todas as seções do app',
        icon: '🧭',
        points: 80,
        category: 'exploration'
      },
      {
        id: 'influencer',
        name: 'Influenciador',
        description: 'Tenha 100 seguidores',
        icon: '⭐',
        points: 500,
        category: 'social'
      },
      {
        id: 'completionist',
        name: 'Completista',
        description: 'Complete 100% do perfil',
        icon: '✅',
        points: 100,
        category: 'profile'
      },
      {
        id: 'night_owl',
        name: 'Coruja Noturna',
        description: 'Publique após às 22h',
        icon: '🦉',
        points: 30,
        category: 'engagement'
      },
      {
        id: 'trend_setter',
        name: 'Ditador de Tendências',
        description: 'Crie uma hashtag usada por 10+ pessoas',
        icon: '🔥',
        points: 300,
        category: 'content'
      }
    ]
  }

  // Lista de badges por nível
  getBadges() {
    return [
      {
        id: 'novice',
        name: 'Novato',
        description: 'Bem-vindo ao IF Wave!',
        icon: '🌱',
        minPoints: 0,
        color: '#22c55e'
      },
      {
        id: 'explorer',
        name: 'Explorador',
        description: 'Você está explorando bem!',
        icon: '🗺️',
        minPoints: 100,
        color: '#3b82f6'
      },
      {
        id: 'contributor',
        name: 'Contribuidor',
        description: 'Ativo na comunidade',
        icon: '🤝',
        minPoints: 300,
        color: '#8b5cf6'
      },
      {
        id: 'veteran',
        name: 'Veterano',
        description: 'Usuário experiente',
        icon: '🏆',
        minPoints: 600,
        color: '#f59e0b'
      },
      {
        id: 'master',
        name: 'Mestre',
        description: 'Expert do IF Wave',
        icon: '👑',
        minPoints: 1000,
        color: '#ef4444'
      },
      {
        id: 'legend',
        name: 'Lenda',
        description: 'Status lendário!',
        icon: '⚡',
        minPoints: 2000,
        color: '#a855f7'
      }
    ]
  }

  // Obtém dados de gamificação do usuário
  getUserGameData(userId = null) {
    const currentUserId = userId || this.getCurrentUserId()
    const saved = localStorage.getItem(`if_wave_game_data_${currentUserId}`)
    
    if (saved) {
      return JSON.parse(saved)
    }

    // Dados iniciais
    return {
      userId: currentUserId,
      totalPoints: 0,
      level: 1,
      achievements: [],
      badges: ['novice'],
      stats: {
        postsCreated: 0,
        likesReceived: 0,
        commentsReceived: 0,
        storiesCreated: 0,
        pollsCreated: 0,
        pollsVoted: 0,
        loginStreak: 0,
        lastLoginDate: null
      },
      weeklyPoints: 0,
      monthlyPoints: 0,
      lastWeeklyReset: new Date().toISOString(),
      lastMonthlyReset: new Date().toISOString()
    }
  }

  // Salva dados de gamificação
  saveUserGameData(gameData) {
    localStorage.setItem(`if_wave_game_data_${gameData.userId}`, JSON.stringify(gameData))
  }

  // Adiciona pontos ao usuário
  addPoints(userId, points, action = 'unknown') {
    const gameData = this.getUserGameData(userId)
    
    gameData.totalPoints += points
    gameData.weeklyPoints += points
    gameData.monthlyPoints += points
    
    // Atualiza nível baseado nos pontos
    gameData.level = this.calculateLevel(gameData.totalPoints)
    
    // Verifica se ganhou novos badges
    this.checkNewBadges(gameData)
    
    this.saveUserGameData(gameData)
    
    // Emite evento
    this.emitGameEvent('pointsAdded', {
      userId,
      points,
      action,
      totalPoints: gameData.totalPoints,
      level: gameData.level
    })

    return gameData
  }

  // Calcula nível baseado nos pontos
  calculateLevel(totalPoints) {
    // 100 pontos por nível inicialmente, aumentando gradualmente
    return Math.floor(Math.sqrt(totalPoints / 50)) + 1
  }

  // Verifica e adiciona novos badges
  checkNewBadges(gameData) {
    const currentBadges = gameData.badges
    const newBadges = []

    this.badges.forEach(badge => {
      if (gameData.totalPoints >= badge.minPoints && !currentBadges.includes(badge.id)) {
        currentBadges.push(badge.id)
        newBadges.push(badge)
      }
    })

    if (newBadges.length > 0) {
      this.emitGameEvent('newBadges', {
        userId: gameData.userId,
        badges: newBadges
      })
    }
  }

  // Verifica e desbloqueia achievements
  checkAchievements(userId, action, data = {}) {
    const gameData = this.getUserGameData(userId)
    const newAchievements = []

    this.achievements.forEach(achievement => {
      if (!gameData.achievements.includes(achievement.id)) {
        if (this.checkAchievementCondition(achievement, gameData, action, data)) {
          gameData.achievements.push(achievement.id)
          gameData.totalPoints += achievement.points
          newAchievements.push(achievement)
        }
      }
    })

    if (newAchievements.length > 0) {
      this.saveUserGameData(gameData)
      this.emitGameEvent('newAchievements', {
        userId,
        achievements: newAchievements
      })
    }

    return newAchievements
  }

  // Verifica condição específica de achievement
  checkAchievementCondition(achievement, gameData, action, data) {
    switch (achievement.id) {
      case 'first_post':
        return action === 'createPost' && gameData.stats.postsCreated === 1

      case 'early_bird':
        return gameData.stats.loginStreak >= 7

      case 'social_butterfly':
        return gameData.stats.likesReceived >= 50

      case 'storyteller':
        return gameData.stats.storiesCreated >= 10

      case 'pollster':
        return gameData.stats.pollsCreated >= 5

      case 'explorer':
        return this.hasVisitedAllSections(gameData)

      case 'influencer':
        return data.followers >= 100

      case 'completionist':
        return this.isProfileComplete(data.profile)

      case 'night_owl':
        const hour = new Date().getHours()
        return action === 'createPost' && hour >= 22

      case 'trend_setter':
        return data.hashtagUsage >= 10

      default:
        return false
    }
  }

  // Verifica se visitou todas as seções
  hasVisitedAllSections(gameData) {
    const requiredSections = ['home', 'search', 'publish', 'messages', 'profile']
    const visited = gameData.visitedSections || []
    return requiredSections.every(section => visited.includes(section))
  }

  // Verifica se o perfil está completo
  isProfileComplete(profile) {
    const requiredFields = ['name', 'bio', 'avatar', 'location']
    return requiredFields.every(field => profile && profile[field])
  }

  // Atualiza estatísticas do usuário
  updateStats(userId, statName, value = 1) {
    const gameData = this.getUserGameData(userId)
    
    if (!gameData.stats[statName]) {
      gameData.stats[statName] = 0
    }
    
    gameData.stats[statName] += value
    this.saveUserGameData(gameData)
    
    return gameData.stats[statName]
  }

  // Processa ação do usuário
  processAction(action, userId = null, data = {}) {
    const currentUserId = userId || this.getCurrentUserId()
    const points = this.pointsConfig[action] || 0
    
    if (points > 0) {
      this.addPoints(currentUserId, points, action)
    }

    // Atualiza estatísticas específicas
    switch (action) {
      case 'createPost':
        this.updateStats(currentUserId, 'postsCreated')
        break
      case 'likePost':
        this.updateStats(data.targetUserId, 'likesReceived')
        break
      case 'commentPost':
        this.updateStats(data.targetUserId, 'commentsReceived')
        break
      case 'createStory':
        this.updateStats(currentUserId, 'storiesCreated')
        break
      case 'createPoll':
        this.updateStats(currentUserId, 'pollsCreated')
        break
      case 'votePoll':
        this.updateStats(currentUserId, 'pollsVoted')
        break
    }

    // Verifica achievements
    this.checkAchievements(currentUserId, action, data)
  }

  // Obtém ranking de usuários
  getLeaderboard(type = 'total', limit = 10) {
    const rankings = []
    
    // Coleta dados de todos os usuários (simulado)
    for (let i = 1; i <= 100; i++) {
      const gameData = this.getUserGameData(i)
      if (gameData.totalPoints > 0) {
        rankings.push({
          userId: i,
          username: `user_${i}`,
          points: type === 'weekly' ? gameData.weeklyPoints : 
                  type === 'monthly' ? gameData.monthlyPoints : 
                  gameData.totalPoints,
          level: gameData.level,
          badges: gameData.badges,
          achievements: gameData.achievements.length
        })
      }
    }

    return rankings
      .sort((a, b) => b.points - a.points)
      .slice(0, limit)
  }

  // Obtém badge atual do usuário
  getCurrentBadge(userId = null) {
    const gameData = this.getUserGameData(userId)
    const userBadges = gameData.badges
    
    // Retorna o badge de maior nível
    let currentBadge = this.badges[0]
    this.badges.forEach(badge => {
      if (userBadges.includes(badge.id) && badge.minPoints > currentBadge.minPoints) {
        currentBadge = badge
      }
    })
    
    return currentBadge
  }

  // Obtém próximo badge
  getNextBadge(userId = null) {
    const gameData = this.getUserGameData(userId)
    const currentBadge = this.getCurrentBadge(userId)
    
    return this.badges.find(badge => badge.minPoints > currentBadge.minPoints) || null
  }

  // Resets periódicos
  checkResets() {
    const now = new Date()
    const gameData = this.getUserGameData()
    
    // Reset semanal (domingo)
    const lastWeeklyReset = new Date(gameData.lastWeeklyReset)
    if (now.getDay() === 0 && now.getDate() !== lastWeeklyReset.getDate()) {
      gameData.weeklyPoints = 0
      gameData.lastWeeklyReset = now.toISOString()
    }
    
    // Reset mensal
    const lastMonthlyReset = new Date(gameData.lastMonthlyReset)
    if (now.getMonth() !== lastMonthlyReset.getMonth()) {
      gameData.monthlyPoints = 0
      gameData.lastMonthlyReset = now.toISOString()
    }
    
    this.saveUserGameData(gameData)
  }

  // Utilitários
  getCurrentUserId() {
    const user = JSON.parse(localStorage.getItem('ifwave_current_user') || '{}')
    return user.id || 1
  }

  emitGameEvent(eventType, data) {
    const event = new CustomEvent('gamification', {
      detail: { type: eventType, data }
    })
    window.dispatchEvent(event)
  }

  // Obtém progresso para próximo nível
  getLevelProgress(userId = null) {
    const gameData = this.getUserGameData(userId)
    const currentLevelPoints = Math.pow(gameData.level - 1, 2) * 50
    const nextLevelPoints = Math.pow(gameData.level, 2) * 50
    const progress = ((gameData.totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100
    
    return {
      currentLevel: gameData.level,
      currentPoints: gameData.totalPoints,
      levelProgress: Math.min(Math.max(progress, 0), 100),
      pointsToNextLevel: nextLevelPoints - gameData.totalPoints
    }
  }
}

// Singleton instance
const gamificationService = new GamificationService()

// Auto-executa checks periódicos
if (typeof window !== 'undefined') {
  setInterval(() => {
    gamificationService.checkResets()
  }, 60000) // A cada minuto
}

export default gamificationService
