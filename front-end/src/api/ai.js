import request from '@/utils/request'

// 获取公开的 AI 配置列表（不包含密钥）
export const getPublicAiConfigs = () => request.get('/ai/configs')

// AI 聊天代理（通过后端代理，不暴露密钥）
export const aiChat = (data) => request.post('/ai/chat', data)
