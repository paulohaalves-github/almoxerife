-- Adicionar campos de localização na tabela produtos
USE almoxerife;

-- Adicionar coluna prateleira
ALTER TABLE produtos 
ADD COLUMN prateleira VARCHAR(255) NULL AFTER fabricante;

-- Adicionar coluna alocacao
ALTER TABLE produtos 
ADD COLUMN alocacao VARCHAR(255) NULL AFTER prateleira;

-- Adicionar índices para melhorar performance nas buscas
ALTER TABLE produtos 
ADD INDEX idx_prateleira (prateleira);

ALTER TABLE produtos 
ADD INDEX idx_alocacao (alocacao);


