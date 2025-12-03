import mysql from 'mysql2/promise';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente do arquivo .env.local se existir
const envPath = join(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  config({ path: envPath });
}

// Configuração da conexão com o banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'almoxerife',
};

console.log('🔌 Conectando ao banco de dados...');
console.log(`   Host: ${dbConfig.host}`);
console.log(`   User: ${dbConfig.user}`);
console.log(`   Database: ${dbConfig.database}\n`);

async function addLocalizacaoProdutos() {
  let connection;
  
  try {
    console.log('Conectando ao MySQL...');
    
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      multipleStatements: true,
    });

    console.log('✅ Conexão estabelecida!\n');

    // Verificar se as colunas já existem
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'produtos'
      AND COLUMN_NAME IN ('prateleira', 'alocacao')
    `, [dbConfig.database]);

    const existingColumns = columns.map((col) => col.COLUMN_NAME);
    console.log(`📊 Colunas existentes: ${existingColumns.length > 0 ? existingColumns.join(', ') : 'nenhuma'}\n`);

    // Adicionar prateleira se não existir
    if (!existingColumns.includes('prateleira')) {
      try {
        await connection.execute(`
          ALTER TABLE produtos 
          ADD COLUMN prateleira VARCHAR(255) NULL AFTER fabricante
        `);
        console.log('✅ Coluna "prateleira" adicionada com sucesso!');
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('⚠️  Coluna "prateleira" já existe.');
        } else {
          throw error;
        }
      }
    } else {
      console.log('ℹ️  Coluna "prateleira" já existe. Pulando...');
    }

    // Adicionar alocacao se não existir
    if (!existingColumns.includes('alocacao')) {
      try {
        await connection.execute(`
          ALTER TABLE produtos 
          ADD COLUMN alocacao VARCHAR(255) NULL AFTER prateleira
        `);
        console.log('✅ Coluna "alocacao" adicionada com sucesso!');
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('⚠️  Coluna "alocacao" já existe.');
        } else {
          throw error;
        }
      }
    } else {
      console.log('ℹ️  Coluna "alocacao" já existe. Pulando...');
    }

    // Adicionar índices
    try {
      await connection.execute(`
        ALTER TABLE produtos 
        ADD INDEX idx_prateleira (prateleira)
      `);
      console.log('✅ Índice "idx_prateleira" criado!');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️  Índice "idx_prateleira" já existe.');
      }
    }

    try {
      await connection.execute(`
        ALTER TABLE produtos 
        ADD INDEX idx_alocacao (alocacao)
      `);
      console.log('✅ Índice "idx_alocacao" criado!');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️  Índice "idx_alocacao" já existe.');
      }
    }

    console.log('\n✅ Migração concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao executar migração:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n⚠️  Erro de acesso negado. Verifique:');
      console.error('   - Usuário: ' + dbConfig.user);
      console.error('   - Senha está correta?');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Erro de conexão. Verifique:');
      console.error('   - MySQL está rodando?');
      console.error('   - Host: ' + dbConfig.host);
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n⚠️  Banco de dados não encontrado.');
      console.error('   Execute primeiro: npm run init-db');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexão encerrada.');
    }
  }
}

addLocalizacaoProdutos();


