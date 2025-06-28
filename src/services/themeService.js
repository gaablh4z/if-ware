// themeService.js - Serviço para gerenciar temas da aplicação
class ThemeService {
  constructor() {
    this.themes = {
      light: {
        name: 'Claro',
        value: 'light',
        icon: '☀️',
        colors: {
          '--primary': '#2563eb',
          '--primary-dark': '#1d4ed8',
          '--primary-light': '#3b82f6',
          '--secondary': '#64748b',
          '--accent': '#f59e0b',
          '--background': '#ffffff',
          '--surface': '#f8fafc',
          '--card': '#ffffff',
          '--border': '#e2e8f0',
          '--text': '#1f2937',
          '--text-secondary': '#6b7280',
          '--text-muted': '#9ca3af',
          '--success': '#10b981',
          '--warning': '#f59e0b',
          '--error': '#ef4444',
          '--info': '#06b6d4'
        }
      },
      dark: {
        name: 'Escuro',
        value: 'dark',
        icon: '🌙',
        colors: {
          '--primary': '#3b82f6',
          '--primary-dark': '#2563eb',
          '--primary-light': '#60a5fa',
          '--secondary': '#64748b',
          '--accent': '#fbbf24',
          '--background': '#0f172a',
          '--surface': '#1e293b',
          '--card': '#334155',
          '--border': '#475569',
          '--text': '#f1f5f9',
          '--text-secondary': '#cbd5e1',
          '--text-muted': '#94a3b8',
          '--success': '#22c55e',
          '--warning': '#fbbf24',
          '--error': '#f87171',
          '--info': '#38bdf8'
        }
      },
      auto: {
        name: 'Automático',
        value: 'auto',
        icon: '🔄',
        description: 'Segue o tema do sistema'
      },
      // Temas personalizados
      midnight: {
        name: 'Meia-noite',
        value: 'midnight',
        icon: '🌌',
        colors: {
          '--primary': '#8b5cf6',
          '--primary-dark': '#7c3aed',
          '--primary-light': '#a78bfa',
          '--secondary': '#6b7280',
          '--accent': '#f59e0b',
          '--background': '#0c0c0c',
          '--surface': '#1a1a1a',
          '--card': '#262626',
          '--border': '#404040',
          '--text': '#ffffff',
          '--text-secondary': '#d4d4d4',
          '--text-muted': '#a3a3a3',
          '--success': '#22c55e',
          '--warning': '#f59e0b',
          '--error': '#ef4444',
          '--info': '#06b6d4'
        }
      },
      ocean: {
        name: 'Oceano',
        value: 'ocean',
        icon: '🌊',
        colors: {
          '--primary': '#0ea5e9',
          '--primary-dark': '#0284c7',
          '--primary-light': '#38bdf8',
          '--secondary': '#64748b',
          '--accent': '#06b6d4',
          '--background': '#0f172a',
          '--surface': '#1e293b',
          '--card': '#334155',
          '--border': '#475569',
          '--text': '#e2e8f0',
          '--text-secondary': '#cbd5e1',
          '--text-muted': '#94a3b8',
          '--success': '#22c55e',
          '--warning': '#f59e0b',
          '--error': '#f87171',
          '--info': '#38bdf8'
        }
      },
      sunset: {
        name: 'Pôr do Sol',
        value: 'sunset',
        icon: '🌅',
        colors: {
          '--primary': '#f97316',
          '--primary-dark': '#ea580c',
          '--primary-light': '#fb923c',
          '--secondary': '#64748b',
          '--accent': '#fbbf24',
          '--background': '#292524',
          '--surface': '#44403c',
          '--card': '#57534e',
          '--border': '#78716c',
          '--text': '#fafaf9',
          '--text-secondary': '#e7e5e4',
          '--text-muted': '#d6d3d1',
          '--success': '#22c55e',
          '--warning': '#fbbf24',
          '--error': '#f87171',
          '--info': '#38bdf8'
        }
      },
      forest: {
        name: 'Floresta',
        value: 'forest',
        icon: '🌲',
        colors: {
          '--primary': '#22c55e',
          '--primary-dark': '#16a34a',
          '--primary-light': '#4ade80',
          '--secondary': '#64748b',
          '--accent': '#84cc16',
          '--background': '#14532d',
          '--surface': '#166534',
          '--card': '#15803d',
          '--border': '#16a34a',
          '--text': '#f0fdf4',
          '--text-secondary': '#dcfce7',
          '--text-muted': '#bbf7d0',
          '--success': '#22c55e',
          '--warning': '#f59e0b',
          '--error': '#ef4444',
          '--info': '#06b6d4'
        }
      }
    };

    this.currentTheme = this.loadTheme();
    this.mediaQuery = null;
    this.eventListeners = [];
    
    this.init();
  }

  init() {
    // Configurar listener para mudanças no tema do sistema
    if (window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', () => {
        if (this.currentTheme === 'auto') {
          this.applyTheme('auto');
        }
      });
    }

    // Aplicar tema inicial
    this.applyTheme(this.currentTheme);
  }

  // Carregar tema salvo
  loadTheme() {
    try {
      const saved = localStorage.getItem('if_wave_theme');
      return saved && this.themes[saved] ? saved : 'auto';
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
      return 'auto';
    }
  }

  // Salvar tema
  saveTheme(theme) {
    try {
      localStorage.setItem('if_wave_theme', theme);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  }

  // Obter tema atual do sistema
  getSystemTheme() {
    if (!window.matchMedia) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Resolver tema (auto -> light/dark)
  resolveTheme(theme) {
    if (theme === 'auto') {
      return this.getSystemTheme();
    }
    return theme;
  }

  // Aplicar tema
  applyTheme(theme) {
    const resolvedTheme = this.resolveTheme(theme);
    const themeData = this.themes[resolvedTheme];

    if (!themeData) {
      console.warn(`Tema não encontrado: ${theme}`);
      return;
    }

    // Aplicar variáveis CSS
    if (themeData.colors) {
      const root = document.documentElement;
      Object.entries(themeData.colors).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
    }

    // Atualizar classes do documento
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.className = `theme-${resolvedTheme}`;

    // Atualizar cor da barra de status (mobile)
    this.updateStatusBarColor(themeData.colors?.['--background'] || '#ffffff');

    // Salvar tema se não for automático
    this.currentTheme = theme;
    this.saveTheme(theme);

    // Notificar listeners
    this.notifyListeners(theme, resolvedTheme);
  }

  // Atualizar cor da barra de status
  updateStatusBarColor(backgroundColor) {
    // Meta tag para cor da barra de status
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = backgroundColor;

    // Meta tag para status bar style (iOS)
    let metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!metaStatusBar) {
      metaStatusBar = document.createElement('meta');
      metaStatusBar.name = 'apple-mobile-web-app-status-bar-style';
      document.head.appendChild(metaStatusBar);
    }
    
    // Determinar se deve usar texto claro ou escuro na barra de status
    const isDark = this.isColorDark(backgroundColor);
    metaStatusBar.content = isDark ? 'light-content' : 'dark-content';
  }

  // Verificar se uma cor é escura
  isColorDark(color) {
    // Converter hex para RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calcular luminância
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }

  // Alternar entre temas
  toggleTheme() {
    const currentResolved = this.resolveTheme(this.currentTheme);
    const nextTheme = currentResolved === 'light' ? 'dark' : 'light';
    this.applyTheme(nextTheme);
  }

  // Obter tema atual
  getCurrentTheme() {
    return this.currentTheme;
  }

  // Obter tema atual resolvido
  getCurrentResolvedTheme() {
    return this.resolveTheme(this.currentTheme);
  }

  // Obter lista de temas disponíveis
  getAvailableThemes() {
    return Object.values(this.themes);
  }

  // Obter dados de um tema específico
  getThemeData(theme) {
    return this.themes[theme] || null;
  }

  // Criar tema customizado
  createCustomTheme(name, config) {
    const customTheme = {
      name: config.name || name,
      value: name,
      icon: config.icon || '🎨',
      colors: config.colors || {},
      custom: true
    };

    this.themes[name] = customTheme;
    
    // Salvar temas customizados
    this.saveCustomThemes();
    
    return customTheme;
  }

  // Remover tema customizado
  removeCustomTheme(theme) {
    if (this.themes[theme] && this.themes[theme].custom) {
      delete this.themes[theme];
      this.saveCustomThemes();
      
      // Se o tema atual foi removido, voltar para auto
      if (this.currentTheme === theme) {
        this.applyTheme('auto');
      }
      
      return true;
    }
    return false;
  }

  // Salvar temas customizados
  saveCustomThemes() {
    try {
      const customThemes = {};
      Object.entries(this.themes).forEach(([key, theme]) => {
        if (theme.custom) {
          customThemes[key] = theme;
        }
      });
      localStorage.setItem('if_wave_custom_themes', JSON.stringify(customThemes));
    } catch (error) {
      console.error('Erro ao salvar temas customizados:', error);
    }
  }

  // Carregar temas customizados
  loadCustomThemes() {
    try {
      const saved = localStorage.getItem('if_wave_custom_themes');
      if (saved) {
        const customThemes = JSON.parse(saved);
        Object.assign(this.themes, customThemes);
      }
    } catch (error) {
      console.error('Erro ao carregar temas customizados:', error);
    }
  }

  // Exportar configurações de tema
  exportThemeConfig() {
    const config = {
      currentTheme: this.currentTheme,
      customThemes: {}
    };

    Object.entries(this.themes).forEach(([key, theme]) => {
      if (theme.custom) {
        config.customThemes[key] = theme;
      }
    });

    return config;
  }

  // Importar configurações de tema
  importThemeConfig(config) {
    try {
      if (config.customThemes) {
        Object.assign(this.themes, config.customThemes);
        this.saveCustomThemes();
      }

      if (config.currentTheme && this.themes[config.currentTheme]) {
        this.applyTheme(config.currentTheme);
      }

      return true;
    } catch (error) {
      console.error('Erro ao importar configurações de tema:', error);
      return false;
    }
  }

  // Adicionar listener para mudanças de tema
  addListener(callback) {
    this.eventListeners.push(callback);
  }

  // Remover listener
  removeListener(callback) {
    this.eventListeners = this.eventListeners.filter(l => l !== callback);
  }

  // Notificar listeners
  notifyListeners(theme, resolvedTheme) {
    this.eventListeners.forEach(callback => {
      try {
        callback({
          theme,
          resolvedTheme,
          themeData: this.themes[resolvedTheme]
        });
      } catch (error) {
        console.error('Erro ao notificar listener de tema:', error);
      }
    });
  }

  // Aplicar transição suave entre temas
  applyThemeWithTransition(theme, duration = 300) {
    // Adicionar classe de transição
    document.documentElement.style.transition = `all ${duration}ms ease-in-out`;
    
    // Aplicar tema
    this.applyTheme(theme);
    
    // Remover transição após completar
    setTimeout(() => {
      document.documentElement.style.transition = '';
    }, duration);
  }

  // Resetar para tema padrão
  resetToDefault() {
    this.applyTheme('auto');
  }
}

// Instância singleton
export default new ThemeService();
