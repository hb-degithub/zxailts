const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'zydylts',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+08:00',
  dateStrings: true,
  charset: 'utf8mb4'
});

// 封装 query 方法，每次查询前先 SET NAMES
const originalQuery = pool.query.bind(pool);

pool.query = async function(sql, values) {
  const conn = await pool.getConnection();
  try {
    await conn.query("SET NAMES utf8mb4");
    return await originalQuery(sql, values);
  } finally {
    conn.release();
  }
};

// 封装 getConnection 方法
const originalGetConnection = pool.getConnection.bind(pool);
pool.getConnection = async function() {
  const conn = await originalGetConnection();
  await conn.query("SET NAMES utf8mb4");
  return conn;
};

module.exports = pool;
