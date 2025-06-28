/**
 * 🎯 Serviço de Curtidas - IF Wave
 * Gerencia sistema de likes em posts, stories e comentários
 */

class LikeService {
  constructor() {
    this.likes = this.loadLikes();
    this.userLikes = this.loadUserLikes();
  }

  // Carrega curtidas do localStorage
  loadLikes() {
    const stored = localStorage.getItem('if_wave_likes');
    return stored ? JSON.parse(stored) : {};
  }

  // Carrega likes do usuário atual
  loadUserLikes() {
    const stored = localStorage.getItem('if_wave_user_likes');
    return stored ? JSON.parse(stored) : {};
  }

  // Salva curtidas no localStorage
  saveLikes() {
    localStorage.setItem('if_wave_likes', JSON.stringify(this.likes));
    localStorage.setItem('if_wave_user_likes', JSON.stringify(this.userLikes));
  }

  // Curtir/descurtir um post
  toggleLike(postId, userId) {
    if (!postId || !userId) {
      console.error('PostId e UserId são obrigatórios');
      return false;
    }

    const likeKey = `${postId}`;
    const userKey = `${userId}_${postId}`;
    
    // Inicializa contadores se não existirem
    if (!this.likes[likeKey]) {
      this.likes[likeKey] = 0;
    }

    // Verifica se usuário já curtiu
    const alreadyLiked = this.userLikes[userKey];

    if (alreadyLiked) {
      // Remove like
      this.likes[likeKey] = Math.max(0, this.likes[likeKey] - 1);
      delete this.userLikes[userKey];
    } else {
      // Adiciona like
      this.likes[likeKey] += 1;
      this.userLikes[userKey] = {
        timestamp: new Date().toISOString(),
        postId,
        userId
      };
    }

    this.saveLikes();
    
    // Emite evento para atualizações em tempo real
    this.emitLikeEvent(postId, this.likes[likeKey], !alreadyLiked);
    
    return {
      liked: !alreadyLiked,
      totalLikes: this.likes[likeKey]
    };
  }

  // Obtém número de curtidas de um post
  getLikes(postId) {
    return this.likes[postId] || 0;
  }

  // Verifica se usuário curtiu um post
  isLiked(postId, userId) {
    const userKey = `${userId}_${postId}`;
    return !!this.userLikes[userKey];
  }

  // Obtém estatísticas de likes
  getLikeStats(postId) {
    const totalLikes = this.getLikes(postId);
    const likers = Object.values(this.userLikes)
      .filter(like => like.postId === postId)
      .map(like => like.userId);

    return {
      total: totalLikes,
      likers,
      isPopular: totalLikes >= 10,
      isViral: totalLikes >= 50
    };
  }

  // Obtém posts mais curtidos
  getMostLiked(limit = 10) {
    return Object.entries(this.likes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([postId, likes]) => ({ postId, likes }));
  }

  // Obtém likes de um usuário
  getUserLikes(userId) {
    return Object.values(this.userLikes)
      .filter(like => like.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Remove like de um post (para moderação)
  removeLike(postId, userId) {
    const userKey = `${userId}_${postId}`;
    const likeKey = `${postId}`;
    
    if (this.userLikes[userKey]) {
      delete this.userLikes[userKey];
      this.likes[likeKey] = Math.max(0, (this.likes[likeKey] || 1) - 1);
      this.saveLikes();
      return true;
    }
    return false;
  }

  // Limpa todas as curtidas (para reset/teste)
  clearAllLikes() {
    this.likes = {};
    this.userLikes = {};
    this.saveLikes();
  }

  // Emite evento de like para sistema real-time
  emitLikeEvent(postId, totalLikes, isLiked) {
    // Integração com realTimeService se disponível
    if (window.realTimeService) {
      window.realTimeService.emit('like_update', {
        postId,
        totalLikes,
        isLiked,
        timestamp: new Date().toISOString()
      });
    }

    // Evento customizado para outros componentes
    window.dispatchEvent(new CustomEvent('likeUpdate', {
      detail: { postId, totalLikes, isLiked }
    }));
  }

  // Sistema de reações diversas (😍, 😂, 😢, etc.)
  toggleReaction(postId, userId, reactionType = 'like') {
    const validReactions = ['like', 'love', 'laugh', 'sad', 'angry', 'wow'];
    
    if (!validReactions.includes(reactionType)) {
      console.error('Tipo de reação inválido:', reactionType);
      return false;
    }

    const reactionKey = `${postId}_${reactionType}`;
    const userReactionKey = `${userId}_${postId}_reaction`;
    
    // Inicializa contadores
    if (!this.likes[reactionKey]) {
      this.likes[reactionKey] = 0;
    }

    // Remove reação anterior do usuário se existir
    const previousReaction = this.userLikes[userReactionKey];
    if (previousReaction) {
      const prevKey = `${postId}_${previousReaction.type}`;
      this.likes[prevKey] = Math.max(0, (this.likes[prevKey] || 1) - 1);
    }

    // Adiciona nova reação
    this.likes[reactionKey] += 1;
    this.userLikes[userReactionKey] = {
      type: reactionType,
      timestamp: new Date().toISOString(),
      postId,
      userId
    };

    this.saveLikes();
    
    return {
      reactionType,
      total: this.likes[reactionKey],
      allReactions: this.getReactionStats(postId)
    };
  }

  // Obtém estatísticas de todas as reações
  getReactionStats(postId) {
    const reactions = {};
    const validReactions = ['like', 'love', 'laugh', 'sad', 'angry', 'wow'];
    
    validReactions.forEach(type => {
      const key = `${postId}_${type}`;
      reactions[type] = this.likes[key] || 0;
    });

    return reactions;
  }
}

// Instância global do serviço
const likeService = new LikeService();

export default likeService;
