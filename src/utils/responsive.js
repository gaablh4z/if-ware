/**
 * Utilitários para responsividade - IF Wave
 * Sistema completo para detectar dispositivos e aplicar estilos responsivos
 */

// Breakpoints do sistema
export const BREAKPOINTS = {
  xs: 0,          // Mobile portrait
  sm: 576,        // Mobile landscape
  md: 768,        // Tablet portrait
  lg: 992,        // Desktop small
  xl: 1200,       // Desktop large
  xxl: 1400       // Desktop extra large
}

// Função para detectar o tipo de dispositivo
export function getDeviceType() {
  const width = window.innerWidth
  
  if (width < BREAKPOINTS.sm) return 'mobile-portrait'
  if (width < BREAKPOINTS.md) return 'mobile-landscape'
  if (width < BREAKPOINTS.lg) return 'tablet'
  if (width < BREAKPOINTS.xl) return 'desktop'
  return 'desktop-large'
}

// Função para detectar se é dispositivo móvel
export function isMobile() {
  return window.innerWidth < BREAKPOINTS.md
}

// Função para detectar se é tablet
export function isTablet() {
  const width = window.innerWidth
  return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg
}

// Função para detectar se é desktop
export function isDesktop() {
  return window.innerWidth >= BREAKPOINTS.lg
}

// Função para detectar orientação
export function getOrientation() {
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
}

// Função para detectar se suporta hover
export function supportsHover() {
  return window.matchMedia('(hover: hover)').matches
}

// Função para detectar se prefere movimento reduzido
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Função para detectar tema preferido do sistema
export function getPreferredColorScheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Função para detectar alta densidade de pixels
export function isHighDPI() {
  return window.devicePixelRatio > 1 || 
         window.matchMedia('(min-resolution: 192dpi)').matches
}

// Classes utilitárias responsivas
export const RESPONSIVE_CLASSES = {
  // Container responsivo
  container: {
    width: '100%',
    maxWidth: 'var(--container-max-width)',
    margin: '0 auto',
    padding: '0 var(--container-padding)'
  },
  
  // Grid responsivo
  grid: {
    display: 'grid',
    gap: 'clamp(16px, 4vw, 24px)',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
  },
  
  // Flexbox responsivo
  flex: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'clamp(12px, 3vw, 20px)'
  },
  
  // Texto responsivo
  text: {
    fontSize: 'clamp(14px, 3.5vw, 16px)',
    lineHeight: '1.6'
  },
  
  // Heading responsivo
  heading: {
    fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
    lineHeight: '1.2',
    fontWeight: '700'
  },
  
  // Botão responsivo
  button: {
    padding: 'clamp(12px, 3vw, 16px) clamp(16px, 4vw, 24px)',
    fontSize: 'clamp(14px, 3.5vw, 16px)',
    borderRadius: 'clamp(6px, 1.5vw, 12px)',
    minHeight: 'clamp(44px, 10vw, 52px)'
  },
  
  // Input responsivo
  input: {
    padding: 'clamp(12px, 3vw, 16px)',
    fontSize: 'clamp(14px, 3.5vw, 16px)',
    borderRadius: 'clamp(6px, 1.5vw, 8px)'
  }
}

// Media queries como JavaScript
export function createMediaQuery(breakpoint, type = 'min') {
  const value = BREAKPOINTS[breakpoint] || breakpoint
  return window.matchMedia(`(${type}-width: ${value}px)`)
}

// Hook para reagir a mudanças de tela
export function onScreenChange(callback) {
  const handler = () => callback(getDeviceType())
  
  window.addEventListener('resize', handler)
  window.addEventListener('orientationchange', handler)
  
  // Retorna função para remover os listeners
  return () => {
    window.removeEventListener('resize', handler)
    window.removeEventListener('orientationchange', handler)
  }
}

// Função para aplicar estilos baseados no dispositivo
export function applyResponsiveStyles(element, styles) {
  const deviceType = getDeviceType()
  const orientation = getOrientation()
  
  // Aplica estilos base
  if (styles.base) {
    Object.assign(element.style, styles.base)
  }
  
  // Aplica estilos por tipo de dispositivo
  if (styles[deviceType]) {
    Object.assign(element.style, styles[deviceType])
  }
  
  // Aplica estilos por orientação
  if (styles[orientation]) {
    Object.assign(element.style, styles[orientation])
  }
}

// Função para calcular tamanho de fonte responsivo
export function calculateResponsiveSize(min, preferred, max, unit = 'px') {
  return `clamp(${min}${unit}, ${preferred}, ${max}${unit})`
}

// Função para detectar capacidades do dispositivo
export function getDeviceCapabilities() {
  return {
    type: getDeviceType(),
    orientation: getOrientation(),
    supportsHover: supportsHover(),
    prefersReducedMotion: prefersReducedMotion(),
    preferredColorScheme: getPreferredColorScheme(),
    isHighDPI: isHighDPI(),
    isTouchDevice: 'ontouchstart' in window,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio
  }
}

// Plugin Vue para usar em componentes
export const ResponsivePlugin = {
  install(app) {
    app.config.globalProperties.$responsive = {
      getDeviceType,
      isMobile,
      isTablet,
      isDesktop,
      getOrientation,
      supportsHover,
      prefersReducedMotion,
      getPreferredColorScheme,
      isHighDPI,
      getDeviceCapabilities,
      onScreenChange,
      BREAKPOINTS,
      RESPONSIVE_CLASSES
    }
  }
}

// CSS personalizado para responsividade
export const RESPONSIVE_CSS = `
/* Variáveis CSS responsivas globais */
:root {
  /* Breakpoints */
  --bp-xs: ${BREAKPOINTS.xs}px;
  --bp-sm: ${BREAKPOINTS.sm}px;
  --bp-md: ${BREAKPOINTS.md}px;
  --bp-lg: ${BREAKPOINTS.lg}px;
  --bp-xl: ${BREAKPOINTS.xl}px;
  --bp-xxl: ${BREAKPOINTS.xxl}px;
  
  /* Tamanhos fluidos */
  --fluid-xs: clamp(0.75rem, 2vw, 1rem);
  --fluid-sm: clamp(0.875rem, 2.5vw, 1.125rem);
  --fluid-base: clamp(1rem, 3vw, 1.25rem);
  --fluid-lg: clamp(1.125rem, 3.5vw, 1.5rem);
  --fluid-xl: clamp(1.25rem, 4vw, 2rem);
  --fluid-2xl: clamp(1.5rem, 5vw, 3rem);
  
  /* Espaçamentos fluidos */
  --space-xs: clamp(0.5rem, 2vw, 0.75rem);
  --space-sm: clamp(0.75rem, 3vw, 1rem);
  --space-md: clamp(1rem, 4vw, 1.5rem);
  --space-lg: clamp(1.5rem, 5vw, 2rem);
  --space-xl: clamp(2rem, 6vw, 3rem);
  --space-2xl: clamp(3rem, 8vw, 4rem);
}

/* Classes utilitárias responsivas */
.responsive-container {
  width: 100%;
  max-width: var(--container-max-width, 1200px);
  margin: 0 auto;
  padding: 0 var(--container-padding, 20px);
}

.responsive-grid {
  display: grid;
  gap: var(--space-md);
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.responsive-flex {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.responsive-text {
  font-size: var(--fluid-base);
  line-height: 1.6;
}

.responsive-heading {
  font-size: var(--fluid-xl);
  line-height: 1.2;
  font-weight: 700;
}

/* Classes para esconder/mostrar por dispositivo */
.mobile-only { display: block; }
.tablet-only,
.desktop-only { display: none; }

@media (min-width: ${BREAKPOINTS.md}px) {
  .mobile-only { display: none; }
  .tablet-only { display: block; }
}

@media (min-width: ${BREAKPOINTS.lg}px) {
  .tablet-only { display: none; }
  .desktop-only { display: block; }
}

/* Safe area para dispositivos com notch */
.safe-area {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
`

export default {
  getDeviceType,
  isMobile,
  isTablet,
  isDesktop,
  getOrientation,
  supportsHover,
  prefersReducedMotion,
  getPreferredColorScheme,
  isHighDPI,
  getDeviceCapabilities,
  onScreenChange,
  applyResponsiveStyles,
  calculateResponsiveSize,
  createMediaQuery,
  BREAKPOINTS,
  RESPONSIVE_CLASSES,
  RESPONSIVE_CSS,
  ResponsivePlugin
}
