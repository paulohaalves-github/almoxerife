# 🏢 Almoxerife - Sistema de Gestão de Almoxarifado

Sistema completo de gestão de almoxarifado desenvolvido com Next.js, React e MySQL. Permite controle total de estoque, registro de entradas e saídas, gestão de usuários e muito mais.

## 📋 Sobre o Projeto

O **Almoxerife** é uma aplicação web moderna para gerenciamento de almoxarifado que oferece:

- ✅ Controle completo de estoque de produtos
- ✅ Registro de entradas (recebimentos) e saídas
- ✅ Gestão de usuários com controle de permissões
- ✅ Sistema de autenticação e autorização
- ✅ Localização de produtos (Prateleira e Alocação)
- ✅ Exportação de dados para Excel
- ✅ Filtros avançados e buscas
- ✅ Interface moderna e responsiva com suporte a dark mode

## 🚀 Tecnologias Utilizadas

- **Next.js 16** - Framework React para produção
- **React 19** - Biblioteca JavaScript para interfaces
- **MySQL** - Banco de dados relacional
- **Tailwind CSS** - Framework CSS utilitário
- **bcryptjs** - Criptografia de senhas
- **xlsx** - Exportação para Excel

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- Node.js 18+ 
- MySQL 8.0+
- npm ou yarn

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd almoxerife
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=almoxerife
```

### 4. Configure o banco de dados

Execute o script de inicialização:

```bash
npm run init-db
```

Este script irá:
- Criar o banco de dados `almoxerife`
- Criar todas as tabelas necessárias
- Configurar índices e relacionamentos

### 5. Execute as migrações adicionais

```bash
# Adicionar sistema de usuários
npm run add-usuarios

# Adicionar campos de localização
npm run add-localizacao
```

### 6. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 👤 Credenciais Padrão

Após executar `npm run add-usuarios`, um usuário administrador padrão é criado:

- **Usuário:** `admin`
- **Senha:** `admin123`

⚠️ **IMPORTANTE:** Altere a senha após o primeiro login!

## 📚 Funcionalidades Principais

### 🔐 Sistema de Autenticação

- Login e logout seguro
- Controle de sessão via cookies
- Dois perfis de usuário:
  - **Administrador:** Acesso completo ao sistema
  - **Estoque:** Acesso apenas às páginas de estoque

### 📦 Gestão de Produtos

- Cadastro de produtos com informações completas:
  - Nome, descrição, categoria, fabricante
  - Prateleira e alocação (localização física)
  - Controle de estoque automático
- Edição e exclusão de produtos
- Busca e filtros avançados:
  - Por nome, descrição, categoria ou fabricante
  - Por prateleira e alocação
- Exportação para Excel
- Indicadores visuais de estoque (baixo, médio, alto)

### 📥 Recebimentos (Entradas)

- Registro de recebimentos de produtos
- Cálculo automático de valores (unitário e total)
- Upload de nota fiscal em PDF
- Atualização automática do estoque

### 📤 Saídas

- Registro de saídas de produtos
- Validação de estoque disponível
- Gestão de destinatários (com setor)
- Filtros por data, destinatário e setor
- Exportação para Excel com dados filtrados
- Atualização automática do estoque

### 👥 Gestão de Usuários (Apenas Administradores)

- Criação, edição e exclusão de usuários
- Atribuição de perfis (Administrador ou Estoque)
- Ativação/desativação de usuários
- Controle de acesso baseado em perfil

### 📍 Localização de Produtos

- Campos de **Prateleira** e **Alocação** para localização física
- Listas suspensas com opção de adicionar novos valores
- Facilita a organização e localização de produtos no almoxarifado

## 🗂️ Estrutura do Banco de Dados

### Tabelas Principais

- **produtos** - Cadastro de produtos
- **recebimentos** - Registro de entradas
- **saidas** - Registro de saídas
- **destinatarios** - Cadastro de destinatários
- **usuarios** - Gestão de usuários do sistema

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Produção
npm run build        # Cria build de produção
npm run start        # Inicia servidor de produção

# Banco de Dados
npm run init-db                    # Inicializa banco de dados
npm run add-usuarios               # Adiciona sistema de usuários
npm run add-localizacao            # Adiciona campos de localização
npm run migrate-recebimentos       # Migra valores de recebimentos
npm run fix-destinatario           # Corrige campo destinatario
npm run add-destinatarios          # Adiciona tabela destinatarios
npm run add-nota-fiscal-pdf        # Adicionando campo nota_fiscal_pdf na tabela recebimentos 

# Qualidade
npm run lint         # Executa linter
```

## 🎨 Interface

- Design moderno e intuitivo
- Suporte completo a dark mode
- Interface responsiva (mobile, tablet, desktop)
- Componentes reutilizáveis
- Feedback visual para ações do usuário

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Autenticação baseada em sessões
- Middleware de proteção de rotas
- Controle de acesso por perfil
- Validação de dados no frontend e backend

## 📊 Exportação de Dados

- Exportação de produtos para Excel
- Exportação de saídas filtradas para Excel
- Formatação automática de colunas
- Nomes de arquivos com data e hora

## 🛠️ Desenvolvimento

### Estrutura de Pastas

```
almoxerife/
├── src/
│   ├── app/              # Páginas e rotas (App Router)
│   │   ├── api/          # API Routes
│   │   ├── estoque/      # Páginas de estoque
│   │   ├── administrativo/ # Páginas administrativas
│   │   └── login/        # Página de login
│   ├── components/       # Componentes React
│   └── lib/              # Utilitários e helpers
├── scripts/              # Scripts de migração e setup
└── public/               # Arquivos estáticos
```

## 📄 Licença

Este projeto é privado e de uso interno.

## 🤝 Contribuindo

Este é um projeto interno. Para sugestões ou melhorias, entre em contato com a equipe de desenvolvimento.

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação em `CONFIGURACAO.md` ou `SETUP.md`.

---

Desenvolvido com ❤️ usando Next.js e React
