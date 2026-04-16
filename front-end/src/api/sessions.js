import request from '@/utils/request'

export const getSessions = (params) => request.get('/ai_sessions', { params })
export const getSession = (id) => request.get(`/ai_sessions/${id}`)
export const createSession = (data) => request.post('/ai_sessions', data)
export const updateSession = (id, data) => request.put(`/ai_sessions/${id}`, data)
export const deleteSession = (id) => request.delete(`/ai_sessions/${id}`)
