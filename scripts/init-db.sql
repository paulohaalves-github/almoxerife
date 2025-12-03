-- Criar banco de dados se não existir
CREATE DATABASE IF NOT EXISTS almoxerife CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE almoxerife;

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(255),
  fabricante VARCHAR(255),
  quantidade_estoque INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nome (nome),
  INDEX idx_categoria (categoria),
  INDEX idx_fabricante (fabricante),
  INDEX idx_estoque (quantidade_estoque)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de saídas
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

-- Tabela de recebimentos (entradas de produtos)
CREATE TABLE IF NOT EXISTS recebimentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produto_id INT NOT NULL,
  quantidade INT NOT NULL,
  valor_unitario DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(12,2) NOT NULL,
  fornecedor VARCHAR(255) NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE RESTRICT,
  INDEX idx_produto (produto_id),
  INDEX idx_fornecedor (fornecedor),
  INDEX idx_data (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

