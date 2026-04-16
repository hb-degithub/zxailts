const pool = require('../config/dbconfig');
const ApiResponse = require('../utils/response');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'admin-secret-key-change-in-production';

const inviteCodeController = {
  // POST /api/invite-codes/validate - 验证邀请码（注册时使用）
  async validate(req, res) {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json(ApiResponse.error('邀请码不能为空'));
      }

      const [codes] = await pool.query(
        'SELECT * FROM invite_codes WHERE code = ? AND is_active = 1',
        [code.toUpperCase()]
      );

      if (codes.length === 0) {
        return res.status(404).json(ApiResponse.error('邀请码无效'));
      }

      const inviteCode = codes[0];

      // 检查是否过期
      if (inviteCode.expires_at && new Date(inviteCode.expires_at) < new Date()) {
        return res.status(400).json(ApiResponse.error('邀请码已过期'));
      }

      // 检查使用次数
      if (inviteCode.used_count >= inviteCode.max_uses) {
        return res.status(400).json(ApiResponse.error('邀请码已用完'));
      }

      res.json(ApiResponse.success({
        valid: true,
        type: inviteCode.type,
        room_id: inviteCode.room_id
      }, '邀请码有效'));
    } catch (error) {
      console.error('validate invite code error:', error);
      res.status(500).json(ApiResponse.error(error.message || '验证失败'));
    }
  },

  // POST /api/invite-codes/use - 使用邀请码
  async use(req, res) {
    try {
      const { code, userId } = req.body;

      if (!code || !userId) {
        return res.status(400).json(ApiResponse.error('邀请码和用户ID不能为空'));
      }

      const [codes] = await pool.query(
        'SELECT * FROM invite_codes WHERE code = ? AND is_active = 1',
        [code.toUpperCase()]
      );

      if (codes.length === 0) {
        return res.status(404).json(ApiResponse.error('邀请码无效'));
      }

      const inviteCode = codes[0];

      // 检查是否过期
      if (inviteCode.expires_at && new Date(inviteCode.expires_at) < new Date()) {
        return res.status(400).json(ApiResponse.error('邀请码已过期'));
      }

      // 检查使用次数
      if (inviteCode.used_count >= inviteCode.max_uses) {
        return res.status(400).json(ApiResponse.error('邀请码已用完'));
      }

      // 更新使用次数
      await pool.query(
        'UPDATE invite_codes SET used_count = used_count + 1, used_by = ?, used_at = NOW() WHERE id = ?',
        [userId, inviteCode.id]
      );

      // 如果是房间邀请码，自动加入房间
      if (inviteCode.type === 'room' && inviteCode.room_id) {
        await pool.query(
          'INSERT IGNORE INTO room_members (room_id, user_id, role) VALUES (?, ?, ?)',
          [inviteCode.room_id, userId, 'member']
        );
      }

      res.json(ApiResponse.success({
        type: inviteCode.type,
        room_id: inviteCode.room_id
      }, '邀请码使用成功'));
    } catch (error) {
      console.error('use invite code error:', error);
      res.status(500).json(ApiResponse.error(error.message || '使用失败'));
    }
  },

  // POST /api/invite-codes/generate - 生成邀请码（需管理员权限）
  async generate(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json(ApiResponse.error('未提供token'));
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      if (decoded.role !== 'admin') {
        return res.status(403).json(ApiResponse.error('需要管理员权限'));
      }

      const { type = 'register', room_id, max_uses = 1, expires_days = 30 } = req.body;

      // 生成6位随机邀请码
      const code = Array.from({ length: 6 }, () =>
        'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
      ).join('');

      const expires_at = new Date(Date.now() + expires_days * 24 * 60 * 60 * 1000);

      const [result] = await pool.query(
        'INSERT INTO invite_codes (code, type, creator_id, room_id, max_uses, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
        [code, type, decoded.id, room_id || null, max_uses, expires_at]
      );

      res.status(201).json(ApiResponse.success({
        id: result.insertId,
        code,
        type,
        room_id,
        max_uses,
        expires_at
      }, '邀请码生成成功'));
    } catch (error) {
      console.error('generate invite code error:', error);
      res.status(500).json(ApiResponse.error(error.message || '生成失败'));
    }
  },

  // GET /api/invite-codes - 获取邀请码列表（需管理员权限）
  async list(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json(ApiResponse.error('未提供token'));
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      if (decoded.role !== 'admin') {
        return res.status(403).json(ApiResponse.error('需要管理员权限'));
      }

      const { page = 1, pageSize = 10 } = req.query;
      const offset = (page - 1) * pageSize;

      const [codes] = await pool.query(
        `SELECT ic.*, u.username as creator_name
         FROM invite_codes ic
         LEFT JOIN users u ON ic.creator_id = u.id
         ORDER BY ic.created_at DESC
         LIMIT ? OFFSET ?`,
        [parseInt(pageSize), offset]
      );

      const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM invite_codes');

      res.json(ApiResponse.success({
        list: codes,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total
        }
      }));
    } catch (error) {
      console.error('list invite codes error:', error);
      res.status(500).json(ApiResponse.error(error.message || '查询失败'));
    }
  },

  // DELETE /api/invite-codes/:id - 删除邀请码（需管理员权限）
  async remove(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json(ApiResponse.error('未提供token'));
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      if (decoded.role !== 'admin') {
        return res.status(403).json(ApiResponse.error('需要管理员权限'));
      }

      const { id } = req.params;

      const [result] = await pool.query('DELETE FROM invite_codes WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json(ApiResponse.error('邀请码不存在'));
      }

      res.json(ApiResponse.success(null, '删除成功'));
    } catch (error) {
      console.error('remove invite code error:', error);
      res.status(500).json(ApiResponse.error(error.message || '删除失败'));
    }
  }
};

module.exports = inviteCodeController;