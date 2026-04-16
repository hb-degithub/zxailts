const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

module.exports = async (req, res) => {
  const { action, secret } = req.body;

  // 简单的密钥验证
  const DEPLOY_SECRET = process.env.DEPLOY_SECRET || 'your-secret-key';

  if (secret !== DEPLOY_SECRET) {
    return res.status(403).json({ code: 403, message: '授权失败', data: null });
  }

  const deployDir = process.env.DEPLOY_DIR || '/opt/chatroom';

  if (action === 'pull') {
    // 从 git 拉取最新代码
    exec('cd ' + deployDir + ' && git pull origin main', (err, stdout, stderr) => {
      if (err) {
        return res.json({ code: 500, message: '拉取失败: ' + stderr, data: null });
      }
      res.json({ code: 200, message: '代码已更新', data: stdout });
    });
  } else if (action === 'build') {
    // 重新构建并启动容器
    exec('cd ' + deployDir + ' && docker-compose build --no-cache && docker-compose up -d', (err, stdout, stderr) => {
      if (err) {
        return res.json({ code: 500, message: '构建失败: ' + stderr, data: null });
      }
      res.json({ code: 200, message: '构建并启动成功', data: stdout });
    });
  } else if (action === 'restart') {
    // 重启容器
    exec('cd ' + deployDir + ' && docker-compose restart', (err, stdout, stderr) => {
      if (err) {
        return res.json({ code: 500, message: '重启失败: ' + stderr, data: null });
      }
      res.json({ code: 200, message: '重启成功', data: stdout });
    });
  } else if (action === 'status') {
    // 查看容器状态
    exec('cd ' + deployDir + ' && docker-compose ps', (err, stdout, stderr) => {
      if (err) {
        return res.json({ code: 500, message: '状态查询失败', data: null });
      }
      res.json({ code: 200, message: '状态查询成功', data: stdout });
    });
  } else if (action === 'logs') {
    // 查看日志
    const service = req.body.service || 'backend';
    exec('cd ' + deployDir + ' && docker-compose logs --tail=100 ' + service, (err, stdout, stderr) => {
      if (err) {
        return res.json({ code: 500, message: '日志查询失败', data: null });
      }
      res.json({ code: 200, message: '日志查询成功', data: stdout });
    });
  } else {
    res.json({ code: 400, message: '未知操作', data: null });
  }
};
