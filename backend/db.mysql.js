import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
console.log(process.env.MYSQL_HOST);
console.log(process.env.MYSQL_PORT);
console.log(process.env.MYSQL_USER);
console.log(process.env.MYSQL_PASSWORD);
console.log(process.env.MYSQL_DATABASE);
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

export const query = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return { rows: results };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const ensureUsersTable = async () => {
  try {
    console.log('Creating users table...');
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mobile VARCHAR(15) UNIQUE NOT NULL,
        aadhaar VARCHAR(12),
        password_hash VARCHAR(255),
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `;
    await query(createTableSQL);
    console.log('Users table created successfully');
  } catch (error) {
    console.error('Error creating users table:', error);
    throw error;
  }
};

export const testConnection = async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    console.log('Connected to MySQL database successfully!');
    conn.release();
    return true;
  } catch (err) {
    console.error('Failed to connect to MySQL database:', err.message);
    return false;
  }
};

export { pool };