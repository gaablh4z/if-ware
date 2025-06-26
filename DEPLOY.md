# 🚀 Guia Completo de Deploy - IF Wave

## 📋 **Pré-requisitos**

Antes de começar, certifique-se de ter:
- ✅ Conta no GitHub
- ✅ Git instalado no seu computador
- ✅ Node.js instalado
- ✅ Projeto funcionando localmente

## 🌐 **Opções de Deploy (3 Métodos)**

### 1️⃣ **GitHub Pages (Gratuito e Simples)**
### 2️⃣ **Vercel (Recomendado - Profissional)**
### 3️⃣ **Netlify (Alternativa Excelente)**

---

## 📚 **PASSO 1: Subir para o GitHub**

### **1.1 Inicializar Git no projeto**
```bash
# Abra o terminal na pasta do projeto
cd "C:\Users\Suporte\Desktop\app"

# Inicializar git
git init

# Adicionar todos os arquivos
git add .

# Fazer o primeiro commit
git commit -m "🎉 Initial commit - IF Wave completo com painel admin"
```

### **1.2 Criar repositório no GitHub**
1. Acesse: https://github.com
2. Clique em **"New repository"**
3. Nome: `if-wave` (ou o que preferir)
4. Descrição: `🌊 Rede Social Acadêmica do IFMT com Painel Admin`
5. Deixe **Public** (para GitHub Pages gratuito)
6. **NÃO** marque "Initialize with README" (já temos)
7. Clique **"Create repository"**

### **1.3 Conectar projeto local ao GitHub**
```bash
# Adicionar origem remota (substitua SEU_USUARIO pelo seu username)
git remote add origin https://github.com/SEU_USUARIO/if-wave.git

# Renomear branch principal
git branch -M main

# Enviar código para o GitHub
git push -u origin main
```

---

## 🎯 **PASSO 2A: Deploy no GitHub Pages**

### **2A.1 Instalar dependência**
```bash
npm install --save-dev gh-pages
```

### **2A.2 Configurar package.json**
Já foi configurado! Verifique se tem:
```json
{
  "homepage": "https://SEU_USUARIO.github.io/if-wave",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

### **2A.3 Ajustar vue.config.js**
Já configurado! Apenas mude o nome do repositório se necessário:
```javascript
publicPath: process.env.NODE_ENV === 'production'
  ? '/if-wave/' // nome do seu repositório
  : '/',
```

### **2A.4 Deploy**
```bash
# Fazer deploy
npm run deploy
```

### **2A.5 Ativar GitHub Pages**
1. Vá para: `https://github.com/SEU_USUARIO/if-wave`
2. Clique em **Settings**
3. Role até **Pages**
4. Source: **Deploy from a branch**
5. Branch: **gh-pages**
6. Save

**🎉 Pronto! Seu site estará em: `https://SEU_USUARIO.github.io/if-wave`**

---

## 🚀 **PASSO 2B: Deploy no Vercel (RECOMENDADO)**

### **2B.1 Criar conta**
1. Acesse: https://vercel.com
2. Faça login com sua conta GitHub

### **2B.2 Importar projeto**
1. Clique **"New Project"**
2. Selecione seu repositório `if-wave`
3. **Framework Preset:** Vue.js
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. Clique **"Deploy"**

**🎉 Pronto! Vercel gera uma URL automaticamente tipo: `https://if-wave-seu-usuario.vercel.app`**

### **2B.3 Configurar domínio personalizado (opcional)**
1. Compre um domínio (ex: `ifwave.com.br`)
2. No painel Vercel, vá em **Settings > Domains**
3. Adicione seu domínio
4. Configure DNS conforme instruções

---

## 🌈 **PASSO 2C: Deploy no Netlify**

### **2C.1 Criar conta**
1. Acesse: https://netlify.com
2. Faça login com GitHub

### **2C.2 Deploy via Git**
1. **"New site from Git"**
2. Escolha **GitHub**
3. Selecione repositório `if-wave`
4. **Build command:** `npm run build`
5. **Publish directory:** `dist`
6. **"Deploy site"**

**🎉 Pronto! Netlify gera URL tipo: `https://amazing-name-123456.netlify.app`**

---

## 🔧 **PASSO 3: Configurações Finais**

### **3.1 Ajustar URLs no README.md**
Substitua no README.md principal:
```markdown
### 🌐 **Demo Online**
👉 **[Acessar IF Wave](SUA_URL_AQUI)** 

### 🛡️ **Painel Admin**
👉 **[Admin Panel](SUA_URL_AQUI/admin.html)**
```

### **3.2 Commit e push das mudanças**
```bash
git add .
git commit -m "📝 Atualizar URLs no README"
git push origin main
```

### **3.3 Redeploy automático**
- **Vercel/Netlify:** Deploy automático a cada push
- **GitHub Pages:** Execute `npm run deploy` novamente

---

## 📱 **PASSO 4: Otimizações Extras**

### **4.1 PWA (Progressive Web App)**
```bash
# Instalar plugin PWA
vue add pwa
```

### **4.2 Analytics (opcional)**
- Google Analytics
- Vercel Analytics
- Netlify Analytics

### **4.3 SEO**
Adicione no `public/index.html`:
```html
<meta name="description" content="Rede Social Acadêmica do IFMT">
<meta name="keywords" content="IFMT, rede social, estudantes, professores">
<meta property="og:title" content="IF Wave - Rede Social Acadêmica">
<meta property="og:description" content="Conecte-se com a comunidade do IFMT">
```

---

## 🎉 **RESULTADO FINAL**

Depois de seguir os passos, você terá:

### **✅ GitHub Repository**
- `https://github.com/SEU_USUARIO/if-wave`
- Código versionado e público
- Colaboração facilitada

### **✅ Site Online**
- **GitHub Pages:** `https://SEU_USUARIO.github.io/if-wave`
- **Vercel:** `https://if-wave-xxx.vercel.app`
- **Netlify:** `https://amazing-name.netlify.app`

### **✅ Funcionalidades**
- ✅ Aplicação principal funcionando
- ✅ Painel admin acessível via `/admin.html`
- ✅ Responsivo em todos os dispositivos
- ✅ Deploy automático a cada mudança

---

## 🚨 **Problemas Comuns e Soluções**

### **Erro 404 ao acessar /admin.html**
```javascript
// No vue.config.js, adicione:
module.exports = {
  // ...outras configurações
  devServer: {
    historyApiFallback: {
      rewrites: [
        { from: /^\/admin.html$/, to: '/admin.html' }
      ]
    }
  }
}
```

### **Paths incorretos em produção**
Verifique o `publicPath` no `vue.config.js`

### **Build falha**
```bash
# Limpar node_modules e reinstalar
rm -rf node_modules
npm install
npm run build
```

---

## 🎯 **Comandos Resumidos**

### **Deploy Inicial**
```bash
# 1. Preparar Git
git init
git add .
git commit -m "🎉 Initial commit"

# 2. Conectar ao GitHub
git remote add origin https://github.com/SEU_USUARIO/if-wave.git
git push -u origin main

# 3. Deploy (escolha um método)
npm run deploy  # GitHub Pages
# OU use Vercel/Netlify via interface
```

### **Atualizações Futuras**
```bash
# Fazer mudanças no código
git add .
git commit -m "✨ Nova funcionalidade"
git push origin main

# Se usando GitHub Pages
npm run deploy
```

---

**🎉 PARABÉNS! Seu IF Wave agora está online e acessível de qualquer lugar do mundo!**

### **Links Importantes:**
- 📖 **Repositório:** `https://github.com/SEU_USUARIO/if-wave`
- 🌐 **Site:** `SUA_URL_AQUI`
- 🛡️ **Admin:** `SUA_URL_AQUI/admin.html`
- 📚 **Documentação:** README.md no repositório
