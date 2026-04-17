const mysql = require('mysql2');

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

// 将 mysql2 的 promise API 包装在查询方法中
const originalQuery = pool.query.bind(pool);

pool.query = function(sql, values) {
  return new Promise((resolve, reject) => {
    originalQuery(sql, values, (err, rows, fields) => {
      if (err) reject(err);
      else resolve([rows, fields]);
    });
  });
};

pool.getConnection = function() {
  return new Promise((resolve, reject) => {
    originalQuery.getConnection((err, conn) => {
      if (err) reject(err);
      else resolve(conn);
    });
  });
};

module.exports = pool;
