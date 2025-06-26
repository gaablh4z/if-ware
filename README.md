# 🌊 IF Wave - Rede Social Acadêmica

Uma rede social moderna desenvolvida especialmente para estudantes e professores do Instituto Federal de Mato Grosso (IFMT).

![IF Wave](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

## 🎯 **Características Principais**

### 📱 **Para Usuários**
- ✅ **Feed Interativo** - Posts, curtidas, comentários
- ✅ **Mensagens Privadas** - Chat em tempo real
- ✅ **Perfis Personalizados** - Bio, curso, campus
- ✅ **Notificações** - Atualizações em tempo real
- ✅ **Busca** - Encontre pessoas e conteúdos
- ✅ **Temas** - Modo claro/escuro

### 🛡️ **Painel Administrativo**
- ✅ **Dashboard Completo** - Estatísticas e gráficos
- ✅ **CRUD de Usuários** - Gerenciar estudantes, professores, admins
- ✅ **Moderação de Conteúdo** - Posts, comentários, relatórios
- ✅ **Analytics** - Usuários ativos, posts populares
- ✅ **Ferramentas** - Backup, export, import de dados
- ✅ **Interface Django-like** - Familiar e profissional

## 🚀 **Acesso Rápido**

### 🌐 **Demo Online**
👉 **[Acessar IF Wave](SEU_LINK_AQUI)** 

### 🛡️ **Painel Admin**
👉 **[Admin Panel](SEU_LINK_AQUI/admin.html)**
- **Usuário:** `admin`
- **Senha:** `admin123`

## 🛠️ **Tecnologias Utilizadas**

- **Frontend:** Vue.js 3, JavaScript ES6+, CSS3
- **Armazenamento:** LocalStorage (pode ser migrado para backend)
- **Icons:** Sistema próprio de ícones
- **Build:** Vue CLI, Webpack
- **Deploy:** Vercel/Netlify (recomendado)

## 📦 **Instalação Local**

### **Pré-requisitos**
- Node.js 16+ 
- npm ou yarn

### **Passos**
```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/if-wave.git
cd if-wave

# 2. Instale as dependências
npm install

# 3. Execute em modo desenvolvimento
npm run serve

# 4. Acesse no navegador
# http://localhost:8080
```

### **Build para Produção**
```bash
# Gerar build otimizado
npm run build

# Arquivos serão gerados na pasta /dist
```

## 👥 **Usuários de Exemplo**

O sistema cria automaticamente usuários de exemplo:

### **Admin**
- **Email:** admin@ifmt.edu.br
- **Username:** admin
- **Senha:** admin123
- **Acesso:** Painel administrativo completo

### **Estudantes/Professores**
- Usuários criados automaticamente na primeira execução
- Senhas padrão: `senha123`

## 🎨 **Interface**

### **Design System**
- **Cores IFMT:** Azul (#003D7C), Verde (#2ECC71), Amarelo (#F1C40F), Roxo (#8E44AD)
- **Tipografia:** Segoe UI, system fonts
- **Responsivo:** Mobile-first design
- **Acessibilidade:** Contraste adequado, navegação por teclado

### **Componentes**
- Sistema modular de componentes Vue
- Reutilização máxima de código
- Props tipadas e validadas

## 📊 **Estrutura do Projeto**

```
src/
├── admin/                 # Painel administrativo
│   ├── components/       # Componentes admin
│   ├── services/        # Serviços (auth, data)
│   ├── models/          # Definições de modelos
│   └── utils/           # Utilitários
├── components/           # Componentes principais
├── assets/              # Imagens, fonts
└── main.js              # Entry point

public/
├── admin.html           # Admin standalone
├── create-admin.html    # Utilitário admin
└── index.html           # App principal
```

## 🔒 **Segurança**

- ✅ Validação de dados no frontend
- ✅ Sanitização de inputs
- ✅ Controle de sessão
- ✅ Permissões por role (student/teacher/admin)
- ⚠️ **Nota:** Em produção, implemente backend com autenticação JWT

## 🌐 **Deploy**

### **Vercel (Recomendado)**
1. Fork este repositório
2. Conecte sua conta Vercel ao GitHub
3. Importe o projeto
4. Deploy automático!

### **Netlify**
1. Build: `npm run build`
2. Pasta de publicação: `dist`
3. Deploy da pasta /dist

### **GitHub Pages**
```bash
# Instalar gh-pages
npm install --save-dev gh-pages

# Adicionar ao package.json
"homepage": "https://SEU_USUARIO.github.io/if-wave",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# Deploy
npm run deploy
```

## 📱 **Mobile**

- ✅ PWA Ready (Progressive Web App)
- ✅ Responsivo em todos os dispositivos
- ✅ Touch-friendly
- ✅ Otimizado para mobile

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 **Autor**

**Seu Nome**
- GitHub: [@SEU_USUARIO](https://github.com/SEU_USUARIO)
- Email: seu.email@exemplo.com

## 🎓 **IFMT**

Desenvolvido com ❤️ para a comunidade do Instituto Federal de Mato Grosso.

---

⭐ **Se este projeto te ajudou, deixe uma estrela!**
