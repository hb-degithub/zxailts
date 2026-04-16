import request from '@/utils/request'

export const getStats = () => request.get('/dashboard/stats')
export const getRecentMessages = (limit) => request.get('/dashboard/messages', { params: { limit } })
export const getUsers = (params) => request.get('/users', { params })
export const getUser = (id) => request.get(`/users/${id}`)
export const getRooms = (params) => request.get('/rooms', { params })
export const getRoom = (id) => request.get(`/rooms/${id}`)
export const createOfficialCustomerService = (data) => request.post('/rooms/official-customer-service', data)
