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

// 每次获取连接后执行 SET NAMES utf8mb4
pool.on('connection', (connection) => {
  connection.query("SET NAMES utf8mb4", (err) => {
    if (err) console.error('SET NAMES error:', err);
  });
});

module.exports = pool;
