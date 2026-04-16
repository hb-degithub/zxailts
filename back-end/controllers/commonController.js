const pool = require('../config/dbconfig');
const ApiResponse = require('../utils/response');

const commonController = {
  // GET /api/:table - 获取列表
  async getList(req, res) {
    try {
      const { table } = req.params;
      const { page = 1, pageSize = 10, keyword, ...filters } = req.query;
      const offset = (page - 1) * pageSize;

      let whereClause = '';
      const values = [];

      // 处理 keyword 搜索（仅对 users 表有效）
      if (keyword && table === 'users') {
        const conditions = [];
        if (filters.id) {
          conditions.push('id = ?');
          values.push(filters.id);
        }
        conditions.push('username LIKE ?');
        values.push(`%${keyword}%`);
        whereClause = 'WHERE ' + conditions.join(' AND ');
      } else if (Object.keys(filters).length > 0) {
        const conditions = Object.keys(filters).map((key) => {
          values.push(filters[key]);
          return `${key} = ?`;
        });
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }

      const countSql = `SELECT COUNT(*) as total FROM ${table} ${whereClause}`;
      const [countResult] = await pool.query(countSql, values);
      const total = countResult[0].total;

      const dataSql = `SELECT * FROM ${table} ${whereClause} LIMIT ? OFFSET ?`;
      const [rows] = await pool.query(dataSql, [...values, parseInt(pageSize), offset]);

      res.json(ApiResponse.success({
        list: rows,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      }));
    } catch (error) {
      console.error('getList error:', error);
      res.status(500).json(ApiResponse.error(error.message || '查询失败'));
    }
  },

  // GET /api/:table/:id - 获取详情
  async getDetail(req, res) {
    try {
      const { table } = req.params;
      const { id } = req.params;

      const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);

      if (rows.length === 0) {
        return res.status(404).json(ApiResponse.notFound());
      }

      res.json(ApiResponse.success(rows[0]));
    } catch (error) {
      console.error('getDetail error:', error);
      res.status(500).json(ApiResponse.error(error.message || '查询失败'));
    }
  },

  // POST /api/:table - 新增
  async create(req, res) {
    try {
      const { table } = req.params;
      const data = req.body;

      console.log(`[${table}] Create data:`, JSON.stringify(data));

      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => '?').join(', ');

      const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
      console.log(`[${table}] SQL:`, sql);
      console.log(`[${table}] Values:`, values);

      const [result] = await pool.query(sql, values);

      const [newRecord] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [result.insertId]);

      res.status(201).json(ApiResponse.success(newRecord[0], '创建成功'));
    } catch (error) {
      console.error('create error:', error);
      console.error('Error code:', error.code);
      console.error('Error number:', error.errno);
      res.status(500).json(ApiResponse.error(error.message || '创建失败'));
    }
  },

  // PUT /api/:table/:id - 更新
  async update(req, res) {
    try {
      const { table } = req.params;
      const { id } = req.params;
      const data = req.body;

      const updates = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), id];

      const sql = `UPDATE ${table} SET ${updates} WHERE id = ?`;
      const [result] = await pool.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(404).json(ApiResponse.notFound());
      }

      const [updated] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);

      res.json(ApiResponse.success(updated[0], '更新成功'));
    } catch (error) {
      console.error('update error:', error);
      res.status(500).json(ApiResponse.error(error.message || '更新失败'));
    }
  },

  // DELETE /api/:table/:id - 删除
  async remove(req, res) {
    try {
      const { table } = req.params;
      const { id } = req.params;

      const [result] = await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json(ApiResponse.notFound());
      }

      res.json(ApiResponse.success(null, '删除成功'));
    } catch (error) {
      console.error('remove error:', error);
      res.status(500).json(ApiResponse.error(error.message || '删除失败'));
    }
  }
};

module.exports = commonController;
