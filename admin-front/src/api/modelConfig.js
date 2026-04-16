import request from '@/utils/request'

export const getModelConfigs = (params) => request.get('/ai_configs', { params })
export const getModelConfig = (id) => request.get(`/ai_configs/${id}`)
export const updateModelConfig = (id, data) => request.put(`/ai_configs/${id}`, data)
export const createModelConfig = (data) => request.post('/ai_configs', data)
export const deleteModelConfig = (id) => request.delete(`/ai_configs/${id}`)
export const testModelConfig = (data) => request.post('/ai_configs/test', data)