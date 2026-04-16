import request from '@/utils/request'

export const getMessages = (params) => request.get('/messages', { params })
export const getMessage = (id) => request.get(`/messages/${id}`)
export const createMessage = (data) => request.post('/messages', data)
export const updateMessage = (id, data) => request.put(`/messages/${id}`, data)
export const deleteMessage = (id) => request.delete(`/messages/${id}`)
