-- ==========================================
-- 1. 创建并选择数据库 (名称: zydylts)
-- ==========================================
CREATE DATABASE IF NOT EXISTS `zydylts` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `zydylts`;

-- ==========================================
-- 2. 创建表结构
-- ==========================================

-- 1. 用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希值',
  `avatar_url` VARCHAR(255) DEFAULT NULL COMMENT '头像链接',
  `role` ENUM('user', 'admin') DEFAULT 'user' COMMENT '用户角色',
  `community_joined` TINYINT(1) DEFAULT 0 COMMENT '是否已加入社区',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 聊天室/房间表
CREATE TABLE IF NOT EXISTS `rooms` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '房间名称',
  `description` TEXT COMMENT '房间描述',
  `type` ENUM('public', 'private', 'ai_chat') DEFAULT 'public' COMMENT '房间类型',
  `owner_id` INT DEFAULT NULL COMMENT '房主ID',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='聊天室表';

-- 3. 消息表
CREATE TABLE IF NOT EXISTS `messages` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `room_id` INT NOT NULL COMMENT '所属房间ID',
  `user_id` INT DEFAULT NULL COMMENT '发送者ID',
  `content` TEXT NOT NULL COMMENT '消息内容',
  `message_type` ENUM('text', 'image', 'system', 'ai_response') DEFAULT 'text' COMMENT '消息类型',
  `parent_id` BIGINT DEFAULT NULL COMMENT '回复的消息ID',
  `is_deleted` TINYINT(1) DEFAULT 0 COMMENT '是否软删除',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_room_id` (`room_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息记录表';

-- 4. 用户自定义模型配置表
CREATE TABLE IF NOT EXISTS `user_model_configs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '所属用户ID',
  `name` VARCHAR(50) NOT NULL COMMENT '配置名称',
  `api_base_url` VARCHAR(255) NOT NULL COMMENT 'API 基础地址',
  `api_key` VARCHAR(255) NOT NULL COMMENT 'API 密钥',
  `model_name` VARCHAR(100) NOT NULL COMMENT '模型标识',
  `max_context_messages` INT DEFAULT 10 COMMENT '最大上下文消息数',
  `timeout` INT DEFAULT 30 COMMENT '请求超时时间(秒)',
  `is_default` TINYINT(1) DEFAULT 0 COMMENT '是否默认配置',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户自定义AI模型配置表';

-- 5. AI配置表 (房间绑定模型)
CREATE TABLE IF NOT EXISTS `ai_configs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `room_id` INT NOT NULL COMMENT '关联的房间ID',
  `provider` VARCHAR(50) NOT NULL COMMENT 'AI提供商',
  `api_base_url` VARCHAR(255) NOT NULL COMMENT 'API地址',
  `api_key` VARCHAR(255) NOT NULL COMMENT 'API密钥',
  `model_name` VARCHAR(50) NOT NULL COMMENT '模型名称',
  `system_prompt` TEXT COMMENT '系统预设提示词',
  `max_tokens` INT DEFAULT 2048 COMMENT '最大输出Token数',
  `temperature` DECIMAL(3,2) DEFAULT 0.7 COMMENT '温度参数',
  `config_type` ENUM('system', 'user_custom') DEFAULT 'system' COMMENT '配置类型',
  `is_public` TINYINT(1) DEFAULT 0 COMMENT '是否公开给用户使用',
  `user_id` INT DEFAULT NULL COMMENT '关联用户ID',
  `custom_config_id` INT DEFAULT NULL COMMENT '关联自定义配置ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_room_id` (`room_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI模型配置表';

-- 6. AI调用日志表
CREATE TABLE IF NOT EXISTS `ai_logs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `message_id` BIGINT NOT NULL COMMENT '关联的消息ID',
  `request_body` TEXT COMMENT '请求体',
  `response_body` TEXT COMMENT '响应体',
  `prompt_tokens` INT DEFAULT 0 COMMENT '输入Token',
  `completion_tokens` INT DEFAULT 0 COMMENT '输出Token',
  `total_tokens` INT DEFAULT 0 COMMENT '总Token',
  `status_code` INT DEFAULT 200 COMMENT 'API状态码',
  `error_message` TEXT COMMENT '错误详情',
  `latency_ms` INT DEFAULT 0 COMMENT '耗时(ms)',
  `cost_amount` DECIMAL(10, 6) DEFAULT 0.000000 COMMENT '预估费用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_message_id` (`message_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI调用日志表';

-- 7. 会话上下文表
CREATE TABLE IF NOT EXISTS `ai_sessions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `room_id` INT NOT NULL COMMENT '房间ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `config_id` INT DEFAULT NULL COMMENT '使用的AI配置ID',
  `title` VARCHAR(100) DEFAULT '新对话' COMMENT '会话标题',
  `context_window` INT DEFAULT 10 COMMENT '上下文窗口大小',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否活跃',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_room_user` (`room_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI会话上下文管理表';

-- 8. 知识库表
CREATE TABLE IF NOT EXISTS `knowledge_bases` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '上传者ID',
  `name` VARCHAR(100) NOT NULL COMMENT '知识库名称',
  `content_type` ENUM('text', 'url', 'file') NOT NULL COMMENT '内容类型',
  `content_value` TEXT NOT NULL COMMENT '内容',
  `status` ENUM('processing', 'ready', 'error') DEFAULT 'processing' COMMENT '处理状态',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户知识库表';

-- 9. 用户额度表
CREATE TABLE IF NOT EXISTS `user_quotas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `daily_limit` INT DEFAULT 50 COMMENT '每日限制',
  `used_today` INT DEFAULT 0 COMMENT '今日已用',
  `reset_at` DATE DEFAULT NULL COMMENT '重置日期',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户调用额度表';

-- 10. 邀请码表
CREATE TABLE IF NOT EXISTS `invite_codes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL COMMENT '邀请码',
  `type` ENUM('register', 'room') DEFAULT 'register' COMMENT '类型：注册/房间邀请',
  `creator_id` INT DEFAULT NULL COMMENT '创建者ID',
  `room_id` INT DEFAULT NULL COMMENT '关联房间ID（房间邀请时使用）',
  `used_by` INT DEFAULT NULL COMMENT '使用者ID',
  `used_at` TIMESTAMP NULL DEFAULT NULL COMMENT '使用时间',
  `expires_at` TIMESTAMP NULL DEFAULT NULL COMMENT '过期时间',
  `max_uses` INT DEFAULT 1 COMMENT '最大使用次数',
  `used_count` INT DEFAULT 0 COMMENT '已使用次数',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_creator_id` (`creator_id`),
  KEY `idx_room_id` (`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='邀请码表';

-- 11. 房间成员表（多对多关系）
CREATE TABLE IF NOT EXISTS `room_members` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `room_id` INT NOT NULL COMMENT '房间ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `role` ENUM('owner', 'admin', 'member') DEFAULT 'member' COMMENT '角色',
  `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_room_user` (`room_id`, `user_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='房间成员表';

-- 12. 公开机器人表（用户公开的机器人）
CREATE TABLE IF NOT EXISTS `public_bots` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '所属用户ID',
  `name` VARCHAR(50) NOT NULL COMMENT '机器人名称',
  `config_id` INT NOT NULL COMMENT '关联的AI配置ID',
  `model_name` VARCHAR(100) NOT NULL COMMENT '模型名称',
  `personality` TEXT COMMENT '性格设定',
  `welcome_msg` TEXT COMMENT '开场白',
  `usage_count` INT DEFAULT 0 COMMENT '被使用次数',
  `is_official` TINYINT(1) DEFAULT 0 COMMENT '是否官方机器人',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_usage_count` (`usage_count` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公开机器人表';

-- ==========================================
-- 3. 初始化数据
-- ==========================================

-- 初始化管理员账户 (密码: admin123)
INSERT IGNORE INTO `users` (`username`, `password_hash`, `role`) VALUES
('admin', '$2a$10$YourHashHere', 'admin');

-- 初始化默认邀请码
INSERT IGNORE INTO `invite_codes` (`code`, `type`, `max_uses`, `expires_at`) VALUES
('ADMIN2024', 'register', 100, DATE_ADD(NOW(), INTERVAL 1 YEAR)),
('WELCOME', 'register', 1000, DATE_ADD(NOW(), INTERVAL 1 YEAR));