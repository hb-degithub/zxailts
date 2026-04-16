import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAdminStore = defineStore('admin', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('admin_user') || 'null'))

  const setToken = (t) => {
    token.value = t
    localStorage.setItem('admin_token', t)
  }

  const setUser = (u) => {
    userInfo.value = u
    localStorage.setItem('admin_user', JSON.stringify(u))
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
  }

  return { token, userInfo, setToken, setUser, logout }
})
