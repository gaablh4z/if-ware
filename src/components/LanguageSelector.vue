<template>
  <div class="language-selector">
    <button 
      @click="toggleDropdown" 
      class="language-btn"
      :title="$t('common.language')"
    >
      <span class="current-language">
        {{ currentLanguageInfo.flag }}
        <span v-if="showText">{{ currentLanguageInfo.name }}</span>
      </span>
      <span class="dropdown-arrow" :class="{ open: isOpen }">▼</span>
    </button>

    <div v-if="isOpen" class="language-dropdown" @click.stop>
      <div 
        v-for="lang in availableLanguages" 
        :key="lang.code"
        @click="selectLanguage(lang.code)"
        class="language-option"
        :class="{ active: lang.code === currentLanguage }"
      >
        <span class="flag">{{ lang.flag }}</span>
        <span class="name">{{ lang.name }}</span>
        <span v-if="lang.code === currentLanguage" class="check">✓</span>
      </div>
    </div>

    <!-- Overlay para fechar dropdown -->
    <div 
      v-if="isOpen" 
      class="dropdown-overlay" 
      @click="closeDropdown"
    ></div>
  </div>
</template>

<script>
import { getCurrentLanguage, setLanguage, availableLanguages } from '../plugins/i18n.js'

export default {
  name: 'LanguageSelector',
  props: {
    showText: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isOpen: false,
      currentLanguage: getCurrentLanguage(),
      availableLanguages
    }
  },
  computed: {
    currentLanguageInfo() {
      return this.availableLanguages.find(lang => lang.code === this.currentLanguage) || this.availableLanguages[0]
    }
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen
    },
    closeDropdown() {
      this.isOpen = false
    },
    selectLanguage(langCode) {
      if (langCode !== this.currentLanguage) {
        setLanguage(langCode)
        this.currentLanguage = langCode
        this.$emit('language-changed', langCode)
        
        // Emite evento global para outros componentes
        this.$emit('global-language-change', langCode)
        
        // Força atualização de componentes que dependem do idioma
        this.$forceUpdate()
      }
      this.closeDropdown()
    }
  },
  mounted() {
    // Escuta mudanças de idioma de outros componentes
    window.addEventListener('language-changed', (event) => {
      this.currentLanguage = event.detail
    })
  }
}
</script>

<style scoped>
.language-selector {
  position: relative;
  display: inline-block;
}

.language-btn {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  min-width: 50px;
  justify-content: space-between;
}

.language-btn:hover {
  background: #f8f9fa;
  border-color: #667eea;
}

.current-language {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
}

.dropdown-arrow {
  font-size: 10px;
  color: #666;
  transition: transform 0.2s ease;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.language-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 4px;
  overflow: hidden;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.language-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.language-option:last-child {
  border-bottom: none;
}

.language-option:hover {
  background: #f8f9fa;
}

.language-option.active {
  background: #f0f7ff;
  color: #667eea;
  font-weight: 600;
}

.flag {
  font-size: 16px;
}

.name {
  flex: 1;
  font-size: 14px;
}

.check {
  color: #667eea;
  font-weight: bold;
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: transparent;
}

/* Versão compacta para mobile */
@media (max-width: 768px) {
  .language-btn {
    padding: 6px 10px;
    min-width: 40px;
  }
  
  .current-language {
    font-size: 12px;
  }
  
  .language-dropdown {
    min-width: 150px;
  }
  
  .language-option {
    padding: 10px 14px;
  }
  
  .name {
    font-size: 13px;
  }
}

/* Versão para modo escuro (futuro) */
@media (prefers-color-scheme: dark) {
  .language-btn {
    background: #2d3748;
    border-color: #4a5568;
    color: white;
  }
  
  .language-btn:hover {
    background: #4a5568;
  }
  
  .language-dropdown {
    background: #2d3748;
    border-color: #4a5568;
  }
  
  .language-option {
    color: white;
    border-color: #4a5568;
  }
  
  .language-option:hover {
    background: #4a5568;
  }
  
  .language-option.active {
    background: #2b6cb0;
  }
}
</style>
