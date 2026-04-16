import request from '@/utils/request'

// 管理员登录
export const login = (data) => request.post('/auth/login', data)

// 用户注册
export const register = (data) => request.post('/auth/register', data)

// 验证token
export const verifyToken = () => request.get('/auth/verify')