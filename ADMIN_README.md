# 🛡️ IF Wave Admin Panel

Painel administrativo completo para gerenciamento da rede social IF Wave, similar ao Django Admin.

## 📋 Funcionalidades

### ✅ **Modelos Disponíveis**
- **👥 Usuários** - Gerenciar contas de estudantes, professores e administradores
- **📝 Posts** - Moderar publicações, curtidas e compartilhamentos
- **💬 Comentários** - Gerenciar comentários e respostas
- **📩 Mensagens** - Supervisionar mensagens privadas entre usuários
- **❤️ Curtidas** - Visualizar histórico de curtidas
- **👥 Seguidores** - Gerenciar relacionamentos entre usuários
- **🔔 Notificações** - Controlar notificações do sistema
- **🚨 Denúncias** - Processar relatórios de abuso e violações

### ✅ **Recursos Implementados**

#### 🔐 **Autenticação**
- Login seguro com credenciais fixas
- Sessão de 24 horas com renovação automática
- Sistema de permissões granular

#### 📊 **Dashboard**
- Estatísticas em tempo real de todos os modelos
- Gráficos de atividade por período
- Posts populares com métricas
- Usuários ativos no sistema
- Relatórios pendentes com priorização
- Status do sistema e armazenamento
- Ações rápidas para tarefas comuns

#### 📋 **Gerenciamento de Modelos**
- **Listagem inteligente**: Tabela e visualização em cards
- **Busca avançada**: Por campos específicos de cada modelo
- **Filtros dinâmicos**: Baseados na configuração do modelo
- **Ordenação**: Por qualquer campo, crescente/decrescente
- **Paginação**: Configurável (padrão: 20 itens/página)
- **Seleção múltipla**: Para ações em lote
- **CRUD completo**: Criar, ler, atualizar e deletar

#### 📝 **Formulários Dinâmicos**
- Geração automática baseada na definição do modelo
- Suporte a todos os tipos de campo:
  - Texto, email, telefone, URL, número
  - Textarea para textos longos
  - Select com opções predefinidas
  - Checkbox para booleanos
  - Date e datetime para datas
  - Password com hash automático
  - Foreign keys com lookup automático
  - JSON com validação de sintaxe
- Validação em tempo real
- Campos obrigatórios e opcionais
- Valores padrão automáticos

#### 🛠️ **Ferramentas Administrativas**
- **Backup e Restauração**: Export/import completo dos dados
- **Exportação**: JSON, CSV e Excel (planejado)
- **Importação**: De arquivos JSON e CSV
- **Limpeza de Dados**: Remoção de dados órfãos, antigos ou corrompidos
- **Estatísticas**: Uso de armazenamento e métricas do sistema
- **Gerador de Dados**: Criação de dados de teste para desenvolvimento
- **Validação**: Verificação de integridade dos dados
- **Debug**: Inspeção do localStorage e logs do sistema

## 🚀 **Como Usar**

### 1. **Acesso ao Admin**

#### **Opção 1: Via aplicação principal**
1. Faça login como administrador na aplicação principal
2. Clique no botão "🛡️ Admin" no cabeçalho
3. O painel será aberto em nova aba

#### **Opção 2: Acesso direto**
1. Navegue para `admin.html` no seu servidor
2. Ou abra o arquivo diretamente no navegador

### 2. **Credenciais de Acesso**
```
Usuário: admin
Senha: admin123
```

### 3. **Navegação**

#### **Dashboard**
- Visão geral do sistema
- Estatísticas em tempo real
- Ações rápidas

#### **Modelos**
- Clique em qualquer modelo na barra lateral
- Use busca e filtros para encontrar registros
- Alterne entre visualização em tabela e cards
- Selecione múltiplos itens para ações em lote

#### **Formulários**
- Clique em "Adicionar" para criar novos registros
- Clique no ícone de edição para modificar existentes
- Todos os campos são validados automaticamente
- Campos obrigatórios são marcados com *

#### **Ferramentas**
- Acesse via menu lateral
- Cada ferramenta tem instruções específicas
- Sempre faça backup antes de operações destrutivas

## ⚙️ **Configuração dos Modelos**

Os modelos são definidos em `src/admin/models/index.js` com a seguinte estrutura:

```javascript
export const models = {
  users: {
    name: 'Usuários',
    icon: 'profile',
    fields: {
      name: { 
        type: 'text', 
        label: 'Nome Completo', 
        required: true 
      },
      email: { 
        type: 'email', 
        label: 'E-mail', 
        required: true, 
        unique: true 
      },
      role: { 
        type: 'select', 
        label: 'Perfil', 
        options: ['student', 'teacher', 'admin'], 
        default: 'student' 
      },
      isActive: { 
        type: 'boolean', 
        label: 'Ativo', 
        default: true 
      }
    },
    listDisplay: ['name', 'email', 'role', 'isActive'],
    listFilter: ['role', 'isActive'],
    searchFields: ['name', 'email'],
    ordering: ['-createdAt']
  }
}
```

### **Tipos de Campo Suportados**
- `text`, `email`, `tel`, `url`, `number`
- `password` (com hash automático)
- `textarea` (textos longos)
- `select` (lista de opções)
- `boolean` (checkbox)
- `date`, `datetime`
- `foreignkey` (referência a outro modelo)
- `json` (dados estruturados)

### **Propriedades dos Campos**
- `type`: Tipo do campo (obrigatório)
- `label`: Rótulo exibido (obrigatório)
- `required`: Campo obrigatório
- `readonly`: Somente leitura
- `primary`: Chave primária
- `unique`: Valor único
- `default`: Valor padrão
- `options`: Opções para select
- `model`: Modelo referenciado (foreignkey)

### **Configurações do Modelo**
- `name`: Nome exibido
- `icon`: Ícone do modelo
- `listDisplay`: Campos exibidos na listagem
- `listFilter`: Campos disponíveis para filtro
- `searchFields`: Campos pesquisáveis
- `ordering`: Ordenação padrão

## 🔧 **Arquitetura**

### **Estrutura de Pastas**
```
src/admin/
├── components/
│   ├── AdminPanel.vue      # Componente principal
│   ├── AdminDashboard.vue  # Dashboard com estatísticas
│   ├── AdminModelView.vue  # Listagem e edição de modelos
│   └── AdminTools.vue      # Ferramentas administrativas
├── models/
│   └── index.js           # Definição dos modelos
└── services/
    ├── authService.js     # Autenticação admin
    └── dataService.js     # Manipulação de dados
```

### **Serviços**

#### **AuthService**
- Gerencia autenticação e sessões
- Sistema de permissões
- Renovação automática de sessão

#### **DataService**
- CRUD genérico para todos os modelos
- Validação baseada na definição do modelo
- Busca, filtros e ordenação
- Paginação automática
- Import/export de dados

## 🎨 **Interface**

### **Design System**
- Paleta de cores do IF Wave
- Componentes responsivos
- Ícones consistentes
- Feedback visual para ações

### **Responsividade**
- Layout adaptativo para desktop e mobile
- Navegação otimizada para telas pequenas
- Formulários mobile-friendly

## 🔒 **Segurança**

### **Implementado**
- Autenticação com sessão
- Validação de dados
- Sanitização de entrada
- Controle de permissões

### **Recomendações para Produção**
- Implementar hash e salt para senhas
- Usar HTTPS obrigatório
- Implementar rate limiting
- Adicionar logs de auditoria
- Configurar CSP (Content Security Policy)

## 📈 **Performance**

### **Otimizações**
- Lazy loading de componentes
- Paginação para grandes datasets
- Debounce em buscas
- Cache de dados freqüentes

## 🧪 **Desenvolvimento**

### **Adicionando Novos Modelos**
1. Defina o modelo em `models/index.js`
2. Configure campos, filtros e exibição
3. O admin detecta automaticamente

### **Customizando Campos**
1. Adicione novos tipos em `AdminModelView.vue`
2. Implemente validação específica
3. Atualize formatação de exibição

### **Adicionando Ferramentas**
1. Implemente em `AdminTools.vue`
2. Adicione à interface
3. Teste com dados reais

## 🐛 **Troubleshooting**

### **Problemas Comuns**

#### **Admin não carrega**
- Verifique se todos os arquivos Vue estão presentes
- Confirme que o navegador suporta modules ES6
- Verifique o console para erros de import

#### **Dados não aparecem**
- Confirme que há dados no localStorage
- Verifique a definição do modelo
- Use as ferramentas de debug no painel

#### **Formulário não salva**
- Verifique campos obrigatórios
- Confirme validação JSON
- Verifique permissões de escrita

### **Dados de Teste**
Use o gerador de dados de teste para popular o sistema:
1. Acesse "Ferramentas"
2. Configure quantidades desejadas
3. Clique em "Gerar Dados de Teste"

## 📊 **Métricas e Monitoramento**

### **Dashboard Metrics**
- Total de usuários ativos
- Posts por período
- Engajamento (curtidas, comentários)
- Relatórios pendentes
- Uso de armazenamento

### **Relatórios Disponíveis**
- Atividade de usuários
- Conteúdo popular
- Moderação necessária
- Performance do sistema

## 🔄 **Backup e Manutenção**

### **Backup Automático**
Recomenda-se fazer backup regular:
1. Use a ferramenta de backup integrada
2. Agende exports periódicos
3. Mantenha versões históricas

### **Limpeza de Dados**
Execute limpeza periódica:
- Notificações antigas (>30 dias)
- Dados órfãos
- Posts vazios
- Usuários inativos

## 🚀 **Roadmap**

### **Próximas Funcionalidades**
- [ ] Logs de auditoria
- [ ] Relatórios avançados
- [ ] API REST para integração
- [ ] Webhooks para eventos
- [ ] Autenticação OAuth
- [ ] Múltiplos idiomas
- [ ] Temas customizáveis
- [ ] Permissões granulares

---

**Desenvolvido para IF Wave** 🌊  
*Sistema de gerenciamento educacional do IFMT*
