import request from '@/utils/request'

export const getAiConfigs = (params) => request.get('/ai_configs', { params })
export const getAiConfig = (id) => request.get(`/ai_configs/${id}`)
export const createAiConfig = (data) => request.post('/ai_configs', data)
export const updateAiConfig = (id, data) => request.put(`/ai_configs/${id}`, data)
export const deleteAiConfig = (id) => request.delete(`/ai_configs/${id}`)
