<template>
  <div class="responsive-demo">
    <div class="demo-header">
      <h1>🎨 Sistema de Responsividade IF Wave</h1>
      <p>Demonstração completa da adaptabilidade da interface</p>
    </div>

    <!-- Informações do dispositivo -->
    <div class="device-info">
      <h2>📱 Informações do Dispositivo</h2>
      <div class="info-grid">
        <div class="info-item">
          <strong>Tipo:</strong> {{ deviceInfo.type }}
        </div>
        <div class="info-item">
          <strong>Orientação:</strong> {{ deviceInfo.orientation }}
        </div>
        <div class="info-item">
          <strong>Largura:</strong> {{ deviceInfo.screenWidth }}px
        </div>
        <div class="info-item">
          <strong>Altura:</strong> {{ deviceInfo.screenHeight }}px
        </div>
        <div class="info-item">
          <strong>DPI Alto:</strong> {{ deviceInfo.isHighDPI ? 'Sim' : 'Não' }}
        </div>
        <div class="info-item">
          <strong>Touch:</strong> {{ deviceInfo.isTouchDevice ? 'Sim' : 'Não' }}
        </div>
      </div>
    </div>

    <!-- Grid responsivo -->
    <div class="responsive-grid-demo">
      <h2>📐 Grid Responsivo</h2>
      <div class="demo-grid">
        <div class="grid-item" v-for="n in 6" :key="n">
          <h3>Item {{ n }}</h3>
          <p>Este item se adapta automaticamente ao tamanho da tela</p>
        </div>
      </div>
    </div>

    <!-- Tipografia responsiva -->
    <div class="typography-demo">
      <h2>📝 Tipografia Responsiva</h2>
      <div class="text-samples">
        <h1 class="fluid-heading">Título Principal</h1>
        <h2 class="fluid-subtitle">Subtítulo Secundário</h2>
        <p class="fluid-text">
          Este texto se adapta fluidamente ao tamanho da tela, 
          mantendo sempre uma boa legibilidade em qualquer dispositivo.
        </p>
        <small class="fluid-small">Texto pequeno responsivo</small>
      </div>
    </div>

    <!-- Componentes responsivos -->
    <div class="components-demo">
      <h2>🧩 Componentes Responsivos</h2>
      
      <!-- Botões -->
      <div class="buttons-section">
        <h3>Botões</h3>
        <div class="buttons-grid">
          <button class="responsive-btn primary">Primário</button>
          <button class="responsive-btn secondary">Secundário</button>
          <button class="responsive-btn accent">Destaque</button>
        </div>
      </div>

      <!-- Formulário -->
      <div class="form-section">
        <h3>Formulário</h3>
        <form class="responsive-form">
          <div class="form-group">
            <label>Nome:</label>
            <input type="text" placeholder="Digite seu nome" class="responsive-input">
          </div>
          <div class="form-group">
            <label>Email:</label>
            <input type="email" placeholder="seu@email.com" class="responsive-input">
          </div>
          <div class="form-group">
            <label>Mensagem:</label>
            <textarea placeholder="Sua mensagem..." class="responsive-textarea"></textarea>
          </div>
          <button type="submit" class="responsive-btn primary full-width">Enviar</button>
        </form>
      </div>
    </div>

    <!-- Cards responsivos -->
    <div class="cards-demo">
      <h2>🎴 Cards Responsivos</h2>
      <div class="cards-grid">
        <div class="responsive-card" v-for="card in cards" :key="card.id">
          <div class="card-image">{{ card.emoji }}</div>
          <div class="card-content">
            <h3>{{ card.title }}</h3>
            <p>{{ card.description }}</p>
            <button class="card-btn">Saiba mais</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Demonstração por dispositivo -->
    <div class="device-specific">
      <h2>📱💻 Conteúdo Específico por Dispositivo</h2>
      
      <div class="mobile-only">
        <div class="device-message mobile">
          📱 <strong>Conteúdo Mobile:</strong> 
          Interface otimizada para toque, navegação simplificada
        </div>
      </div>

      <div class="tablet-only">
        <div class="device-message tablet">
          📐 <strong>Conteúdo Tablet:</strong> 
          Layout híbrido, aproveitando o espaço médio disponível
        </div>
      </div>

      <div class="desktop-only">
        <div class="device-message desktop">
          💻 <strong>Conteúdo Desktop:</strong> 
          Interface completa com todas as funcionalidades avançadas
        </div>
      </div>
    </div>

    <!-- Estatísticas de performance -->
    <div class="performance-stats">
      <h2>⚡ Performance Responsiva</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ loadTime }}ms</div>
          <div class="stat-label">Tempo de Carregamento</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ renderTime }}ms</div>
          <div class="stat-label">Tempo de Renderização</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ breakpointChanges }}</div>
          <div class="stat-label">Mudanças de Breakpoint</div>
        </div>
      </div>
    </div>

    <!-- Demonstração das Classes Utilitárias CSS -->
    <section class="demo-section card-responsive">
      <h2 class="text-responsive-2xl">🎨 Classes Utilitárias CSS</h2>
      <p class="text-responsive-base">
        Demonstração das novas classes utilitárias responsivas implementadas.
      </p>
      
      <!-- Grid Responsivo -->
      <div class="utility-demo">
        <h3 class="text-responsive-lg">Grid Responsivo</h3>
        <div class="grid-responsive-3">
          <div class="card-responsive">
            <h4 class="text-responsive-base">Card 1</h4>
            <p class="text-responsive-sm truncate-2">
              Este é um exemplo de card responsivo que se adapta automaticamente ao tamanho da tela usando as novas classes utilitárias.
            </p>
          </div>
          <div class="card-responsive">
            <h4 class="text-responsive-base">Card 2</h4>
            <p class="text-responsive-sm truncate-2">
              O grid responsivo ajusta o número de colunas baseado no espaço disponível.
            </p>
          </div>
          <div class="card-responsive">
            <h4 class="text-responsive-base">Card 3</h4>
            <p class="text-responsive-sm truncate-2">
              Perfeito para componentes como posts, notificações e outros elementos repetitivos.
            </p>
          </div>
        </div>
      </div>
      
      <!-- Tipografia Fluida -->
      <div class="utility-demo">
        <h3 class="text-responsive-lg">Tipografia Fluida</h3>
        <div class="typography-samples">
          <p class="text-responsive-3xl">Título Principal (3XL)</p>
          <p class="text-responsive-2xl">Título Secundário (2XL)</p>
          <p class="text-responsive-xl">Título Terciário (XL)</p>
          <p class="text-responsive-lg">Subtítulo (LG)</p>
          <p class="text-responsive-base">Texto Base</p>
          <p class="text-responsive-sm">Texto Pequeno</p>
          <p class="text-responsive-xs">Texto Muito Pequeno</p>
        </div>
      </div>
      
      <!-- Espaçamento Fluido -->
      <div class="utility-demo">
        <h3 class="text-responsive-lg">Espaçamento Fluido</h3>
        <div class="spacing-demo">
          <div class="p-responsive-xs" style="background: #e3f2fd; margin-bottom: 8px;">Padding XS</div>
          <div class="p-responsive-sm" style="background: #e8f5e8; margin-bottom: 8px;">Padding SM</div>
          <div class="p-responsive-md" style="background: #fff3e0; margin-bottom: 8px;">Padding MD</div>
          <div class="p-responsive-lg" style="background: #fce4ec;">Padding LG</div>
        </div>
      </div>
      
      <!-- Componentes Responsivos -->
      <div class="utility-demo">
        <h3 class="text-responsive-lg">Componentes Responsivos</h3>
        <div class="components-demo">
          <button class="btn-responsive" style="background: #0095f6; color: white; border: none; margin-right: 8px;">
            Botão Responsivo
          </button>
          <input class="input-responsive" placeholder="Input responsivo com altura mínima para toque" style="margin-bottom: 12px;">
          <div class="card-responsive">
            <h4 class="text-responsive-base">Card Responsivo</h4>
            <p class="text-responsive-sm">
              Cards com hover effects e bordas fluidas que se adaptam ao viewport.
            </p>
          </div>
        </div>
      </div>
      
      <!-- Visibilidade Responsiva -->
      <div class="utility-demo">
        <h3 class="text-responsive-lg">Controle de Visibilidade</h3>
        <div class="visibility-demo">
          <div class="show-mobile-only" style="padding: 12px; background: #e8f5e8; margin-bottom: 8px; border-radius: 8px;">
            📱 Visível apenas no mobile
          </div>
          <div class="show-tablet-only" style="padding: 12px; background: #fff3e0; margin-bottom: 8px; border-radius: 8px;">
            📟 Visível apenas no tablet
          </div>
          <div class="show-desktop-only" style="padding: 12px; background: #e3f2fd; margin-bottom: 8px; border-radius: 8px;">
            🖥️ Visível apenas no desktop
          </div>
          <div class="hide-mobile" style="padding: 12px; background: #fce4ec; margin-bottom: 8px; border-radius: 8px;">
            🚫 Oculto no mobile
          </div>
        </div>
      </div>
    </section>

    <!-- Testes de Performance -->
    <section class="demo-section card-responsive">
      <h2 class="text-responsive-2xl">⚡ Performance e Otimização</h2>
      <div class="performance-grid grid-responsive-2">
        <div class="performance-metric card-responsive">
          <h3 class="text-responsive-lg">🎯 Área de Toque</h3>
          <p class="text-responsive-sm">
            Todos os elementos interativos têm no mínimo 44x44px para garantir boa usabilidade em dispositivos de toque.
          </p>
          <div class="touch-demo">
            <button class="btn-responsive" style="background: #4caf50; color: white; border: none; margin: 4px;">
              ✓ Botão Otimizado
            </button>
            <button style="padding: 2px 4px; font-size: 10px; border: 1px solid #ccc; margin: 4px;">
              ✗ Muito Pequeno
            </button>
          </div>
        </div>
        
        <div class="performance-metric card-responsive">
          <h3 class="text-responsive-lg">📐 Aspect Ratio</h3>
          <p class="text-responsive-sm">
            Suporte para diferentes proporções de aspecto usando CSS moderno.
          </p>
          <div class="aspect-demo" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px;">
            <div class="aspect-square" style="background: linear-gradient(45deg, #ff6b6b, #ee5a24); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
              1:1
            </div>
            <div class="aspect-video" style="background: linear-gradient(45deg, #0095f6, #005bb5); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; grid-column: 1 / -1;">
              16:9
            </div>
          </div>
        </div>
        
        <div class="performance-metric card-responsive">
          <h3 class="text-responsive-lg">📱 iOS Optimizations</h3>
          <p class="text-responsive-sm">
            Otimizações específicas para dispositivos iOS, incluindo prevenção de zoom em inputs e melhor performance.
          </p>
          <input class="input-responsive ios-input-fix" placeholder="Input otimizado para iOS" style="margin-top: 8px;">
        </div>
        
        <div class="performance-metric card-responsive">
          <h3 class="text-responsive-lg">♿ Acessibilidade</h3>
          <p class="text-responsive-sm">
            Melhorias de acessibilidade incluindo indicadores de foco visíveis e suporte a leitores de tela.
          </p>
          <button class="btn-responsive focus-visible" style="background: #9c27b0; color: white; border: none; margin-top: 8px;" tabindex="0">
            Foque-me com Tab
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'ResponsiveDemo',
  data() {
    return {
      deviceInfo: {},
      breakpointChanges: 0,
      loadTime: 0,
      renderTime: 0,
      cards: [
        {
          id: 1,
          emoji: '🚀',
          title: 'Performance',
          description: 'Interface otimizada para todos os dispositivos'
        },
        {
          id: 2,
          emoji: '🎨',
          title: 'Design',
          description: 'Visual consistente e moderno em qualquer tela'
        },
        {
          id: 3,
          emoji: '🔧',
          title: 'Funcionalidade',
          description: 'Todas as funcionalidades acessíveis'
        },
        {
          id: 4,
          emoji: '♿',
          title: 'Acessibilidade',
          description: 'Interface inclusiva e fácil de usar'
        }
      ]
    }
  },
  mounted() {
    this.loadTime = Date.now()
    this.updateDeviceInfo()
    this.setupResponsiveListeners()
    
    // Simula tempo de renderização
    this.$nextTick(() => {
      this.renderTime = Date.now() - this.loadTime
    })
  },
  methods: {
    updateDeviceInfo() {
      if (this.$responsive) {
        this.deviceInfo = this.$responsive.getDeviceCapabilities()
      }
    },
    
    setupResponsiveListeners() {
      if (this.$responsive) {
        this.removeScreenListener = this.$responsive.onScreenChange(() => {
          this.updateDeviceInfo()
          this.breakpointChanges++
        })
      }
    }
  },
  beforeUnmount() {
    if (this.removeScreenListener) {
      this.removeScreenListener()
    }
  }
}
</script>

<style scoped>
/* Container principal */
.responsive-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-md, 20px);
  color: var(--foreground);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header */
.demo-header {
  text-align: center;
  margin-bottom: var(--space-xl, 40px);
}

.demo-header h1 {
  font-size: clamp(2rem, 6vw, 3rem);
  color: var(--primary);
  margin-bottom: var(--space-sm, 12px);
  font-weight: 800;
}

.demo-header p {
  font-size: clamp(1rem, 3vw, 1.25rem);
  color: var(--text-secondary, #666);
  margin: 0;
}

/* Seções */
.responsive-demo > div {
  margin-bottom: var(--space-xl, 40px);
  padding: var(--space-lg, 24px);
  background: var(--card);
  border-radius: clamp(12px, 3vw, 20px);
  border: 1px solid var(--border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.responsive-demo h2 {
  font-size: clamp(1.5rem, 4vw, 2rem);
  color: var(--primary);
  margin-bottom: var(--space-md, 20px);
  font-weight: 700;
}

/* Informações do dispositivo */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-sm, 16px);
}

.info-item {
  padding: var(--space-sm, 12px);
  background: var(--background);
  border-radius: clamp(6px, 1.5vw, 8px);
  border: 1px solid var(--border);
  font-size: clamp(14px, 3vw, 16px);
}

/* Grid demo */
.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-md, 20px);
}

.grid-item {
  padding: var(--space-md, 20px);
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border-radius: clamp(8px, 2vw, 12px);
  text-align: center;
}

.grid-item h3 {
  margin: 0 0 var(--space-sm, 12px) 0;
  font-size: clamp(1.25rem, 4vw, 1.5rem);
}

.grid-item p {
  margin: 0;
  font-size: clamp(14px, 3vw, 16px);
  opacity: 0.9;
}

/* Tipografia */
.text-samples {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 20px);
}

.fluid-heading {
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: 900;
  margin: 0 0 var(--space-sm, 12px) 0;
  background: linear-gradient(45deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.fluid-subtitle {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  font-weight: 600;
  margin: 0 0 var(--space-md, 20px) 0;
  color: var(--secondary);
}

.fluid-text {
  font-size: clamp(1rem, 3vw, 1.25rem);
  line-height: 1.6;
  margin: 0 0 var(--space-md, 20px) 0;
}

.fluid-small {
  font-size: clamp(0.875rem, 2.5vw, 1rem);
  color: var(--text-secondary, #666);
}

/* Botões responsivos */
.buttons-section {
  margin-bottom: var(--space-lg, 32px);
}

.buttons-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm, 16px);
}

.responsive-btn {
  padding: clamp(12px, 3vw, 16px) clamp(16px, 4vw, 24px);
  border: none;
  border-radius: clamp(6px, 1.5vw, 8px);
  font-size: clamp(14px, 3.5vw, 16px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: clamp(44px, 10vw, 52px);
  outline: none;
}

.responsive-btn.primary {
  background: var(--primary);
  color: white;
}

.responsive-btn.secondary {
  background: var(--secondary);
  color: white;
}

.responsive-btn.accent {
  background: var(--accent);
  color: var(--preto-profundo);
}

.responsive-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.responsive-btn.full-width {
  width: 100%;
}

/* Formulário responsivo */
.responsive-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 20px);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs, 8px);
}

.form-group label {
  font-weight: 600;
  font-size: clamp(14px, 3vw, 16px);
  color: var(--foreground);
}

.responsive-input,
.responsive-textarea {
  padding: clamp(12px, 3vw, 16px);
  border: 1px solid var(--border);
  border-radius: clamp(6px, 1.5vw, 8px);
  font-size: clamp(14px, 3.5vw, 16px);
  background: var(--background);
  color: var(--foreground);
  transition: all 0.3s ease;
  outline: none;
}

.responsive-input:focus,
.responsive-textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(0, 61, 124, 0.1);
}

.responsive-textarea {
  min-height: clamp(80px, 15vw, 120px);
  resize: vertical;
}

/* Cards responsivos */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-md, 20px);
}

.responsive-card {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: clamp(12px, 3vw, 16px);
  overflow: hidden;
  transition: all 0.3s ease;
}

.responsive-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-image {
  font-size: clamp(3rem, 8vw, 4rem);
  text-align: center;
  padding: var(--space-lg, 32px) var(--space-md, 20px);
  background: linear-gradient(135deg, var(--primary), var(--secondary));
}

.card-content {
  padding: var(--space-md, 20px);
}

.card-content h3 {
  margin: 0 0 var(--space-sm, 12px) 0;
  font-size: clamp(1.25rem, 4vw, 1.5rem);
  color: var(--foreground);
}

.card-content p {
  margin: 0 0 var(--space-md, 20px) 0;
  color: var(--text-secondary, #666);
  font-size: clamp(14px, 3vw, 16px);
  line-height: 1.5;
}

.card-btn {
  width: 100%;
  padding: var(--space-sm, 12px);
  background: var(--primary);
  color: white;
  border: none;
  border-radius: clamp(6px, 1.5vw, 8px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.card-btn:hover {
  background: var(--secondary);
}

/* Mensagens por dispositivo */
.device-message {
  padding: var(--space-md, 20px);
  border-radius: clamp(8px, 2vw, 12px);
  text-align: center;
  font-size: clamp(14px, 3.5vw, 16px);
  font-weight: 500;
}

.device-message.mobile {
  background: linear-gradient(135deg, #ff6b6b, #ffa726);
  color: white;
}

.device-message.tablet {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: white;
}

.device-message.desktop {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

/* Estatísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-md, 20px);
}

.stat-item {
  text-align: center;
  padding: var(--space-md, 20px);
  background: var(--background);
  border-radius: clamp(8px, 2vw, 12px);
  border: 1px solid var(--border);
}

.stat-value {
  font-size: clamp(1.5rem, 5vw, 2rem);
  font-weight: 700;
  color: var(--primary);
  margin-bottom: var(--space-xs, 8px);
}

.stat-label {
  font-size: clamp(12px, 2.5vw, 14px);
  color: var(--text-secondary, #666);
  font-weight: 500;
}

/* Estilos específicos para demonstração das classes utilitárias */
.utility-demo {
  margin-bottom: var(--fluid-spacing-lg);
}

.typography-samples p {
  margin: var(--fluid-spacing-sm) 0;
  line-height: 1.2;
}

.spacing-demo > div {
  border-radius: 8px;
  color: #333;
  font-weight: 500;
}

.components-demo {
  display: flex;
  flex-direction: column;
  gap: var(--fluid-spacing-sm);
}

.visibility-demo > div {
  font-weight: 500;
  text-align: center;
}

.performance-grid {
  margin-top: var(--fluid-spacing-md);
}

.performance-metric {
  min-height: 200px;
}

.touch-demo {
  margin-top: var(--fluid-spacing-sm);
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Melhorias responsivas específicas para o demo */
@media (max-width: 768px) {
  .components-demo {
    gap: var(--fluid-spacing-md);
  }
  
  .touch-demo {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .aspect-demo {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 480px) {
  .typography-samples p {
    text-align: center;
    margin: var(--fluid-spacing-xs) 0;
  }
  
  .spacing-demo > div {
    text-align: center;
    font-size: 14px;
  }
  
  .performance-metric {
    min-height: auto;
    padding: var(--fluid-spacing-md);
  }
}

/* Media queries específicas */
@media (max-width: 479.98px) {
  .responsive-demo {
    padding: var(--space-sm, 12px);
  }
  
  .buttons-grid {
    flex-direction: column;
  }
  
  .responsive-btn {
    width: 100%;
  }
}

@media (max-width: 767.98px) and (orientation: landscape) {
  .demo-header h1 {
    font-size: 1.75rem;
  }
  
  .responsive-demo > div {
    padding: var(--space-md, 16px);
  }
}

@media (min-width: 992px) {
  .responsive-demo {
    padding: var(--space-lg, 32px);
  }
  
  .responsive-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  }
}

/* Classes utilitárias já definidas no CSS global */
.mobile-only { display: block; }
.tablet-only,
.desktop-only { display: none; }

@media (min-width: 768px) {
  .mobile-only { display: none; }
  .tablet-only { display: block; }
}

@media (min-width: 992px) {
  .tablet-only { display: none; }
  .desktop-only { display: block; }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .responsive-btn,
  .responsive-card,
  .responsive-input,
  .responsive-textarea {
    transition: none;
  }
  
  .responsive-btn:hover,
  .responsive-card:hover {
    transform: none;
  }
}
</style>
