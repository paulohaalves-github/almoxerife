import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente do arquivo .env.local se existir
const envPath = join(process.cwd(), '.env.local');
config({ path: envPath });

// Configuração de conexão
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'almoxerife',
  multipleStatements: true,
};

console.log('Configuração de conexão:');
console.log(`  Host: ${dbConfig.host}`);
console.log(`  User: ${dbConfig.user}`);
console.log(`  Database: ${dbConfig.database}`);
console.log('');

async function addColumns() {
  let connection;
  
  try {
    console.log('Conectando ao MySQL...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('Conexão estabelecida!');

    // Ler e executar o script SQL
    const sqlFile = join(__dirname, 'add-categoria-fabricante.sql');
    const sql = readFileSync(sqlFile, 'utf8');

    console.log('Adicionando colunas categoria e fabricante...');
    await connection.query(sql);

    console.log('✅ Colunas categoria e fabricante adicionadas com sucesso!');
    console.log('✅ Índices criados com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao executar script:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\nErro de acesso negado. Verifique:');
      console.error('- Usuário: ' + dbConfig.user);
      console.error('- Senha está correta?');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\nErro de conexão. Verifique:');
      console.error('- MySQL está rodando?');
      console.error('- Host: ' + dbConfig.host);
    } else if (error.code === 'ER_DUP_FIELDNAME') {
      console.error('\n⚠️  Uma ou mais colunas já existem na tabela.');
      console.error('Isso é normal se você já executou este script antes.');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addColumns();





