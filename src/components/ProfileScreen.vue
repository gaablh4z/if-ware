<template>
  <div class="profile-container">
    <!-- Modal de Edição de Perfil -->
    <div v-if="showEditModal" class="edit-modal-overlay" @click="closeEditModal">
      <div class="edit-modal" @click.stop>
        <div class="edit-header">
          <button class="btn-cancel" @click="closeEditModal">Cancelar</button>
          <h3>Editar perfil</h3>
          <button class="btn-save" @click="saveProfile" :disabled="isSaving">
            {{ isSaving ? 'Salvando...' : 'Concluído' }}
          </button>
        </div>

        <div class="edit-content">
          <div class="edit-avatar">
            <img :src="editForm.avatar" :alt="editForm.name" />
            <button class="change-photo-btn" @click="changePhoto">
              Alterar foto do perfil
            </button>
          </div>

          <div class="edit-fields">
            <div class="field-group">
              <label>Nome</label>
              <input v-model="editForm.name" type="text" maxlength="30" />
            </div>

            <div class="field-group">
              <label>Nome de usuário</label>
              <input v-model="editForm.username" type="text" maxlength="30" />
            </div>

            <div class="field-group">
              <label>Curso</label>
              <input v-model="editForm.course" type="text" />
            </div>

            <div class="field-group">
              <label>Campus</label>
              <input v-model="editForm.campus" type="text" />
            </div>

            <div class="field-group">
              <label>Bio</label>
              <textarea v-model="editForm.bio" maxlength="150" rows="3"></textarea>
              <span class="char-count">{{ editForm.bio.length }}/150</span>
            </div>

            <div class="field-group">
              <label>GitHub</label>
              <input v-model="editForm.github" type="url" placeholder="https://github.com/seu-usuario" />
            </div>

            <div class="field-group">
              <label>LinkedIn</label>
              <input v-model="editForm.linkedin" type="url" placeholder="https://linkedin.com/in/seu-usuario" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Header do Perfil -->
    <div class="profile-header">
      <div class="profile-info">
        <div class="profile-avatar">
          <img :src="userProfile.avatar" :alt="userProfile.name" />
          <div class="status-indicator online"></div>
        </div>
        <div class="profile-details">
          <div class="profile-name-section">
            <h2>{{ userProfile.name }}</h2>
            <button class="btn-edit" @click="openEditModal">
              Editar perfil
            </button>
          </div>
          <p class="profile-username">@{{ userProfile.username }}</p>
          <p class="profile-course">{{ userProfile.course }}</p>
          <p class="profile-campus">{{ userProfile.campus }}</p>
        </div>
      </div>
    </div>

    <!-- Estatísticas -->
    <div class="profile-stats">
      <div class="stat-item">
        <span class="stat-number">{{ userProfile.stats.posts }}</span>
        <span class="stat-label">publicações</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ userProfile.stats.followers }}</span>
        <span class="stat-label">seguidores</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ userProfile.stats.following }}</span>
        <span class="stat-label">seguindo</span>
      </div>
    </div>

    <!-- Bio -->
    <div class="profile-bio" v-if="userProfile.bio">
      <p>{{ userProfile.bio }}</p>
      <div class="bio-links" v-if="userProfile.links.length">
        <a v-for="link in userProfile.links" :key="link.id" :href="link.url" target="_blank" class="bio-link">
          {{ link.label }}
        </a>
      </div>
    </div>

    <!-- Tabs de Conteúdo -->
    <div class="content-tabs">
      <button 
        v-for="tab in contentTabs" 
        :key="tab.id" 
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <IconComponent :name="tab.icon" :size="18" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- Conteúdo das Tabs -->
    <div class="tab-content">
      <!-- Posts -->
      <div v-if="activeTab === 'posts'" class="posts-grid">
        <div v-if="userPosts.length === 0" class="empty-state">
          <IconComponent name="camera" :size="48" />
          <p>Nenhuma publicação ainda</p>
          <p class="sub-text">Quando você publicar algo, aparecerá aqui.</p>
        </div>
        <div v-else v-for="post in userPosts" :key="post.id" class="post-item">
          <img :src="post.image" :alt="post.caption" />
          <div class="post-overlay">
            <div class="post-stats">
              <span>❤️ {{ post.likes }}</span>
              <span>💬 {{ post.comments }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Salvos -->
      <div v-else-if="activeTab === 'saved'" class="saved-grid">
        <div v-if="savedPosts.length === 0" class="empty-state">
          <IconComponent name="bookmark" :size="48" />
          <p>Nenhum item salvo</p>
          <p class="sub-text">Salve publicações para vê-las aqui.</p>
        </div>
        <div v-else v-for="saved in savedPosts" :key="saved.id" class="saved-item">
          <img :src="saved.image" :alt="saved.title" />
        </div>
      </div>

      <!-- Projetos -->
      <div v-else-if="activeTab === 'projects'" class="projects-grid">
        <div v-if="userProjects.length === 0" class="empty-state">
          <IconComponent name="code" :size="48" />
          <p>Nenhum projeto ainda</p>
          <p class="sub-text">Seus projetos aparecerão aqui.</p>
        </div>
        <div v-else v-for="project in userProjects" :key="project.id" class="project-item">
          <div class="project-image">
            <img :src="project.image" :alt="project.title" />
            <div class="project-type">{{ project.type }}</div>
          </div>
          <div class="project-info">
            <h4>{{ project.title }}</h4>
            <p>{{ project.description }}</p>
            <div class="project-tech">
              <span v-for="tech in project.technologies" :key="tech" class="tech-tag">{{ tech }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Eventos -->
      <div v-else-if="activeTab === 'events'" class="events-list">
        <div v-if="userEvents.length === 0" class="empty-state">
          <IconComponent name="calendar" :size="48" />
          <p>Nenhum evento ainda</p>
          <p class="sub-text">Eventos que você participa aparecerão aqui.</p>
        </div>
        <div v-else v-for="event in userEvents" :key="event.id" class="event-item">
          <div class="event-date">
            <span class="event-day">{{ event.date.day }}</span>
            <span class="event-month">{{ event.date.month }}</span>
          </div>
          <div class="event-info">
            <h4>{{ event.title }}</h4>
            <p>{{ event.description }}</p>
            <span class="event-location">{{ event.location }}</span>
          </div>
          <div class="event-status" :class="event.status">{{ event.statusText }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import IconComponent from './IconComponent.vue'

export default {
  name: 'ProfileScreen',
  components: {
    IconComponent
  },
  props: {
    currentUser: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      activeTab: 'posts',
      showMenu: false,
      showEditModal: false,
      isSaving: false,
      editForm: {
        name: '',
        username: '',
        course: '',
        campus: '',
        bio: '',
        avatar: '',
        github: '',
        linkedin: ''
      },
      contentTabs: [
        { id: 'posts', label: 'Posts', icon: 'grid' },
        { id: 'projects', label: 'Projetos', icon: 'code' },
        { id: 'saved', label: 'Salvos', icon: 'bookmark' },
        { id: 'events', label: 'Eventos', icon: 'calendar' }
      ],
      userPosts: [],
      savedPosts: [],
      userProjects: [],
      userEvents: []
    }
  },
  computed: {
    userProfile() {
      if (!this.currentUser) {
        return {
          name: 'Usuário',
          username: 'usuario',
          course: 'Não informado',
          campus: 'Não informado',
          bio: '',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b750?auto=format&fit=crop&w=150&q=80',
          stats: { posts: 0, followers: 0, following: 0 },
          links: []
        }
      }

      // Buscar perfil salvo ou criar um novo
      const savedProfile = JSON.parse(localStorage.getItem(`ifwave_profile_${this.currentUser.id}`) || '{}')
      
      return {
        name: this.currentUser.name,
        username: this.generateUsername(this.currentUser.name),
        course: this.currentUser.course,
        campus: this.currentUser.campus,
        bio: savedProfile.bio || '',
        avatar: savedProfile.avatar || this.generateAvatar(),
        stats: savedProfile.stats || { 
          posts: Math.floor(Math.random() * 10), 
          followers: Math.floor(Math.random() * 50) + 10, 
          following: Math.floor(Math.random() * 30) + 5 
        },
        links: savedProfile.links || []
      }
    }
  },
  mounted() {
    this.loadUserData()
  },
  methods: {
    generateUsername(name) {
      return name.toLowerCase()
        .replace(/\s+/g, '.')
        .replace(/[áàâã]/g, 'a')
        .replace(/[éèê]/g, 'e')
        .replace(/[íì]/g, 'i')
        .replace(/[óòôõ]/g, 'o')
        .replace(/[úù]/g, 'u')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9.]/g, '')
    },

    generateAvatar() {
      const avatars = [
        'https://images.unsplash.com/photo-1494790108755-2616b612b750?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80'
      ]
      return avatars[Math.floor(Math.random() * avatars.length)]
    },

    loadUserData() {
      if (!this.currentUser) return

      // Carregar posts do usuário (simulados)
      this.userPosts = this.generateUserPosts()
      
      // Carregar posts salvos (simulados)
      this.savedPosts = this.generateSavedPosts()
      
      // Carregar projetos do usuário (simulados)
      this.userProjects = this.generateUserProjects()
      
      // Carregar eventos do usuário (simulados)
      this.userEvents = this.generateUserEvents()
    },

    generateUserPosts() {
      const postImages = [
        'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=300&q=80'
      ]
      
      return Array.from({ length: Math.floor(Math.random() * 6) }, (_, i) => ({
        id: i + 1,
        image: postImages[i % postImages.length],
        caption: `Post ${i + 1}`,
        likes: Math.floor(Math.random() * 100) + 10,
        comments: Math.floor(Math.random() * 20) + 2
      }))
    },

    generateSavedPosts() {
      const savedImages = [
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=300&q=80'
      ]
      
      return Array.from({ length: Math.floor(Math.random() * 4) }, (_, i) => ({
        id: i + 1,
        image: savedImages[i % savedImages.length],
        title: `Post salvo ${i + 1}`
      }))
    },

    generateUserProjects() {
      const projectImages = [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=300&q=80'
      ]
      
      const projectTitles = [
        'Sistema de Gestão Escolar',
        'App Mobile IFMT',
        'Site Institucional',
        'Sistema de Biblioteca',
        'Plataforma de Cursos Online'
      ]
      
      const technologies = [
        ['Vue.js', 'Node.js', 'MySQL'],
        ['React Native', 'Firebase'],
        ['HTML', 'CSS', 'JavaScript'],
        ['Python', 'Django', 'PostgreSQL'],
        ['React', 'Express', 'MongoDB']
      ]
      
      return Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, i) => ({
        id: i + 1,
        title: projectTitles[i % projectTitles.length],
        description: `Projeto desenvolvido durante o ${i + 1}º semestre`,
        image: projectImages[i % projectImages.length],
        type: i % 2 === 0 ? 'Web App' : 'Mobile',
        technologies: technologies[i % technologies.length]
      }))
    },

    generateUserEvents() {
      const eventTitles = [
        'Feira de Ciências IFMT',
        'Workshop de Git/GitHub',
        'Palestra sobre Carreira em TI',
        'Hackathon IFMT 2025',
        'Mostra de Projetos'
      ]
      
      const months = ['JUL', 'AGO', 'SET', 'OUT', 'NOV']
      const locations = [
        'Auditório Principal',
        'Lab. Informática 1',
        'Lab. Informática 2',
        'Sala de Conferências',
        'Pátio Central'
      ]
      
      return Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => ({
        id: i + 1,
        title: eventTitles[i % eventTitles.length],
        description: `Evento educacional do IFMT`,
        location: locations[i % locations.length],
        date: { 
          day: String(15 + i * 7).padStart(2, '0'), 
          month: months[i % months.length] 
        },
        status: i % 2 === 0 ? 'confirmed' : 'pending',
        statusText: i % 2 === 0 ? 'Confirmado' : 'Pendente'
      }))
    },

    openEditModal() {
      this.editForm = {
        name: this.userProfile.name,
        username: this.userProfile.username,
        course: this.userProfile.course,
        campus: this.userProfile.campus,
        bio: this.userProfile.bio,
        avatar: this.userProfile.avatar,
        github: this.userProfile.links.find(link => link.type === 'github')?.url || '',
        linkedin: this.userProfile.links.find(link => link.type === 'linkedin')?.url || ''
      }
      this.showEditModal = true
    },

    closeEditModal() {
      this.showEditModal = false
      this.isSaving = false
    },

    changePhoto() {
      const avatars = [
        'https://images.unsplash.com/photo-1494790108755-2616b612b750?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80'
      ]
      this.editForm.avatar = avatars[Math.floor(Math.random() * avatars.length)]
    },

    async saveProfile() {
      this.isSaving = true

      try {
        // Simular delay de salvamento
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Preparar links
        const links = []
        if (this.editForm.github) {
          links.push({ id: 1, type: 'github', label: 'GitHub', url: this.editForm.github })
        }
        if (this.editForm.linkedin) {
          links.push({ id: 2, type: 'linkedin', label: 'LinkedIn', url: this.editForm.linkedin })
        }

        // Salvar perfil no localStorage
        const profileData = {
          bio: this.editForm.bio,
          avatar: this.editForm.avatar,
          stats: this.userProfile.stats,
          links: links,
          updatedAt: new Date().toISOString()
        }

        localStorage.setItem(`ifwave_profile_${this.currentUser.id}`, JSON.stringify(profileData))

        // Atualizar dados do usuário principal se necessário
        if (this.editForm.name !== this.currentUser.name || 
            this.editForm.course !== this.currentUser.course || 
            this.editForm.campus !== this.currentUser.campus) {
          
          const users = JSON.parse(localStorage.getItem('ifwave_users') || '[]')
          const userIndex = users.findIndex(user => user.id === this.currentUser.id)
          
          if (userIndex !== -1) {
            users[userIndex].name = this.editForm.name
            users[userIndex].course = this.editForm.course
            users[userIndex].campus = this.editForm.campus
            localStorage.setItem('ifwave_users', JSON.stringify(users))

            // Atualizar sessão atual
            const currentUser = JSON.parse(localStorage.getItem('ifwave_current_user'))
            currentUser.name = this.editForm.name
            currentUser.course = this.editForm.course
            currentUser.campus = this.editForm.campus
            localStorage.setItem('ifwave_current_user', JSON.stringify(currentUser))
          }
        }

        this.closeEditModal()
        
        // Forçar re-renderização
        this.$forceUpdate()

      } catch (error) {
        console.error('Erro ao salvar perfil:', error)
      } finally {
        this.isSaving = false
      }
    },

    openPost(post) {
      console.log('Abrir post:', post)
    },

    shareProfile() {
      console.log('Compartilhar perfil')
      this.showMenu = false
    },

    downloadQR() {
      console.log('Download QR Code')
      this.showMenu = false
    },

    viewInsights() {
      console.log('Ver estatísticas')
      this.showMenu = false
    },

    logout() {
      console.log('Logout')
      this.showMenu = false
    }
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 400px;
  margin: 0 auto;
  background: var(--card);
  min-height: 100vh;
  padding: 0 16px;
}

/* Modal de Edição */
.edit-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.edit-modal {
  background: var(--card);
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.edit-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--foreground);
}

.btn-cancel,
.btn-save {
  background: none;
  border: none;
  color: #0095f6;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px;
}

.btn-cancel {
  color: var(--foreground);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.edit-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.edit-avatar {
  text-align: center;
  margin-bottom: 24px;
}

.edit-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 8px;
}

.change-photo-btn {
  background: none;
  border: none;
  color: #0095f6;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.edit-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
}

.field-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 4px;
}

.field-group input,
.field-group textarea {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--card);
  color: var(--foreground);
  font-size: 14px;
  resize: vertical;
}

.field-group input:focus,
.field-group textarea:focus {
  outline: none;
  border-color: #0095f6;
}

.char-count {
  font-size: 12px;
  color: #8e8e8e;
  text-align: right;
  margin-top: 4px;
}

/* Header do Perfil */
.profile-header {
  padding: 20px 0;
  border-bottom: 1px solid var(--border);
}

.profile-info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.profile-avatar {
  position: relative;
  flex-shrink: 0;
}

.profile-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border);
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--card);
}

.status-indicator.online {
  background: #44b883;
}

.profile-details {
  flex: 1;
  min-width: 0;
}

.profile-name-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.profile-name-section h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--foreground);
}

.btn-edit {
  padding: 6px 16px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--foreground);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-edit:hover {
  background: var(--border);
}

.profile-username {
  color: #8e8e8e;
  font-size: 14px;
  margin: 0 0 4px 0;
}

.profile-course,
.profile-campus {
  color: var(--foreground);
  font-size: 13px;
  margin: 2px 0;
}

/* Bio */
.profile-bio {
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
}

.profile-bio p {
  margin: 0 0 8px 0;
  line-height: 1.4;
  color: var(--foreground);
}

.bio-links {
  display: flex;
  gap: 12px;
}

.bio-link {
  color: #0095f6;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
}

.bio-link:hover {
  text-decoration: underline;
}

/* Estatísticas */
.profile-stats {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  font-size: 18px;
  font-weight: 600;
  color: var(--foreground);
}

.stat-label {
  font-size: 12px;
  color: #8e8e8e;
  margin-top: 2px;
}

/* Tabs */
.content-tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
}

.tab-btn {
  flex: 1;
  padding: 12px;
  border: none;
  background: none;
  color: #8e8e8e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  transition: color 0.2s ease;
  border-bottom: 1px solid transparent;
}

.tab-btn.active {
  color: var(--foreground);
  border-bottom-color: var(--foreground);
}

.tab-btn:hover {
  color: var(--foreground);
}

/* Conteúdo */
.tab-content {
  padding: 16px 0;
}

.posts-grid,
.saved-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
}

.post-item,
.saved-item {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  cursor: pointer;
}

.post-item img,
.saved-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.post-item:hover .post-overlay {
  opacity: 1;
}

.post-stats {
  display: flex;
  gap: 16px;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #8e8e8e;
  grid-column: 1 / -1;
}

.empty-state p {
  margin: 8px 0 4px 0;
  font-size: 14px;
}

.sub-text {
  font-size: 12px;
  color: #c7c7c7;
}

/* Projetos */
.projects-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-item {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.project-item:hover {
  transform: translateY(-2px);
}

.project-image {
  position: relative;
  height: 120px;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-type {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.project-info {
  padding: 16px;
}

.project-info h4 {
  margin: 0 0 8px 0;
  color: var(--foreground);
  font-size: 14px;
  font-weight: 600;
}

.project-info p {
  color: #8e8e8e;
  font-size: 12px;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.project-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tech-tag {
  background: #f0f0f0;
  color: #333;
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
}

/* Eventos */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: transform 0.2s ease;
}

.event-item:hover {
  transform: translateY(-1px);
}

.event-date {
  text-align: center;
  min-width: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.event-day {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--foreground);
  line-height: 1;
}

.event-month {
  display: block;
  font-size: 11px;
  color: #8e8e8e;
  font-weight: 600;
  margin-top: 2px;
}

.event-info {
  flex: 1;
}

.event-info h4 {
  margin: 0 0 4px 0;
  color: var(--foreground);
  font-size: 14px;
  font-weight: 600;
}

.event-info p {
  margin: 0 0 8px 0;
  color: #8e8e8e;
  font-size: 12px;
  line-height: 1.3;
}

.event-location {
  color: #0095f6;
  font-size: 11px;
  font-weight: 500;
}

.event-status {
  align-self: flex-start;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.event-status.confirmed {
  background: #e8f5e8;
  color: #2e7d32;
}

.event-status.pending {
  background: #fff3e0;
  color: #f57c00;
}

@media (max-width: 480px) {
  .profile-container {
    padding: 0 12px;
  }
  
  .profile-info {
    gap: 12px;
  }
  
  .profile-avatar img {
    width: 70px;
    height: 70px;
  }
  
  .profile-name-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>