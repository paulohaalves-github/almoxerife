# Configuração do Sistema de Almoxarifado

## Pré-requisitos

- Node.js 18+ instalado
- MySQL instalado e rodando
- npm ou yarn

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=almoxerife
```

3. Configure o banco de dados MySQL:

Execute o script SQL para criar as tabelas necessárias:

```bash
mysql -u root -p < scripts/init-db.sql
```

Ou copie e cole o conteúdo do arquivo `scripts/init-db.sql` no seu cliente MySQL.

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

5. Acesse o sistema:

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## Estrutura do Banco de Dados

### Tabela: produtos
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `nome` (VARCHAR(255), NOT NULL)
- `descricao` (TEXT)
- `quantidade_estoque` (INT, NOT NULL, DEFAULT 0)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Tabela: saidas
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `produto_id` (INT, NOT NULL, FOREIGN KEY)
- `quantidade` (INT, NOT NULL)
- `destinatario` (VARCHAR(255), NOT NULL)
- `observacoes` (TEXT)
- `created_at` (TIMESTAMP)

## Funcionalidades

### Gestão de Produtos
- Cadastrar novos produtos
- Editar produtos existentes
- Visualizar lista de produtos com estoque
- Buscar produtos por nome ou descrição

### Gestão de Estoque
- Visualizar quantidade em estoque de cada produto
- Indicadores visuais de estoque baixo
- Histórico de alterações

### Registro de Saídas
- Registrar saídas de produtos
- Registrar destinatário da saída
- Validar quantidade disponível antes de registrar saída
- Atualização automática do estoque após registro de saída
- Visualizar histórico de todas as saídas

## Uso

1. **Cadastrar Produto**: 
   - Acesse o menu "Estoque"
   - Clique em "Novo Produto"
   - Preencha os dados e salve

2. **Editar Produto**:
   - Na lista de produtos, clique em "Editar"
   - Altere os dados desejados e salve

3. **Registrar Saída**:
   - Acesse "Registrar Saída" no menu de estoque
   - Selecione o produto
   - Informe a quantidade e o destinatário
   - O sistema atualizará automaticamente o estoque

## API Endpoints

### Produtos
- `GET /api/produtos` - Listar todos os produtos
- `GET /api/produtos?busca=termo` - Buscar produtos
- `GET /api/produtos/[id]` - Buscar produto por ID
- `POST /api/produtos` - Criar novo produto
- `PUT /api/produtos/[id]` - Atualizar produto
- `DELETE /api/produtos/[id]` - Deletar produto

### Saídas
- `GET /api/saidas` - Listar todas as saídas
- `GET /api/saidas?produto_id=1` - Filtrar saídas por produto
- `GET /api/saidas?destinatario=nome` - Filtrar saídas por destinatário
- `POST /api/saidas` - Registrar nova saída


