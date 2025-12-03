-- Criar tabela de destinatários
USE almoxerife;

-- Tabela de destinatários
CREATE TABLE IF NOT EXISTS destinatarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  setor VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_nome_setor (nome, setor),
  INDEX idx_nome (nome),
  INDEX idx_setor (setor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Adicionar campo destinatario_id na tabela saidas
ALTER TABLE saidas 
ADD COLUMN destinatario_id INT NULL AFTER destinatario;

-- Adicionar foreign key
ALTER TABLE saidas
ADD CONSTRAINT fk_destinatario 
FOREIGN KEY (destinatario_id) REFERENCES destinatarios(id) ON DELETE RESTRICT;

-- Tornar o campo destinatario opcional (NULL) já que agora usamos destinatario_id
ALTER TABLE saidas
MODIFY COLUMN destinatario VARCHAR(255) NULL;

-- Migrar dados existentes (se houver)
-- Criar destinatários a partir dos destinatários únicos existentes em saidas
INSERT IGNORE INTO destinatarios (nome, setor)
SELECT DISTINCT destinatario, 'Não informado' as setor
FROM saidas
WHERE destinatario IS NOT NULL AND destinatario != '';

-- Atualizar saidas com os IDs dos destinatários
UPDATE saidas s
INNER JOIN destinatarios d ON s.destinatario = d.nome AND d.setor = 'Não informado'
SET s.destinatario_id = d.id
WHERE s.destinatario_id IS NULL;

