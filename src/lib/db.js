import mysql from 'mysql2/promise';

// Configuração da conexão com o banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'almoxerife',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Criar pool de conexões
const pool = mysql.createPool(dbConfig);

// Função para executar queries
export async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Erro na query:', error);
    throw error;
  }
}

// Função para testar a conexão
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Conexão com banco de dados estabelecida com sucesso!');
    connection.release();
    return true;
  } catch (error) {
    console.error('Erro ao conectar com banco de dados:', error);
    return false;
  }
}

export default pool;


