<template>
  <div class="search-container">
    <header class="search-header">
      <h2>🔍 Descobrir</h2>
      <p>Encontre pessoas, posts e conteúdos do IFMT</p>
    </header>

    <!-- Barra de Pesquisa -->
    <div class="search-bar">
      <div class="search-input-container">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
        </svg>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Buscar pessoas, cursos, posts..."
          class="search-input"
          @input="handleSearch"
        >
        <button 
          v-if="searchQuery" 
          @click="clearSearch" 
          class="clear-btn"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="search-filters">
      <button 
        v-for="filter in filters" 
        :key="filter.id"
        :class="['filter-btn', { active: activeFilter === filter.id }]"
        @click="setActiveFilter(filter.id)"
      >
        {{ filter.icon }} {{ filter.label }}
      </button>
    </div>

    <!-- Resultados da Busca -->
    <div v-if="searchQuery" class="search-results">
      <h3>Resultados para "{{ searchQuery }}"</h3>
      
      <!-- Pessoas -->
      <div v-if="filteredPeople.length > 0" class="results-section">
        <h4>👥 Pessoas</h4>
        <div class="people-grid">
          <div 
            v-for="person in filteredPeople" 
            :key="person.id"
            class="person-card"
          >
            <div class="person-avatar">
              <img :src="person.avatar || getDefaultAvatar(person.name)" :alt="person.name">
            </div>
            <div class="person-info">
              <h5>{{ person.name }}</h5>
              <p class="person-course">{{ person.course }}</p>
              <p class="person-campus">{{ person.campus }}</p>
            </div>
            <div class="person-actions">
              <button class="follow-btn">
                {{ person.following ? 'Seguindo' : 'Seguir' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Posts -->
      <div v-if="filteredPosts.length > 0" class="results-section">
        <h4>📝 Posts</h4>
        <div class="posts-list">
          <div 
            v-for="post in filteredPosts" 
            :key="post.id"
            class="post-card"
          >
            <div class="post-header">
              <div class="post-avatar">
                <img :src="getDefaultAvatar(post.author)" :alt="post.author">
              </div>
              <div class="post-info">
                <h5>{{ post.author }}</h5>
                <p class="post-time">{{ getRelativeTime(post.timestamp) }}</p>
              </div>
              <div v-if="post.category" class="post-category">
                {{ getCategoryLabel(post.category) }}
              </div>
            </div>
            <div class="post-content">
              {{ post.content }}
            </div>
            <div v-if="post.image" class="post-image">
              <img :src="post.image" :alt="'Post image'">
            </div>
            <div class="post-stats">
              <span>❤️ {{ post.likes }}</span>
              <span>💬 {{ post.comments }}</span>
              <span>📤 {{ post.shares }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Nenhum resultado -->
      <div v-if="hasNoResults" class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>Nenhum resultado encontrado</h3>
        <p>Tente buscar por algo diferente ou verifique a ortografia.</p>
      </div>
    </div>

    <!-- Sugestões (quando não há busca) -->
    <div v-else class="suggestions">
      <!-- Pessoas Sugeridas -->
      <div class="suggestion-section">
        <h3>👥 Pessoas que você pode conhecer</h3>
        <div class="suggestions-grid">
          <div 
            v-for="person in suggestedPeople" 
            :key="person.id"
            class="suggestion-card"
          >
            <div class="suggestion-avatar">
              <img :src="person.avatar || getDefaultAvatar(person.name)" :alt="person.name">
            </div>
            <div class="suggestion-info">
              <h5>{{ person.name }}</h5>
              <p>{{ person.course }}</p>
              <p class="campus">{{ person.campus }}</p>
            </div>
            <button class="suggestion-follow-btn">
              Seguir
            </button>
          </div>
        </div>
      </div>

      <!-- Hashtags Populares -->
      <div class="suggestion-section">
        <h3>🔥 Hashtags Populares</h3>
        <div class="hashtags-grid">
          <div 
            v-for="hashtag in popularHashtags" 
            :key="hashtag.tag"
            class="hashtag-card"
            @click="searchHashtag(hashtag.tag)"
          >
            <div class="hashtag-name">#{{ hashtag.tag }}</div>
            <div class="hashtag-count">{{ hashtag.count }} posts</div>
          </div>
        </div>
      </div>

      <!-- Cursos Populares -->
      <div class="suggestion-section">
        <h3>📚 Cursos em Destaque</h3>
        <div class="courses-grid">
          <div 
            v-for="course in popularCourses" 
            :key="course.id"
            class="course-card"
          >
            <div class="course-icon">{{ course.icon }}</div>
            <div class="course-info">
              <h5>{{ course.name }}</h5>
              <p>{{ course.students }} estudantes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchScreen',
  data() {
    return {
      searchQuery: '',
      activeFilter: 'all',
      filters: [
        { id: 'all', label: 'Tudo', icon: '🔍' },
        { id: 'people', label: 'Pessoas', icon: '👥' },
        { id: 'posts', label: 'Posts', icon: '📝' },
        { id: 'courses', label: 'Cursos', icon: '📚' }
      ],
      mockPeople: [
        {
          id: 1,
          name: 'Ana Silva',
          course: 'Técnico em Informática',
          campus: 'Cuiabá - Octayde',
          following: false,
          avatar: null
        },
        {
          id: 2,
          name: 'Pedro Santos',
          course: 'Técnico em Eletrônica',
          campus: 'Várzea Grande',
          following: true,
          avatar: null
        },
        {
          id: 3,
          name: 'Maria Costa',
          course: 'Engenharia de Software',
          campus: 'Cuiabá - Octayde',
          following: false,
          avatar: null
        },
        {
          id: 4,
          name: 'João Oliveira',
          course: 'Técnico em Redes',
          campus: 'Rondonópolis',
          following: false,
          avatar: null
        }
      ],
      mockPosts: [
        {
          id: 1,
          author: 'Ana Silva',
          content: 'Acabei de finalizar meu projeto de TCC! Muito feliz com o resultado.',
          category: 'projeto',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          likes: 15,
          comments: 8,
          shares: 3,
          image: null
        },
        {
          id: 2,
          author: 'Pedro Santos',
          content: 'Dica para quem está estudando programação: pratique todos os dias, mesmo que seja só 30 minutos!',
          category: 'dica',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          likes: 23,
          comments: 12,
          shares: 7,
          image: null
        },
        {
          id: 3,
          author: 'Maria Costa',
          content: 'Evento de tecnologia no campus amanhã! Quem vai comparecer?',
          category: 'evento',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
          likes: 31,
          comments: 15,
          shares: 12,
          image: null
        }
      ],
      suggestedPeople: [
        {
          id: 5,
          name: 'Carlos Lima',
          course: 'Técnico em Informática',
          campus: 'Cuiabá - Octayde'
        },
        {
          id: 6,
          name: 'Lucia Ferreira',
          course: 'Engenharia Elétrica',
          campus: 'Cuiabá - Octayde'
        },
        {
          id: 7,
          name: 'Rafael Souza',
          course: 'Técnico em Eletrônica',
          campus: 'Várzea Grande'
        }
      ],
      popularHashtags: [
        { tag: 'ifmt', count: 156 },
        { tag: 'tcc', count: 89 },
        { tag: 'programacao', count: 67 },
        { tag: 'eletronica', count: 45 },
        { tag: 'projeto', count: 34 }
      ],
      popularCourses: [
        {
          id: 1,
          name: 'Técnico em Informática',
          students: 245,
          icon: '💻'
        },
        {
          id: 2,
          name: 'Técnico em Eletrônica',
          students: 189,
          icon: '⚡'
        },
        {
          id: 3,
          name: 'Engenharia de Software',
          students: 156,
          icon: '👨‍💻'
        }
      ]
    }
  },
  computed: {
    filteredPeople() {
      if (!this.searchQuery || (this.activeFilter !== 'all' && this.activeFilter !== 'people')) {
        return []
      }
      return this.mockPeople.filter(person => 
        person.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        person.course.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        person.campus.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    },
    
    filteredPosts() {
      if (!this.searchQuery || (this.activeFilter !== 'all' && this.activeFilter !== 'posts')) {
        return []
      }
      return this.mockPosts.filter(post => 
        post.content.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    },
    
    hasNoResults() {
      return this.searchQuery && 
             this.filteredPeople.length === 0 && 
             this.filteredPosts.length === 0
    }
  },
  methods: {
    handleSearch() {
      // Simula busca em tempo real
      // Em produção, aqui seria feita a chamada para a API
    },
    
    clearSearch() {
      this.searchQuery = ''
    },
    
    setActiveFilter(filterId) {
      this.activeFilter = filterId
    },
    
    searchHashtag(tag) {
      this.searchQuery = `#${tag}`
      this.activeFilter = 'posts'
    },
    
    getDefaultAvatar(name) {
      const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8', 'F7DC6F', 'BB8FCE', '85C1E9']
      const colorIndex = name.length % colors.length
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      
      return `https://ui-avatars.com/api/?name=${initials}&background=${colors[colorIndex]}&color=fff&size=50&format=svg`
    },
    
    getCategoryLabel(category) {
      const labels = {
        projeto: '💻 Projeto',
        dica: '💡 Dica',
        evento: '📅 Evento',
        academico: '📚 Acadêmico',
        conquista: '🏆 Conquista'
      }
      return labels[category] || category
    },
    
    getRelativeTime(timestamp) {
      const now = new Date()
      const time = new Date(timestamp)
      const diffInSeconds = Math.floor((now - time) / 1000)
      
      if (diffInSeconds < 60) {
        return 'agora'
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        return `${minutes}min`
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `${hours}h`
      } else {
        const days = Math.floor(diffInSeconds / 86400)
        return `${days}d`
      }
    }
  }
}
</script>

<style scoped>
.search-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #ffffff;
  min-height: 100vh;
}

.search-header {
  text-align: center;
  margin-bottom: 25px;
}

.search-header h2 {
  color: #2d3748;
  margin: 0 0 8px 0;
  font-size: 1.8em;
}

.search-header p {
  color: #718096;
  margin: 0;
}

.search-bar {
  margin-bottom: 20px;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 15px;
  color: #718096;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 15px 15px 15px 50px;
  border: 2px solid #e2e8f0;
  border-radius: 25px;
  font-size: 16px;
  background: #f7fafc;
  transition: all 0.2s;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #4299e1;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.clear-btn {
  position: absolute;
  right: 15px;
  background: #e2e8f0;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #718096;
  font-size: 14px;
}

.search-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.filter-btn {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
  color: #4a5568;
}

.filter-btn:hover {
  border-color: #cbd5e0;
}

.filter-btn.active {
  background: #4299e1;
  border-color: #4299e1;
  color: white;
}

.search-results h3 {
  color: #2d3748;
  margin-bottom: 20px;
  font-size: 1.3em;
}

.results-section {
  margin-bottom: 30px;
}

.results-section h4 {
  color: #4a5568;
  margin-bottom: 15px;
  font-size: 1.1em;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.people-grid {
  display: grid;
  gap: 15px;
}

.person-card {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.2s;
}

.person-card:hover {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.person-avatar img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.person-info {
  flex: 1;
}

.person-info h5 {
  margin: 0 0 4px 0;
  color: #2d3748;
  font-size: 1em;
}

.person-course {
  margin: 0 0 2px 0;
  color: #4a5568;
  font-size: 0.9em;
}

.person-campus {
  margin: 0;
  color: #718096;
  font-size: 0.85em;
}

.follow-btn {
  background: #4299e1;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;
  transition: background 0.2s;
}

.follow-btn:hover {
  background: #3182ce;
}

.posts-list {
  display: grid;
  gap: 15px;
}

.post-card {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 15px;
  transition: all 0.2s;
}

.post-card:hover {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.post-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.post-info h5 {
  margin: 0;
  color: #2d3748;
  font-size: 0.9em;
}

.post-time {
  margin: 0;
  color: #718096;
  font-size: 0.8em;
}

.post-category {
  background: #e6fffa;
  color: #2c7a7b;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75em;
  margin-left: auto;
}

.post-content {
  margin-bottom: 12px;
  color: #2d3748;
  line-height: 1.5;
}

.post-stats {
  display: flex;
  gap: 15px;
  color: #718096;
  font-size: 0.85em;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #718096;
}

.no-results-icon {
  font-size: 3em;
  margin-bottom: 15px;
}

.no-results h3 {
  color: #4a5568;
  margin-bottom: 8px;
}

.suggestions {
  margin-top: 20px;
}

.suggestion-section {
  margin-bottom: 30px;
}

.suggestion-section h3 {
  color: #2d3748;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.suggestions-grid {
  display: grid;
  gap: 12px;
}

.suggestion-card {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
}

.suggestion-card:hover {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.suggestion-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.suggestion-info {
  flex: 1;
}

.suggestion-info h5 {
  margin: 0 0 2px 0;
  color: #2d3748;
  font-size: 0.9em;
}

.suggestion-info p {
  margin: 0;
  color: #718096;
  font-size: 0.8em;
}

.campus {
  color: #a0aec0 !important;
}

.suggestion-follow-btn {
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8em;
  transition: background 0.2s;
}

.suggestion-follow-btn:hover {
  background: #cbd5e0;
}

.hashtags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.hashtag-card {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.hashtag-card:hover {
  background: #4299e1;
  color: white;
  transform: translateY(-2px);
}

.hashtag-name {
  font-weight: 600;
  font-size: 1.1em;
  margin-bottom: 4px;
}

.hashtag-count {
  font-size: 0.85em;
  opacity: 0.8;
}

.courses-grid {
  display: grid;
  gap: 12px;
}

.course-card {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.2s;
}

.course-card:hover {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.course-icon {
  font-size: 2em;
}

.course-info h5 {
  margin: 0 0 4px 0;
  color: #2d3748;
}

.course-info p {
  margin: 0;
  color: #718096;
  font-size: 0.9em;
}

@media (max-width: 768px) {
  .search-container {
    padding: 15px;
  }
  
  .search-filters {
    justify-content: flex-start;
  }
  
  .person-card {
    flex-direction: column;
    text-align: center;
  }
  
  .hashtags-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>