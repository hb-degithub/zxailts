import request from '@/utils/request'

export const generateCodes = (data) => request.post('/invite_codes/generate', data)
export const getCodes = (params) => request.get('/invite_codes', { params })
export const deleteCode = (id) => request.delete(`/invite_codes/${id}`)
export const toggleCode = (id, isActive) => request.put(`/invite_codes/${id}/toggle`, { isActive })
