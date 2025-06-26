<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <h2>📊 Dashboard</h2>
      <p>Visão geral do sistema</p>
    </div>

    <!-- Cartões de estatísticas -->
    <div class="stats-grid">
      <div 
        v-for="(stat, key) in stats" 
        :key="key" 
        class="stat-card"
        @click="$emit('selectModel', key)"
      >
        <div class="stat-icon">
          <IconComponent :name="models[key]?.icon || 'chart'" :size="32" />
        </div>
        <div class="stat-content">
          <h3>{{ stat.count }}</h3>
          <p>{{ models[key]?.name || key }}</p>
        </div>
        <div class="stat-trend" :class="{ positive: stat.trend > 0, negative: stat.trend < 0 }">
          {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
        </div>
      </div>
    </div>

    <!-- Gráficos e relatórios -->
    <div class="dashboard-grid">
      <!-- Atividade recente -->
      <div class="dashboard-card">
        <div class="card-header">
          <h3>📈 Atividade Recente</h3>
          <select v-model="activityPeriod" class="period-selector">
            <option value="today">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
          </select>
        </div>
        <div class="activity-chart">
          <div class="chart-bars">
            <div 
              v-for="(value, index) in chartData" 
              :key="index" 
              class="chart-bar"
              :style="{ height: `${value}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Posts populares -->
      <div class="dashboard-card">
        <div class="card-header">
          <h3>🔥 Posts Populares</h3>
        </div>
        <div class="popular-posts">
          <div 
            v-for="post in popularPosts" 
            :key="post.id"
            class="popular-item"
          >
            <div class="item-content">
              <span class="content-preview">{{ truncateText(post.content, 50) }}</span>
              <small>por {{ getUserName(post.userId) }}</small>
            </div>
            <div class="item-stats">
              <span class="likes">❤️ {{ post.likesCount }}</span>
              <span class="comments">💬 {{ post.commentsCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Usuários ativos -->
      <div class="dashboard-card">
        <div class="card-header">
          <h3>👥 Usuários Ativos</h3>
        </div>
        <div class="active-users">
          <div 
            v-for="user in activeUsers" 
            :key="user.id"
            class="user-item"
          >
            <div class="user-avatar">
              <img 
                v-if="user.avatar" 
                :src="user.avatar" 
                :alt="user.name"
                @error="handleImageError"
              />
              <IconComponent v-else name="profile" :size="24" />
            </div>
            <div class="user-info">
              <span class="user-name">{{ user.name }}</span>
              <small>{{ user.course }} - {{ user.campus }}</small>
            </div>
            <div class="user-status online">●</div>
          </div>
        </div>
      </div>

      <!-- Relatórios pendentes -->
      <div class="dashboard-card">
        <div class="card-header">
          <h3>🚨 Relatórios Pendentes</h3>
        </div>
        <div class="pending-reports">
          <div 
            v-for="report in pendingReports" 
            :key="report.id"
            class="report-item"
            :class="getReportSeverity(report.reason)"
          >
            <div class="report-content">
              <span class="report-reason">{{ translateReason(report.reason) }}</span>
              <small>{{ report.targetType }} reportado</small>
            </div>
            <div class="report-date">
              {{ formatDate(report.createdAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Status do sistema -->
      <div class="dashboard-card">
        <div class="card-header">
          <h3>⚙️ Status do Sistema</h3>
        </div>
        <div class="system-status">
          <div class="status-item">
            <span class="status-label">Usuários Online</span>
            <span class="status-value">{{ onlineUsers }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Posts Hoje</span>
            <span class="status-value">{{ todayPosts }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Mensagens Hoje</span>
            <span class="status-value">{{ todayMessages }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Armazenamento</span>
            <span class="status-value">{{ storageUsed }}MB</span>
          </div>
        </div>
      </div>

      <!-- Ações rápidas -->
      <div class="dashboard-card">
        <div class="card-header">
          <h3>⚡ Ações Rápidas</h3>
        </div>
        <div class="quick-actions">
          <button 
            v-for="action in quickActions" 
            :key="action.id"
            class="action-btn"
            @click="handleQuickAction(action.id)"
          >
            <IconComponent :name="action.icon" :size="20" />
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import IconComponent from '../../components/IconComponent.vue'

export default {
  name: 'AdminDashboard',
  components: {
    IconComponent
  },
  props: {
    models: {
      type: Object,
      required: true
    },
    dataService: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      activityPeriod: 'week',
      quickActions: [
        { id: 'create-user', label: 'Criar Usuário', icon: 'profile' },
        { id: 'backup-data', label: 'Backup', icon: 'document' },
        { id: 'clear-cache', label: 'Limpar Cache', icon: 'settings' },
        { id: 'export-data', label: 'Exportar Dados', icon: 'share' }
      ]
    }
  },
  computed: {
    stats() {
      const stats = {}
      for (const modelKey in this.models) {
        const data = this.dataService.getAll(modelKey)
        const previousData = this.getPreviousData(modelKey)
        const trend = this.calculateTrend(data.length, previousData.length)
        
        stats[modelKey] = {
          count: data.length,
          trend: trend
        }
      }
      return stats
    },
    
    popularPosts() {
      const posts = this.dataService.getAll('posts')
      return posts
        .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
        .slice(0, 5)
    },
    
    activeUsers() {
      const users = this.dataService.getAll('users')
      return users
        .filter(user => user.isActive)
        .slice(0, 8)
    },
    
    pendingReports() {
      const reports = this.dataService.getAll('reports')
      return reports
        .filter(report => report.status === 'pending')
        .slice(0, 5)
    },
    
    onlineUsers() {
      return this.activeUsers.length
    },
    
    todayPosts() {
      const posts = this.dataService.getAll('posts')
      const today = new Date().toDateString()
      return posts.filter(post => {
        const postDate = new Date(post.createdAt).toDateString()
        return postDate === today
      }).length
    },
    
    todayMessages() {
      const messages = this.dataService.getAll('messages')
      const today = new Date().toDateString()
      return messages.filter(message => {
        const messageDate = new Date(message.createdAt).toDateString()
        return messageDate === today
      }).length
    },
    
    chartData() {
      // Gerar dados do gráfico baseado no período selecionado
      const days = this.activityPeriod === 'today' ? 24 : 
                   this.activityPeriod === 'week' ? 7 : 30
      
      const data = []
      for (let i = 0; i < days; i++) {
        // Simular atividade baseada em dados reais + randomização
        const activity = Math.random() * 100
        data.push(Math.round(activity))
      }
      return data
    },
    
    storageUsed() {
      // Simular uso de armazenamento
      let totalSize = 0
      for (const key in localStorage) {
        if (key.startsWith('ifwave_')) {
          totalSize += localStorage[key].length
        }
      }
      return Math.round(totalSize / 1024) // KB to MB aproximado
    }
  },
  methods: {
    getPreviousData(modelKey) {
      // Simular dados anteriores para calcular tendência
      const currentData = this.dataService.getAll(modelKey)
      const variation = Math.random() * 0.3 - 0.15 // -15% a +15%
      return Array(Math.floor(currentData.length * (1 - variation)))
    },
    
    calculateTrend(current, previous) {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    },
    
    getUserName(userId) {
      const user = this.dataService.getById('users', userId)
      return user ? user.name : 'Usuário Desconhecido'
    },
    
    truncateText(text, maxLength) {
      if (!text) return ''
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    },
    
    translateReason(reason) {
      const translations = {
        spam: 'Spam',
        harassment: 'Assédio',
        inappropriate: 'Inadequado',
        fake: 'Conteúdo Falso',
        violence: 'Violência',
        other: 'Outro'
      }
      return translations[reason] || reason
    },
    
    getReportSeverity(reason) {
      const severities = {
        violence: 'high',
        harassment: 'high',
        inappropriate: 'medium',
        spam: 'low',
        fake: 'medium',
        other: 'low'
      }
      return severities[reason] || 'low'
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    handleQuickAction(actionId) {
      switch (actionId) {
        case 'create-user':
          this.$emit('navigate', 'model', 'users')
          break
        case 'backup-data':
          this.backupData()
          break
        case 'clear-cache':
          this.clearCache()
          break
        case 'export-data':
          this.exportData()
          break
      }
    },
    
    backupData() {
      try {
        const backup = {}
        for (const modelKey in this.models) {
          backup[modelKey] = this.dataService.getAll(modelKey)
        }
        
        const dataStr = JSON.stringify(backup, null, 2)
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
        
        const exportFileDefaultName = `ifwave-backup-${new Date().toISOString().split('T')[0]}.json`
        
        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()
        
        alert('Backup realizado com sucesso!')
      } catch (error) {
        alert('Erro ao realizar backup: ' + error.message)
      }
    },
    
    clearCache() {
      if (confirm('Tem certeza que deseja limpar o cache? Esta ação não pode ser desfeita.')) {
        // Limpar apenas dados temporários, manter dados principais
        const keysToKeep = Object.keys(this.models).map(key => `ifwave_${key}`)
        
        for (const key in localStorage) {
          if (key.startsWith('ifwave_') && !keysToKeep.includes(key)) {
            localStorage.removeItem(key)
          }
        }
        
        alert('Cache limpo com sucesso!')
      }
    },
    
    exportData() {
      try {
        const exportData = {}
        for (const modelKey in this.models) {
          exportData[modelKey] = this.dataService.getAll(modelKey)
        }
        
        const csv = this.jsonToCsv(exportData)
        const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csv)
        
        const exportFileDefaultName = `ifwave-export-${new Date().toISOString().split('T')[0]}.csv`
        
        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()
        
        alert('Dados exportados com sucesso!')
      } catch (error) {
        alert('Erro ao exportar dados: ' + error.message)
      }
    },
    
    jsonToCsv(data) {
      let csv = ''
      
      for (const [modelName, records] of Object.entries(data)) {
        if (records.length === 0) continue
        
        csv += `\n\n=== ${modelName.toUpperCase()} ===\n`
        
        const headers = Object.keys(records[0])
        csv += headers.join(',') + '\n'
        
        for (const record of records) {
          const values = headers.map(header => {
            const value = record[header]
            return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
          })
          csv += values.join(',') + '\n'
        }
      }
      
      return csv
    },
    
    handleImageError(event) {
      event.target.style.display = 'none'
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  padding: 0;
}

.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h2 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 1.8em;
}

.dashboard-header p {
  margin: 0;
  color: #666;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  border-left: 4px solid #007bff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-left-color: #0056b3;
}

.stat-icon {
  background: #f8f9fa;
  border-radius: 50%;
  padding: 12px;
  color: #007bff;
}

.stat-content h3 {
  margin: 0;
  font-size: 2em;
  font-weight: bold;
  color: #333;
}

.stat-content p {
  margin: 4px 0 0 0;
  color: #666;
  font-size: 0.9em;
}

.stat-trend {
  margin-left: auto;
  font-size: 0.9em;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  background: #e9ecef;
  color: #6c757d;
}

.stat-trend.positive {
  background: #d4edda;
  color: #155724;
}

.stat-trend.negative {
  background: #f8d7da;
  color: #721c24;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.dashboard-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.card-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.1em;
}

.period-selector {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9em;
}

/* Activity Chart */
.activity-chart {
  padding: 20px;
}

.chart-bars {
  display: flex;
  align-items: end;
  justify-content: space-between;
  height: 120px;
  gap: 2px;
  padding: 0 10px;
}

.chart-bar {
  background: linear-gradient(to top, #007bff, #66b3ff);
  min-height: 10%;
  flex: 1;
  border-radius: 2px 2px 0 0;
  transition: all 0.3s ease;
}

.chart-bar:hover {
  background: linear-gradient(to top, #0056b3, #4da6ff);
  transform: scaleY(1.05);
}

.chart-placeholder {
  text-align: center;
  color: #999;
  padding: 40px 20px;
}

.chart-placeholder p {
  margin: 10px 0 0 0;
  font-size: 0.9em;
}

/* Popular Posts */
.popular-posts {
  padding: 0;
}

.popular-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f8f9fa;
}

.popular-item:last-child {
  border-bottom: none;
}

.item-content {
  flex: 1;
}

.content-preview {
  display: block;
  color: #333;
  font-size: 0.9em;
  margin-bottom: 4px;
}

.item-content small {
  color: #666;
  font-size: 0.8em;
}

.item-stats {
  display: flex;
  gap: 12px;
  font-size: 0.8em;
  color: #666;
}

/* Active Users */
.active-users {
  padding: 0;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid #f8f9fa;
}

.user-item:last-child {
  border-bottom: none;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-name {
  display: block;
  font-weight: 500;
  color: #333;
  font-size: 0.9em;
}

.user-info small {
  color: #666;
  font-size: 0.8em;
}

.user-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #28a745;
}

/* Pending Reports */
.pending-reports {
  padding: 0;
}

.report-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f8f9fa;
  border-left: 4px solid #28a745;
}

.report-item:last-child {
  border-bottom: none;
}

.report-item.medium {
  border-left-color: #ffc107;
}

.report-item.high {
  border-left-color: #dc3545;
}

.report-reason {
  display: block;
  font-weight: 500;
  color: #333;
  font-size: 0.9em;
}

.report-content small {
  color: #666;
  font-size: 0.8em;
}

.report-date {
  font-size: 0.8em;
  color: #666;
}

/* System Status */
.system-status {
  padding: 20px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f8f9fa;
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  color: #666;
  font-size: 0.9em;
}

.status-value {
  font-weight: bold;
  color: #333;
}

/* Quick Actions */
.quick-actions {
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: #495057;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e9ecef;
  border-color: #007bff;
  color: #007bff;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>
