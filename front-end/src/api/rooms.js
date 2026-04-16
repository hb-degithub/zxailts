import request from '@/utils/request'

export const getRooms = (params) => request.get('/rooms', { params })
export const getRoom = (id) => request.get(`/rooms/${id}`)
export const createRoom = (data) => request.post('/rooms', data)
export const updateRoom = (id, data) => request.put(`/rooms/${id}`, data)
export const deleteRoom = (id) => request.delete(`/rooms/${id}`)

// 房间成员
export const getRoomMembers = (roomId) => request.get(`/rooms/${roomId}/members`)
export const addRoomMember = (roomId, data) => request.post(`/rooms/${roomId}/members`, data)
export const removeRoomMember = (roomId, userId) => request.delete(`/rooms/${roomId}/members/${userId}`)

// 公开机器人
export const getPublicBots = () => request.get('/public-bots')
export const getMyPublicBots = (userId) => request.get('/public-bots/my', { params: { userId } })
export const publishBot = (data) => request.post('/public-bots', data)
export const unpublishBot = (id) => request.delete(`/public-bots/${id}`)
export const usePublicBot = (id) => request.post(`/public-bots/${id}/use`)
