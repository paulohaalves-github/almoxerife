-- Criar tabela de usuários
USE almoxerife;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  perfil ENUM('Administrador', 'Estoque') NOT NULL DEFAULT 'Estoque',
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_usuario (usuario),
  INDEX idx_perfil (perfil)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


