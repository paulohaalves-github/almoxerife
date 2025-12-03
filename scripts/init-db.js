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

// Carregar variáveis de ambiente
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'almoxerife',
};

console.log('Configuração de conexão:');
console.log(`  Host: ${dbConfig.host}`);
console.log(`  User: ${dbConfig.user}`);
console.log(`  Database: ${dbConfig.database}`);
console.log('');

async function initDatabase() {
  let connection;
  
  try {
    console.log('Conectando ao MySQL...');
    
    // Conectar sem especificar o banco de dados primeiro
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true,
    });

    console.log('Conexão estabelecida!');

    // Ler e executar o script SQL
    const sqlFile = join(__dirname, 'init-db.sql');
    const sql = readFileSync(sqlFile, 'utf8');

    console.log('Criando banco de dados e tabelas...');
    await connection.query(sql);

    console.log('✅ Banco de dados "almoxerife" criado com sucesso!');
    console.log('✅ Tabelas criadas com sucesso!');
    console.log('\nPróximos passos:');
    console.log('1. Certifique-se de ter configurado o arquivo .env.local');
    console.log('2. Reinicie o servidor Next.js (npm run dev)');

  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\nErro de acesso negado. Verifique:');
      console.error('- Usuário: ' + dbConfig.user);
      console.error('- Senha está correta?');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\nErro de conexão. Verifique:');
      console.error('- MySQL está rodando?');
      console.error('- Host: ' + dbConfig.host);
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();

