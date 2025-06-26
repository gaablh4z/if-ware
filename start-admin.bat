@echo off
title IF Wave - Admin Panel

echo 🌊 IF Wave - Inicializando com Painel Admin...
echo.

REM Verificar se estamos no diretório correto
if not exist "package.json" (
    echo ❌ Erro: Execute este script na pasta raiz do projeto
    pause
    exit /b 1
)

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado. Instale Node.js primeiro.
    echo 📥 Download: https://nodejs.org/
    pause
    exit /b 1
)

REM Instalar dependências se necessário
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    npm install
)

echo 🚀 Iniciando servidor de desenvolvimento...
echo.
echo 📍 URLs disponíveis:
echo    🌊 Aplicação Principal: http://localhost:8080/
echo    🛡️ Painel Admin: http://localhost:8080/admin.html
echo    👤 Criar Admin: http://localhost:8080/create-admin.html
echo    🧪 Debug Gabriel: http://localhost:8080/gabriel-test.html
echo.
echo 🔐 Credenciais padrão do admin:
echo    Usuário: admin
echo    Senha: admin123
echo.
echo 💡 Dica: Use create-admin.html para criar o usuário administrador
echo.
echo ⏳ Aguarde o servidor inicializar...
echo.

REM Abrir navegador automaticamente após 3 segundos
timeout /t 3 /nobreak >nul
start http://localhost:8080/create-admin.html

REM Iniciar servidor
npm run serve
