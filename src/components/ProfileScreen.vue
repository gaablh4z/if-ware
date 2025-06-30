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
      
      <!-- Botão de Menu (3 pontos) -->
      <div class="profile-menu">
        <button class="menu-btn" @click="showProfileMenu = !showProfileMenu" title="Opções">
          <IconComponent name="more" :size="24" />
        </button>
        
        <!-- Menu Dropdown -->
        <div v-if="showProfileMenu" class="profile-menu-dropdown" @click.stop>
          <button class="menu-item" @click="openPrivacySettings">
            <IconComponent name="lock" :size="18" />
            <span>Privacidade</span>
          </button>
          <button class="menu-item" @click="openBlockedProfiles">
            <IconComponent name="block" :size="18" />
            <span>Perfis Bloqueados</span>
          </button>
          <button class="menu-item" @click="openAppSettings">
            <IconComponent name="settings" :size="18" />
            <span>Configurações do App</span>
          </button>
          <div class="menu-divider"></div>
          <button class="menu-item danger" @click="logout">
            <IconComponent name="logout" :size="18" />
            <span>Sair</span>
          </button>
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
        <div v-if="actualSavedPosts.length === 0" class="empty-state">
          <IconComponent name="bookmark" :size="48" />
          <p>Nenhum item salvo</p>
          <p class="sub-text">Salve publicações para vê-las aqui.</p>
        </div>
        <div v-else>
          <!-- Filtros para posts salvos -->
          <div class="saved-filters">
            <select v-model="savedFilter" @change="updateSavedPosts" class="filter-select">
              <option value="all">Todos</option>
              <option value="recent">Mais recentes</option>
              <option value="popular">Mais populares</option>
              <option value="oldest">Mais antigos</option>
            </select>
            <button @click="clearAllSaved" class="clear-btn" v-if="actualSavedPosts.length > 0">
              <IconComponent name="trash" :size="16" />
              Limpar todos
            </button>
          </div>
          <!-- Grid de posts salvos -->
          <div class="saved-posts-grid">
            <div v-for="saved in actualSavedPosts" :key="saved.id" class="saved-item">
              <div class="saved-content">
                <div class="saved-author">
                  <img :src="saved.author?.avatar || generateAvatar()" :alt="saved.author?.name" class="author-avatar">
                  <span class="author-name">{{ saved.author?.name || 'Usuário' }}</span>
                </div>
                <div class="saved-text">{{ saved.content }}</div>
                <img v-if="saved.image" :src="saved.image" :alt="saved.content" class="saved-image" />
                <div class="saved-stats">
                  <span>❤️ {{ saved.likes || 0 }}</span>
                  <span>💬 {{ saved.comments || 0 }}</span>
                </div>
                <div class="saved-meta">
                  <span class="saved-date">Salvo em {{ formatDate(saved.savedAt) }}</span>
                  <button @click="removeSaved(saved.id)" class="remove-saved-btn" title="Remover dos salvos">
                    <IconComponent name="trash" :size="14" />
                  </button>
                </div>
              </div>
            </div>
          </div>
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

    <!-- Modal de Configurações de Privacidade -->
    <div v-if="showPrivacyModal" class="settings-modal-overlay" @click="closePrivacyModal">
      <div class="settings-modal" @click.stop>
        <div class="modal-header">
          <h3>Configurações de Privacidade</h3>
          <button class="close-btn" @click="closePrivacyModal">
            <IconComponent name="close" :size="20" />
          </button>
        </div>
        
        <div class="modal-content">
          <div class="setting-section">
            <div class="setting-item">
              <div class="setting-info">
                <h4>Conta Privada</h4>
                <p>Apenas seguidores aprovados podem ver suas publicações</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="privacySettings.privateAccount">
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>Ocultar Status Online</h4>
                <p>Outros usuários não verão quando você está online</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="privacySettings.hideOnlineStatus">
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>Permitir Mensagens de Desconhecidos</h4>
                <p>Usuários que você não segue podem te enviar mensagens</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="privacySettings.allowUnknownMessages">
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>Mostrar Seguidores</h4>
                <p>Outros usuários podem ver sua lista de seguidores</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="privacySettings.showFollowers">
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>Indexação por Buscadores</h4>
                <p>Permitir que seu perfil apareça em resultados de busca externa</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="privacySettings.searchIndexing">
                <span class="slider"></span>
              </label>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="btn-save" @click="savePrivacySettings">Salvar Alterações</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Perfis Bloqueados -->
    <div v-if="showBlockedModal" class="settings-modal-overlay" @click="closeBlockedModal">
      <div class="settings-modal" @click.stop>
        <div class="modal-header">
          <h3>Perfis Bloqueados</h3>
          <button class="close-btn" @click="closeBlockedModal">
            <IconComponent name="close" :size="20" />
          </button>
        </div>
        
        <div class="modal-content">
          <div class="search-blocked">
            <div class="search-input-container">
              <IconComponent name="search" :size="16" class="search-icon" />
              <input 
                type="text" 
                placeholder="Buscar usuário bloqueado..." 
                v-model="blockedSearchQuery"
                class="search-input"
              />
            </div>
          </div>
          
          <div v-if="filteredBlockedUsers.length === 0" class="empty-state">
            <IconComponent name="block" :size="48" />
            <p v-if="!blockedSearchQuery">Nenhum usuário bloqueado</p>
            <p v-else>Nenhum resultado encontrado</p>
            <p class="sub-text">Usuários bloqueados não podem ver seu perfil ou te enviar mensagens</p>
          </div>
          
          <div v-else class="blocked-list">
            <div 
              v-for="user in filteredBlockedUsers" 
              :key="user.id"
              class="blocked-item"
            >
              <div class="blocked-user-info">
                <img :src="user.avatar" :alt="user.name" class="blocked-avatar">
                <div class="blocked-details">
                  <span class="blocked-name">{{ user.name }}</span>
                  <span class="blocked-username">@{{ user.username }}</span>
                  <span class="blocked-date">Bloqueado em {{ formatDate(user.blockedDate) }}</span>
                </div>
              </div>
              <button class="unblock-btn" @click="unblockUser(user.id)">
                Desbloquear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Configurações do App -->
    <div v-if="showAppSettingsModal" class="settings-modal-overlay" @click="closeAppSettingsModal">
      <div class="settings-modal" @click.stop>
        <div class="modal-header">
          <h3>Configurações do App</h3>
          <button class="close-btn" @click="closeAppSettingsModal">
            <IconComponent name="close" :size="20" />
          </button>
        </div>
        
        <div class="modal-content">
          <div class="setting-section">
            <h4 class="section-title">Aparência</h4>
            <div class="setting-item">
              <div class="setting-info">
                <h4>Tema</h4>
                <p>Escolha entre tema claro, escuro ou automático</p>
              </div>
              <select v-model="appSettings.theme" class="setting-select">
                <option value="auto">Automático</option>
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
              </select>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>Tamanho da Fonte</h4>
                <p>Ajuste o tamanho do texto da interface</p>
              </div>
              <select v-model="appSettings.fontSize" class="setting-select">
                <option value="small">Pequeno</option>
                <option value="medium">Médio</option>
                <option value="large">Grande</option>
              </select>
            </div>
          </div>
          
          <div class="setting-section">
            <h4 class="section-title">Notificações</h4>
            <div class="setting-item">
              <div class="setting-info">
                <h4>Notificações Push</h4>
                <p>Receber notificações quando o app estiver fechado</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="appSettings.pushNotifications">
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>Som das Notificações</h4>
                <p>Reproduzir som quando receber notificações</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="appSettings.soundNotifications">
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>Notificações de Mensagens</h4>
                <p>Receber notificações de novas mensagens</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="appSettings.messageNotifications">
                <span class="slider"></span>
              </label>
            </div>
          </div>
          
          <div class="setting-section">
            <h4 class="section-title">Dados e Armazenamento</h4>
            <div class="setting-item">
              <div class="setting-info">
                <h4>Download Automático</h4>
                <p>Baixar automaticamente imagens e vídeos</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="appSettings.autoDownload">
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>Qualidade das Imagens</h4>
                <p>Escolha a qualidade para economizar dados</p>
              </div>
              <select v-model="appSettings.imageQuality" class="setting-select">
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>
          </div>
          
          <div class="setting-section">
            <h4 class="section-title">Sobre</h4>
            <div class="about-info">
              <div class="about-item">
                <span>Versão do App:</span>
                <span>1.0.0</span>
              </div>
              <div class="about-item">
                <span>Última Atualização:</span>
                <span>28 de Junho, 2025</span>
              </div>
            </div>
            
            <div class="setting-actions">
              <button class="action-btn" @click="clearCache">
                <IconComponent name="trash" :size="16" />
                Limpar Cache
              </button>
              <button class="action-btn" @click="exportData">
                <IconComponent name="download" :size="16" />
                Exportar Dados
              </button>
              <button class="action-btn danger" @click="deleteAccount">
                <IconComponent name="delete" :size="16" />
                Excluir Conta
              </button>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="btn-save" @click="saveAppSettings">Salvar Configurações</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import IconComponent from './IconComponent.vue'
import savedService from '@/services/savedService.js'

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
      userEvents: [],
      
      // Novos dados para posts salvos integrados
      actualSavedPosts: [],
      savedFilter: 'all',
      
      // Menu de perfil e modais
      showProfileMenu: false,
      showPrivacyModal: false,
      showBlockedModal: false,
      showAppSettingsModal: false,
      
      // Configurações de privacidade
      privacySettings: {
        privateAccount: false,
        hideOnlineStatus: false,
        allowUnknownMessages: true,
        showFollowers: true,
        searchIndexing: false
      },
      
      // Perfis bloqueados
      blockedSearchQuery: '',
      blockedUsers: [],
      
      // Configurações do app
      appSettings: {
        theme: 'auto',
        fontSize: 'medium',
        pushNotifications: true,
        soundNotifications: true,
        messageNotifications: true,
        autoDownload: false,
        imageQuality: 'medium'
      }
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
      let savedProfile = JSON.parse(localStorage.getItem(`ifwave_profile_${this.currentUser.id}`) || '{}')
      
      // Se não há avatar salvo, gerar um consistente baseado no ID do usuário
      if (!savedProfile.avatar) {
        savedProfile.avatar = this.generateConsistentAvatar(this.currentUser.id)
        
        // Se não há stats salvos, gerar stats consistentes baseados no ID
        if (!savedProfile.stats) {
          savedProfile.stats = this.generateConsistentStats(this.currentUser.id)
        }
        
        // Salvar o perfil com os dados gerados para manter consistência
        localStorage.setItem(`ifwave_profile_${this.currentUser.id}`, JSON.stringify(savedProfile))
      }
      
      return {
        name: this.currentUser.name,
        username: this.generateUsername(this.currentUser.name),
        course: this.currentUser.course,
        campus: this.currentUser.campus,
        bio: savedProfile.bio || '',
        avatar: savedProfile.avatar,
        stats: savedProfile.stats || this.generateConsistentStats(this.currentUser.id),
        links: savedProfile.links || []
      }
    },

    filteredBlockedUsers() {
      if (!this.blockedSearchQuery) {
        return this.blockedUsers
      }

      return this.blockedUsers.filter(user => 
        user.name.toLowerCase().includes(this.blockedSearchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(this.blockedSearchQuery.toLowerCase())
      )
    }
  },
  watch: {
    currentUser: {
      handler(newUser, oldUser) {
        // Só recarregar dados se o usuário realmente mudou
        if (newUser && (!oldUser || newUser.id !== oldUser.id)) {
          this.loadUserData()
          this.updateSavedPosts()
        }
      },
      immediate: false
    }
  },
  mounted() {
    this.loadUserData()
    this.updateSavedPosts()
    
    // Adicionar listener para fechar menu ao clicar fora
    document.addEventListener('click', this.handleClickOutside)
  },
  
  beforeUnmount() {
    // Remover listener ao destruir componente
    document.removeEventListener('click', this.handleClickOutside)
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

    generateConsistentAvatar(userId) {
      const avatars = [
        'https://images.unsplash.com/photo-1494790108755-2616b612b750?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80'
      ]
      
      // Usar uma função hash simples baseada no userId para garantir consistência
      let hash = 0
      const str = userId.toString()
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
      }
      
      const index = Math.abs(hash) % avatars.length
      return avatars[index]
    },

    generateConsistentStats(userId) {
      // Usar uma função hash simples baseada no userId para gerar stats consistentes
      let hash = 0
      const str = userId.toString()
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
      }
      
      // Usar o hash para gerar números consistentes
      const absHash = Math.abs(hash)
      
      return {
        posts: (absHash % 10) + 1, // 1-10 posts
        followers: (absHash % 50) + 10, // 10-59 followers
        following: ((absHash * 7) % 30) + 5 // 5-34 following
      }
    },

    getHashFromUserId(userId) {
      // Função helper para gerar hash consistente do userId
      let hash = 0
      const str = userId.toString()
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
      }
      return Math.abs(hash)
    },

    loadUserData() {
      if (!this.currentUser) return

      // Verificar se os dados já foram carregados para este usuário
      const dataKey = `ifwave_user_data_${this.currentUser.id}`
      const savedUserData = localStorage.getItem(dataKey)
      
      if (savedUserData) {
        // Se já há dados salvos, carregá-los
        const userData = JSON.parse(savedUserData)
        this.userPosts = userData.userPosts || []
        this.savedPosts = userData.savedPosts || []
        this.userProjects = userData.userProjects || []
        this.userEvents = userData.userEvents || []
      } else {
        // Se não há dados salvos, gerar novos dados consistentes
        this.userPosts = this.generateUserPosts()
        this.savedPosts = this.generateSavedPosts()
        this.userProjects = this.generateUserProjects()
        this.userEvents = this.generateUserEvents()
        
        // Salvar os dados gerados para manter consistência
        const userData = {
          userPosts: this.userPosts,
          savedPosts: this.savedPosts,
          userProjects: this.userProjects,
          userEvents: this.userEvents,
          generatedAt: new Date().toISOString()
        }
        localStorage.setItem(dataKey, JSON.stringify(userData))
      }
      
      // Carregar configurações salvas
      this.loadSavedSettings()
      
      // Carregar usuários bloqueados
      this.updateBlockedUsers()
    },

    loadSavedSettings() {
      // Carregar configurações de privacidade
      if (this.currentUser.privateAccount !== undefined) {
        this.privacySettings.privateAccount = this.currentUser.privateAccount
      }
      if (this.currentUser.hideOnlineStatus !== undefined) {
        this.privacySettings.hideOnlineStatus = this.currentUser.hideOnlineStatus
      }
      if (this.currentUser.allowUnknownMessages !== undefined) {
        this.privacySettings.allowUnknownMessages = this.currentUser.allowUnknownMessages
      }
      if (this.currentUser.showFollowers !== undefined) {
        this.privacySettings.showFollowers = this.currentUser.showFollowers
      }
      if (this.currentUser.searchIndexing !== undefined) {
        this.privacySettings.searchIndexing = this.currentUser.searchIndexing
      }

      // Carregar configurações do app
      const savedAppSettings = localStorage.getItem('ifwave_app_settings')
      if (savedAppSettings) {
        const settings = JSON.parse(savedAppSettings)
        this.appSettings = { ...this.appSettings, ...settings }
      }
    },

    generateUserPosts() {
      if (!this.currentUser) return []
      
      const postImages = [
        'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=300&q=80'
      ]
      
      // Gerar número consistente de posts baseado no ID do usuário
      const hash = this.getHashFromUserId(this.currentUser.id)
      const postCount = (hash % 6) + 1 // 1-6 posts
      
      return Array.from({ length: postCount }, (_, i) => ({
        id: i + 1,
        image: postImages[i % postImages.length],
        caption: `Post ${i + 1}`,
        likes: ((hash * (i + 1)) % 100) + 10,
        comments: ((hash * (i + 2)) % 20) + 2
      }))
    },

    generateSavedPosts() {
      if (!this.currentUser) return []
      
      const savedImages = [
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=300&q=80'
      ]
      
      // Gerar número consistente de posts salvos baseado no ID do usuário
      const hash = this.getHashFromUserId(this.currentUser.id)
      const savedCount = (hash % 4) + 1 // 1-4 posts salvos
      
      return Array.from({ length: savedCount }, (_, i) => ({
        id: i + 1,
        image: savedImages[i % savedImages.length],
        title: `Post salvo ${i + 1}`
      }))
    },

    generateUserProjects() {
      if (!this.currentUser) return []
      
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
      
      // Gerar número consistente de projetos baseado no ID do usuário
      const hash = this.getHashFromUserId(this.currentUser.id)
      const projectCount = (hash % 4) + 1 // 1-4 projetos
      
      return Array.from({ length: projectCount }, (_, i) => ({
        id: i + 1,
        title: projectTitles[i % projectTitles.length],
        description: `Projeto desenvolvido durante o ${i + 1}º semestre`,
        image: projectImages[i % projectImages.length],
        type: i % 2 === 0 ? 'Web App' : 'Mobile',
        technologies: technologies[i % technologies.length]
      }))
    },

    generateUserEvents() {
      if (!this.currentUser) return []
      
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
      
      // Gerar número consistente de eventos baseado no ID do usuário
      const hash = this.getHashFromUserId(this.currentUser.id)
      const eventCount = (hash % 3) + 1 // 1-3 eventos
      
      return Array.from({ length: eventCount }, (_, i) => ({
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
      if (confirm('Tem certeza que deseja sair?')) {
        // Limpar dados do usuário
        localStorage.removeItem('ifwave_current_user')
        localStorage.removeItem('ifwave_auth_token')
        
        // Fechar menu
        this.showProfileMenu = false
        
        // Redirecionar para login
        this.$router.push('/login')
      }
    },

    // Métodos para posts salvos integrados
    updateSavedPosts() {
      this.actualSavedPosts = savedService.getSavedPostsByFilter(this.savedFilter)
    },

    removeSaved(postId) {
      savedService.removeSavedPost(postId)
      this.updateSavedPosts()
    },

    clearAllSaved() {
      if (confirm('Tem certeza que deseja remover todos os posts salvos?')) {
        savedService.clearAllSaved()
        this.updateSavedPosts()
      }
    },

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },

    openPrivacySettings() {
      this.privacySettings = {
        privateAccount: this.currentUser.privateAccount,
        hideOnlineStatus: this.currentUser.hideOnlineStatus,
        allowUnknownMessages: this.currentUser.allowUnknownMessages,
        showFollowers: this.currentUser.showFollowers,
        searchIndexing: this.currentUser.searchIndexing
      }
      this.showPrivacyModal = true
    },

    closePrivacyModal() {
      this.showPrivacyModal = false
    },

    async savePrivacySettings() {
      this.showPrivacyModal = false

      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 500))

      // Atualizar usuário atual no localStorage
      const currentUser = JSON.parse(localStorage.getItem('ifwave_current_user'))
      currentUser.privateAccount = this.privacySettings.privateAccount
      currentUser.hideOnlineStatus = this.privacySettings.hideOnlineStatus
      currentUser.allowUnknownMessages = this.privacySettings.allowUnknownMessages
      currentUser.showFollowers = this.privacySettings.showFollowers
      currentUser.searchIndexing = this.privacySettings.searchIndexing
      localStorage.setItem('ifwave_current_user', JSON.stringify(currentUser))

      // Atualizar perfil salvo
      const profileKey = `ifwave_profile_${currentUser.id}`
      const savedProfile = JSON.parse(localStorage.getItem(profileKey))
      if (savedProfile) {
        savedProfile.privateAccount = this.privacySettings.privateAccount
        savedProfile.hideOnlineStatus = this.privacySettings.hideOnlineStatus
        savedProfile.allowUnknownMessages = this.privacySettings.allowUnknownMessages
        savedProfile.showFollowers = this.privacySettings.showFollowers
        savedProfile.searchIndexing = this.privacySettings.searchIndexing
        localStorage.setItem(profileKey, JSON.stringify(savedProfile))
      }
    },

    openBlockedProfiles() {
      this.showBlockedModal = true
    },

    closeBlockedModal() {
      this.showBlockedModal = false
    },

    unblockUser(userId) {
      if (confirm('Tem certeza que deseja desbloquear este usuário?')) {
        // Simular remoção do bloqueio
        setTimeout(() => {
          const currentUser = JSON.parse(localStorage.getItem('ifwave_current_user'))
          const blockedUsers = currentUser.blockedUsers.filter(user => user.id !== userId)
          currentUser.blockedUsers = blockedUsers
          localStorage.setItem('ifwave_current_user', JSON.stringify(currentUser))

          // Forçar atualização da lista
          this.updateBlockedUsers()
        }, 500)
      }
    },

    updateBlockedUsers() {
      // Método para atualizar a lista de usuários bloqueados
      const currentUser = JSON.parse(localStorage.getItem('ifwave_current_user'))
      
      // Se não há usuários bloqueados, criar alguns exemplos para demonstração
      if (!currentUser.blockedUsers || currentUser.blockedUsers.length === 0) {
        const exampleBlockedUsers = [
          {
            id: 'blocked1',
            name: 'Usuário Spam',
            username: 'usuario.spam',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            blockedDate: new Date().toISOString()
          },
          {
            id: 'blocked2', 
            name: 'Perfil Fake',
            username: 'perfil.fake',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
            blockedDate: new Date(Date.now() - 86400000).toISOString() // 1 dia atrás
          }
        ]
        
        currentUser.blockedUsers = exampleBlockedUsers
        localStorage.setItem('ifwave_current_user', JSON.stringify(currentUser))
      }
      
      this.blockedUsers = currentUser.blockedUsers || []
    },

    openAppSettings() {
      this.showAppSettingsModal = true
    },

    closeAppSettingsModal() {
      this.showAppSettingsModal = false
    },

    async saveAppSettings() {
      this.showAppSettingsModal = false

      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 500))

      // Atualizar configurações no localStorage
      const appSettings = {
        theme: this.appSettings.theme,
        fontSize: this.appSettings.fontSize,
        pushNotifications: this.appSettings.pushNotifications,
        soundNotifications: this.appSettings.soundNotifications,
        messageNotifications: this.appSettings.messageNotifications,
        autoDownload: this.appSettings.autoDownload,
        imageQuality: this.appSettings.imageQuality
      }

      localStorage.setItem('ifwave_app_settings', JSON.stringify(appSettings))
    },

    clearCache() {
      if (confirm('Tem certeza que deseja limpar o cache do aplicativo?')) {
        // Simular limpeza de cache
        setTimeout(() => {
          alert('Cache limpo com sucesso!')
        }, 500)
      }
    },

    exportData() {
      // Lógica para exportar dados do usuário
      const currentUser = JSON.parse(localStorage.getItem('ifwave_current_user'))
      const userData = {
        ...currentUser,
        password: undefined // Não incluir senha na exportação
      }

      const dataStr = JSON.stringify(userData, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `dados_usuario_${currentUser.id}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },

    deleteAccount() {
      if (confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível.')) {
        // Simular exclusão de conta
        setTimeout(() => {
          alert('Conta excluída com sucesso!')
          // Redirecionar para a tela de login ou homepage
          this.$router.push('/login')
        }, 500)
      }
    },

    handleClickOutside(event) {
      // Verificar se o clique foi fora do menu de perfil
      const profileMenu = event.target.closest('.profile-menu')
      if (!profileMenu && this.showProfileMenu) {
        this.showProfileMenu = false
      }
    },
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
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.posts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
}

.saved-grid {
  padding: 0;
}

.saved-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 16px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card);
  color: var(--foreground);
  font-size: 14px;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--special);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: var(--special);
  opacity: 0.8;
}

.saved-posts-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 16px;
}

.saved-item {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
  overflow: hidden;
  transition: transform 0.2s ease;
}

.saved-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.saved-content {
  padding: 16px;
}

.saved-author {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  font-weight: 600;
  color: var(--foreground);
}

.saved-text {
  margin-bottom: 12px;
  color: var(--foreground);
  line-height: 1.4;
}

.saved-image {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 12px;
}

.saved-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--foreground);
}

.saved-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--foreground);
  opacity: 0.7;
}

.remove-saved-btn {
  background: none;
  border: none;
  color: var(--special);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.remove-saved-btn:hover {
  background: var(--background);
}

.post-item {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  cursor: pointer;
}

.post-item img {
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

/* Modal de Configurações */
.settings-modal-overlay {
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
  padding: 20px;
}

.settings-modal {
  background: var(--card);
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--foreground);
}

.close-btn {
  background: none;
  border: none;
  color: var(--special);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: var(--background);
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.setting-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 16px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.setting-info {
  flex: 1;
  min-width: 0;
}

.setting-info h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--foreground);
}

.setting-info p {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #8e8e8e;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  border-radius: 50%;
  transition: .4s;
}

input:checked + .slider {
  background-color: #0095f6;
}

input:checked + .slider:before {
  transform: translateX(16px);
}

.setting-select {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card);
  color: var(--foreground);
  font-size: 14px;
}

/* Bloqueados */
.search-blocked {
  margin-bottom: 16px;
}

.search-input-container {
  position: relative;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  color: #8e8e8e;
}

.search-input {
  padding: 12px 12px 12px 40px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card);
  color: var(--foreground);
  font-size: 14px;
  width: 100%;
}

.blocked-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.blocked-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card);
  transition: transform 0.2s ease;
}

.blocked-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.blocked-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.blocked-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.blocked-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.blocked-name {
  font-weight: 600;
  color: var(--foreground);
}

.blocked-username {
  color: #8e8e8e;
  font-size: 12px;
}

.blocked-date {
  color: #8e8e8e;
  font-size: 11px;
}

.unblock-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: #ff4d4d;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.unblock-btn:hover {
  background: #e60000;
}

/* Menu de Perfil */
.profile-menu {
  position: relative;
  flex-shrink: 0;
  margin-top: 8px;
}

.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--foreground);
  transition: background-color 0.2s ease;
}

.menu-btn:hover {
  background: var(--border);
}

.profile-menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1000;
  padding: 8px 0;
}

.menu-item {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  color: var(--foreground);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background: var(--border);
}

.menu-item.danger {
  color: #ff4757;
}

.menu-item.danger:hover {
  background: rgba(255, 71, 87, 0.1);
}

.menu-divider {
  height: 1px;
  background: var(--border);
  margin: 8px 0;
}

/* Responsividade */
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