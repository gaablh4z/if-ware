import { models } from '../models/index.js'

// Serviço para gerenciar dados do localStorage
export class AdminDataService {
  constructor() {
    this.storagePrefix = 'ifwave_'
  }

  // Obter chave do localStorage para um modelo
  getStorageKey(modelName) {
    return `${this.storagePrefix}${modelName}`
  }

  // Obter todos os registros de um modelo
  getAll(modelName) {
    try {
      const data = localStorage.getItem(this.getStorageKey(modelName))
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error(`Erro ao carregar ${modelName}:`, error)
      return []
    }
  }

  // Obter um registro por ID
  getById(modelName, id) {
    const records = this.getAll(modelName)
    return records.find(record => record.id === id)
  }

  // Salvar todos os registros de um modelo
  saveAll(modelName, records) {
    try {
      localStorage.setItem(this.getStorageKey(modelName), JSON.stringify(records))
      return true
    } catch (error) {
      console.error(`Erro ao salvar ${modelName}:`, error)
      return false
    }
  }

  // Criar um novo registro
  create(modelName, data) {
    const records = this.getAll(modelName)
    const model = models[modelName]
    
    // Gerar ID único
    const newRecord = {
      ...data,
      id: this.generateId(modelName),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Aplicar valores padrão
    Object.keys(model.fields).forEach(fieldName => {
      const field = model.fields[fieldName]
      if (field.default !== undefined && newRecord[fieldName] === undefined) {
        newRecord[fieldName] = field.default
      }
    })

    records.push(newRecord)
    
    if (this.saveAll(modelName, records)) {
      return newRecord
    }
    return null
  }

  // Atualizar um registro
  update(modelName, id, data) {
    const records = this.getAll(modelName)
    const index = records.findIndex(record => record.id === id)
    
    if (index === -1) return null

    const updatedRecord = {
      ...records[index],
      ...data,
      updatedAt: new Date().toISOString()
    }

    records[index] = updatedRecord
    
    if (this.saveAll(modelName, records)) {
      return updatedRecord
    }
    return null
  }

  // Deletar um registro
  delete(modelName, id) {
    const records = this.getAll(modelName)
    const filteredRecords = records.filter(record => record.id !== id)
    
    if (filteredRecords.length < records.length) {
      return this.saveAll(modelName, filteredRecords)
    }
    return false
  }

  // Deletar múltiplos registros
  deleteMultiple(modelName, ids) {
    const records = this.getAll(modelName)
    const filteredRecords = records.filter(record => !ids.includes(record.id))
    return this.saveAll(modelName, filteredRecords)
  }

  // Buscar registros
  search(modelName, query, fields = []) {
    const records = this.getAll(modelName)
    const model = models[modelName]
    
    if (!query) return records

    const searchFields = fields.length > 0 ? fields : (model.searchFields || [])
    
    return records.filter(record => {
      return searchFields.some(field => {
        const value = record[field]
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query.toLowerCase())
        }
        return false
      })
    })
  }

  // Filtrar registros
  filter(modelName, filters) {
    const records = this.getAll(modelName)
    
    return records.filter(record => {
      return Object.keys(filters).every(field => {
        const filterValue = filters[field]
        const recordValue = record[field]
        
        if (filterValue === '' || filterValue === null || filterValue === undefined) {
          return true
        }
        
        return recordValue === filterValue
      })
    })
  }

  // Ordenar registros
  sort(records, ordering = []) {
    if (ordering.length === 0) return records

    return [...records].sort((a, b) => {
      for (const field of ordering) {
        const desc = field.startsWith('-')
        const fieldName = desc ? field.slice(1) : field
        
        const aVal = a[fieldName]
        const bVal = b[fieldName]
        
        if (aVal < bVal) return desc ? 1 : -1
        if (aVal > bVal) return desc ? -1 : 1
      }
      return 0
    })
  }

  // Paginar registros
  paginate(records, page = 1, itemsPerPage = 20) {
    const start = (page - 1) * itemsPerPage
    const end = start + itemsPerPage
    
    return {
      records: records.slice(start, end),
      pagination: {
        currentPage: page,
        itemsPerPage,
        totalItems: records.length,
        totalPages: Math.ceil(records.length / itemsPerPage),
        hasNext: end < records.length,
        hasPrev: page > 1
      }
    }
  }

  // Gerar ID único
  generateId(modelName) {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `${modelName}_${timestamp}_${random}`
  }

  // Obter estatísticas
  getStats(modelName) {
    const records = this.getAll(modelName)
    
    const stats = {
      total: records.length,
      createdToday: 0,
      createdThisWeek: 0,
      createdThisMonth: 0
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    records.forEach(record => {
      if (record.createdAt) {
        const createdDate = new Date(record.createdAt)
        
        if (createdDate >= today) {
          stats.createdToday++
        }
        if (createdDate >= weekAgo) {
          stats.createdThisWeek++
        }
        if (createdDate >= monthAgo) {
          stats.createdThisMonth++
        }
      }
    })

    return stats
  }

  // Validar dados antes de salvar
  validate(modelName, data) {
    const model = models[modelName]
    const errors = {}

    Object.keys(model.fields).forEach(fieldName => {
      const field = model.fields[fieldName]
      const value = data[fieldName]

      // Campo obrigatório
      if (field.required && (!value || value === '')) {
        errors[fieldName] = `${field.label} é obrigatório`
      }

      // Validação de email
      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          errors[fieldName] = 'E-mail inválido'
        }
      }

      // Validação de URL
      if ((field.type === 'url' || field.type === 'image') && value) {
        try {
          new URL(value)
        } catch {
          errors[fieldName] = 'URL inválida'
        }
      }

      // Campo único
      if (field.unique && value) {
        const existing = this.getAll(modelName).find(record => 
          record[fieldName] === value && record.id !== data.id
        )
        if (existing) {
          errors[fieldName] = `${field.label} já existe`
        }
      }
    })

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  // Exportar dados
  exportData(modelName) {
    const records = this.getAll(modelName)
    const modelConfig = models[modelName]
    
    return {
      model: modelName,
      modelName: modelConfig.name,
      exportedAt: new Date().toISOString(),
      totalRecords: records.length,
      data: records
    }
  }

  // Importar dados
  importData(modelName, data) {
    try {
      if (Array.isArray(data)) {
        return this.saveAll(modelName, data)
      } else if (data.data && Array.isArray(data.data)) {
        return this.saveAll(modelName, data.data)
      }
      return false
    } catch (error) {
      console.error(`Erro ao importar ${modelName}:`, error)
      return false
    }
  }

  // Limpar todos os dados de um modelo
  clearAll(modelName) {
    return this.saveAll(modelName, [])
  }
}

// Instância única do serviço
export const adminDataService = new AdminDataService()
