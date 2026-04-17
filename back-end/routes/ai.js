const express = require('express');
const router = express.Router();
const pool = require('../config/dbconfig');
const ApiResponse = require('../utils/response');

// AI 聊天代理接口 - 隐藏 API 密钥
// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { config_id, messages, temperature = 0.7, max_tokens = 2048 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json(ApiResponse.error('messages 参数无效'));
    }

    let aiResponse = '抱歉，AI 服务暂时不可用。';

    if (config_id) {
      // 根据 config_id 获取配置
      const [configs] = await pool.query(
        'SELECT * FROM ai_configs WHERE id = ? AND is_public = 1',
        [config_id]
      );

      if (configs.length === 0) {
        return res.status(404).json(ApiResponse.error('AI 配置不存在或未公开'));
      }

      const config = configs[0];

      // 如果有 system_prompt，添加到消息列表开头
      const fullMessages = [];
      if (config.system_prompt) {
        fullMessages.push({ role: 'system', content: config.system_prompt });
      }
      fullMessages.push(...messages);

      try {
        // 构建中转站请求
        const requestBody = {
          model: config.model_name,
          messages: fullMessages,
          temperature: parseFloat(temperature),
          max_tokens: parseInt(max_tokens)
        };

        const response = await fetch(`${config.api_base_url}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.api_key}`
          },
          body: JSON.stringify(requestBody)
        });

        if (response.ok) {
          const data = await response.json();
          aiResponse = data.choices?.[0]?.message?.content || aiResponse;

          // 记录调用日志
          await pool.query(
            `INSERT INTO ai_logs (message_id, request_body, response_body, total_tokens, status_code, latency_ms)
             VALUES (0, ?, ?, ?, ?, ?)`,
            [
              JSON.stringify(requestBody),
              JSON.stringify(data),
              data.usage?.total_tokens || 0,
              response.status,
              Date.now()
            ]
          );
        } else {
          console.error('AI API error:', response.status, await response.text());
        }
      } catch (apiError) {
        console.error('AI API call failed:', apiError);
      }
    }

    res.json(ApiResponse.success({
      id: 'chatcmpl-' + Date.now(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'ai-config',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: aiResponse
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: aiResponse.length,
        total_tokens: aiResponse.length
      }
    }));
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json(ApiResponse.error(error.message || 'AI 服务错误'));
  }
});

// 获取公开的 AI 配置列表（不包含密钥）
// GET /api/ai/configs
router.get('/configs', async (req, res) => {
  try {
    const [configs] = await pool.query(
      `SELECT id, room_id, provider, model_name, system_prompt, max_tokens, temperature, is_public
       FROM ai_configs WHERE is_public = 1`
    );

    res.json(ApiResponse.success(configs));
  } catch (error) {
    console.error('List AI configs error:', error);
    res.status(500).json(ApiResponse.error(error.message || '查询失败'));
  }
});

module.exports = router;
