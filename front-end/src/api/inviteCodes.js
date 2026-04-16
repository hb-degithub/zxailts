import request from '@/utils/request'

// 验证邀请码
export const validateInviteCode = (code) => request.post('/invite-codes/validate', { code })

// 使用邀请码
export const useInviteCode = (code, userId) => request.post('/invite-codes/use', { code, userId })

// 生成邀请码（管理员）
export const generateInviteCode = (data) => request.post('/invite-codes/generate', data)

// 获取邀请码列表（管理员）
export const getInviteCodes = (params) => request.get('/invite-codes', { params })

// 删除邀请码（管理员）
export const deleteInviteCode = (id) => request.delete(`/invite-codes/${id}`)