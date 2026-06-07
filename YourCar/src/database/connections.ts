import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// cria um pool de conexoes em vez de um conexao unica
// ele gerencia tudo sozinho e, de forma perfomatica e seguro

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'db', // db eo nome do conteiner
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root_secure_password123',
    database: process.env.DB_NAME || 'yourcar_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;