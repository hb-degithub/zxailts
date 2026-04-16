# 专业引导聊天室

> 学校个人项目

一个基于 Vue3 + Express + MySQL 的实时聊天室系统，支持 AI 机器人对话。

## 功能特性

- 💬 多人实时聊天
- 🤖 AI 机器人助手（支持自定义机器人）
- 🌐 公共聊天室、AI讨论区、官方客服群、综合讨论
- 🔐 邀请码注册系统
- 👤 个人中心（头像上传）
- 📊 管理后台（用户、房间、消息统计）
- 📦 Docker 一键部署

## 技术栈

**前端**
- Vue 3
- Element Plus
- Pinia
- Vue Router

**后端**
- Express.js
- MySQL
- RESTful API

## 快速部署

### Docker 部署（推荐）

```bash
git clone https://github.com/hb-degithub/zxailts.git
cd zxailts
docker-compose up -d
```

访问 http://服务器IP:10086

### 手动部署

**后端**
```bash
cd back-end
npm install
node app.js
```

**前端**
```bash
cd front-end
npm install
npm run build
```

## 在线更新

```bash
curl -X POST http://服务器IP:10020/api/deploy \
  -H "Content-Type: application/json" \
  -d '{"secret":"你的密钥","action":"build"}'
```

## 端口说明

| 服务 | 端口 |
|------|------|
| 前端 | 10086 |
| 管理后台 | 10010 |
| 后端 API | 10020 |
| MySQL | 3306 |

## 许可证

MIT
