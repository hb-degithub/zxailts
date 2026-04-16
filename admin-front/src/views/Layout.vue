<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <h3>管理后台</h3>
      </div>
      <el-menu :default-active="$route.path" router class="sidebar-menu">
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/invite-codes">
          <el-icon><Tickets /></el-icon>
          <span>邀请码</span>
        </el-menu-item>
        <el-menu-item index="/model-config">
          <el-icon><Cpu /></el-icon>
          <span>模型配置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <span class="title">{{ $route.meta.title || '管理后台' }}</span>
        <div class="user-info">
          <span>{{ adminStore.userInfo?.username }}</span>
          <el-button type="danger" size="small" @click="handleLogout">退出</el-button>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'

const router = useRouter()
const adminStore = useAdminStore()

const handleLogout = () => {
  adminStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout-container { height: 100vh; }
.sidebar {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  box-shadow: 4px 0 20px rgba(0,0,0,0.15);
}
.logo {
  padding: 24px 20px;
  color: #fff;
  text-align: center;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.logo h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.sidebar-menu {
  border: none;
  background: transparent;
  padding: 12px 8px;
}
.sidebar-menu :deep(.el-menu-item) {
  color: rgba(255,255,255,0.7);
  border-radius: 10px;
  margin: 4px 0;
  padding-left: 20px !important;
}
.sidebar-menu :deep(.el-menu-item:hover) {
  background: rgba(255,255,255,0.08);
  color: #fff;
}
.sidebar-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}
.sidebar-menu :deep(.el-icon) {
  margin-right: 10px;
}
.header {
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 0 24px;
}
.title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}
.user-info span {
  font-weight: 500;
  color: #334155;
}
.main-content {
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
}
</style>
