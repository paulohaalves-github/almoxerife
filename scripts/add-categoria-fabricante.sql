-- Script para adicionar colunas categoria e fabricante em tabela existente
-- Execute apenas se a tabela produtos já existir sem essas colunas

USE almoxerife;

-- Adicionar coluna categoria se não existir (verificação manual necessária)
-- Se a coluna já existir, você receberá um erro que pode ser ignorado
ALTER TABLE produtos 
ADD COLUMN categoria VARCHAR(255) AFTER descricao;

ALTER TABLE produtos 
ADD COLUMN fabricante VARCHAR(255) AFTER categoria;

-- Adicionar índices para melhorar performance nas buscas
ALTER TABLE produtos 
ADD INDEX idx_categoria (categoria);

ALTER TABLE produtos 
ADD INDEX idx_fabricante (fabricante);
