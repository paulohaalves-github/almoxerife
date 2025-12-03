# Guia Rápido de Configuração

## 🚀 Configuração do Banco de Dados

O erro que você está vendo (`Unknown database 'almoxerife'`) significa que o banco de dados ainda não foi criado.

### Opção 1: Usar o Script Automático (Recomendado)

1. **Configure o arquivo `.env.local`** na raiz do projeto:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=almoxerife
```

2. **Execute o script de inicialização**:

```bash
npm run init-db
```

O script irá:
- Conectar ao MySQL
- Criar o banco de dados `almoxerife`
- Criar todas as tabelas necessárias

### Opção 2: Criar Manualmente via MySQL

1. Acesse o MySQL:

```bash
mysql -u root -p
```

2. Execute o script SQL:

```sql
CREATE DATABASE IF NOT EXISTS almoxerife CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE almoxerife;

CREATE TABLE IF NOT EXISTS produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  quantidade_estoque INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nome (nome),
  INDEX idx_estoque (quantidade_estoque)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS saidas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produto_id INT NOT NULL,
  quantidade INT NOT NULL,
  destinatario VARCHAR(255) NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE RESTRICT,
  INDEX idx_produto (produto_id),
  INDEX idx_destinatario (destinatario),
  INDEX idx_data (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Ou execute diretamente:

```bash
mysql -u root -p < scripts/init-db.sql
```

### Opção 3: Via Interface Gráfica (phpMyAdmin, MySQL Workbench, etc.)

1. Crie um novo banco de dados chamado `almoxerife`
2. Execute o conteúdo do arquivo `scripts/init-db.sql` dentro desse banco

## ✅ Verificação

Após criar o banco de dados:

1. Reinicie o servidor Next.js (se estiver rodando):
   ```bash
   # Pare o servidor (Ctrl+C) e inicie novamente
   npm run dev
   ```

2. Acesse http://localhost:3000/estoque

3. Tente cadastrar um produto para verificar se está tudo funcionando!

## 📝 Atualização do Banco de Dados (Adicionar Categoria e Fabricante)

Se você já criou o banco de dados anteriormente, execute este script para adicionar as novas colunas:

```bash
mysql -u root -p almoxerife < scripts/add-categoria-fabricante.sql
```

Ou execute manualmente no MySQL:

```sql
USE almoxerife;

ALTER TABLE produtos 
ADD COLUMN categoria VARCHAR(255) AFTER descricao,
ADD COLUMN fabricante VARCHAR(255) AFTER categoria;

ALTER TABLE produtos 
ADD INDEX idx_categoria (categoria),
ADD INDEX idx_fabricante (fabricante);
```

## 🔧 Solução de Problemas

### Erro: "Access denied"
- Verifique se o usuário e senha no `.env.local` estão corretos
- Certifique-se de que o usuário MySQL tem permissões para criar bancos

### Erro: "Can't connect to MySQL server"
- Verifique se o MySQL está rodando
- Verifique se o `DB_HOST` está correto (localhost por padrão)
- Verifique se a porta está correta (padrão é 3306)

### Erro: "ER_BAD_DB_ERROR"
- O banco de dados ainda não foi criado
- Execute uma das opções acima para criar o banco

