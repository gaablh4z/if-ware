/**
 * 🔧 Script Avançado de Análise e Teste - IF Wave
 * Análise completa de código, detecção de funcionalidades e geração de relatórios
 * 
 * Versão: 3.0 - Análise Estática Avançada
 * Funcionalidades:
 * - Análise estática completa do código
 * - Detecção automática de funcionalidades implementadas
 * - Sugestão de funcionalidades opcionais
 * - Geração de roadmap de desenvolvimento
 * - Relatórios detalhados em JSON e Markdown
 */

const fs = require('fs');
const path = require('path');

class AdvancedSocialNetworkAnalyzer {
  constructor() {
    this.analysisResults = {
      timestamp: new Date().toISOString(),
      projectInfo: {},
      codeAnalysis: {
        components: [],
        features: [],
        architecture: {},
        codeQuality: {}
      },
      functionalityMatrix: {
        implemented: [],
        partial: [],
        missing: [],
        optional: []
      },
      recommendations: {
        critical: [],
        important: [],
        nice_to_have: []
      },
      roadmap: {},
      scores: {
        completeness: 0,
        codeQuality: 0,
        architecture: 0,
        security: 0,
        performance: 0,
        accessibility: 0
      }
    };
    
    this.baseDir = __dirname;
    this.srcDir = path.join(this.baseDir, 'src');
    this.componentsDir = path.join(this.srcDir, 'components');
    this.adminDir = path.join(this.srcDir, 'admin');
    
    // Matriz de funcionalidades esperadas em uma rede social
    this.expectedFeatures = {
      // Funcionalidades essenciais
      core: [
        { name: 'user_authentication', weight: 10, patterns: ['login', 'register', 'auth', 'password'] },
        { name: 'user_profile', weight: 8, patterns: ['profile', 'avatar', 'bio', 'user.*info'] },
        { name: 'post_creation', weight: 9, patterns: ['publish', 'post', 'create.*post', 'share'] },
        { name: 'feed_display', weight: 9, patterns: ['feed', 'timeline', 'posts.*list'] },
        { name: 'notifications', weight: 7, patterns: ['notification', 'alert', 'badge'] },
        { name: 'search', weight: 6, patterns: ['search', 'find', 'filter'] },
        { name: 'messaging', weight: 8, patterns: ['message', 'chat', 'conversation'] },
        { name: 'admin_panel', weight: 5, patterns: ['admin', 'dashboard', 'management'] }
      ],
      
      // Funcionalidades de interação
      interaction: [
        { name: 'likes_reactions', weight: 7, patterns: ['like', 'react', 'heart', 'emotion'] },
        { name: 'comments', weight: 8, patterns: ['comment', 'reply', 'discuss'] },
        { name: 'sharing', weight: 5, patterns: ['share', 'repost', 'forward'] },
        { name: 'following', weight: 6, patterns: ['follow', 'friend', 'connect'] },
        { name: 'mentions', weight: 4, patterns: ['mention', '@', 'tag.*user'] }
      ],
      
      // Funcionalidades avançadas
      advanced: [
        { name: 'stories', weight: 6, patterns: ['story', 'stories', 'temporary.*post'] },
        { name: 'groups', weight: 7, patterns: ['group', 'community', 'team'] },
        { name: 'events', weight: 5, patterns: ['event', 'calendar', 'appointment'] },
        { name: 'live_streaming', weight: 4, patterns: ['live', 'stream', 'broadcast'] },
        { name: 'polls', weight: 4, patterns: ['poll', 'vote', 'survey'] },
        { name: 'hashtags', weight: 5, patterns: ['hashtag', '#', 'tag'] }
      ],
      
      // Recursos técnicos
      technical: [
        { name: 'real_time_updates', weight: 6, patterns: ['websocket', 'socket.io', 'real.*time'] },
        { name: 'offline_support', weight: 4, patterns: ['offline', 'pwa', 'service.*worker'] },
        { name: 'mobile_responsive', weight: 8, patterns: ['responsive', 'mobile', '@media'] },
        { name: 'dark_mode', weight: 3, patterns: ['dark.*mode', 'theme', 'color.*scheme'] },
        { name: 'accessibility', weight: 6, patterns: ['aria', 'accessibility', 'a11y', 'role='] }
      ]
    };
  }

  // Função utilitária para ler arquivos
  readFileContent(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8');
      }
      return null;
    } catch (error) {
      console.warn(`⚠️ Erro ao ler arquivo ${filePath}:`, error.message);
      return null;
    }
  }

  // Análise do package.json
  analyzeProjectInfo() {
    console.log('📦 Analisando informações do projeto...');
    
    const packageJsonPath = path.join(this.baseDir, 'package.json');
    const packageContent = this.readFileContent(packageJsonPath);
    
    if (packageContent) {
      try {
        const packageData = JSON.parse(packageContent);
        this.analysisResults.projectInfo = {
          name: packageData.name || 'Projeto sem nome',
          version: packageData.version || '0.0.0',
          dependencies: Object.keys(packageData.dependencies || {}),
          devDependencies: Object.keys(packageData.devDependencies || {}),
          scripts: packageData.scripts || {},
          framework: this.detectFramework(packageData)
        };
        
        this.analysisResults.scores.architecture += 10; // Projeto bem estruturado
      } catch (error) {
        console.warn('⚠️ Erro ao analisar package.json:', error.message);
      }
    }
  }

  // Detecta o framework principal
  detectFramework(packageData) {
    const deps = { ...packageData.dependencies, ...packageData.devDependencies };
    
    if (deps.vue) return 'Vue.js';
    if (deps.react) return 'React';
    if (deps.angular) return 'Angular';
    if (deps.svelte) return 'Svelte';
    
    return 'Vanilla JavaScript';
  }

  // Análise completa de componentes
  analyzeComponents() {
    console.log('🧩 Analisando componentes...');
    
    const componentFiles = this.getVueFiles(this.componentsDir);
    const adminFiles = this.getVueFiles(this.adminDir);
    
    [...componentFiles, ...adminFiles].forEach(filePath => {
      const content = this.readFileContent(filePath);
      if (content) {
        const analysis = this.analyzeVueComponent(filePath, content);
        this.analysisResults.codeAnalysis.components.push(analysis);
      }
    });
    
    // Analisa arquivo principal App.vue
    const appPath = path.join(this.srcDir, 'App.vue');
    const appContent = this.readFileContent(appPath);
    if (appContent) {
      const analysis = this.analyzeVueComponent(appPath, appContent);
      this.analysisResults.codeAnalysis.components.push(analysis);
    }
  }

  // Busca arquivos .vue recursivamente
  getVueFiles(directory) {
    const files = [];
    
    if (!fs.existsSync(directory)) return files;
    
    const items = fs.readdirSync(directory);
    items.forEach(item => {
      const itemPath = path.join(directory, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getVueFiles(itemPath));
      } else if (item.endsWith('.vue')) {
        files.push(itemPath);
      }
    });
    
    return files;
  }

  // Análise detalhada de componente Vue
  analyzeVueComponent(filePath, content) {
    const componentName = path.basename(filePath, '.vue');
    const relativePath = path.relative(this.baseDir, filePath);
    
    const analysis = {
      name: componentName,
      path: relativePath,
      size: content.length,
      sections: {
        template: this.extractSection(content, 'template'),
        script: this.extractSection(content, 'script'),
        style: this.extractSection(content, 'style')
      },
      features: [],
      complexity: this.calculateComplexity(content),
      imports: this.extractImports(content),
      exports: this.extractExports(content),
      events: this.extractEvents(content),
      props: this.extractProps(content)
    };
    
    // Detecta funcionalidades específicas
    analysis.features = this.detectFeatures(content);
    
    // Avalia qualidade do código
    analysis.quality = this.evaluateCodeQuality(content);
    
    return analysis;
  }

  // Extrai seções do componente Vue
  extractSection(content, sectionName) {
    const regex = new RegExp(`<${sectionName}[^>]*>([\\s\\S]*?)<\\/${sectionName}>`, 'gi');
    const match = regex.exec(content);
    return match ? match[1].trim() : '';
  }

  // Calcula complexidade do código
  calculateComplexity(content) {
    const lines = content.split('\n').length;
    const functions = (content.match(/function|=>/g) || []).length;
    const conditions = (content.match(/if|else|switch|case|\?/g) || []).length;
    const loops = (content.match(/for|while|forEach|map|filter/g) || []).length;
    
    return {
      lines,
      functions,
      conditions,
      loops,
      score: Math.min(100, (functions * 2 + conditions * 1.5 + loops * 1.2) / lines * 100)
    };
  }

  // Extrai imports do componente
  extractImports(content) {
    const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  // Extrai exports do componente
  extractExports(content) {
    const exports = [];
    if (content.includes('export default')) {
      exports.push('default');
    }
    return exports;
  }

  // Extrai eventos emitidos
  extractEvents(content) {
    const eventRegex = /\$emit\(['"`]([^'"`]+)['"`]/g;
    const events = [];
    let match;
    
    while ((match = eventRegex.exec(content)) !== null) {
      events.push(match[1]);
    }
    
    return events;
  }

  // Extrai props do componente
  extractProps(content) {
    const propsRegex = /props:\s*\{([^}]+)\}/;
    const match = propsRegex.exec(content);
    
    if (match) {
      const propsContent = match[1];
      return propsContent.split(',').map(prop => prop.trim().split(':')[0].trim());
    }
    
    return [];
  }

  // Detecta funcionalidades implementadas
  detectFeatures(content) {
    const features = [];
    const lowerContent = content.toLowerCase();
    
    // Verifica cada categoria de funcionalidades
    Object.keys(this.expectedFeatures).forEach(category => {
      this.expectedFeatures[category].forEach(feature => {
        const detected = feature.patterns.some(pattern => {
          const regex = new RegExp(pattern, 'i');
          return regex.test(lowerContent);
        });
        
        if (detected) {
          features.push({
            name: feature.name,
            category,
            weight: feature.weight,
            confidence: this.calculateConfidence(lowerContent, feature.patterns)
          });
        }
      });
    });
    
    return features;
  }

  // Calcula confiança da detecção
  calculateConfidence(content, patterns) {
    let matches = 0;
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'gi');
      const patternMatches = content.match(regex);
      if (patternMatches) matches += patternMatches.length;
    });
    
    return Math.min(100, matches * 20); // Máximo 100%
  }

  // Avalia qualidade do código
  evaluateCodeQuality(content) {
    const metrics = {
      hasComments: /\/\*|\/\/|<!--/.test(content),
      hasValidation: /validate|validation|required/.test(content),
      hasErrorHandling: /try|catch|error|throw/.test(content),
      hasTypeChecking: /typeof|instanceof/.test(content),
      usesModernSyntax: /const|let|=>|async|await/.test(content),
      hasAccessibility: /aria|role|alt|title/.test(content)
    };
    
    const score = Object.values(metrics).filter(Boolean).length / Object.keys(metrics).length * 100;
    
    return {
      ...metrics,
      score: Math.round(score)
    };
  }

  // Análise de funcionalidades implementadas vs esperadas
  buildFunctionalityMatrix() {
    console.log('📊 Construindo matriz de funcionalidades...');
    
    const allDetectedFeatures = [];
    
    // Coleta todas as funcionalidades detectadas
    this.analysisResults.codeAnalysis.components.forEach(component => {
      component.features.forEach(feature => {
        const existing = allDetectedFeatures.find(f => f.name === feature.name);
        if (existing) {
          existing.confidence = Math.max(existing.confidence, feature.confidence);
          existing.components.push(component.name);
        } else {
          allDetectedFeatures.push({
            ...feature,
            components: [component.name]
          });
        }
      });
    });
    
    // Classifica funcionalidades por status
    Object.keys(this.expectedFeatures).forEach(category => {
      this.expectedFeatures[category].forEach(expectedFeature => {
        const detected = allDetectedFeatures.find(f => f.name === expectedFeature.name);
        
        if (detected) {
          if (detected.confidence >= 80) {
            this.analysisResults.functionalityMatrix.implemented.push({
              ...expectedFeature,
              ...detected,
              status: 'implemented'
            });
          } else {
            this.analysisResults.functionalityMatrix.partial.push({
              ...expectedFeature,
              ...detected,
              status: 'partial'
            });
          }
        } else {
          this.analysisResults.functionalityMatrix.missing.push({
            ...expectedFeature,
            status: 'missing'
          });
        }
      });
    });
  }

  // Detecta funcionalidades opcionais interessantes
  detectOptionalFeatures() {
    console.log('🎯 Detectando funcionalidades opcionais...');
    
    const optionalFeatures = [
      {
        name: 'AI Content Moderation',
        category: 'advanced',
        description: 'Moderação automática de conteúdo usando IA',
        priority: 'high',
        implementation: 'Integração com APIs de ML para detectar conteúdo inadequado',
        effort: 'medium'
      },
      {
        name: 'Stories System',
        category: 'interaction',
        description: 'Sistema de stories temporários (24h)',
        priority: 'high',
        implementation: 'Componente StoriesViewer + sistema de expiração',
        effort: 'medium'
      },
      {
        name: 'Voice Messages',
        category: 'messaging',
        description: 'Mensagens de voz no chat',
        priority: 'medium',
        implementation: 'Web Audio API + armazenamento de áudio',
        effort: 'high'
      },
      {
        name: 'Advanced Analytics',
        category: 'admin',
        description: 'Dashboard de analytics avançado',
        priority: 'medium',
        implementation: 'Gráficos interativos + métricas de engajamento',
        effort: 'high'
      },
      {
        name: 'Gamification',
        category: 'engagement',
        description: 'Sistema de pontos, badges e rankings',
        priority: 'medium',
        implementation: 'Sistema de achievements + leaderboard',
        effort: 'medium'
      },
      {
        name: 'AR Filters',
        category: 'media',
        description: 'Filtros de realidade aumentada para fotos',
        priority: 'low',
        implementation: 'WebRTC + bibliotecas de AR',
        effort: 'very_high'
      },
      {
        name: 'Blockchain Integration',
        category: 'advanced',
        description: 'NFTs e verificação descentralizada',
        priority: 'low',
        implementation: 'Web3 + smart contracts',
        effort: 'very_high'
      },
      {
        name: 'Progressive Web App',
        category: 'technical',
        description: 'PWA completo com offline support',
        priority: 'high',
        implementation: 'Service Workers + Web App Manifest',
        effort: 'medium'
      },
      {
        name: 'Video Calling',
        category: 'messaging',
        description: 'Chamadas de vídeo entre usuários',
        priority: 'medium',
        implementation: 'WebRTC + signaling server',
        effort: 'very_high'
      }
    ];
    
    // Adiciona funcionalidades opcionais baseadas no que não está implementado
    const missingCoreFeatures = this.analysisResults.functionalityMatrix.missing
      .filter(f => f.category === 'core' && f.weight >= 7);
    
    if (missingCoreFeatures.length > 0) {
      optionalFeatures.unshift({
        name: 'Complete Core Features',
        category: 'critical',
        description: 'Implementar funcionalidades essenciais faltantes',
        priority: 'critical',
        implementation: `Focar em: ${missingCoreFeatures.map(f => f.name).join(', ')}`,
        effort: 'high'
      });
    }
    
    this.analysisResults.functionalityMatrix.optional = optionalFeatures;
  }

  // Gera recomendações personalizadas
  generateRecommendations() {
    console.log('💡 Gerando recomendações...');
    
    const implemented = this.analysisResults.functionalityMatrix.implemented;
    const missing = this.analysisResults.functionalityMatrix.missing;
    const partial = this.analysisResults.functionalityMatrix.partial;
    
    // Recomendações críticas
    if (missing.some(f => f.category === 'core' && f.weight >= 8)) {
      this.analysisResults.recommendations.critical.push({
        type: 'missing_core',
        title: 'Implementar Funcionalidades Essenciais',
        description: 'Algumas funcionalidades essenciais estão faltando',
        action: 'Priorizar implementação de funcionalidades core com peso >= 8',
        impact: 'high'
      });
    }
    
    // Recomendações importantes
    if (partial.length > 0) {
      this.analysisResults.recommendations.important.push({
        type: 'complete_partial',
        title: 'Completar Funcionalidades Parciais',
        description: `${partial.length} funcionalidades estão parcialmente implementadas`,
        action: 'Revisar e completar implementações parciais',
        impact: 'medium'
      });
    }
    
    // Qualidade do código
    const avgQuality = this.analysisResults.codeAnalysis.components
      .reduce((sum, comp) => sum + (comp.quality?.score || 0), 0) / 
      this.analysisResults.codeAnalysis.components.length;
    
    if (avgQuality < 70) {
      this.analysisResults.recommendations.important.push({
        type: 'code_quality',
        title: 'Melhorar Qualidade do Código',
        description: `Qualidade média do código: ${avgQuality.toFixed(1)}%`,
        action: 'Adicionar comentários, validações e tratamento de erros',
        impact: 'medium'
      });
    }
    
    // Acessibilidade
    const accessibilityComponents = this.analysisResults.codeAnalysis.components
      .filter(comp => comp.quality?.hasAccessibility);
    
    if (accessibilityComponents.length < this.analysisResults.codeAnalysis.components.length * 0.5) {
      this.analysisResults.recommendations.important.push({
        type: 'accessibility',
        title: 'Melhorar Acessibilidade',
        description: 'Poucos componentes implementam recursos de acessibilidade',
        action: 'Adicionar ARIA labels, roles e alt texts',
        impact: 'medium'
      });
    }
    
    // Nice to have
    if (implemented.length >= missing.length) {
      this.analysisResults.recommendations.nice_to_have.push({
        type: 'optional_features',
        title: 'Implementar Funcionalidades Opcionais',
        description: 'Base sólida permite adicionar recursos avançados',
        action: 'Considerar implementação de funcionalidades opcionais',
        impact: 'low'
      });
    }
  }

  // Calcula scores finais
  calculateScores() {
    console.log('📈 Calculando scores...');
    
    const implemented = this.analysisResults.functionalityMatrix.implemented;
    const missing = this.analysisResults.functionalityMatrix.missing;
    const partial = this.analysisResults.functionalityMatrix.partial;
    
    // Score de completude
    const totalWeight = [...implemented, ...missing, ...partial]
      .reduce((sum, f) => sum + f.weight, 0);
    const implementedWeight = implemented.reduce((sum, f) => sum + f.weight, 0);
    const partialWeight = partial.reduce((sum, f) => sum + f.weight * 0.5, 0);
    
    this.analysisResults.scores.completeness = Math.round(
      ((implementedWeight + partialWeight) / totalWeight) * 100
    );
    
    // Score de qualidade de código
    const avgQuality = this.analysisResults.codeAnalysis.components
      .reduce((sum, comp) => sum + (comp.quality?.score || 0), 0) / 
      this.analysisResults.codeAnalysis.components.length;
    
    this.analysisResults.scores.codeQuality = Math.round(avgQuality);
    
    // Score de arquitetura (baseado na estrutura de componentes)
    const componentCount = this.analysisResults.codeAnalysis.components.length;
    const avgComplexity = this.analysisResults.codeAnalysis.components
      .reduce((sum, comp) => sum + comp.complexity.score, 0) / componentCount;
    
    this.analysisResults.scores.architecture = Math.min(100, 
      Math.round((componentCount * 5) + (100 - avgComplexity))
    );
    
    // Scores estimados para segurança, performance e acessibilidade
    this.analysisResults.scores.security = this.estimateSecurityScore();
    this.analysisResults.scores.performance = this.estimatePerformanceScore();
    this.analysisResults.scores.accessibility = this.estimateAccessibilityScore();
  }

  estimateSecurityScore() {
    const securityFeatures = this.analysisResults.codeAnalysis.components
      .filter(comp => comp.quality?.hasValidation || comp.quality?.hasErrorHandling);
    
    return Math.round((securityFeatures.length / this.analysisResults.codeAnalysis.components.length) * 100);
  }

  estimatePerformanceScore() {
    const modernComponents = this.analysisResults.codeAnalysis.components
      .filter(comp => comp.quality?.usesModernSyntax);
    
    return Math.round((modernComponents.length / this.analysisResults.codeAnalysis.components.length) * 100);
  }

  estimateAccessibilityScore() {
    const a11yComponents = this.analysisResults.codeAnalysis.components
      .filter(comp => comp.quality?.hasAccessibility);
    
    return Math.round((a11yComponents.length / this.analysisResults.codeAnalysis.components.length) * 100);
  }

  // Cria roadmap de desenvolvimento
  createRoadmap() {
    console.log('🗺️ Criando roadmap de desenvolvimento...');
    
    const missing = this.analysisResults.functionalityMatrix.missing;
    const partial = this.analysisResults.functionalityMatrix.partial;
    const optional = this.analysisResults.functionalityMatrix.optional;
    
    this.analysisResults.roadmap = {
      phase1: {
        title: 'Correções Críticas (1-2 semanas)',
        items: [
          ...missing.filter(f => f.category === 'core' && f.weight >= 8),
          ...this.analysisResults.recommendations.critical
        ]
      },
      phase2: {
        title: 'Completar Base (2-4 semanas)',
        items: [
          ...partial,
          ...missing.filter(f => f.category === 'core' && f.weight < 8)
        ]
      },
      phase3: {
        title: 'Melhorias Importantes (1-2 meses)',
        items: [
          ...missing.filter(f => f.category === 'interaction'),
          ...optional.filter(f => f.priority === 'high')
        ]
      },
      phase4: {
        title: 'Recursos Avançados (2-3 meses)',
        items: [
          ...optional.filter(f => f.priority === 'medium'),
          ...missing.filter(f => f.category === 'advanced')
        ]
      },
      phase5: {
        title: 'Inovação e Diferenciação (ongoing)',
        items: [
          ...optional.filter(f => f.priority === 'low'),
          ...optional.filter(f => f.effort === 'very_high')
        ]
      }
    };
  }

  // Executa análise completa
  async runCompleteAnalysis() {
    console.log('🚀 Iniciando Análise Completa do IF Wave...\n');
    console.log('=' * 60);
    
    try {
      this.analyzeProjectInfo();
      this.analyzeComponents();
      this.buildFunctionalityMatrix();
      this.detectOptionalFeatures();
      this.generateRecommendations();
      this.calculateScores();
      this.createRoadmap();
      
      this.printSummary();
      return this.analysisResults;
      
    } catch (error) {
      console.error('❌ Erro durante a análise:', error);
      throw error;
    }
  }

  // Imprime resumo da análise
  printSummary() {
    console.log('\n' + '=' * 60);
    console.log('📊 RESUMO DA ANÁLISE');
    console.log('=' * 60);
    
    const scores = this.analysisResults.scores;
    console.log(`🎯 Completude de Funcionalidades: ${scores.completeness}%`);
    console.log(`📝 Qualidade do Código: ${scores.codeQuality}%`);
    console.log(`🏗️ Arquitetura: ${scores.architecture}%`);
    console.log(`🔒 Segurança: ${scores.security}%`);
    console.log(`⚡ Performance: ${scores.performance}%`);
    console.log(`♿ Acessibilidade: ${scores.accessibility}%`);
    
    const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
    console.log(`📈 Score Geral: ${avgScore.toFixed(1)}%`);
    
    console.log('\n📋 Status das Funcionalidades:');
    console.log(`✅ Implementadas: ${this.analysisResults.functionalityMatrix.implemented.length}`);
    console.log(`🔄 Parciais: ${this.analysisResults.functionalityMatrix.partial.length}`);
    console.log(`❌ Faltando: ${this.analysisResults.functionalityMatrix.missing.length}`);
    console.log(`🎯 Opcionais Sugeridas: ${this.analysisResults.functionalityMatrix.optional.length}`);
    
    console.log('\n📝 Componentes Analisados:');
    this.analysisResults.codeAnalysis.components.forEach(comp => {
      console.log(`  - ${comp.name} (${comp.features.length} funcionalidades detectadas)`);
    });
  }

  // Salva relatório JSON
  saveJSONReport(filename = 'analysis-report.json') {
    const reportPath = path.join(this.baseDir, filename);
    fs.writeFileSync(reportPath, JSON.stringify(this.analysisResults, null, 2));
    console.log(`\n💾 Relatório JSON salvo em: ${reportPath}`);
  }

  // Salva relatório Markdown
  saveMarkdownReport(filename = 'ANALISE_COMPLETA_IF_WAVE.md') {
    const reportPath = path.join(this.baseDir, filename);
    
    let md = `# 📊 Análise Completa - IF Wave Social Network\n\n`;
    md += `**Data da Análise:** ${new Date(this.analysisResults.timestamp).toLocaleString('pt-BR')}\n\n`;
    
    // Informações do projeto
    md += `## 📦 Informações do Projeto\n\n`;
    const info = this.analysisResults.projectInfo;
    md += `- **Nome:** ${info.name}\n`;
    md += `- **Versão:** ${info.version}\n`;
    md += `- **Framework:** ${info.framework}\n`;
    md += `- **Dependências:** ${info.dependencies?.length || 0}\n`;
    md += `- **Scripts:** ${Object.keys(info.scripts || {}).join(', ')}\n\n`;
    
    // Scores
    md += `## 📈 Scores de Qualidade\n\n`;
    const scores = this.analysisResults.scores;
    Object.entries(scores).forEach(([key, value]) => {
      const emoji = value >= 80 ? '🟢' : value >= 60 ? '🟡' : '🔴';
      const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
      md += `${emoji} **${label}:** ${value}%\n`;
    });
    
    const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
    md += `\n🎯 **Score Geral:** ${avgScore.toFixed(1)}%\n\n`;
    
    // Status das funcionalidades
    md += `## ✅ Status das Funcionalidades\n\n`;
    
    md += `### Implementadas (${this.analysisResults.functionalityMatrix.implemented.length})\n`;
    this.analysisResults.functionalityMatrix.implemented.forEach(feature => {
      md += `- ✅ **${feature.name}** (${feature.confidence}% confiança)\n`;
    });
    
    md += `\n### Parcialmente Implementadas (${this.analysisResults.functionalityMatrix.partial.length})\n`;
    this.analysisResults.functionalityMatrix.partial.forEach(feature => {
      md += `- 🔄 **${feature.name}** (${feature.confidence}% confiança)\n`;
    });
    
    md += `\n### Faltando (${this.analysisResults.functionalityMatrix.missing.length})\n`;
    this.analysisResults.functionalityMatrix.missing.forEach(feature => {
      const priorityIcon = feature.weight >= 8 ? '🔴' : feature.weight >= 6 ? '🟡' : '🟢';
      md += `- ${priorityIcon} **${feature.name}** (peso: ${feature.weight})\n`;
    });
    
    // Funcionalidades opcionais
    md += `\n## 🎯 Funcionalidades Opcionais Sugeridas\n\n`;
    this.analysisResults.functionalityMatrix.optional.forEach(feature => {
      const priorityIcon = feature.priority === 'critical' ? '🔴' : 
                          feature.priority === 'high' ? '🟡' : 
                          feature.priority === 'medium' ? '🔵' : '🟢';
      md += `### ${priorityIcon} ${feature.name}\n`;
      md += `**Categoria:** ${feature.category}\n`;
      md += `**Prioridade:** ${feature.priority}\n`;
      md += `**Esforço:** ${feature.effort}\n`;
      md += `**Descrição:** ${feature.description}\n`;
      md += `**Implementação:** ${feature.implementation}\n\n`;
    });
    
    // Roadmap
    md += `## 🗺️ Roadmap de Desenvolvimento\n\n`;
    Object.entries(this.analysisResults.roadmap).forEach(([, data]) => {
      md += `### ${data.title}\n`;
      data.items.forEach(item => {
        const name = item.name || item.title || 'Item';
        md += `- ${name}\n`;
      });
      md += `\n`;
    });
    
    // Recomendações
    md += `## 💡 Recomendações\n\n`;
    
    if (this.analysisResults.recommendations.critical.length > 0) {
      md += `### 🔴 Críticas\n`;
      this.analysisResults.recommendations.critical.forEach(rec => {
        md += `- **${rec.title}:** ${rec.description}\n`;
        md += `  - *Ação:* ${rec.action}\n`;
      });
      md += `\n`;
    }
    
    if (this.analysisResults.recommendations.important.length > 0) {
      md += `### 🟡 Importantes\n`;
      this.analysisResults.recommendations.important.forEach(rec => {
        md += `- **${rec.title}:** ${rec.description}\n`;
        md += `  - *Ação:* ${rec.action}\n`;
      });
      md += `\n`;
    }
    
    if (this.analysisResults.recommendations.nice_to_have.length > 0) {
      md += `### 🟢 Desejáveis\n`;
      this.analysisResults.recommendations.nice_to_have.forEach(rec => {
        md += `- **${rec.title}:** ${rec.description}\n`;
        md += `  - *Ação:* ${rec.action}\n`;
      });
      md += `\n`;
    }
    
    // Análise de componentes
    md += `## 🧩 Análise de Componentes\n\n`;
    this.analysisResults.codeAnalysis.components.forEach(comp => {
      md += `### ${comp.name}\n`;
      md += `**Arquivo:** \`${comp.path}\`\n`;
      md += `**Tamanho:** ${comp.size} caracteres\n`;
      md += `**Complexidade:** ${comp.complexity.score.toFixed(1)}/100\n`;
      md += `**Qualidade:** ${comp.quality?.score || 0}%\n`;
      md += `**Funcionalidades:** ${comp.features.length}\n`;
      if (comp.features.length > 0) {
        comp.features.forEach(feature => {
          md += `  - ${feature.name} (${feature.confidence}%)\n`;
        });
      }
      md += `\n`;
    });
    
    fs.writeFileSync(reportPath, md);
    console.log(`📄 Relatório Markdown salvo em: ${reportPath}`);
  }
}

// Função principal
async function main() {
  const analyzer = new AdvancedSocialNetworkAnalyzer();
  
  try {
    const results = await analyzer.runCompleteAnalysis();
    
    // Salva relatórios
    analyzer.saveJSONReport('advanced-analysis-report.json');
    analyzer.saveMarkdownReport('ANALISE_COMPLETA_IF_WAVE.md');
    
    console.log('\n✨ Análise completa finalizada!');
    console.log('📁 Verifique os arquivos de relatório gerados.');
    
    return results;
    
  } catch (error) {
    console.error('❌ Erro durante a análise:', error);
    process.exit(1);
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = AdvancedSocialNetworkAnalyzer;
