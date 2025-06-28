// savedService.js - Serviço para gerenciar posts salvos/favoritos
class SavedService {
  constructor() {
    this.savedPosts = this.loadSavedPosts();
    this.eventListeners = [];
  }

  // Carregar posts salvos do localStorage
  loadSavedPosts() {
    try {
      const saved = localStorage.getItem('if_wave_saved_posts');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Erro ao carregar posts salvos:', error);
      return [];
    }
  }

  // Salvar posts no localStorage
  savePosts() {
    try {
      localStorage.setItem('if_wave_saved_posts', JSON.stringify(this.savedPosts));
      this.notifyListeners();
    } catch (error) {
      console.error('Erro ao salvar posts:', error);
    }
  }

  // Verificar se um post está salvo
  isPostSaved(postId) {
    return this.savedPosts.some(post => post.id === postId);
  }

  // Salvar/remover post dos favoritos
  toggleSavePost(post) {
    const isCurrentlySaved = this.isPostSaved(post.id);
    
    if (isCurrentlySaved) {
      // Remover dos salvos
      this.savedPosts = this.savedPosts.filter(p => p.id !== post.id);
    } else {
      // Adicionar aos salvos
      const savedPost = {
        id: post.id,
        content: post.content,
        author: post.author,
        timestamp: post.timestamp,
        savedAt: new Date().toISOString(),
        likes: post.likes || 0,
        comments: post.comments || 0,
        image: post.image
      };
      this.savedPosts.unshift(savedPost);
    }

    this.savePosts();
    return !isCurrentlySaved;
  }

  // Obter todos os posts salvos
  getSavedPosts() {
    return [...this.savedPosts];
  }

  // Obter posts salvos com filtros
  getSavedPostsByFilter(filter = 'all') {
    let filtered = [...this.savedPosts];

    switch (filter) {
      case 'recent':
        filtered = filtered.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
        break;
      case 'popular':
        filtered = filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case 'oldest':
        filtered = filtered.sort((a, b) => new Date(a.savedAt) - new Date(b.savedAt));
        break;
      default:
        // 'all' - manter ordem atual
        break;
    }

    return filtered;
  }

  // Remover post específico dos salvos
  removeSavedPost(postId) {
    this.savedPosts = this.savedPosts.filter(p => p.id !== postId);
    this.savePosts();
  }

  // Limpar todos os posts salvos
  clearAllSaved() {
    this.savedPosts = [];
    this.savePosts();
  }

  // Exportar posts salvos
  exportSavedPosts() {
    const exportData = {
      exported_at: new Date().toISOString(),
      total_posts: this.savedPosts.length,
      posts: this.savedPosts
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `if_wave_saved_posts_${new Date().getTime()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  // Importar posts salvos
  importSavedPosts(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          if (importData.posts && Array.isArray(importData.posts)) {
            // Mesclar com posts existentes, evitando duplicatas
            const existingIds = new Set(this.savedPosts.map(p => p.id));
            const newPosts = importData.posts.filter(p => !existingIds.has(p.id));
            
            this.savedPosts = [...this.savedPosts, ...newPosts];
            this.savePosts();
            resolve(newPosts.length);
          } else {
            reject(new Error('Formato de arquivo inválido'));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }

  // Obter estatísticas dos posts salvos
  getStatistics() {
    const total = this.savedPosts.length;
    const totalLikes = this.savedPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const totalComments = this.savedPosts.reduce((sum, post) => sum + (post.comments || 0), 0);
    
    const authorCounts = {};
    this.savedPosts.forEach(post => {
      const author = post.author?.name || 'Desconhecido';
      authorCounts[author] = (authorCounts[author] || 0) + 1;
    });

    const mostSavedAuthor = Object.keys(authorCounts).reduce((a, b) => 
      authorCounts[a] > authorCounts[b] ? a : b, null
    );

    return {
      total,
      totalLikes,
      totalComments,
      averageLikes: total > 0 ? (totalLikes / total).toFixed(1) : 0,
      averageComments: total > 0 ? (totalComments / total).toFixed(1) : 0,
      mostSavedAuthor,
      authorCounts
    };
  }

  // Adicionar listener para mudanças
  addListener(callback) {
    this.eventListeners.push(callback);
  }

  // Remover listener
  removeListener(callback) {
    this.eventListeners = this.eventListeners.filter(l => l !== callback);
  }

  // Notificar listeners sobre mudanças
  notifyListeners() {
    this.eventListeners.forEach(callback => {
      try {
        callback(this.savedPosts);
      } catch (error) {
        console.error('Erro ao notificar listener:', error);
      }
    });
  }
}

// Instância singleton
export default new SavedService();
