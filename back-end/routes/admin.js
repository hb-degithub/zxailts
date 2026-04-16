const express = require('express');
const router = express.Router();
const pool = require('../config/dbconfig');
const ApiResponse = require('../utils/response');

// 获取统计数据
router.get('/dashboard/stats', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT COUNT(*) as total FROM users');
    const [rooms] = await pool.query('SELECT COUNT(*) as total FROM rooms');
    const [messages] = await pool.query('SELECT COUNT(*) as total FROM messages');
    const [codes] = await pool.query('SELECT COUNT(*) as total FROM invite_codes');
    const [todayMessages] = await pool.query('SELECT COUNT(*) as total FROM messages WHERE DATE(created_at) = CURDATE()');
    const [todayActiveUsers] = await pool.query('SELECT COUNT(DISTINCT user_id) as total FROM messages WHERE DATE(created_at) = CURDATE()');
    const [aiConfigs] = await pool.query('SELECT COUNT(*) as total FROM ai_configs');
    const [publicBots] = await pool.query('SELECT COUNT(*) as total FROM public_bots');

    res.json(ApiResponse.success({
      totalUsers: users[0].total,
      totalRooms: rooms[0].total,
      totalMessages: messages[0].total,
      todayMessages: todayMessages[0].total,
      todayActiveUsers: todayActiveUsers[0].total,
      totalCodes: codes[0].total,
      totalAiConfigs: aiConfigs[0].total,
      totalPublicBots: publicBots[0].total
    }));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
});

// 获取所有用户（分页）
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    const [rows] = await pool.query(`
      SELECT u.*,
        (SELECT COUNT(*) FROM messages WHERE user_id = u.id) as message_count,
        (SELECT COUNT(*) FROM rooms WHERE owner_id = u.id) as room_count
      FROM users u
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [pageSize, offset]);

    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM users');
    const total = countResult[0].total;

    res.json(ApiResponse.success({
      list: rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
});

// 获取用户详情
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [user] = await pool.query(`
      SELECT u.*,
        (SELECT COUNT(*) FROM messages WHERE user_id = u.id) as message_count,
        (SELECT COUNT(*) FROM rooms WHERE owner_id = u.id) as room_count
      FROM users u
      WHERE u.id = ?
    `, [id]);

    if (user.length === 0) {
      return res.status(404).json(ApiResponse.notFound());
    }

    // 获取该用户的消息
    const [recentMessages] = await pool.query(`
      SELECT m.*, r.name as room_name
      FROM messages m
      LEFT JOIN rooms r ON m.room_id = r.id
      WHERE m.user_id = ?
      ORDER BY m.created_at DESC
      LIMIT 20
    `, [id]);

    // 获取该用户拥有的房间
    const [userRooms] = await pool.query('SELECT * FROM rooms WHERE owner_id = ?', [id]);

    res.json(ApiResponse.success({
      ...user[0],
      recentMessages,
      userRooms
    }));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
});

// 获取所有聊天室（分页）
router.get('/rooms', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    const [rows] = await pool.query(`
      SELECT r.*,
        u.username as owner_name,
        (SELECT COUNT(*) FROM messages WHERE room_id = r.id) as message_count,
        (SELECT COUNT(*) FROM room_members WHERE room_id = r.id) as member_count
      FROM rooms r
      LEFT JOIN users u ON r.owner_id = u.id
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [pageSize, offset]);

    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM rooms');
    const total = countResult[0].total;

    res.json(ApiResponse.success({
      list: rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
});

// 获取聊天室详情
router.get('/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [room] = await pool.query(`
      SELECT r.*, u.username as owner_name
      FROM rooms r
      LEFT JOIN users u ON r.owner_id = u.id
      WHERE r.id = ?
    `, [id]);

    if (room.length === 0) {
      return res.status(404).json(ApiResponse.notFound());
    }

    // 获取成员
    const [members] = await pool.query(`
      SELECT rm.*, u.username, u.avatar_url, u.role as user_role
      FROM room_members rm
      LEFT JOIN users u ON rm.user_id = u.id
      WHERE rm.room_id = ?
    `, [id]);

    // 获取最近消息
    const [recentMessages] = await pool.query(`
      SELECT m.*, u.username
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.room_id = ?
      ORDER BY m.created_at DESC
      LIMIT 50
    `, [id]);

    res.json(ApiResponse.success({
      ...room[0],
      members,
      recentMessages
    }));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
});

// 创建官方客服聊天室
router.post('/rooms/official-customer-service', async (req, res) => {
  try {
    const { name = '官方客服群', description = '官方客服，为您解答问题' } = req.body;

    // 检查是否已存在
    const [existing] = await pool.query('SELECT id FROM rooms WHERE name = ? AND type = ?', [name, 'ai_chat']);

    if (existing.length > 0) {
      return res.json(ApiResponse.success(existing[0], '客服聊天室已存在'));
    }

    const [result] = await pool.query(
      'INSERT INTO rooms (name, description, type, owner_id, is_active) VALUES (?, ?, ?, NULL, 1)',
      [name, description, 'ai_chat']
    );

    res.status(201).json(ApiResponse.success({ id: result.insertId, name, description }, '创建成功'));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
});

// 获取最近消息
router.get('/dashboard/messages', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [rows] = await pool.query(`
      SELECT m.*, u.username, r.name as room_name
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      LEFT JOIN rooms r ON m.room_id = r.id
      ORDER BY m.created_at DESC
      LIMIT ?
    `, [limit]);

    res.json(ApiResponse.success(rows));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
});

// 生成邀请码
router.post('/invite_codes/generate', async (req, res) => {
  try {
    const { count = 10, prefix = 'INV' } = req.body;
    const codes = [];

    for (let i = 0; i < count; i++) {
      const code = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const [result] = await pool.query(
        'INSERT INTO invite_codes (code, is_used, created_at) VALUES (?, 0, NOW())',
        [code]
      );
      codes.push({ id: result.insertId, code });
    }

    res.json(ApiResponse.success(codes, '生成成功'));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
});

// 切换邀请码状态
router.put('/invite_codes/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    await pool.query('UPDATE invite_codes SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);

    res.json(ApiResponse.success(null, '更新成功'));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
});

// 测试AI API连接
router.post('/ai_configs/test', async (req, res) => {
  try {
    const { api_base_url, api_key, model_name } = req.body;

    if (!api_base_url || !api_key || !model_name) {
      return res.status(400).json(ApiResponse.error('缺少必要参数'));
    }

    // 去掉末尾的 /chat/completions 等路径，只保留 base URL
    let baseUrl = api_base_url.replace(/\/chat\/completions.*$/, '').replace(/\/$/, '');

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${api_key}`
      },
      body: JSON.stringify({
        model: model_name,
        messages: [{ role: 'user', content: 'hello' }],
        max_tokens: 10
      })
    });

    const data = await response.json();

    if (response.ok) {
      // 隐藏敏感信息，只返回必要字段
      const result = {
        model: data.model,
        response: data.choices?.[0]?.message?.content || '',
        usage: data.usage
      }
      res.json(ApiResponse.success(result, '测试成功'));
    } else {
      res.status(400).json(ApiResponse.error(data.error?.message || '测试失败'));
    }
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
});

// 设置用户额度
router.put('/users/:id/quota', async (req, res) => {
  try {
    const { id } = req.params;
    const { dailyLimit } = req.body;

    const [existing] = await pool.query('SELECT id FROM user_quotas WHERE user_id = ?', [id]);

    if (existing.length > 0) {
      await pool.query('UPDATE user_quotas SET daily_limit = ?, updated_at = NOW() WHERE user_id = ?', [dailyLimit, id]);
    } else {
      await pool.query('INSERT INTO user_quotas (user_id, daily_limit) VALUES (?, ?)', [id, dailyLimit]);
    }

    res.json(ApiResponse.success(null, '设置成功'));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
});

module.exports = router;