import request from '@/utils/request'

export const getUsers = (params) => request.get('/users', { params })
export const getUser = (id) => request.get(`/users/${id}`)
export const updateUser = (id, data) => request.put(`/users/${id}`, data)
export const deleteUser = (id) => request.delete(`/users/${id}`)
export const setUserQuota = (id, data) => request.put(`/users/${id}/quota`, data)
