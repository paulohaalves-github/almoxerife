-- Adicionar tabela de recebimentos
USE almoxerife;

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


