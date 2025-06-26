<template>
  <div class="admin-tools">
    <div class="tools-header">
      <h2>🛠️ Ferramentas Administrativas</h2>
      <p>Utilitários para gerenciamento do sistema</p>
    </div>

    <div class="tools-grid">
      <!-- Backup e Restauração -->
      <div class="tool-card">
        <div class="tool-header">
          <h3>
            <IconComponent name="document" :size="20" />
            Backup e Restauração
          </h3>
        </div>
        <div class="tool-content">
          <p>Faça backup dos dados do sistema ou restaure de um arquivo anterior.</p>
          
          <div class="tool-actions">
            <button @click="createBackup" class="btn btn-primary">
              <IconComponent name="document" :size="16" />
              Criar Backup
            </button>
            
            <div class="file-input-wrapper">
              <input 
                ref="restoreInput"
                type="file" 
                accept=".json"
                @change="handleRestoreFile"
                style="display: none"
              />
              <button @click="$refs.restoreInput.click()" class="btn btn-secondary">
                <IconComponent name="publish" :size="16" />
                Restaurar Backup
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Importação e Exportação -->
      <div class="tool-card">
        <div class="tool-header">
          <h3>
            <IconComponent name="share" :size="20" />
            Importação e Exportação
          </h3>
        </div>
        <div class="tool-content">
          <p>Importe ou exporte dados em diferentes formatos.</p>
          
          <div class="export-options">
            <label>Formato de exportação:</label>
            <select v-model="exportFormat" class="format-select">
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="xlsx">Excel</option>
            </select>
          </div>
          
          <div class="model-selection">
            <label>Modelos para exportar:</label>
            <div class="checkbox-group">
              <label 
                v-for="(model, key) in models" 
                :key="key"
                class="checkbox-label"
              >
                <input 
                  type="checkbox" 
                  :value="key"
                  v-model="selectedModels"
                />
                {{ model.name }}
              </label>
            </div>
          </div>
          
          <div class="tool-actions">
            <button @click="exportData" :disabled="selectedModels.length === 0" class="btn btn-primary">
              <IconComponent name="share" :size="16" />
              Exportar Dados
            </button>
            
            <div class="file-input-wrapper">
              <input 
                ref="importInput"
                type="file" 
                accept=".json,.csv"
                @change="handleImportFile"
                style="display: none"
              />
              <button @click="$refs.importInput.click()" class="btn btn-secondary">
                <IconComponent name="publish" :size="16" />
                Importar Dados
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Limpeza de Dados -->
      <div class="tool-card">
        <div class="tool-header">
          <h3>
            <IconComponent name="settings" :size="20" />
            Limpeza de Dados
          </h3>
        </div>
        <div class="tool-content">
          <p>Limpe dados desnecessários ou corrompidos do sistema.</p>
          
          <div class="cleanup-options">
            <div class="cleanup-item">
              <label class="checkbox-label">
                <input type="checkbox" v-model="cleanupOptions.orphanedData" />
                Dados órfãos (sem referências)
              </label>
            </div>
            <div class="cleanup-item">
              <label class="checkbox-label">
                <input type="checkbox" v-model="cleanupOptions.oldNotifications" />
                Notificações antigas (>30 dias)
              </label>
            </div>
            <div class="cleanup-item">
              <label class="checkbox-label">
                <input type="checkbox" v-model="cleanupOptions.deletedUsers" />
                Dados de usuários inativos
              </label>
            </div>
            <div class="cleanup-item">
              <label class="checkbox-label">
                <input type="checkbox" v-model="cleanupOptions.emptyPosts" />
                Posts vazios ou corrompidos
              </label>
            </div>
          </div>
          
          <div class="tool-actions">
            <button @click="previewCleanup" class="btn btn-secondary">
              <IconComponent name="search" :size="16" />
              Visualizar Limpeza
            </button>
            <button @click="performCleanup" class="btn btn-danger">
              <IconComponent name="close" :size="16" />
              Executar Limpeza
            </button>
          </div>
        </div>
      </div>

      <!-- Estatísticas do Sistema -->
      <div class="tool-card">
        <div class="tool-header">
          <h3>
            <IconComponent name="chart" :size="20" />
            Estatísticas do Sistema
          </h3>
        </div>
        <div class="tool-content">
          <div class="stats-list">
            <div class="stat-item">
              <span class="stat-label">Espaço usado no localStorage:</span>
              <span class="stat-value">{{ storageInfo.used }} KB</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Espaço disponível estimado:</span>
              <span class="stat-value">{{ storageInfo.available }} KB</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Total de registros:</span>
              <span class="stat-value">{{ totalRecords }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Maior tabela:</span>
              <span class="stat-value">{{ largestTable.name }} ({{ largestTable.count }} registros)</span>
            </div>
          </div>
          
          <div class="tool-actions">
            <button @click="refreshStats" class="btn btn-primary">
              <IconComponent name="settings" :size="16" />
              Atualizar Estatísticas
            </button>
          </div>
        </div>
      </div>

      <!-- Gerador de Dados de Teste -->
      <div class="tool-card">
        <div class="tool-header">
          <h3>
            <IconComponent name="code" :size="20" />
            Gerador de Dados de Teste
          </h3>
        </div>
        <div class="tool-content">
          <p>Gere dados de teste para desenvolvimento e demonstração.</p>
          
          <div class="generator-options">
            <div class="form-group">
              <label>Quantidade de usuários:</label>
              <input 
                type="number" 
                v-model.number="generateOptions.users" 
                min="0" 
                max="100"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Quantidade de posts:</label>
              <input 
                type="number" 
                v-model.number="generateOptions.posts" 
                min="0" 
                max="500"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Quantidade de comentários:</label>
              <input 
                type="number" 
                v-model.number="generateOptions.comments" 
                min="0" 
                max="1000"
                class="form-control"
              />
            </div>
          </div>
          
          <div class="tool-actions">
            <button @click="generateTestData" class="btn btn-primary">
              <IconComponent name="publish" :size="16" />
              Gerar Dados de Teste
            </button>
            <button @click="clearAllData" class="btn btn-danger">
              <IconComponent name="close" :size="16" />
              Limpar Todos os Dados
            </button>
          </div>
        </div>
      </div>

      <!-- Ferramentas de Debug -->
      <div class="tool-card">
        <div class="tool-header">
          <h3>
            <IconComponent name="settings" :size="20" />
            Ferramentas de Debug
          </h3>
        </div>
        <div class="tool-content">
          <p>Ferramentas para depuração e análise do sistema.</p>
          
          <div class="tool-actions">
            <button @click="validateData" class="btn btn-primary">
              <IconComponent name="check" :size="16" />
              Validar Integridade dos Dados
            </button>
            <button @click="showLocalStorageData" class="btn btn-secondary">
              <IconComponent name="code" :size="16" />
              Ver localStorage
            </button>
            <button @click="downloadLogs" class="btn btn-secondary">
              <IconComponent name="document" :size="16" />
              Baixar Logs
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Resultados -->
    <div v-if="showResultModal" class="modal-overlay" @click="closeResultModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ resultModal.title }}</h3>
          <button @click="closeResultModal" class="close-btn">
            <IconComponent name="close" :size="18" />
          </button>
        </div>
        <div class="modal-body">
          <div v-if="resultModal.type === 'cleanup-preview'" class="cleanup-preview">
            <h4>Itens que serão removidos:</h4>
            <div 
              v-for="(items, category) in resultModal.data" 
              :key="category"
              class="preview-category"
            >
              <strong>{{ category }}:</strong> {{ items.length }} item(s)
              <ul v-if="items.length > 0" class="preview-list">
                <li v-for="item in items.slice(0, 5)" :key="item.id">
                  {{ item.name || item.title || item.content || item.id }}
                </li>
                <li v-if="items.length > 5">... e mais {{ items.length - 5 }} item(s)</li>
              </ul>
            </div>
          </div>
          <div v-else-if="resultModal.type === 'validation'" class="validation-results">
            <div 
              v-for="(result, model) in resultModal.data" 
              :key="model"
              class="validation-model"
            >
              <h4>{{ models[model]?.name || model }}</h4>
              <div v-if="result.errors.length === 0" class="validation-success">
                ✅ Todos os {{ result.total }} registros estão válidos
              </div>
              <div v-else class="validation-errors">
                ❌ {{ result.errors.length }} erro(s) encontrado(s):
                <ul>
                  <li v-for="error in result.errors" :key="error.id">
                    <strong>{{ error.id }}:</strong> {{ error.message }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div v-else-if="resultModal.type === 'storage'" class="storage-data">
            <pre>{{ resultModal.data }}</pre>
          </div>
          <div v-else class="result-message">
            {{ resultModal.data }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import IconComponent from '../../components/IconComponent.vue'

export default {
  name: 'AdminTools',
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
      exportFormat: 'json',
      selectedModels: [],
      cleanupOptions: {
        orphanedData: false,
        oldNotifications: false,
        deletedUsers: false,
        emptyPosts: false
      },
      generateOptions: {
        users: 10,
        posts: 50,
        comments: 100
      },
      showResultModal: false,
      resultModal: {
        title: '',
        type: '',
        data: null
      }
    }
  },
  computed: {
    storageInfo() {
      let totalUsed = 0
      for (const key in localStorage) {
        if (key.startsWith('ifwave_')) {
          totalUsed += localStorage[key].length
        }
      }
      
      // Estimativa baseada no limite típico de 5-10MB
      const estimatedLimit = 5 * 1024 * 1024 // 5MB
      const used = Math.round(totalUsed / 1024) // KB
      const available = Math.round((estimatedLimit - totalUsed) / 1024) // KB
      
      return { used, available }
    },
    
    totalRecords() {
      let total = 0
      for (const modelKey in this.models) {
        total += this.dataService.getAll(modelKey).length
      }
      return total
    },
    
    largestTable() {
      let largest = { name: 'Nenhuma', count: 0 }
      for (const [modelKey, model] of Object.entries(this.models)) {
        const count = this.dataService.getAll(modelKey).length
        if (count > largest.count) {
          largest = { name: model.name, count }
        }
      }
      return largest
    }
  },
  mounted() {
    this.selectedModels = Object.keys(this.models)
  },
  methods: {
    createBackup() {
      try {
        const backup = {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          data: {}
        }
        
        for (const modelKey in this.models) {
          backup.data[modelKey] = this.dataService.getAll(modelKey)
        }
        
        this.downloadFile(
          JSON.stringify(backup, null, 2),
          `ifwave-backup-${new Date().toISOString().split('T')[0]}.json`,
          'application/json'
        )
        
        this.showResult('Backup Criado', 'success', 'Backup realizado com sucesso!')
      } catch (error) {
        this.showResult('Erro', 'error', 'Erro ao criar backup: ' + error.message)
      }
    },
    
    handleRestoreFile(event) {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target.result)
          this.restoreFromBackup(backup)
        } catch (error) {
          this.showResult('Erro', 'error', 'Arquivo de backup inválido: ' + error.message)
        }
      }
      reader.readAsText(file)
    },
    
    restoreFromBackup(backup) {
      if (!backup.data) {
        this.showResult('Erro', 'error', 'Formato de backup inválido')
        return
      }
      
      if (!confirm('Tem certeza que deseja restaurar o backup? Todos os dados atuais serão substituídos.')) {
        return
      }
      
      try {
        for (const [modelKey, data] of Object.entries(backup.data)) {
          if (this.models[modelKey]) {
            localStorage.setItem(`ifwave_${modelKey}`, JSON.stringify(data))
          }
        }
        
        this.showResult('Restauração Concluída', 'success', 'Backup restaurado com sucesso!')
        this.refreshStats()
      } catch (error) {
        this.showResult('Erro', 'error', 'Erro ao restaurar backup: ' + error.message)
      }
    },
    
    exportData() {
      try {
        const exportData = {}
        
        for (const modelKey of this.selectedModels) {
          exportData[modelKey] = this.dataService.getAll(modelKey)
        }
        
        let filename, content, mimeType
        
        switch (this.exportFormat) {
          case 'json':
            content = JSON.stringify(exportData, null, 2)
            filename = `ifwave-export-${new Date().toISOString().split('T')[0]}.json`
            mimeType = 'application/json'
            break
            
          case 'csv':
            content = this.convertToCSV(exportData)
            filename = `ifwave-export-${new Date().toISOString().split('T')[0]}.csv`
            mimeType = 'text/csv'
            break
            
          default:
            throw new Error('Formato de exportação não suportado')
        }
        
        this.downloadFile(content, filename, mimeType)
        this.showResult('Exportação Concluída', 'success', 'Dados exportados com sucesso!')
      } catch (error) {
        this.showResult('Erro', 'error', 'Erro ao exportar dados: ' + error.message)
      }
    },
    
    convertToCSV(data) {
      let csv = ''
      
      for (const [modelName, records] of Object.entries(data)) {
        if (records.length === 0) continue
        
        csv += `\n\n=== ${modelName.toUpperCase()} ===\n`
        
        const headers = Object.keys(records[0])
        csv += headers.join(',') + '\n'
        
        for (const record of records) {
          const values = headers.map(header => {
            const value = record[header]
            if (value === null || value === undefined) return ''
            if (typeof value === 'string') {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          })
          csv += values.join(',') + '\n'
        }
      }
      
      return csv
    },
    
    handleImportFile(event) {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          let importData
          
          if (file.name.endsWith('.json')) {
            importData = JSON.parse(e.target.result)
          } else if (file.name.endsWith('.csv')) {
            // Implementação básica de CSV - pode ser expandida
            this.showResult('Erro', 'error', 'Importação de CSV não implementada ainda')
            return
          }
          
          this.importData(importData)
        } catch (error) {
          this.showResult('Erro', 'error', 'Erro ao importar arquivo: ' + error.message)
        }
      }
      reader.readAsText(file)
    },
    
    importData(data) {
      if (!confirm('Tem certeza que deseja importar estes dados? Registros existentes podem ser substituídos.')) {
        return
      }
      
      try {
        let imported = 0
        
        for (const [modelKey, records] of Object.entries(data)) {
          if (this.models[modelKey] && Array.isArray(records)) {
            for (const record of records) {
              this.dataService.create(modelKey, record)
              imported++
            }
          }
        }
        
        this.showResult('Importação Concluída', 'success', `${imported} registros importados com sucesso!`)
        this.refreshStats()
      } catch (error) {
        this.showResult('Erro', 'error', 'Erro ao importar dados: ' + error.message)
      }
    },
    
    previewCleanup() {
      const preview = {}
      
      if (this.cleanupOptions.orphanedData) {
        preview['Dados Órfãos'] = this.findOrphanedData()
      }
      
      if (this.cleanupOptions.oldNotifications) {
        preview['Notificações Antigas'] = this.findOldNotifications()
      }
      
      if (this.cleanupOptions.deletedUsers) {
        preview['Usuários Inativos'] = this.findInactiveUsers()
      }
      
      if (this.cleanupOptions.emptyPosts) {
        preview['Posts Vazios'] = this.findEmptyPosts()
      }
      
      this.showResult('Prévia da Limpeza', 'cleanup-preview', preview)
    },
    
    performCleanup() {
      if (!confirm('Tem certeza que deseja executar a limpeza? Esta ação não pode ser desfeita.')) {
        return
      }
      
      try {
        let removed = 0
        
        if (this.cleanupOptions.orphanedData) {
          removed += this.removeOrphanedData()
        }
        
        if (this.cleanupOptions.oldNotifications) {
          removed += this.removeOldNotifications()
        }
        
        if (this.cleanupOptions.deletedUsers) {
          removed += this.removeInactiveUsers()
        }
        
        if (this.cleanupOptions.emptyPosts) {
          removed += this.removeEmptyPosts()
        }
        
        this.showResult('Limpeza Concluída', 'success', `${removed} itens removidos com sucesso!`)
        this.refreshStats()
      } catch (error) {
        this.showResult('Erro', 'error', 'Erro durante a limpeza: ' + error.message)
      }
    },
    
    findOrphanedData() {
      // Encontrar dados sem referências válidas
      const orphaned = []
      // Implementação simplificada
      return orphaned
    },
    
    findOldNotifications() {
      const notifications = this.dataService.getAll('notifications')
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      return notifications.filter(notification => {
        const createdAt = new Date(notification.createdAt)
        return createdAt < thirtyDaysAgo
      })
    },
    
    findInactiveUsers() {
      const users = this.dataService.getAll('users')
      return users.filter(user => !user.isActive)
    },
    
    findEmptyPosts() {
      const posts = this.dataService.getAll('posts')
      return posts.filter(post => !post.content || post.content.trim() === '')
    },
    
    removeOrphanedData() {
      // Implementar remoção de dados órfãos
      return 0
    },
    
    removeOldNotifications() {
      const oldNotifications = this.findOldNotifications()
      oldNotifications.forEach(notification => {
        this.dataService.delete('notifications', notification.id)
      })
      return oldNotifications.length
    },
    
    removeInactiveUsers() {
      const inactiveUsers = this.findInactiveUsers()
      inactiveUsers.forEach(user => {
        this.dataService.delete('users', user.id)
      })
      return inactiveUsers.length
    },
    
    removeEmptyPosts() {
      const emptyPosts = this.findEmptyPosts()
      emptyPosts.forEach(post => {
        this.dataService.delete('posts', post.id)
      })
      return emptyPosts.length
    },
    
    generateTestData() {
      if (!confirm('Tem certeza que deseja gerar dados de teste? Isso pode criar muitos registros.')) {
        return
      }
      
      try {
        let generated = 0
        
        // Gerar usuários
        for (let i = 0; i < this.generateOptions.users; i++) {
          const user = this.generateRandomUser(i)
          this.dataService.create('users', user)
          generated++
        }
        
        // Gerar posts
        const users = this.dataService.getAll('users')
        for (let i = 0; i < this.generateOptions.posts; i++) {
          const post = this.generateRandomPost(users)
          this.dataService.create('posts', post)
          generated++
        }
        
        // Gerar comentários
        const posts = this.dataService.getAll('posts')
        for (let i = 0; i < this.generateOptions.comments; i++) {
          const comment = this.generateRandomComment(users, posts)
          this.dataService.create('comments', comment)
          generated++
        }
        
        this.showResult('Dados Gerados', 'success', `${generated} registros de teste criados com sucesso!`)
        this.refreshStats()
      } catch (error) {
        this.showResult('Erro', 'error', 'Erro ao gerar dados de teste: ' + error.message)
      }
    },
    
    generateRandomUser(index) {
      const names = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Luiza', 'Roberto', 'Fernanda', 'Ricardo', 'Camila']
      const surnames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes']
      const courses = ['Análise e Desenvolvimento de Sistemas', 'Redes de Computadores', 'Informática', 'Administração', 'Contabilidade']
      const campuses = ['IFMT Campus Cuiabá', 'IFMT Campus Várzea Grande', 'IFMT Campus Rondonópolis']
      
      const firstName = names[Math.floor(Math.random() * names.length)]
      const lastName = surnames[Math.floor(Math.random() * surnames.length)]
      const name = `${firstName} ${lastName}`
      
      return {
        name,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@estudante.ifmt.edu.br`,
        course: courses[Math.floor(Math.random() * courses.length)],
        campus: campuses[Math.floor(Math.random() * campuses.length)],
        passwordHash: this.hashPassword('123456'),
        isActive: Math.random() > 0.1, // 90% ativos
        isVerified: Math.random() > 0.3, // 70% verificados
        role: Math.random() > 0.9 ? 'teacher' : 'student', // 10% professores
        bio: `Estudante de ${courses[Math.floor(Math.random() * courses.length)]} no IFMT.`,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(), // Últimos 90 dias
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // Última semana
      }
    },
    
    generateRandomPost(users) {
      const contents = [
        'Acabei de terminar meu projeto de programação! 🎉',
        'Alguém pode me ajudar com esta questão de matemática?',
        'Que evento incrível tivemos hoje no campus!',
        'Dicas para a prova de algoritmos?',
        'Novo laboratório de informática ficou show! 💻',
        'Quem vai no evento de tecnologia na próxima semana?',
        'Compartilhando um artigo interessante sobre IA',
        'Grupo de estudos de banco de dados, quem tem interesse?',
        'Feedback sobre o projeto integrador',
        'Dúvidas sobre estágio obrigatório'
      ]
      
      const user = users[Math.floor(Math.random() * users.length)]
      
      return {
        userId: user.id,
        content: contents[Math.floor(Math.random() * contents.length)],
        type: Math.random() > 0.8 ? 'image' : 'text',
        isPublic: Math.random() > 0.05, // 95% públicos
        likesCount: Math.floor(Math.random() * 50),
        commentsCount: Math.floor(Math.random() * 20),
        sharesCount: Math.floor(Math.random() * 10),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Últimos 30 dias
        updatedAt: new Date().toISOString()
      }
    },
    
    generateRandomComment(users, posts) {
      const comments = [
        'Muito bom! 👏',
        'Concordo totalmente!',
        'Tenho a mesma dúvida...',
        'Obrigado por compartilhar!',
        'Interessante ponto de vista',
        'Pode me explicar melhor?',
        'Excelente trabalho!',
        'Vou participar sim!',
        'Achei muito útil esta informação',
        'Parabéns pelo projeto!'
      ]
      
      const user = users[Math.floor(Math.random() * users.length)]
      const post = posts[Math.floor(Math.random() * posts.length)]
      
      return {
        postId: post.id,
        userId: user.id,
        content: comments[Math.floor(Math.random() * comments.length)],
        likesCount: Math.floor(Math.random() * 10),
        isHidden: Math.random() > 0.95, // 5% ocultos
        createdAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString(), // Últimos 15 dias
        updatedAt: new Date().toISOString()
      }
    },
    
    clearAllData() {
      if (!confirm('ATENÇÃO: Tem certeza que deseja limpar TODOS os dados? Esta ação é irreversível!')) {
        return
      }
      
      if (!confirm('Esta é sua última chance. Todos os dados serão perdidos permanentemente. Continuar?')) {
        return
      }
      
      try {
        for (const modelKey in this.models) {
          localStorage.removeItem(`ifwave_${modelKey}`)
        }
        
        this.showResult('Dados Limpos', 'success', 'Todos os dados foram removidos com sucesso!')
        this.refreshStats()
      } catch (error) {
        this.showResult('Erro', 'error', 'Erro ao limpar dados: ' + error.message)
      }
    },
    
    validateData() {
      const results = {}
      
      for (const [modelKey, model] of Object.entries(this.models)) {
        const records = this.dataService.getAll(modelKey)
        const errors = []
        
        records.forEach(record => {
          // Validar campos obrigatórios
          for (const [fieldName, fieldConfig] of Object.entries(model.fields)) {
            if (fieldConfig.required && !record[fieldName]) {
              errors.push({
                id: record.id,
                message: `Campo obrigatório '${fieldConfig.label}' está vazio`
              })
            }
          }
          
          // Validar tipos de dados
          // Validar referências estrangeiras
          // etc.
        })
        
        results[modelKey] = {
          total: records.length,
          errors
        }
      }
      
      this.showResult('Validação de Dados', 'validation', results)
    },
    
    showLocalStorageData() {
      const data = {}
      for (const key in localStorage) {
        if (key.startsWith('ifwave_')) {
          try {
            data[key] = JSON.parse(localStorage[key])
          } catch {
            data[key] = localStorage[key]
          }
        }
      }
      
      this.showResult('Dados do localStorage', 'storage', JSON.stringify(data, null, 2))
    },
    
    downloadLogs() {
      // Gerar logs do sistema
      const logs = {
        timestamp: new Date().toISOString(),
        system: 'IF Wave Admin',
        storage: this.storageInfo,
        records: this.totalRecords,
        models: Object.keys(this.models),
        browser: navigator.userAgent
      }
      
      this.downloadFile(
        JSON.stringify(logs, null, 2),
        `ifwave-logs-${new Date().toISOString().split('T')[0]}.json`,
        'application/json'
      )
      
      this.showResult('Logs Baixados', 'success', 'Logs do sistema baixados com sucesso!')
    },
    
    refreshStats() {
      this.$forceUpdate()
    },
    
    downloadFile(content, filename, mimeType) {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      
      URL.revokeObjectURL(url)
    },
    
    hashPassword(password) {
      let hash = 0
      for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }
      return Math.abs(hash).toString(16)
    },
    
    showResult(title, type, data) {
      this.resultModal = { title, type, data }
      this.showResultModal = true
    },
    
    closeResultModal() {
      this.showResultModal = false
      this.resultModal = { title: '', type: '', data: null }
    }
  }
}
</script>

<style scoped>
.admin-tools {
  padding: 0;
}

.tools-header {
  margin-bottom: 30px;
}

.tools-header h2 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 1.8em;
}

.tools-header p {
  margin: 0;
  color: #666;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.tool-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.tool-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.tool-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #333;
  font-size: 1.1em;
}

.tool-content {
  padding: 20px;
}

.tool-content p {
  margin: 0 0 20px 0;
  color: #666;
  line-height: 1.5;
}

.tool-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.file-input-wrapper {
  position: relative;
}

.export-options,
.model-selection,
.cleanup-options,
.generator-options {
  margin-bottom: 20px;
}

.export-options label,
.model-selection label,
.generator-options label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
  font-size: 14px;
}

.format-select,
.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #495057;
  cursor: pointer;
  margin: 0;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
}

.cleanup-item {
  margin-bottom: 12px;
}

.stats-list {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f8f9fa;
  font-size: 14px;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: #666;
}

.stat-value {
  font-weight: bold;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #495057;
  font-size: 14px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 700px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #495057;
}

.modal-body {
  padding: 20px;
}

.cleanup-preview,
.validation-results {
  font-size: 14px;
}

.preview-category,
.validation-model {
  margin-bottom: 20px;
}

.preview-category strong,
.validation-model h4 {
  color: #333;
  margin-bottom: 8px;
}

.preview-list {
  margin: 8px 0 0 20px;
  color: #666;
}

.validation-success {
  color: #28a745;
  font-weight: 500;
}

.validation-errors {
  color: #dc3545;
}

.validation-errors ul {
  margin: 8px 0 0 20px;
}

.storage-data pre {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 12px;
  border: 1px solid #e9ecef;
}

.result-message {
  font-size: 16px;
  color: #495057;
  text-align: center;
  padding: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .tool-actions {
    flex-direction: column;
  }
  
  .checkbox-group {
    grid-template-columns: 1fr;
  }
  
  .stat-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
}
</style>
