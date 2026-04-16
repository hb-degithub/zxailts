import request from '@/utils/request'

export const getModelConfigs = (params) => request.get('/user_model_configs', { params })
export const getModelConfig = (id) => request.get(`/user_model_configs/${id}`)
export const createModelConfig = (data) => request.post('/user_model_configs', data)
export const updateModelConfig = (id, data) => request.put(`/user_model_configs/${id}`, data)
export const deleteModelConfig = (id) => request.delete(`/user_model_configs/${id}`)
