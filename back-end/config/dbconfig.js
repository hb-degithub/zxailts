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
  typeCast: true,
  supportBigNumbers: true,
  bigNumberStrings: true,
  charset: 'utf8mb4',
  collation: 'utf8mb4_unicode_ci'
});

// 确保每次获取连接时设置字符集
pool.on('connection', (connection) => {
  connection.query("SET NAMES utf8mb4", (err) => {
    if (err) console.error('Set names error:', err);
  });
});

module.exports = pool;
