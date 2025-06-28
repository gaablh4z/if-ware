/**
 * 💬 Serviço de Comentários - IF Wave
 * Gerencia sistema completo de comentários em posts, stories e enquetes
 */

class CommentService {
  constructor() {
    this.comments = this.loadComments();
    this.userSettings = this.loadUserSettings();
  }

  // Carrega comentários do localStorage
  loadComments() {
    const stored = localStorage.getItem('if_wave_comments');
    return stored ? JSON.parse(stored) : {};
  }

  // Carrega configurações do usuário
  loadUserSettings() {
    const stored = localStorage.getItem('if_wave_comment_settings');
    return stored ? JSON.parse(stored) : {
      notifications: true,
      autoTranslate: false,
      hideInappropriate: true
    };
  }

  // Salva comentários no localStorage
  saveComments() {
    localStorage.setItem('if_wave_comments', JSON.stringify(this.comments));
  }

  // Adiciona um novo comentário
  addComment(postId, userId, text, parentCommentId = null) {
    if (!postId || !userId || !text?.trim()) {
      throw new Error('PostId, UserId e texto são obrigatórios');
    }

    const commentId = this.generateCommentId();
    const now = new Date().toISOString();
    
    const comment = {
      id: commentId,
      postId,
      userId,
      text: text.trim(),
      parentCommentId,
      timestamp: now,
      edited: false,
      editedAt: null,
      likes: 0,
      replies: [],
      isHidden: false,
      reported: false,
      metadata: {
        device: this.getDeviceInfo(),
        ipHash: this.getIpHash(),
        userAgent: navigator.userAgent.substring(0, 100)
      }
    };

    // Inicializa array de comentários do post se não existir
    if (!this.comments[postId]) {
      this.comments[postId] = [];
    }

    // Se é uma resposta, adiciona ao comentário pai
    if (parentCommentId) {
      const parentComment = this.findComment(postId, parentCommentId);
      if (parentComment) {
        parentComment.replies.push(comment);
      } else {
        throw new Error('Comentário pai não encontrado');
      }
    } else {
      // Adiciona como comentário principal
      this.comments[postId].push(comment);
    }

    this.saveComments();
    
    // Emite evento para sistema real-time
    this.emitCommentEvent('comment_added', {
      postId,
      comment,
      isReply: !!parentCommentId
    });

    return comment;
  }

  // Edita um comentário existente
  editComment(postId, commentId, newText, userId) {
    if (!newText?.trim()) {
      throw new Error('Novo texto é obrigatório');
    }

    const comment = this.findComment(postId, commentId);
    
    if (!comment) {
      throw new Error('Comentário não encontrado');
    }

    if (comment.userId !== userId) {
      throw new Error('Usuário não autorizado a editar este comentário');
    }

    // Histórico de edições
    if (!comment.editHistory) {
      comment.editHistory = [];
    }
    
    comment.editHistory.push({
      text: comment.text,
      editedAt: comment.editedAt || comment.timestamp
    });

    comment.text = newText.trim();
    comment.edited = true;
    comment.editedAt = new Date().toISOString();

    this.saveComments();
    
    this.emitCommentEvent('comment_edited', {
      postId,
      commentId,
      newText: comment.text
    });

    return comment;
  }

  // Remove um comentário
  deleteComment(postId, commentId, userId, isAdmin = false) {
    const comment = this.findComment(postId, commentId);
    
    if (!comment) {
      throw new Error('Comentário não encontrado');
    }

    if (comment.userId !== userId && !isAdmin) {
      throw new Error('Usuário não autorizado a deletar este comentário');
    }

    // Soft delete - marca como deletado mas mantém estrutura para respostas
    comment.text = '[Comentário removido]';
    comment.isDeleted = true;
    comment.deletedAt = new Date().toISOString();
    comment.deletedBy = userId;

    this.saveComments();
    
    this.emitCommentEvent('comment_deleted', {
      postId,
      commentId,
      deletedBy: userId
    });

    return true;
  }

  // Obtém comentários de um post
  getComments(postId, options = {}) {
    const {
      limit = 50,
      offset = 0,
      sortBy = 'timestamp', // timestamp, likes, replies
      order = 'asc', // asc, desc
      includeReplies = true,
      hideDeleted = true
    } = options;

    let comments = this.comments[postId] || [];

    // Filtra comentários deletados se necessário
    if (hideDeleted) {
      comments = comments.filter(comment => !comment.isDeleted);
    }

    // Ordenação
    comments = this.sortComments(comments, sortBy, order);

    // Paginação
    comments = comments.slice(offset, offset + limit);

    // Processa respostas se necessário
    if (includeReplies) {
      comments = comments.map(comment => ({
        ...comment,
        replies: this.sortComments(comment.replies || [], sortBy, order)
      }));
    }

    return comments;
  }

  // Busca comentários por texto
  searchComments(postId, searchTerm, options = {}) {
    const comments = this.getComments(postId, { ...options, includeReplies: true });
    const results = [];

    const searchInComment = (comment) => {
      if (comment.text.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push(comment);
      }
      
      // Busca nas respostas
      if (comment.replies) {
        comment.replies.forEach(searchInComment);
      }
    };

    comments.forEach(searchInComment);
    return results;
  }

  // Obtém estatísticas de comentários
  getCommentStats(postId) {
    const comments = this.comments[postId] || [];
    
    const stats = {
      total: 0,
      totalWithReplies: 0,
      topCommenters: {},
      avgCommentsPerUser: 0,
      mostLikedComment: null,
      mostRepliedComment: null,
      recentActivity: []
    };

    const processComment = (comment) => {
      if (!comment.isDeleted) {
        stats.total++;
        stats.totalWithReplies++;
        
        // Contagem por usuário
        stats.topCommenters[comment.userId] = (stats.topCommenters[comment.userId] || 0) + 1;
        
        // Comentário mais curtido
        if (!stats.mostLikedComment || comment.likes > stats.mostLikedComment.likes) {
          stats.mostLikedComment = comment;
        }
        
        // Comentário com mais respostas
        const replyCount = comment.replies ? comment.replies.length : 0;
        if (!stats.mostRepliedComment || replyCount > (stats.mostRepliedComment.replies?.length || 0)) {
          stats.mostRepliedComment = comment;
        }
        
        // Atividade recente (últimos 7 dias)
        const commentDate = new Date(comment.timestamp);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (commentDate > weekAgo) {
          stats.recentActivity.push(comment);
        }
      }
      
      // Processa respostas
      if (comment.replies) {
        comment.replies.forEach(processComment);
      }
    };

    comments.forEach(processComment);
    
    // Calcula média
    const uniqueUsers = Object.keys(stats.topCommenters).length;
    stats.avgCommentsPerUser = uniqueUsers > 0 ? stats.totalWithReplies / uniqueUsers : 0;
    
    return stats;
  }

  // Reporta um comentário
  reportComment(postId, commentId, userId, reason) {
    const comment = this.findComment(postId, commentId);
    
    if (!comment) {
      throw new Error('Comentário não encontrado');
    }

    if (!comment.reports) {
      comment.reports = [];
    }

    // Verifica se usuário já reportou
    const existingReport = comment.reports.find(r => r.userId === userId);
    if (existingReport) {
      throw new Error('Usuário já reportou este comentário');
    }

    comment.reports.push({
      userId,
      reason,
      timestamp: new Date().toISOString()
    });

    comment.reported = true;

    // Auto-hide se muitos reports
    if (comment.reports.length >= 3) {
      comment.isHidden = true;
    }

    this.saveComments();
    
    this.emitCommentEvent('comment_reported', {
      postId,
      commentId,
      reason,
      reportCount: comment.reports.length
    });

    return true;
  }

  // Modera comentário (para admins)
  moderateComment(postId, commentId, action, moderatorId) {
    const comment = this.findComment(postId, commentId);
    
    if (!comment) {
      throw new Error('Comentário não encontrado');
    }

    const now = new Date().toISOString();

    switch (action) {
      case 'hide':
        comment.isHidden = true;
        comment.moderatedAt = now;
        comment.moderatedBy = moderatorId;
        break;
      case 'show':
        comment.isHidden = false;
        comment.moderatedAt = now;
        comment.moderatedBy = moderatorId;
        break;
      case 'delete':
        return this.deleteComment(postId, commentId, moderatorId, true);
      default:
        throw new Error('Ação de moderação inválida');
    }

    this.saveComments();
    
    this.emitCommentEvent('comment_moderated', {
      postId,
      commentId,
      action,
      moderatorId
    });

    return comment;
  }

  // Métodos auxiliares
  findComment(postId, commentId) {
    const comments = this.comments[postId] || [];
    
    for (const comment of comments) {
      if (comment.id === commentId) {
        return comment;
      }
      
      // Busca nas respostas
      if (comment.replies) {
        for (const reply of comment.replies) {
          if (reply.id === commentId) {
            return reply;
          }
        }
      }
    }
    
    return null;
  }

  sortComments(comments, sortBy, order) {
    const multiplier = order === 'desc' ? -1 : 1;
    
    return comments.sort((a, b) => {
      switch (sortBy) {
        case 'likes':
          return (a.likes - b.likes) * multiplier;
        case 'replies':
          return ((a.replies?.length || 0) - (b.replies?.length || 0)) * multiplier;
        case 'timestamp':
        default:
          return (new Date(a.timestamp) - new Date(b.timestamp)) * multiplier;
      }
    });
  }

  generateCommentId() {
    return 'comment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getDeviceInfo() {
    return {
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    };
  }

  getIpHash() {
    // Simulação de hash de IP (em produção seria feito no backend)
    return 'ip_' + Math.random().toString(36).substr(2, 16);
  }

  emitCommentEvent(eventType, data) {
    // Integração com realTimeService
    if (window.realTimeService) {
      window.realTimeService.emit(eventType, {
        ...data,
        timestamp: new Date().toISOString()
      });
    }

    // Evento customizado para outros componentes
    window.dispatchEvent(new CustomEvent('commentUpdate', {
      detail: { eventType, ...data }
    }));
  }

  // Limpa comentários antigos (para manutenção)
  cleanupOldComments(daysOld = 90) {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    let cleaned = 0;

    Object.keys(this.comments).forEach(postId => {
      this.comments[postId] = this.comments[postId].filter(comment => {
        const commentDate = new Date(comment.timestamp);
        if (commentDate < cutoffDate && comment.isDeleted) {
          cleaned++;
          return false;
        }
        return true;
      });
    });

    this.saveComments();
    return cleaned;
  }
}

// Instância global do serviço
const commentService = new CommentService();

export default commentService;
