# 🚀 PRÓXIMOS PASSOS - Deploy do IF Wave

## ✅ **O QUE JÁ FOI FEITO**

1. ✅ Projeto preparado para Git
2. ✅ Arquivos de configuração criados (.gitignore, README.md, LICENSE)
3. ✅ Primeiro commit realizado
4. ✅ gh-pages instalado
5. ✅ Configurações de deploy prontas

## 📋 **AGORA VOCÊ PRECISA FAZER**

### **PASSO 1: Criar repositório no GitHub**
1. Acesse: https://github.com
2. Clique em **"New repository"** (botão verde)
3. Nome do repositório: `if-wave`
4. Descrição: `🌊 Rede Social Acadêmica do IFMT com Painel Admin`
5. Deixe **Public** marcado
6. **NÃO marque** "Initialize with README" (já temos)
7. Clique **"Create repository"**

### **PASSO 2: Conectar projeto ao GitHub**
Copie e cole estes comandos no seu terminal (PowerShell):

```bash
# Substitua SEU_USUARIO pelo seu nome de usuário do GitHub
cd "C:\Users\Suporte\Desktop\app"
git remote add origin https://github.com/SEU_USUARIO/if-wave.git
git branch -M main
git push -u origin main
```

### **PASSO 3: Deploy no GitHub Pages**
```bash
cd "C:\Users\Suporte\Desktop\app"
npm run deploy
```

### **PASSO 4: Ativar GitHub Pages**
1. Vá para: `https://github.com/SEU_USUARIO/if-wave`
2. Clique em **Settings** (aba)
3. Role até encontrar **Pages** (lado esquerdo)
4. Em **Source**, selecione: **Deploy from a branch**
5. Em **Branch**, selecione: **gh-pages**
6. Clique **Save**

## 🎉 **RESULTADO**

Após seguir os passos, seu site estará online em:
**`https://SEU_USUARIO.github.io/if-wave`**

### **URLs que funcionarão:**
- 🌐 **Site principal:** `https://SEU_USUARIO.github.io/if-wave`
- 🛡️ **Painel admin:** `https://SEU_USUARIO.github.io/if-wave/admin.html`

## 🔧 **ALTERNATIVAS MAIS FÁCEIS**

### **VERCEL (Recomendado - Mais Profissional)**
1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique **"New Project"**
4. Selecione seu repositório `if-wave`
5. Clique **"Deploy"**
6. ✅ Pronto! URL automática gerada

### **NETLIFY**
1. Acesse: https://netlify.com
2. Arraste a pasta `C:\Users\Suporte\Desktop\app` para o site
3. ✅ Pronto! URL automática gerada

## 🆘 **PRECISA DE AJUDA?**

Se algo der errado:

1. **Erro no git push?**
   - Verifique se substituiu `SEU_USUARIO` pelo seu username real
   - Verifique se o repositório foi criado no GitHub

2. **Site não carrega?**
   - Aguarde alguns minutos após o deploy
   - Verifique se o GitHub Pages foi ativado

3. **Admin não funciona?**
   - Acesse: `sua-url.com/admin.html`
   - Use: usuário `admin`, senha `admin123`

## 📞 **CONTATO**

- GitHub: Veja a documentação em cada repositório
- Issues: Use o sistema de Issues do GitHub

---

**🎯 RESUMO: Crie repositório → Conecte → Deploy → Ative Pages = Site Online!**
