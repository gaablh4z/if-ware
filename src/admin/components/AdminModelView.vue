<template>
  <div class="admin-model-view">
    <!-- Header -->
    <div class="model-header">
      <div class="header-left">
        <button @click="$emit('back')" class="back-btn">
          <IconComponent name="back" :size="16" />
          Voltar
        </button>
        <h2>
          <IconComponent :name="model.icon" :size="24" />
          {{ model.name }}
        </h2>
      </div>
      
      <div class="header-actions">
        <button @click="showForm = true; editingItem = null" class="btn btn-primary">
          <IconComponent name="publish" :size="16" />
          Adicionar {{ model.name.slice(0, -1) }}
        </button>
      </div>
    </div>

    <!-- Filtros e busca -->
    <div class="model-filters">
      <div class="search-bar">
        <IconComponent name="search" :size="16" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Buscar..."
          class="search-input"
        />
      </div>
      
      <div class="filters">
        <select 
          v-for="filter in model.listFilter" 
          :key="filter"
          v-model="filters[filter]"
          class="filter-select"
        >
          <option value="">Todos {{ getFieldLabel(filter) }}</option>
          <option 
            v-for="option in getFilterOptions(filter)" 
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
      
      <div class="view-controls">
        <button 
          @click="viewMode = 'table'" 
          :class="{ active: viewMode === 'table' }"
          class="view-btn"
        >
          <IconComponent name="grid" :size="16" />
        </button>
        <button 
          @click="viewMode = 'cards'" 
          :class="{ active: viewMode === 'cards' }"
          class="view-btn"
        >
          <IconComponent name="menu" :size="16" />
        </button>
      </div>
    </div>

    <!-- Lista de itens -->
    <div class="model-content">
      <!-- Modo Tabela -->
      <div v-if="viewMode === 'table'" class="table-view">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    @change="toggleSelectAll"
                    :checked="allSelected"
                    :indeterminate="someSelected"
                  />
                </th>
                <th 
                  v-for="field in model.listDisplay" 
                  :key="field"
                  @click="sortBy(field)"
                  class="sortable"
                  :class="{ active: sortField === field }"
                >
                  {{ getFieldLabel(field) }}
                  <span v-if="sortField === field" class="sort-indicator">
                    {{ sortDirection === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="item in paginatedItems" 
                :key="item.id"
                class="data-row"
              >
                <td>
                  <input 
                    type="checkbox" 
                    :value="item.id"
                    v-model="selectedItems"
                  />
                </td>
                <td 
                  v-for="field in model.listDisplay" 
                  :key="field"
                  class="data-cell"
                >
                  {{ formatFieldValue(item[field], field) }}
                </td>
                <td class="actions-cell">
                  <button 
                    @click="editItem(item)" 
                    class="action-btn edit"
                    title="Editar"
                  >
                    <IconComponent name="edit" :size="14" />
                  </button>
                  <button 
                    @click="deleteItem(item)" 
                    class="action-btn delete"
                    title="Excluir"
                  >
                    <IconComponent name="close" :size="14" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modo Cards -->
      <div v-else class="cards-view">
        <div class="cards-grid">
          <div 
            v-for="item in paginatedItems" 
            :key="item.id"
            class="item-card"
          >
            <div class="card-header">
              <input 
                type="checkbox" 
                :value="item.id"
                v-model="selectedItems"
              />
              <div class="card-actions">
                <button 
                  @click="editItem(item)" 
                  class="action-btn edit"
                  title="Editar"
                >
                  <IconComponent name="edit" :size="14" />
                </button>
                <button 
                  @click="deleteItem(item)" 
                  class="action-btn delete"
                  title="Excluir"
                >
                  <IconComponent name="close" :size="14" />
                </button>
              </div>
            </div>
            <div class="card-content">
              <div 
                v-for="field in model.listDisplay.slice(0, 4)" 
                :key="field"
                class="card-field"
              >
                <strong>{{ getFieldLabel(field) }}:</strong>
                <span>{{ formatFieldValue(item[field], field) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginação -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          @click="currentPage = 1" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          ««
        </button>
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          ‹
        </button>
        
        <span class="page-info">
          {{ currentPage }} de {{ totalPages }}
        </span>
        
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          ›
        </button>
        <button 
          @click="currentPage = totalPages" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          »»
        </button>
      </div>
    </div>

    <!-- Ações em lote -->
    <div v-if="selectedItems.length > 0" class="bulk-actions">
      <div class="bulk-info">
        {{ selectedItems.length }} item(s) selecionado(s)
      </div>
      <div class="bulk-buttons">
        <button @click="bulkDelete" class="btn btn-danger">
          <IconComponent name="close" :size="16" />
          Excluir Selecionados
        </button>
        <button @click="selectedItems = []" class="btn btn-secondary">
          Cancelar
        </button>
      </div>
    </div>

    <!-- Modal de formulário -->
    <div v-if="showForm" class="modal-overlay" @click="closeForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            {{ editingItem ? 'Editar' : 'Adicionar' }} {{ model.name.slice(0, -1) }}
          </h3>
          <button @click="closeForm" class="close-btn">
            <IconComponent name="close" :size="18" />
          </button>
        </div>
        
        <form @submit.prevent="saveItem" class="item-form">
          <div class="form-grid">
            <div 
              v-for="(fieldConfig, fieldName) in model.fields" 
              :key="fieldName"
              v-show="!fieldConfig.readonly || editingItem"
              class="form-group"
              :class="{ 'full-width': fieldConfig.type === 'textarea' }"
            >
              <label :for="fieldName">
                {{ fieldConfig.label }}
                <span v-if="fieldConfig.required" class="required">*</span>
              </label>
              
              <!-- Text, Email, Tel, URL, Number -->
              <input 
                v-if="['text', 'email', 'tel', 'url', 'number'].includes(fieldConfig.type)"
                :id="fieldName"
                v-model="formData[fieldName]"
                :type="fieldConfig.type"
                :required="fieldConfig.required"
                :readonly="fieldConfig.readonly"
                class="form-control"
              />
              
              <!-- Password -->
              <input 
                v-else-if="fieldConfig.type === 'password'"
                :id="fieldName"
                v-model="formData[fieldName]"
                type="password"
                :required="fieldConfig.required && !editingItem"
                class="form-control"
                :placeholder="editingItem ? 'Deixe em branco para manter a senha atual' : ''"
              />
              
              <!-- Textarea -->
              <textarea 
                v-else-if="fieldConfig.type === 'textarea'"
                :id="fieldName"
                v-model="formData[fieldName]"
                :required="fieldConfig.required"
                :readonly="fieldConfig.readonly"
                class="form-control"
                rows="3"
              ></textarea>
              
              <!-- Select -->
              <select 
                v-else-if="fieldConfig.type === 'select'"
                :id="fieldName"
                v-model="formData[fieldName]"
                :required="fieldConfig.required"
                :disabled="fieldConfig.readonly"
                class="form-control"
              >
                <option value="">Selecione...</option>
                <option 
                  v-for="option in fieldConfig.options" 
                  :key="option"
                  :value="option"
                >
                  {{ option }}
                </option>
              </select>
              
              <!-- Boolean -->
              <div v-else-if="fieldConfig.type === 'boolean'" class="checkbox-wrapper">
                <input 
                  :id="fieldName"
                  type="checkbox"
                  v-model="formData[fieldName]"
                  :disabled="fieldConfig.readonly"
                  class="form-checkbox"
                />
                <label :for="fieldName" class="checkbox-label">
                  {{ fieldConfig.label }}
                </label>
              </div>
              
              <!-- Date, Datetime -->
              <input 
                v-else-if="['date', 'datetime'].includes(fieldConfig.type)"
                :id="fieldName"
                v-model="formData[fieldName]"
                :type="fieldConfig.type === 'date' ? 'date' : 'datetime-local'"
                :required="fieldConfig.required"
                :readonly="fieldConfig.readonly"
                class="form-control"
              />
              
              <!-- Foreign Key -->
              <select 
                v-else-if="fieldConfig.type === 'foreignkey'"
                :id="fieldName"
                v-model="formData[fieldName]"
                :required="fieldConfig.required"
                :disabled="fieldConfig.readonly"
                class="form-control"
              >
                <option value="">Selecione...</option>
                <option 
                  v-for="option in getForeignKeyOptions(fieldConfig.model)" 
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              
              <!-- JSON -->
              <textarea 
                v-else-if="fieldConfig.type === 'json'"
                :id="fieldName"
                v-model="jsonFields[fieldName]"
                :required="fieldConfig.required"
                :readonly="fieldConfig.readonly"
                class="form-control json-field"
                rows="4"
                placeholder="Formato JSON válido"
              ></textarea>
              
              <!-- Default fallback -->
              <input 
                v-else
                :id="fieldName"
                v-model="formData[fieldName]"
                type="text"
                :required="fieldConfig.required"
                :readonly="fieldConfig.readonly"
                class="form-control"
              />
              
              <!-- Field errors -->
              <div v-if="fieldErrors[fieldName]" class="field-error">
                {{ fieldErrors[fieldName] }}
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" :disabled="isSaving" class="btn btn-primary">
              {{ isSaving ? 'Salvando...' : 'Salvar' }}
            </button>
            <button type="button" @click="closeForm" class="btn btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import IconComponent from '../../components/IconComponent.vue'

export default {
  name: 'AdminModelView',
  components: {
    IconComponent
  },
  props: {
    modelName: {
      type: String,
      required: true
    },
    model: {
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
      // View settings
      viewMode: 'table', // 'table' or 'cards'
      searchQuery: '',
      filters: {},
      sortField: '',
      sortDirection: 'desc',
      
      // Pagination
      currentPage: 1,
      itemsPerPage: 20,
      
      // Selection
      selectedItems: [],
      
      // Form
      showForm: false,
      editingItem: null,
      formData: {},
      jsonFields: {},
      fieldErrors: {},
      isSaving: false
    }
  },
  computed: {
    allItems() {
      return this.dataService.getAll(this.modelName)
    },
    
    filteredItems() {
      let items = [...this.allItems]
      
      // Apply search
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        items = items.filter(item => {
          return this.model.searchFields.some(field => {
            const value = item[field]
            return value && value.toString().toLowerCase().includes(query)
          })
        })
      }
      
      // Apply filters
      for (const [field, value] of Object.entries(this.filters)) {
        if (value) {
          items = items.filter(item => item[field] === value)
        }
      }
      
      return items
    },
    
    sortedItems() {
      if (!this.sortField) {
        return this.filteredItems
      }
      
      return [...this.filteredItems].sort((a, b) => {
        const aVal = a[this.sortField]
        const bVal = b[this.sortField]
        
        let comparison = 0
        if (aVal < bVal) comparison = -1
        else if (aVal > bVal) comparison = 1
        
        return this.sortDirection === 'asc' ? comparison : -comparison
      })
    },
    
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.sortedItems.slice(start, end)
    },
    
    totalPages() {
      return Math.ceil(this.sortedItems.length / this.itemsPerPage)
    },
    
    allSelected() {
      return this.paginatedItems.length > 0 && 
             this.paginatedItems.every(item => this.selectedItems.includes(item.id))
    },
    
    someSelected() {
      return this.selectedItems.length > 0 && !this.allSelected
    }
  },
  watch: {
    searchQuery() {
      this.currentPage = 1
    },
    filters: {
      handler() {
        this.currentPage = 1
      },
      deep: true
    }
  },
  mounted() {
    this.initializeFilters()
    this.applySorting()
  },
  methods: {
    initializeFilters() {
      this.model.listFilter?.forEach(field => {
        this.$set(this.filters, field, '')
      })
    },
    
    applySorting() {
      if (this.model.ordering && this.model.ordering.length > 0) {
        const firstOrder = this.model.ordering[0]
        if (firstOrder.startsWith('-')) {
          this.sortField = firstOrder.substring(1)
          this.sortDirection = 'desc'
        } else {
          this.sortField = firstOrder
          this.sortDirection = 'asc'
        }
      }
    },
    
    getFieldLabel(fieldName) {
      return this.model.fields[fieldName]?.label || fieldName
    },
    
    getFilterOptions(fieldName) {
      const field = this.model.fields[fieldName]
      
      if (field.type === 'select') {
        return field.options.map(option => ({
          value: option,
          label: option
        }))
      }
      
      if (field.type === 'boolean') {
        return [
          { value: true, label: 'Sim' },
          { value: false, label: 'Não' }
        ]
      }
      
      // Extract unique values from data
      const values = [...new Set(this.allItems.map(item => item[fieldName]))]
        .filter(val => val !== null && val !== undefined && val !== '')
      
      return values.map(value => ({
        value,
        label: this.formatFieldValue(value, fieldName)
      }))
    },
    
    getForeignKeyOptions(modelName) {
      const relatedItems = this.dataService.getAll(modelName)
      return relatedItems.map(item => ({
        value: item.id,
        label: item.name || item.title || item.email || item.id
      }))
    },
    
    formatFieldValue(value, fieldName) {
      if (value === null || value === undefined) return ''
      
      const field = this.model.fields[fieldName]
      
      if (field?.type === 'boolean') {
        return value ? 'Sim' : 'Não'
      }
      
      if (field?.type === 'datetime' || field?.type === 'date') {
        try {
          const date = new Date(value)
          return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            ...(field.type === 'datetime' && {
              hour: '2-digit',
              minute: '2-digit'
            })
          })
        } catch {
          return value
        }
      }
      
      if (field?.type === 'foreignkey') {
        const relatedItem = this.dataService.getById(field.model, value)
        return relatedItem ? (relatedItem.name || relatedItem.title || relatedItem.email || value) : value
      }
      
      if (typeof value === 'string' && value.length > 50) {
        return value.substring(0, 50) + '...'
      }
      
      return value
    },
    
    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortField = field
        this.sortDirection = 'asc'
      }
    },
    
    toggleSelectAll() {
      if (this.allSelected) {
        this.selectedItems = this.selectedItems.filter(id => 
          !this.paginatedItems.some(item => item.id === id)
        )
      } else {
        const newSelections = this.paginatedItems.map(item => item.id)
        this.selectedItems = [...new Set([...this.selectedItems, ...newSelections])]
      }
    },
    
    editItem(item) {
      this.editingItem = item
      this.formData = { ...item }
      
      // Handle JSON fields
      for (const [fieldName, fieldConfig] of Object.entries(this.model.fields)) {
        if (fieldConfig.type === 'json') {
          this.jsonFields[fieldName] = JSON.stringify(item[fieldName] || {}, null, 2)
        }
      }
      
      this.showForm = true
    },
    
    deleteItem(item) {
      if (confirm(`Tem certeza que deseja excluir este ${this.model.name.slice(0, -1).toLowerCase()}?`)) {
        try {
          this.dataService.delete(this.modelName, item.id)
          this.$forceUpdate()
        } catch (error) {
          alert('Erro ao excluir: ' + error.message)
        }
      }
    },
    
    bulkDelete() {
      if (confirm(`Tem certeza que deseja excluir ${this.selectedItems.length} item(s)?`)) {
        try {
          this.selectedItems.forEach(id => {
            this.dataService.delete(this.modelName, id)
          })
          this.selectedItems = []
          this.$forceUpdate()
        } catch (error) {
          alert('Erro ao excluir itens: ' + error.message)
        }
      }
    },
    
    closeForm() {
      this.showForm = false
      this.editingItem = null
      this.formData = {}
      this.jsonFields = {}
      this.fieldErrors = {}
      this.isSaving = false
    },
    
    async saveItem() {
      this.isSaving = true
      this.fieldErrors = {}
      
      try {
        // Validate and prepare data
        const data = { ...this.formData }
        
        // Handle JSON fields
        for (const [fieldName, value] of Object.entries(this.jsonFields)) {
          try {
            data[fieldName] = JSON.parse(value || '{}')
          } catch (error) {
            this.fieldErrors[fieldName] = 'JSON inválido'
          }
        }
        
        // Check for validation errors
        if (Object.keys(this.fieldErrors).length > 0) {
          this.isSaving = false
          return
        }
        
        // Hash password if provided
        for (const [fieldName, fieldConfig] of Object.entries(this.model.fields)) {
          if (fieldConfig.type === 'password' && data[fieldName]) {
            data[fieldName] = this.hashPassword(data[fieldName])
          }
        }
        
        // Save data
        if (this.editingItem) {
          await this.dataService.update(this.modelName, this.editingItem.id, data)
        } else {
          await this.dataService.create(this.modelName, data)
        }
        
        this.closeForm()
        this.$forceUpdate()
      } catch (error) {
        alert('Erro ao salvar: ' + error.message)
      } finally {
        this.isSaving = false
      }
    },
    
    hashPassword(password) {
      let hash = 0
      for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }
      return Math.abs(hash).toString(16)
    }
  }
}
</script>

<style scoped>
.admin-model-view {
  padding: 0;
}

/* Header */
.model-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #e9ecef;
}

.model-header h2 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #333;
  font-size: 1.5em;
}

/* Filters */
.model-filters {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 0 12px;
  min-width: 300px;
}

.search-input {
  border: none;
  outline: none;
  padding: 10px 0;
  flex: 1;
  font-size: 14px;
}

.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  min-width: 150px;
}

.view-controls {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

.view-btn {
  padding: 8px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  color: #6c757d;
  transition: all 0.2s;
}

.view-btn:hover,
.view-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

/* Table View */
.table-wrapper {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.data-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
}

.data-table th.sortable:hover {
  background: #e9ecef;
}

.data-table th.active {
  background: #007bff;
  color: white;
}

.sort-indicator {
  margin-left: 8px;
  font-size: 12px;
}

.data-row:hover {
  background: #f8f9fa;
}

.data-cell {
  font-size: 14px;
  color: #495057;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions-cell {
  white-space: nowrap;
}

.action-btn {
  padding: 6px;
  margin: 0 2px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.edit {
  background: #007bff;
  color: white;
}

.action-btn.edit:hover {
  background: #0056b3;
}

.action-btn.delete {
  background: #dc3545;
  color: white;
}

.action-btn.delete:hover {
  background: #c82333;
}

/* Cards View */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.item-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-content {
  padding: 16px;
}

.card-field {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.card-field:last-child {
  margin-bottom: 0;
}

.card-field strong {
  color: #495057;
  margin-right: 12px;
}

.card-field span {
  color: #6c757d;
  text-align: right;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
}

.page-btn {
  padding: 8px 12px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #e9ecef;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  margin: 0 16px;
  font-size: 14px;
  color: #6c757d;
}

/* Bulk Actions */
.bulk-actions {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 1000;
}

.bulk-info {
  font-size: 14px;
  color: #495057;
  font-weight: 500;
}

.bulk-buttons {
  display: flex;
  gap: 8px;
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
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
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

/* Form */
.item-form {
  padding: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #495057;
  font-size: 14px;
}

.required {
  color: #dc3545;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.form-control:readonly {
  background: #f8f9fa;
  color: #6c757d;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-checkbox {
  width: auto;
}

.checkbox-label {
  margin: 0;
  cursor: pointer;
}

.json-field {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.field-error {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 10px 20px;
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

/* Responsive */
@media (max-width: 768px) {
  .model-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-bar {
    min-width: auto;
  }
  
  .view-controls {
    margin-left: 0;
    justify-content: center;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .bulk-actions {
    left: 20px;
    right: 20px;
    transform: none;
    flex-direction: column;
    text-align: center;
  }
  
  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .data-table {
    font-size: 12px;
  }
  
  .data-table th,
  .data-table td {
    padding: 8px;
  }
}
</style>
