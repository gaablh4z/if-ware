const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  
  // Configuração para GitHub Pages
  publicPath: process.env.NODE_ENV === 'production'
    ? '/if-wave/' // substitua 'if-wave' pelo nome do seu repositório
    : '/',
    
  // Configurações de build
  outputDir: 'dist',
  assetsDir: 'static',
  
  // Configurações de desenvolvimento
  devServer: {
    port: 8080,
    host: '0.0.0.0',
    allowedHosts: 'all',
    open: true
  }
})
