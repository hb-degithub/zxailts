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
  bigNumberStrings: true
});

// 初始化连接时设置字符集
pool.getConnection().then(conn => {
  conn.query("SET NAMES utf8mb4").then(() => {
    conn.release();
  }).catch(() => {
    conn.release();
  });
});

module.exports = pool;
