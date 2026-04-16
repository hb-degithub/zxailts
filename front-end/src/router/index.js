import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Home from '@/views/Home.vue'
import ChatRoom from '@/views/ChatRoom.vue'
import ModelConfig from '@/views/ModelConfig.vue'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/chat',
    name: 'ChatRoom',
    component: ChatRoom
  },
  {
    path: '/config',
    name: 'ModelConfig',
    component: ModelConfig
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
