-- Adicionar campo para armazenar o caminho do PDF da nota fiscal
USE almoxerife;

ALTER TABLE recebimentos 
ADD COLUMN nota_fiscal_pdf VARCHAR(500) NULL AFTER observacoes;






