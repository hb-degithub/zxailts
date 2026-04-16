<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2>专业导引聊天室</h2>
        <div class="mode-tabs">
          <div
            :class="['mode-tab', { active: !isRegister }]"
            @click="isRegister = false"
          >
            登录
          </div>
          <div
            :class="['mode-tab', { active: isRegister }]"
            @click="isRegister = true"
          >
            注册
          </div>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item v-if="isRegister" label="邀请码" prop="inviteCode">
          <el-input v-model="form.inviteCode" placeholder="请输入邀请码" />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleSubmit"
            style="width: 100%"
          >
            {{ isRegister ? '注册' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { validateInviteCode, useInviteCode } from '@/api/inviteCodes'
import { login as userLogin, register as userRegister } from '@/api/auth'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)
const isRegister = ref(false)

const form = reactive({
  username: '',
  password: '',
  inviteCode: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  inviteCode: [{ required: true, message: '请输入邀请码', trigger: 'blur' }]
}

const handleSubmit = async () => {
  await formRef.value.validate()

  loading.value = true
  try {
    if (isRegister.value) {
      // 验证邀请码
      try {
        const validateRes = await validateInviteCode(form.inviteCode)
        if (!validateRes.data?.valid) {
          ElMessage.error('邀请码无效')
          loading.value = false
          return
        }
      } catch (e) {
        ElMessage.error('邀请码无效或已过期')
        loading.value = false
        return
      }

      // 注册用户
      const res = await userRegister({
        username: form.username,
        password: form.password
      })

      if (res.data?.id) {
        // 使用邀请码
        try {
          await useInviteCode(form.inviteCode, res.data.id)
        } catch (e) {
          console.error('使用邀请码失败', e)
        }
      }

      ElMessage.success('注册成功，请登录')
      isRegister.value = false
      form.password = ''
      form.inviteCode = ''
    } else {
      // 登录
      const res = await userLogin({
        username: form.username,
        password: form.password
      })

      if (res.data?.token) {
        userStore.setUser(res.data.user)
        userStore.setToken(res.data.token)
        ElMessage.success('登录成功')
        router.push('/home')
      } else {
        ElMessage.error('登录失败')
      }
    }
  } catch (error) {
    ElMessage.error(isRegister.value ? '注册失败，用户名可能已存在' : '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 50%);
  animation: pulse 15s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

.login-card {
  width: 420px;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  position: relative;
  z-index: 1;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

:deep(.el-card__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px 20px;
  border: none;
}

h2 {
  text-align: center;
  margin: 0 0 20px 0;
  color: #fff;
  font-size: 26px;
  font-weight: 600;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
  letter-spacing: 2px;
}

.mode-tabs {
  display: flex;
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
  padding: 4px;
}

.mode-tab {
  flex: 1;
  padding: 10px 20px;
  text-align: center;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 15px;
  color: rgba(255,255,255,0.8);
  font-weight: 500;
}

.mode-tab.active {
  background: #fff;
  color: #667eea;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.mode-tab:hover:not(.active) {
  color: #fff;
  background: rgba(255,255,255,0.1);
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
}

:deep(.el-input__wrapper) {
  border-radius: 10px;
  padding: 12px 15px;
  box-shadow: 0 0 0 1px #e0e0e0 inset;
  transition: all 0.3s;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #667eea inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #667eea inset;
}

:deep(.el-button--primary) {
  border-radius: 10px;
  padding: 14px 30px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}
</style>
