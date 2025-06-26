#!/bin/bash

# Script para inicializar o IF Wave com painel admin

echo "🌊 IF Wave - Inicializando com Painel Admin..."
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na pasta raiz do projeto"
    exit 1
fi

# Verificar se o Vue CLI está instalado
if ! command -v vue &> /dev/null; then
    echo "📦 Instalando Vue CLI..."
    npm install -g @vue/cli
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

echo "🚀 Iniciando servidor de desenvolvimento..."
echo ""
echo "📍 URLs disponíveis:"
echo "   🌊 Aplicação Principal: http://localhost:8080/"
echo "   🛡️ Painel Admin: http://localhost:8080/admin.html"
echo "   👤 Criar Admin: http://localhost:8080/create-admin.html"
echo "   🧪 Debug Gabriel: http://localhost:8080/gabriel-test.html"
echo ""
echo "🔐 Credenciais padrão do admin:"
echo "   Usuário: admin"
echo "   Senha: admin123"
echo ""
echo "💡 Dica: Use create-admin.html para criar o usuário administrador"
echo ""

# Iniciar servidor
npm run serve
