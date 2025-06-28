<template>
  <div class="lazy-image-container" :class="containerClass">
    <transition name="fade" mode="out-in">
      <!-- Placeholder/Loading state -->
      <div 
        v-if="!imageLoaded && !imageError"
        key="loading"
        class="image-placeholder"
        :style="placeholderStyle"
      >
        <div class="loading-content">
          <div v-if="showSkeleton" class="skeleton-loader"></div>
          <div v-else class="spinner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <p v-if="loadingText" class="loading-text">{{ loadingText }}</p>
        </div>
      </div>

      <!-- Error state -->
      <div 
        v-else-if="imageError"
        key="error"
        class="image-error"
        :style="errorStyle"
        @click="retryLoad"
      >
        <div class="error-content">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p class="error-text">{{ errorText || 'Erro ao carregar imagem' }}</p>
          <button v-if="allowRetry" class="retry-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="23,4 23,10 17,10"/>
              <path d="M20.49,15a9,9,0,1,1-2.12-9.36L23,10"/>
            </svg>
            Tentar novamente
          </button>
        </div>
      </div>

      <!-- Loaded image -->
      <img 
        v-else
        key="image"
        ref="image"
        :src="currentSrc"
        :alt="alt"
        :title="title"
        class="lazy-image"
        :class="imageClass"
        :style="imageStyle"
        @load="onImageLoad"
        @error="onImageError"
        @click="handleImageClick"
      />
    </transition>

    <!-- Overlay content -->
    <div v-if="$slots.overlay && imageLoaded" class="image-overlay">
      <slot name="overlay"></slot>
    </div>

    <!-- Progressive enhancement indicators -->
    <div v-if="progressive && imageLoaded" class="progressive-indicators">
      <div v-if="lowQualityLoaded && !highQualityLoaded" class="quality-indicator low">
        Carregando...
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LazyImage',
  props: {
    // URLs da imagem
    src: {
      type: String,
      required: true
    },
    lowQualitySrc: {
      type: String,
      default: null
    },
    
    // Atributos da imagem
    alt: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: null
    },
    
    // Configurações do lazy loading
    threshold: {
      type: Number,
      default: 0.1
    },
    rootMargin: {
      type: String,
      default: '50px'
    },
    
    // Configurações visuais
    width: {
      type: [String, Number],
      default: null
    },
    height: {
      type: [String, Number],
      default: null
    },
    aspectRatio: {
      type: String,
      default: null
    },
    objectFit: {
      type: String,
      default: 'cover',
      validator: value => ['contain', 'cover', 'fill', 'none', 'scale-down'].includes(value)
    },
    
    // Estados e comportamentos
    progressive: {
      type: Boolean,
      default: false
    },
    showSkeleton: {
      type: Boolean,
      default: true
    },
    allowRetry: {
      type: Boolean,
      default: true
    },
    clickable: {
      type: Boolean,
      default: false
    },
    
    // Textos customizáveis
    loadingText: {
      type: String,
      default: null
    },
    errorText: {
      type: String,
      default: null
    },
    
    // Classes CSS customizáveis
    containerClass: {
      type: [String, Array, Object],
      default: null
    },
    imageClass: {
      type: [String, Array, Object],
      default: null
    }
  },
  data() {
    return {
      imageLoaded: false,
      imageError: false,
      lowQualityLoaded: false,
      highQualityLoaded: false,
      currentSrc: '',
      observer: null,
      isInViewport: false,
      retryCount: 0,
      maxRetries: 3
    };
  },
  computed: {
    placeholderStyle() {
      const style = {};
      
      if (this.width) style.width = typeof this.width === 'number' ? `${this.width}px` : this.width;
      if (this.height) style.height = typeof this.height === 'number' ? `${this.height}px` : this.height;
      if (this.aspectRatio) style.aspectRatio = this.aspectRatio;
      
      return style;
    },
    
    errorStyle() {
      return this.placeholderStyle;
    },
    
    imageStyle() {
      const style = {};
      
      if (this.objectFit) style.objectFit = this.objectFit;
      if (this.width) style.width = typeof this.width === 'number' ? `${this.width}px` : this.width;
      if (this.height) style.height = typeof this.height === 'number' ? `${this.height}px` : this.height;
      if (this.aspectRatio) style.aspectRatio = this.aspectRatio;
      
      return style;
    }
  },
  mounted() {
    this.setupIntersectionObserver();
  },
  beforeUnmount() {
    this.cleanupObserver();
  },
  methods: {
    setupIntersectionObserver() {
      if (!('IntersectionObserver' in window)) {
        // Fallback para browsers que não suportam Intersection Observer
        this.loadImage();
        return;
      }

      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !this.isInViewport) {
              this.isInViewport = true;
              this.loadImage();
              this.observer.disconnect();
            }
          });
        },
        {
          threshold: this.threshold,
          rootMargin: this.rootMargin
        }
      );

      this.observer.observe(this.$el);
    },

    cleanupObserver() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    },

    async loadImage() {
      if (this.imageLoaded || this.imageError) return;

      try {
        if (this.progressive && this.lowQualitySrc) {
          await this.loadProgressiveImage();
        } else {
          await this.loadSingleImage();
        }
      } catch (error) {
        console.error('Erro ao carregar imagem:', error);
        this.onImageError();
      }
    },

    async loadProgressiveImage() {
      // Carregar imagem de baixa qualidade primeiro
      if (this.lowQualitySrc) {
        try {
          await this.preloadImage(this.lowQualitySrc);
          this.currentSrc = this.lowQualitySrc;
          this.lowQualityLoaded = true;
          this.imageLoaded = true;
        } catch (error) {
          console.warn('Erro ao carregar imagem de baixa qualidade:', error);
        }
      }

      // Carregar imagem de alta qualidade
      try {
        await this.preloadImage(this.src);
        this.currentSrc = this.src;
        this.highQualityLoaded = true;
        this.$emit('highQualityLoaded');
      } catch (error) {
        if (!this.lowQualityLoaded) {
          throw error;
        }
      }
    },

    async loadSingleImage() {
      await this.preloadImage(this.src);
      this.currentSrc = this.src;
      this.imageLoaded = true;
    },

    preloadImage(src) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Falha ao carregar: ${src}`));
        img.src = src;
      });
    },

    onImageLoad() {
      this.imageError = false;
      this.retryCount = 0;
      this.$emit('load', {
        src: this.currentSrc,
        progressive: this.progressive,
        lowQuality: this.lowQualityLoaded && !this.highQualityLoaded
      });
    },

    onImageError() {
      this.imageError = true;
      this.imageLoaded = false;
      this.$emit('error', {
        src: this.currentSrc,
        retryCount: this.retryCount
      });
    },

    retryLoad() {
      if (this.retryCount >= this.maxRetries) {
        this.$emit('maxRetriesReached');
        return;
      }

      this.retryCount++;
      this.imageError = false;
      this.imageLoaded = false;
      this.lowQualityLoaded = false;
      this.highQualityLoaded = false;
      
      // Aguardar um pouco antes de tentar novamente
      setTimeout(() => {
        this.loadImage();
      }, 1000 * this.retryCount);
      
      this.$emit('retry', this.retryCount);
    },

    handleImageClick(event) {
      if (this.clickable) {
        this.$emit('click', event);
      }
    }
  }
};
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

/* Placeholder */
.image-placeholder {
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  width: 100%;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.skeleton-loader {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.spinner {
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}

.spinner svg {
  width: 100%;
  height: 100%;
}

.loading-text {
  font-size: 0.8rem;
  margin: 0;
}

/* Error state */
.image-error {
  background: #fef2f2;
  border: 1px dashed #fca5a5;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.2s;
}

.image-error:hover {
  background: #fef7f7;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #dc2626;
  text-align: center;
  padding: 1rem;
}

.error-icon {
  width: 24px;
  height: 24px;
}

.error-text {
  font-size: 0.8rem;
  margin: 0;
}

.retry-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: #b91c1c;
}

.retry-button svg {
  width: 14px;
  height: 14px;
}

/* Loaded image */
.lazy-image {
  width: 100%;
  height: 100%;
  max-width: 100%;
  display: block;
}

.lazy-image.clickable {
  cursor: pointer;
}

/* Overlay */
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.image-overlay > * {
  pointer-events: auto;
}

/* Progressive indicators */
.progressive-indicators {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.quality-indicator {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
}

.quality-indicator.low {
  background: rgba(245, 158, 11, 0.9);
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .loading-text,
  .error-text {
    font-size: 0.7rem;
  }
  
  .retry-button {
    font-size: 0.7rem;
    padding: 0.375rem 0.5rem;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .image-placeholder {
    background: #374151;
  }
  
  .loading-content {
    color: #d1d5db;
  }
  
  .skeleton-loader {
    background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
    background-size: 200% 100%;
  }
  
  .image-error {
    background: #450a0a;
    border-color: #dc2626;
  }
  
  .image-error:hover {
    background: #7f1d1d;
  }
}
</style>
