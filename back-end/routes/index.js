const express = require('express');
const router = express.Router();
const commonController = require('../controllers/commonController');
const authController = require('../controllers/authController');
const inviteCodeController = require('../controllers/inviteCodeController');
const adminRoutes = require('./admin');
const openaiRoutes = require('./openai');
const aiRoutes = require('./ai');
const pool = require('../config/dbconfig');
const ApiResponse = require('../utils/response');

// 表名列表（根据 SQL 文件定义）
const tables = [
  'users',
  'rooms',
  'messages',
  'user_model_configs',
  'ai_configs',
  'ai_logs',
  'ai_sessions',
  'knowledge_bases',
  'user_quotas',
  'invite_codes',
  'room_members'
];

// OpenAI 兼容接口
router.use('/', openaiRoutes);

// AI 代理接口 - 用户端通过此接口调用 AI，不暴露密钥
router.use('/api', aiRoutes);

// 房间成员接口 - 必须在 /api/:table 和 adminRoutes 之前定义
router.get('/api/rooms/:roomId/members', async (req, res) => {
  try {
    const { roomId } = req.params;
    const [members] = await pool.query(`
      SELECT rm.*, u.username, u.avatar_url
      FROM room_members rm
      LEFT JOIN users u ON rm.user_id = u.id
      WHERE rm.room_id = ?
    `, [roomId]);
    res.json(ApiResponse.success(members));
  } catch (error) {
    console.error('获取房间成员失败:', error);
    res.status(500).json(ApiResponse.error(error.message || '获取房间成员失败'));
  }
});

router.post('/api/rooms/:roomId/members', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { user_id, role = 'member' } = req.body;

    // 检查是否已存在
    const [existing] = await pool.query(
      'SELECT id FROM room_members WHERE room_id = ? AND user_id = ?',
      [roomId, user_id]
    );

    if (existing.length > 0) {
      return res.json(ApiResponse.success(null, '用户已在房间中'));
    }

    const [result] = await pool.query(
      'INSERT INTO room_members (room_id, user_id, role) VALUES (?, ?, ?)',
      [roomId, user_id, role]
    );
    res.status(201).json(ApiResponse.success({ id: result.insertId }, '添加成功'));
  } catch (error) {
    console.error('添加房间成员失败:', error);
    res.status(500).json(ApiResponse.error(error.message || '添加房间成员失败'));
  }
});

router.delete('/api/rooms/:roomId/members/:userId', async (req, res) => {
  try {
    const { roomId, userId } = req.params;
    const [result] = await pool.query(
      'DELETE FROM room_members WHERE room_id = ? AND user_id = ?',
      [roomId, userId]
    );

    res.json(ApiResponse.success(null, '移除成功'));
  } catch (error) {
    console.error('移除房间成员失败:', error);
    res.status(500).json(ApiResponse.error(error.message || '移除房间成员失败'));
  }
});

// 管理后台接口
router.use('/api', adminRoutes);

// 管理员认证接口 - 必须在 /api/:table 之前定义
router.post('/api/auth/login', authController.login);
router.post('/api/auth/register', authController.register);
router.get('/api/auth/verify', authController.verify);

// 邀请码接口
router.post('/api/invite-codes/validate', inviteCodeController.validate);
router.post('/api/invite-codes/use', inviteCodeController.use);
router.post('/api/invite-codes/generate', inviteCodeController.generate);
router.get('/api/invite-codes', inviteCodeController.list);
router.delete('/api/invite-codes/:id', inviteCodeController.remove);

// 用户接口
router.put('/api/users/:id/join-community', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE users SET community_joined = 1 WHERE id = ?', [id]);
    res.json(ApiResponse.success({ community_joined: true }, '加入成功'));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message || '操作失败'));
  }
});

// 社区统计接口
router.get('/api/community/stats', async (req, res) => {
  try {
    let members = 0, joined = 0, messagesToday = 0;

    try {
      const [totalResult] = await pool.query('SELECT COUNT(*) as total FROM users');
      members = totalResult[0]?.total || 0;
    } catch (e) {
      console.error('users count error:', e);
    }

    try {
      const [joinedResult] = await pool.query('SELECT COUNT(*) as joined FROM users WHERE community_joined = 1');
      joined = joinedResult[0]?.joined || 0;
    } catch (e) {
      console.error('joined count error:', e);
    }

    try {
      const [messagesResult] = await pool.query('SELECT COUNT(*) as messagesToday FROM messages WHERE DATE(created_at) = CURDATE()');
      messagesToday = messagesResult[0]?.messagesToday || 0;
    } catch (e) {
      console.error('messages count error:', e);
    }

    res.json(ApiResponse.success({
      members,
      joined,
      messagesToday
    }));
  } catch (error) {
    console.error('社区统计错误:', error);
    res.json(ApiResponse.success({
      members: 0,
      joined: 0,
      messagesToday: 0
    }));
  }
});

// 验证表名是否合法
router.param('table', (req, res, next, table) => {
  if (tables.includes(table)) {
    req.tableName = table;
    next();
  } else {
    res.status(404).json({ code: 404, message: '表不存在', data: null, timestamp: Date.now() });
  }
});

// 公开机器人接口 (必须在通用路由 /api/:table 之前定义)
router.get('/api/public-bots', async (req, res) => {
  try {
    const [bots] = await pool.query(`
      SELECT pb.*, u.username as creator_name, u.avatar_url as creator_avatar
      FROM public_bots pb
      LEFT JOIN users u ON pb.user_id = u.id
      ORDER BY pb.usage_count DESC, pb.created_at DESC
    `);
    res.json(ApiResponse.success(bots));
  } catch (error) {
    console.error('获取公开机器人失败:', error);
    res.status(500).json(ApiResponse.error(error.message || '获取公开机器人失败'));
  }
});

router.get('/api/public-bots/my', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json(ApiResponse.error('用户ID不能为空'));
    }
    const [bots] = await pool.query('SELECT * FROM public_bots WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json(ApiResponse.success(bots));
  } catch (error) {
    console.error('获取我的公开机器人失败:', error);
    res.status(500).json(ApiResponse.error(error.message || '获取我的公开机器人失败'));
  }
});

router.post('/api/public-bots', async (req, res) => {
  try {
    const { user_id, name, config_id, model_name, personality, welcome_msg } = req.body;
    if (!user_id || !name || !config_id || !model_name) {
      return res.status(400).json(ApiResponse.error('缺少必填字段'));
    }
    const [result] = await pool.query(
      'INSERT INTO public_bots (user_id, name, config_id, model_name, personality, welcome_msg) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, name, config_id, model_name, personality || '', welcome_msg || '']
    );
    res.status(201).json(ApiResponse.success({ id: result.insertId }, '公开成功'));
  } catch (error) {
    console.error('公开机器人失败:', error);
    res.status(500).json(ApiResponse.error(error.message || '公开机器人失败'));
  }
});

router.delete('/api/public-bots/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM public_bots WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json(ApiResponse.notFound());
    }
    res.json(ApiResponse.success(null, '取消公开成功'));
  } catch (error) {
    console.error('取消公开失败:', error);
    res.status(500).json(ApiResponse.error(error.message || '取消公开失败'));
  }
});

router.post('/api/public-bots/:id/use', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE public_bots SET usage_count = usage_count + 1 WHERE id = ?', [id]);
    res.json(ApiResponse.success(null, '使用成功'));
  } catch (error) {
    console.error('记录使用失败:', error);
    res.status(500).json(ApiResponse.error(error.message || '记录使用失败'));
  }
});

// 通用路由 - 使用 :table 参数 (必须放在特定路由之后)
router.get('/api/:table', commonController.getList);
router.get('/api/:table/:id', commonController.getDetail);
router.post('/api/:table', commonController.create);
router.put('/api/:table/:id', commonController.update);
router.delete('/api/:table/:id', commonController.remove);

// 在线部署接口
const deployController = require('../deploy');
router.post('/api/deploy', deployController);

module.exports = router;
