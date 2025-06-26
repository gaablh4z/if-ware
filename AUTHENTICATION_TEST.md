# Sistema de Autenticação - IF Wave

## 🔐 Funcionalidades Implementadas

### ✅ Cadastro de Usuário (RegisterForm.vue)
- **Validação de e-mail institucional**: Aceita apenas e-mails dos domínios:
  - `@estudante.ifmt.edu.br`
  - `@professor.ifmt.edu.br` 
  - `@ifmt.edu.br`
- **Verificação de usuário duplicado**: Impede cadastro com e-mail já existente
- **Validação de campos obrigatórios**: Nome, e-mail, curso, campus, senha
- **Confirmação de senha**: Verifica se as senhas coincidem
- **Hash de senha**: Aplica algoritmo de hash antes de salvar
- **Feedback visual**: Mensagens de erro e sucesso, loading states
- **Persistência**: Salva dados no localStorage

### ✅ Login de Usuário (LoginForm.vue)
- **Validação de e-mail institucional**: Mesma regra do cadastro
- **Verificação de usuário existente**: Checa se o e-mail está cadastrado
- **Autenticação por senha**: Compara hash da senha inserida com hash salvo
- **Sessão de usuário**: Salva dados da sessão no localStorage
- **Feedback visual**: Mensagens de erro/sucesso, loading states
- **Validação em tempo real**: Valida campos ao perder foco

## 🧪 Como Testar

### 1. Testando o Cadastro
1. Acesse a aplicação em `http://localhost:8082/`
2. Clique em "Não tem conta? Cadastre-se"
3. **Teste de validação de e-mail**:
   - Tente usar um e-mail comum (ex: `usuario@gmail.com`) 
   - ❌ Deve exibir erro: "Use apenas e-mail institucional do IFMT"
   - ✅ Use um e-mail válido: `joao.silva@estudante.ifmt.edu.br`
4. **Teste de validação de campos**:
   - Deixe campos vazios e observe os erros
   - Digite senha com menos de 6 caracteres
   - Digite senhas diferentes na confirmação
5. **Teste de cadastro bem-sucedido**:
   - Preencha todos os campos corretamente
   - Observe o loading durante o processamento
   - Veja a mensagem de sucesso

### 2. Testando o Login
1. Após cadastrar um usuário, volte para a tela de login
2. **Teste de usuário inexistente**:
   - Tente fazer login com e-mail não cadastrado
   - ❌ Deve exibir: "E-mail não encontrado. Verifique ou crie uma conta."
3. **Teste de senha incorreta**:
   - Use e-mail cadastrado com senha errada
   - ❌ Deve exibir: "Senha incorreta. Tente novamente."
4. **Teste de login bem-sucedido**:
   - Use e-mail e senha corretos
   - ✅ Deve exibir: "Bem-vindo(a), [Nome]!"
   - Deve redirecionar para o feed

### 3. Verificando Persistência
1. Abra as DevTools do navegador (F12)
2. Vá em Application > Local Storage > http://localhost:8082
3. Veja as chaves:
   - `ifwave_users`: Array com todos os usuários cadastrados
   - `ifwave_current_user`: Dados do usuário logado

## 🔒 Segurança Implementada

### Hash de Senha
```javascript
hashPassword(password) {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}
```

### Validação de E-mail Institucional
```javascript
isInstitutionalEmail(email) {
  const institutionalDomains = [
    '@estudante.ifmt.edu.br',
    '@professor.ifmt.edu.br',
    '@ifmt.edu.br'
  ]
  return institutionalDomains.some(domain => email.endsWith(domain))
}
```

## 📝 Exemplos de Dados de Teste

### Usuários para Teste
```javascript
// Estudante
{
  name: "João Silva",
  email: "joao.silva@estudante.ifmt.edu.br",
  course: "Técnico em Informática",
  campus: "Cuiabá - Octayde Jorge da Silva",
  password: "123456"
}

// Professor  
{
  name: "Maria Santos",
  email: "maria.santos@professor.ifmt.edu.br", 
  course: "Docente",
  campus: "Cuiabá - Octayde Jorge da Silva",
  password: "senha123"
}
```

## 🚀 Próximos Passos (Melhorias Futuras)

1. **Logout**: Implementar funcionalidade de sair da conta
2. **Proteção de Rotas**: Impedir acesso ao feed sem autenticação
3. **Recuperação de Senha**: Sistema de reset de senha
4. **Validação de Servidor**: Integrar com backend real
5. **2FA**: Autenticação de dois fatores
6. **Hash Mais Seguro**: Usar bcrypt ou similar em produção

---

✅ **Status**: Sistema de autenticação completamente funcional com validações reais!
