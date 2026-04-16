const express = require('express');
const router = express.Router();
const pool = require('../config/dbconfig');
const ApiResponse = require('../utils/response');

// OpenAI 兼容的聊天补全接口
// POST /api/chat/completions
router.post('/chat/completions', async (req, res) => {
  try {
    const { messages, model, temperature = 0.7, max_tokens = 2048 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: {
          message: 'messages is required and must be an array',
          type: 'invalid_request_error'
        }
      });
    }

    // 获取最后一条用户消息
    const userMessage = [...messages].reverse().find(m => m.role === 'user');
    const content = userMessage?.content || '';

    // 查找该房间的 AI 配置
    // 这里简化处理，实际应该根据 room_id 或 user_id 查找对应配置
    const [aiConfigs] = await pool.query(
      'SELECT * FROM ai_configs WHERE config_type = "system" LIMIT 1'
    );

    let aiResponse = '您好！我是 AI 助手。'; // 默认回复

    // 如果配置了 AI，则构造请求体并调用外部 AI API
    if (aiConfigs.length > 0) {
      const config = aiConfigs[0];
      try {
        const response = await fetch(`${config.api_base_url}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.api_key}`
          },
          body: JSON.stringify({
            model: model || config.model_name,
            messages: messages,
            temperature: parseFloat(temperature),
            max_tokens: parseInt(max_tokens)
          })
        });

        if (response.ok) {
          const data = await response.json();
          aiResponse = data.choices?.[0]?.message?.content || aiResponse;

          // 记录 AI 调用日志
          await pool.query(
            `INSERT INTO ai_logs (message_id, request_body, response_body, total_tokens, status_code, latency_ms)
             VALUES (0, ?, ?, ?, ?, ?)`,
            [
              JSON.stringify({ messages, model, temperature, max_tokens }),
              JSON.stringify(data),
              data.usage?.total_tokens || 0,
              response.status,
              Date.now()
            ]
          );
        }
      } catch (apiError) {
        console.error('AI API call failed:', apiError);
        aiResponse = '抱歉，AI 服务暂时不可用。';
      }
    }

    // 返回 OpenAI 兼容格式
    res.json({
      id: 'chatcmpl-' + Date.now(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model || 'default-model',
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
    });
  } catch (error) {
    console.error('Chat completion error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        type: 'server_error'
      }
    });
  }
});

// 获取模型列表
router.get('/models', async (req, res) => {
  try {
    const [configs] = await pool.query(
      'SELECT DISTINCT model_name, provider FROM ai_configs'
    );

    const models = configs.map(c => ({
      id: c.model_name,
      object: 'model',
      created: Math.floor(Date.now() / 1000),
      owned_by: c.provider,
      model: c.model_name
    }));

    res.json({
      object: 'list',
      data: models
    });
  } catch (error) {
    console.error('List models error:', error);
    res.status(500).json({ error: { message: 'Failed to list models' } });
  }
});

module.exports = router;
