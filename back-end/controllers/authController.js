const pool = require('../config/dbconfig');
const ApiResponse = require('../utils/response');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'admin-secret-key-change-in-production';

const authController = {
  // POST /auth/login - 支持普通用户和管理员登录
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json(ApiResponse.error('请输入用户名和密码'));
      }

      const [users] = await pool.query(
        'SELECT id, username, password_hash, role, avatar_url FROM users WHERE username = ?',
        [username]
      );

      if (users.length === 0) {
        return res.status(401).json(ApiResponse.error('用户不存在'));
      }

      const user = users[0];

      // 使用bcrypt验证密码
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json(ApiResponse.error('密码错误'));
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json(ApiResponse.success({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          avatar_url: user.avatar_url,
          community_joined: user.community_joined || false
        }
      }, '登录成功'));
    } catch (error) {
      console.error('login error:', error);
      res.status(500).json(ApiResponse.error(error.message || '登录失败'));
    }
  },

  // GET /auth/verify
  async verify(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json(ApiResponse.error('未提供token'));
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      res.json(ApiResponse.success(decoded));
    } catch (error) {
      res.status(401).json(ApiResponse.error('token无效'));
    }
  },

  // POST /auth/register - 用户注册
  async register(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json(ApiResponse.error('用户名和密码不能为空'));
      }

      if (username.length < 3 || username.length > 50) {
        return res.status(400).json(ApiResponse.error('用户名长度为3-50个字符'));
      }

      if (password.length < 6) {
        return res.status(400).json(ApiResponse.error('密码至少6位'));
      }

      // 检查用户是否已存在
      const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
      if (existing.length > 0) {
        return res.status(400).json(ApiResponse.error('用户名已存在'));
      }

      // 哈希密码
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // 创建用户，默认角色为 user
      const [result] = await pool.query(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
        [username, password_hash, 'user']
      );

      const [newUser] = await pool.query('SELECT id, username, role, avatar_url, created_at FROM users WHERE id = ?', [result.insertId]);

      res.status(201).json(ApiResponse.success(newUser[0], '注册成功'));
    } catch (error) {
      console.error('register error:', error);
      res.status(500).json(ApiResponse.error(error.message || '注册失败'));
    }
  }
};

module.exports = authController;