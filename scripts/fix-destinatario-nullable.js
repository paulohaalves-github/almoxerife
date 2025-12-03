import mysql from 'mysql2/promise';
import { existsSync } from 'fs';
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

async function fixDestinatarioNullable() {
  let connection;

  try {
    console.log('🔌 Conectando ao banco de dados...');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   User: ${dbConfig.user}`);
    console.log(`   Database: ${dbConfig.database}\n`);
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // Verificar se a coluna destinatario existe e se é NOT NULL
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'saidas'
      AND COLUMN_NAME = 'destinatario'
    `, [dbConfig.database]);

    if (columns.length === 0) {
      console.log('⚠️  Coluna "destinatario" não encontrada na tabela "saidas".');
      console.log('   A tabela pode ter sido criada com uma estrutura diferente.\n');
      return;
    }

    const column = columns[0];
    console.log(`📊 Estado atual da coluna "destinatario":`);
    console.log(`   Tipo: ${column.COLUMN_TYPE}`);
    console.log(`   Permite NULL: ${column.IS_NULLABLE}\n`);

    if (column.IS_NULLABLE === 'YES') {
      console.log('✅ A coluna "destinatario" já permite NULL. Nenhuma alteração necessária.\n');
      return;
    }

    console.log('📝 Tornando a coluna "destinatario" opcional (NULL)...');
    
    await connection.execute(`
      ALTER TABLE saidas
      MODIFY COLUMN destinatario VARCHAR(255) NULL
    `);

    console.log('✅ Coluna "destinatario" atualizada com sucesso!\n');

    // Verificar novamente
    const [updatedColumns] = await connection.execute(`
      SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'saidas'
      AND COLUMN_NAME = 'destinatario'
    `, [dbConfig.database]);

    if (updatedColumns.length > 0) {
      const updatedColumn = updatedColumns[0];
      console.log('📊 Estado após a atualização:');
      console.log(`   Tipo: ${updatedColumn.COLUMN_TYPE}`);
      console.log(`   Permite NULL: ${updatedColumn.IS_NULLABLE}\n`);
    }

    console.log('✅ Correção aplicada com sucesso!');
    console.log('   Agora você pode registrar saídas usando apenas destinatario_id.\n');
  } catch (error) {
    console.error('\n❌ Erro ao executar correção:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n⚠️  Erro de acesso negado. Verifique:');
      console.error('   - Usuário: ' + dbConfig.user);
      console.error('   - Senha está configurada no arquivo .env.local?');
      console.error('   - Certifique-se de que o arquivo .env.local existe na raiz do projeto');
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
      console.log('🔌 Conexão encerrada.');
    }
  }
}

// Executar correção
fixDestinatarioNullable();


