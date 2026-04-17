import request from '@/utils/request'

// 获取公开的 AI 配置列表（不包含密钥）- 用户端使用
export const getAiConfigs = (params) => request.get('/ai/configs', { params })

// 以下是管理员使用的接口
export const getAiConfig = (id) => request.get(`/ai_configs/${id}`)
export const createAiConfig = (data) => request.post('/ai_configs', data)
export const updateAiConfig = (id, data) => request.put(`/ai_configs/${id}`, data)
export const deleteAiConfig = (id) => request.delete(`/ai_configs/${id}`)
