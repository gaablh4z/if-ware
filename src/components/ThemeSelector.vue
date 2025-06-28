<template>
  <div class="theme-selector" :class="{ 'expanded': isExpanded }">
    <!-- Botão principal -->
    <button 
      @click="toggleExpanded"
      class="theme-toggle-btn"
      :title="currentThemeData?.name || 'Selecionar tema'"
      :aria-label="`Tema atual: ${currentThemeData?.name || 'Desconhecido'}`"
    >
      <span class="theme-icon">{{ currentThemeData?.icon || '🎨' }}</span>
      <span v-if="showLabel" class="theme-label">{{ currentThemeData?.name }}</span>
      <svg 
        v-if="expandable"
        class="expand-icon"
        :class="{ 'rotated': isExpanded }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <polyline points="6,9 12,15 18,9"/>
      </svg>
    </button>

    <!-- Menu de temas -->
    <transition name="theme-menu">
      <div v-if="isExpanded" class="theme-menu" @click.stop>
        <div class="theme-menu-header">
          <h3>Escolher Tema</h3>
          <button @click="isExpanded = false" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="theme-categories">
          <!-- Temas padrão -->
          <div class="theme-category">
            <h4>Temas Padrão</h4>
            <div class="theme-grid">
              <button
                v-for="theme in standardThemes"
                :key="theme.value"
                @click="selectTheme(theme.value)"
                class="theme-option"
                :class="{ 
                  'active': currentTheme === theme.value,
                  'system-default': theme.value === 'auto'
                }"
                :title="theme.description || theme.name"
              >
                <div class="theme-preview" :data-theme="theme.value">
                  <span class="theme-icon">{{ theme.icon }}</span>
                  <div v-if="theme.colors" class="color-preview">
                    <div 
                      v-for="(color, index) in getPreviewColors(theme.colors)"
                      :key="index"
                      class="color-dot"
                      :style="{ backgroundColor: color }"
                    ></div>
                  </div>
                </div>
                <span class="theme-name">{{ theme.name }}</span>
                <span v-if="theme.value === 'auto'" class="system-indicator">
                  Sistema: {{ systemTheme }}
                </span>
              </button>
            </div>
          </div>

          <!-- Temas especiais -->
          <div v-if="specialThemes.length > 0" class="theme-category">
            <h4>Temas Especiais</h4>
            <div class="theme-grid">
              <button
                v-for="theme in specialThemes"
                :key="theme.value"
                @click="selectTheme(theme.value)"
                class="theme-option special"
                :class="{ 'active': currentTheme === theme.value }"
                :title="theme.name"
              >
                <div class="theme-preview" :data-theme="theme.value">
                  <span class="theme-icon">{{ theme.icon }}</span>
                  <div class="color-preview">
                    <div 
                      v-for="(color, index) in getPreviewColors(theme.colors)"
                      :key="index"
                      class="color-dot"
                      :style="{ backgroundColor: color }"
                    ></div>
                  </div>
                </div>
                <span class="theme-name">{{ theme.name }}</span>
              </button>
            </div>
          </div>

          <!-- Temas customizados -->
          <div v-if="customThemes.length > 0" class="theme-category">
            <h4>Temas Personalizados</h4>
            <div class="theme-grid">
              <div
                v-for="theme in customThemes"
                :key="theme.value"
                class="theme-option-container custom"
              >
                <button
                  @click="selectTheme(theme.value)"
                  class="theme-option custom"
                  :class="{ 'active': currentTheme === theme.value }"
                  :title="theme.name"
                >
                  <div class="theme-preview" :data-theme="theme.value">
                    <span class="theme-icon">{{ theme.icon }}</span>
                    <div class="color-preview">
                      <div 
                        v-for="(color, index) in getPreviewColors(theme.colors)"
                        :key="index"
                        class="color-dot"
                        :style="{ backgroundColor: color }"
                      ></div>
                    </div>
                  </div>
                  <span class="theme-name">{{ theme.name }}</span>
                </button>
                <button 
                  @click="removeCustomTheme(theme.value)"
                  class="remove-theme-btn"
                  title="Remover tema"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Ações do menu -->
        <div class="theme-menu-actions">
          <button @click="showThemeCreator = true" class="action-btn create-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Criar Tema
          </button>
          
          <button @click="exportThemes" class="action-btn export-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exportar
          </button>
          
          <button @click="triggerImport" class="action-btn import-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17,8 12,3 7,8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Importar
          </button>
        </div>
      </div>
    </transition>

    <!-- Criador de tema customizado -->
    <div v-if="showThemeCreator" class="theme-creator-overlay" @click.self="showThemeCreator = false">
      <div class="theme-creator">
        <h3>Criar Tema Personalizado</h3>
        <div class="creator-content">
          <div class="creator-form">
            <label>
              Nome do Tema:
              <input v-model="newTheme.name" type="text" placeholder="Meu Tema">
            </label>
            
            <label>
              Emoji/Ícone:
              <input v-model="newTheme.icon" type="text" placeholder="🎨" maxlength="2">
            </label>
            
            <div class="color-inputs">
              <h4>Cores do Tema</h4>
              <div 
                v-for="(colorInfo, colorKey) in colorDefinitions"
                :key="colorKey"
                class="color-input-group"
              >
                <label>
                  {{ colorInfo.label }}:
                  <div class="color-input-wrapper">
                    <input 
                      v-model="newTheme.colors[colorKey]"
                      type="color"
                      class="color-picker"
                    >
                    <input 
                      v-model="newTheme.colors[colorKey]"
                      type="text"
                      class="color-text"
                      :placeholder="colorInfo.default"
                    >
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <div class="creator-preview">
            <h4>Visualização</h4>
            <div class="preview-container" :style="getPreviewStyle()">
              <div class="preview-card">
                <div class="preview-header">
                  <span>{{ newTheme.icon }} {{ newTheme.name || 'Novo Tema' }}</span>
                </div>
                <div class="preview-content">
                  <p>Este é um exemplo de como o tema ficará.</p>
                  <button class="preview-button">Botão</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="creator-actions">
          <button @click="showThemeCreator = false" class="btn-secondary">
            Cancelar
          </button>
          <button 
            @click="createCustomTheme" 
            class="btn-primary"
            :disabled="!newTheme.name"
          >
            Criar Tema
          </button>
        </div>
      </div>
    </div>

    <!-- Input de arquivo escondido -->
    <input 
      ref="fileInput"
      type="file"
      accept=".json"
      @change="handleImport"
      style="display: none"
    />

    <!-- Overlay -->
    <div 
      v-if="isExpanded"
      class="theme-overlay"
      @click="isExpanded = false"
    ></div>
  </div>
</template>

<script>
import themeService from '@/services/themeService';

export default {
  name: 'ThemeSelector',
  props: {
    expandable: {
      type: Boolean,
      default: true
    },
    showLabel: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    }
  },
  data() {
    return {
      isExpanded: false,
      showThemeCreator: false,
      currentTheme: 'auto',
      systemTheme: 'light',
      availableThemes: [],
      newTheme: {
        name: '',
        icon: '🎨',
        colors: {}
      },
      colorDefinitions: {
        '--primary': { label: 'Cor Principal', default: '#2563eb' },
        '--background': { label: 'Fundo', default: '#ffffff' },
        '--surface': { label: 'Superfície', default: '#f8fafc' },
        '--text': { label: 'Texto', default: '#1f2937' },
        '--border': { label: 'Borda', default: '#e2e8f0' },
        '--accent': { label: 'Destaque', default: '#f59e0b' },
        '--success': { label: 'Sucesso', default: '#10b981' },
        '--error': { label: 'Erro', default: '#ef4444' }
      }
    };
  },
  computed: {
    currentThemeData() {
      return themeService.getThemeData(this.currentTheme);
    },

    standardThemes() {
      return this.availableThemes.filter(theme => 
        ['light', 'dark', 'auto'].includes(theme.value)
      );
    },

    specialThemes() {
      return this.availableThemes.filter(theme => 
        !['light', 'dark', 'auto'].includes(theme.value) && !theme.custom
      );
    },

    customThemes() {
      return this.availableThemes.filter(theme => theme.custom);
    }
  },
  mounted() {
    this.loadThemes();
    this.updateSystemTheme();
    themeService.addListener(this.onThemeChanged);

    // Listener para mudanças do sistema
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', this.updateSystemTheme);
    }

    // Fechar menu ao clicar fora
    document.addEventListener('click', this.handleOutsideClick);
  },
  beforeUnmount() {
    themeService.removeListener(this.onThemeChanged);
    document.removeEventListener('click', this.handleOutsideClick);
  },
  methods: {
    loadThemes() {
      this.availableThemes = themeService.getAvailableThemes();
      this.currentTheme = themeService.getCurrentTheme();
    },

    updateSystemTheme() {
      this.systemTheme = themeService.getSystemTheme();
    },

    toggleExpanded() {
      if (!this.expandable) {
        themeService.toggleTheme();
        return;
      }
      this.isExpanded = !this.isExpanded;
    },

    selectTheme(theme) {
      themeService.applyThemeWithTransition(theme);
      this.isExpanded = false;
    },

    onThemeChanged(data) {
      this.currentTheme = data.theme;
    },

    handleOutsideClick(event) {
      if (!this.$el.contains(event.target)) {
        this.isExpanded = false;
      }
    },

    getPreviewColors(colors) {
      if (!colors) return [];
      const previewKeys = ['--primary', '--background', '--surface', '--accent'];
      return previewKeys
        .map(key => colors[key])
        .filter(Boolean)
        .slice(0, 4);
    },

    createCustomTheme() {
      if (!this.newTheme.name) return;

      const themeValue = this.newTheme.name.toLowerCase().replace(/\s+/g, '_');
      
      themeService.createCustomTheme(themeValue, {
        name: this.newTheme.name,
        icon: this.newTheme.icon,
        colors: { ...this.newTheme.colors }
      });

      this.loadThemes();
      this.selectTheme(themeValue);
      this.showThemeCreator = false;
      this.resetThemeCreator();
    },

    removeCustomTheme(theme) {
      if (confirm(`Remover o tema "${themeService.getThemeData(theme)?.name}"?`)) {
        themeService.removeCustomTheme(theme);
        this.loadThemes();
      }
    },

    resetThemeCreator() {
      this.newTheme = {
        name: '',
        icon: '🎨',
        colors: {}
      };
    },

    getPreviewStyle() {
      const colors = { ...this.newTheme.colors };
      let style = '';
      Object.entries(colors).forEach(([key, value]) => {
        if (value) {
          style += `${key}: ${value}; `;
        }
      });
      return style;
    },

    exportThemes() {
      const config = themeService.exportThemeConfig();
      const dataStr = JSON.stringify(config, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `if_wave_themes_${new Date().getTime()}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
    },

    triggerImport() {
      this.$refs.fileInput.click();
    },

    async handleImport(event) {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const config = JSON.parse(text);
        
        if (themeService.importThemeConfig(config)) {
          this.loadThemes();
          alert('Temas importados com sucesso!');
        } else {
          alert('Erro ao importar temas.');
        }
      } catch (error) {
        alert(`Erro ao importar: ${error.message}`);
      }

      event.target.value = '';
    }
  }
};
</script>

<style scoped>
.theme-selector {
  position: relative;
  display: inline-block;
}

/* Botão principal */
.theme-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.theme-toggle-btn:hover {
  background: var(--background);
  border-color: var(--primary);
}

.theme-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.theme-label {
  font-weight: 500;
}

.expand-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

/* Overlay */
.theme-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 998;
}

/* Menu de temas */
.theme-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  width: 320px;
  max-height: 80vh;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 999;
  overflow: hidden;
}

.theme-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  background: var(--background);
}

.theme-menu-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
}

.close-btn {
  padding: 0.25rem;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--surface);
  color: var(--text);
}

.close-btn svg {
  width: 16px;
  height: 16px;
}

/* Categorias de temas */
.theme-categories {
  max-height: 60vh;
  overflow-y: auto;
  padding: 1rem;
}

.theme-category {
  margin-bottom: 1.5rem;
}

.theme-category:last-child {
  margin-bottom: 0;
}

.theme-category h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
}

/* Opções de tema */
.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px solid var(--border);
  border-radius: 0.5rem;
  background: var(--background);
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  min-height: 80px;
}

.theme-option:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.theme-option.active {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
}

.theme-option.special {
  border-style: dashed;
}

.theme-option.custom {
  border-color: var(--accent);
}

/* Container para tema customizado com botão de remoção */
.theme-option-container {
  position: relative;
  display: inline-block;
}

.theme-option-container.custom .theme-option {
  width: 100%;
}

.theme-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.theme-preview .theme-icon {
  font-size: 1.5rem;
}

.color-preview {
  display: flex;
  gap: 2px;
}

.color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.theme-name {
  font-size: 0.7rem;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

.system-indicator {
  font-size: 0.6rem;
  opacity: 0.7;
  text-align: center;
}

.remove-theme-btn {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: var(--error);
  color: white;
  border: 2px solid var(--background);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-theme-btn:hover {
  transform: scale(1.1);
}

.remove-theme-btn svg {
  width: 10px;
  height: 10px;
}

/* Ações do menu */
.theme-menu-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid var(--border);
  background: var(--background);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--background);
  border-color: var(--primary);
}

.action-btn svg {
  width: 14px;
  height: 14px;
}

/* Criador de tema */
.theme-creator-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.theme-creator {
  background: var(--surface);
  border-radius: 0.75rem;
  padding: 1.5rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.theme-creator h3 {
  margin: 0 0 1rem 0;
  color: var(--text);
}

.creator-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.creator-form label {
  display: block;
  margin-bottom: 1rem;
  color: var(--text);
  font-weight: 500;
}

.creator-form input[type="text"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  background: var(--background);
  color: var(--text);
  margin-top: 0.25rem;
}

.color-inputs h4 {
  margin: 1rem 0 0.5rem 0;
  color: var(--text);
  font-size: 0.9rem;
}

.color-input-group {
  margin-bottom: 0.75rem;
}

.color-input-wrapper {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.color-picker {
  width: 40px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 0.25rem;
  cursor: pointer;
}

.color-text {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  background: var(--background);
  color: var(--text);
  font-family: monospace;
}

.creator-preview h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text);
  font-size: 0.9rem;
}

.preview-container {
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--background);
}

.preview-card {
  background: var(--surface, #f8fafc);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 0.5rem;
  overflow: hidden;
}

.preview-header {
  padding: 0.75rem;
  background: var(--primary, #2563eb);
  color: var(--background, #ffffff);
  font-weight: 500;
}

.preview-content {
  padding: 0.75rem;
}

.preview-content p {
  margin: 0 0 0.5rem 0;
  color: var(--text, #1f2937);
}

.preview-button {
  padding: 0.5rem 1rem;
  background: var(--accent, #f59e0b);
  color: var(--background, #ffffff);
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.creator-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-secondary,
.btn-primary {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary {
  background: var(--surface);
  color: var(--text);
}

.btn-secondary:hover {
  background: var(--background);
}

.btn-primary {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Animações */
.theme-menu-enter-active,
.theme-menu-leave-active {
  transition: all 0.3s ease;
}

.theme-menu-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.theme-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* Responsivo */
@media (max-width: 768px) {
  .theme-menu {
    width: 280px;
    right: -140px;
    transform: translateX(50%);
  }

  .creator-content {
    grid-template-columns: 1fr;
  }
  
  .theme-creator {
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }
}

@media (max-width: 480px) {
  .theme-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
