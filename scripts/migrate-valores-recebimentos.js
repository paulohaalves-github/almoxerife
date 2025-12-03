import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente do arquivo .env.local se existir
const envPath = path.join(process.cwd(), '.env.local');
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

async function migrate() {
  let connection;

  try {
    console.log('🔌 Conectando ao banco de dados...');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   User: ${dbConfig.user}`);
    console.log(`   Database: ${dbConfig.database}\n`);
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // Ler o arquivo SQL
    const sqlFile = path.join(__dirname, 'add-valores-recebimentos.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📝 Executando migração...');
    console.log('   Adicionando colunas valor_unitario e valor_total na tabela recebimentos...\n');

    // Verificar se as colunas já existem
    const [existingColumns] = await connection.execute(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'recebimentos'
      AND COLUMN_NAME IN ('valor_unitario', 'valor_total')
    `, [dbConfig.database]);

    const existingColumnNames = existingColumns.map((col) => col.COLUMN_NAME);
    console.log(`   Colunas existentes encontradas: ${existingColumnNames.length > 0 ? existingColumnNames.join(', ') : 'nenhuma'}\n`);

    // Adicionar valor_unitario se não existir
    if (!existingColumnNames.includes('valor_unitario')) {
      try {
        await connection.execute(`
          ALTER TABLE recebimentos 
          ADD COLUMN valor_unitario DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER quantidade
        `);
        console.log('   ✅ Coluna valor_unitario adicionada com sucesso!');
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('   ⚠️  Coluna valor_unitario já existe.');
        } else {
          throw error;
        }
      }
    } else {
      console.log('   ℹ️  Coluna valor_unitario já existe. Pulando...');
    }

    // Adicionar valor_total se não existir
    if (!existingColumnNames.includes('valor_total')) {
      try {
        await connection.execute(`
          ALTER TABLE recebimentos 
          ADD COLUMN valor_total DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER valor_unitario
        `);
        console.log('   ✅ Coluna valor_total adicionada com sucesso!');
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('   ⚠️  Coluna valor_total já existe.');
        } else {
          throw error;
        }
      }
    } else {
      console.log('   ℹ️  Coluna valor_total já existe. Pulando...');
    }

    // Atualizar registros existentes que possam ter valores NULL (se necessário)
    try {
      const [updateResult1] = await connection.execute(`
        UPDATE recebimentos 
        SET valor_unitario = 0.00 
        WHERE valor_unitario IS NULL
      `);
      if (updateResult1.affectedRows > 0) {
        console.log(`   ✅ ${updateResult1.affectedRows} registro(s) atualizado(s) para valor_unitario`);
      }
    } catch (error) {
      // Ignorar se a coluna não existir ainda
      if (error.code !== 'ER_BAD_FIELD_ERROR') {
        console.log('   ⚠️  Erro ao atualizar valor_unitario:', error.message);
      }
    }

    try {
      const [updateResult2] = await connection.execute(`
        UPDATE recebimentos 
        SET valor_total = 0.00 
        WHERE valor_total IS NULL
      `);
      if (updateResult2.affectedRows > 0) {
        console.log(`   ✅ ${updateResult2.affectedRows} registro(s) atualizado(s) para valor_total`);
      }
    } catch (error) {
      // Ignorar se a coluna não existir ainda
      if (error.code !== 'ER_BAD_FIELD_ERROR') {
        console.log('   ⚠️  Erro ao atualizar valor_total:', error.message);
      }
    }

    console.log('');

    // Verificar se as colunas foram criadas
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'recebimentos'
      AND COLUMN_NAME IN ('valor_unitario', 'valor_total')
      ORDER BY COLUMN_NAME
    `, [dbConfig.database]);

    console.log('\n📊 Verificação das colunas:');
    if (columns.length === 0) {
      console.log('   ⚠️  Nenhuma coluna nova encontrada. Verifique se a migração foi executada corretamente.');
    } else {
      columns.forEach((col) => {
        console.log(`   ✅ ${col.COLUMN_NAME} (${col.COLUMN_TYPE})`);
      });
    }

    console.log('\n✅ Migração concluída com sucesso!');
  } catch (error) {
    console.error('\n❌ Erro ao executar migração:', error.message);
    
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
      console.log('\n🔌 Conexão encerrada.');
    }
  }
}

// Executar migração
migrate();

