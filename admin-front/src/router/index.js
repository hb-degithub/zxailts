import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import UserManage from '@/views/UserManage.vue'
import InviteCodes from '@/views/InviteCodes.vue'
import ModelConfig from '@/views/ModelConfig.vue'
import Layout from '@/views/Layout.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'users', name: 'UserManage', component: UserManage },
      { path: 'invite-codes', name: 'InviteCodes', component: InviteCodes },
      { path: 'model-config', name: 'ModelConfig', component: ModelConfig }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
