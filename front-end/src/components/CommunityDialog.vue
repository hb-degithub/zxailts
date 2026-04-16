<template>
  <el-dialog
    v-model="visible"
    title=""
    width="580px"
    align-center
    class="community-dialog"
    destroy-on-close
  >
    <template #header>
      <div class="community-header">
        <div class="community-icon">🏘️</div>
        <div class="community-title">
          <h2>聊天社区</h2>
          <p>加入我们的社区，与其他用户交流</p>
        </div>
      </div>
    </template>

    <div class="community-content">
      <!-- 社区数据 -->
      <div class="community-stats">
        <div class="stat-item">
          <span class="stat-value">{{ stats.members }}</span>
          <span class="stat-label">成员</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.joined }}</span>
          <span class="stat-label">已加入</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.messagesToday }}</span>
          <span class="stat-label">今日消息</span>
        </div>
      </div>

      <!-- 福利 -->
      <div class="community-benefits">
        <h4>社区福利</h4>
        <div class="benefits-grid">
          <div class="benefit-item">
            <span class="benefit-icon">💬</span>
            <span class="benefit-text">交流心得</span>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">🎯</span>
            <span class="benefit-text">获取帮助</span>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">🆕</span>
            <span class="benefit-text">最新资讯</span>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">🎉</span>
            <span class="benefit-text">参与活动</span>
          </div>
        </div>
      </div>

      <!-- 频道 -->
      <div class="community-channels">
        <h4>热门频道</h4>
        <div class="channels-list">
          <div class="channel-item">
            <span class="channel-icon">📢</span>
            <div class="channel-info">
              <strong>官方公告</strong>
              <p>功能更新、活动公告</p>
            </div>
            <el-tag type="success" size="small">官方</el-tag>
          </div>
          <div class="channel-item">
            <span class="channel-icon">💬</span>
            <div class="channel-info">
              <strong>综合讨论</strong>
              <p>日常聊天、问题反馈</p>
            </div>
            <el-tag size="small">推荐</el-tag>
          </div>
          <div class="channel-item">
            <span class="channel-icon">🤖</span>
            <div class="channel-info">
              <strong>AI 技巧</strong>
              <p>使用技巧分享</p>
            </div>
            <el-tag type="warning" size="small">热门</el-tag>
          </div>
          <div class="channel-item">
            <span class="channel-icon">🐛</span>
            <div class="channel-info">
              <strong>反馈建议</strong>
              <p>Bug 反馈、功能建议</p>
            </div>
            <el-tag type="info" size="small">反馈</el-tag>
          </div>
        </div>
      </div>

      <!-- 加入方式 -->
      <div class="join-section">
        <h4>快速加入</h4>
        <div class="join-card">
          <div class="join-qr">
            <div class="qr-box">📱</div>
            <p>扫码加入</p>
          </div>
          <div class="join-links">
            <div class="join-link-item">
              <span class="link-icon">💁</span>
              <span class="link-name">官方客服群</span>
              <el-button size="small" type="primary" plain @click="goToCustomerService">进入</el-button>
            </div>
            <div class="join-link-item">
              <span class="link-icon">🌐</span>
              <span class="link-name">作者网站</span>
              <el-button size="small" type="primary" plain @click="handleVisitWebsite">访问</el-button>
            </div>
            <div class="join-link-item">
              <span class="link-icon">📧</span>
              <span class="link-name">意见反馈</span>
              <el-button size="small" type="primary" plain @click="handleFeedback">反馈</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 规范 -->
      <div class="community-rules">
        <h4>社区规范</h4>
        <div class="rules-row">
          <div class="rule-box allowed">
            <strong>✅ 鼓励</strong>
            <p>友善交流、分享经验</p>
          </div>
          <div class="rule-box prohibited">
            <strong>❌ 禁止</strong>
            <p>人身攻击、垃圾广告</p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">稍后再说</el-button>
        <el-button type="primary" @click="handleJoin">立即加入</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getCommunityStats, joinCommunity } from '@/api/users'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'enterRoom'])
const userStore = useUserStore()

const visible = ref(false)
const stats = ref({
  members: 0,
  joined: 0,
  messagesToday: 0
})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    fetchStats()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

onMounted(() => {
  fetchStats()
})

const fetchStats = async () => {
  try {
    const res = await getCommunityStats()
    stats.value = res.data || { members: 0, joined: 0, messagesToday: 0 }
  } catch (error) {
    console.error('获取社区统计失败', error)
    stats.value = { members: 0, joined: 0, messagesToday: 0 }
  }
}

const handleJoin = async () => {
  if (!userStore.userInfo?.id) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    await joinCommunity(userStore.userInfo.id)
    userStore.setUser({
      ...userStore.userInfo,
      community_joined: true
    })
    ElMessage.success('恭喜您已成功加入社区！')
    visible.value = false
  } catch (error) {
    ElMessage.error('加入社区失败，请重试')
  }
}

const handleVisitWebsite = () => {
  window.open('https://hlydwz.com', '_blank')
}

const goToCustomerService = () => {
  visible.value = false
  emit('enterRoom', '官方客服群')
}

const handleFeedback = () => {
  ElMessage.info('反馈功能：请通过作者网站联系我们')
  window.open('https://hlydwz.com', '_blank')
}
</script>

<style scoped>
:deep(.community-dialog .el-dialog) {
  border-radius: 20px;
}

:deep(.community-dialog .el-dialog__header) {
  padding: 20px 24px 0;
  margin-right: 0;
}

:deep(.community-dialog .el-dialog__body) {
  padding: 0 24px 16px;
}

:deep(.community-dialog .el-dialog__footer) {
  padding: 12px 24px 20px;
}

.community-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.community-icon {
  font-size: 40px;
}

.community-title h2 {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.community-title p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.community-content {
  max-height: 60vh;
  overflow-y: auto;
}

.community-stats {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 16px;
  margin-bottom: 20px;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 12px;
  color: rgba(255,255,255,0.8);
}

.community-benefits {
  margin-bottom: 20px;
}

.community-benefits h4,
.community-channels h4,
.join-section h4,
.community-rules h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.benefits-grid {
  display: flex;
  gap: 10px;
}

.benefit-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
  background: #f8fafc;
  border-radius: 12px;
  text-align: center;
}

.benefit-icon {
  font-size: 24px;
}

.benefit-text {
  font-size: 12px;
  color: #475569;
}

.channels-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.channel-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #f8fafc;
  border-radius: 10px;
  transition: all 0.2s;
}

.channel-item:hover {
  background: #f1f5f9;
}

.channel-icon {
  font-size: 22px;
}

.channel-info {
  flex: 1;
}

.channel-info strong {
  display: block;
  font-size: 14px;
  color: #334155;
}

.channel-info p {
  margin: 2px 0 0;
  font-size: 12px;
  color: #94a3b8;
}

.join-card {
  display: flex;
  gap: 20px;
  padding: 18px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 14px;
  margin-bottom: 20px;
}

.join-qr {
  text-align: center;
  flex-shrink: 0;
}

.qr-box {
  width: 80px;
  height: 80px;
  background: #fff;
  border: 2px dashed #cbd5e1;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin-bottom: 8px;
}

.join-qr p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

.join-links {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.join-link-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #fff;
  border-radius: 8px;
}

.link-icon {
  font-size: 18px;
}

.link-name {
  flex: 1;
  font-size: 13px;
  color: #475569;
}

.rules-row {
  display: flex;
  gap: 12px;
}

.rule-box {
  flex: 1;
  padding: 12px 14px;
  border-radius: 10px;
}

.rule-box.allowed {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 1px solid #bbf7d0;
}

.rule-box.prohibited {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border: 1px solid #fecaca;
}

.rule-box strong {
  display: block;
  font-size: 13px;
  color: #334155;
  margin-bottom: 4px;
}

.rule-box p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.dialog-footer .el-button--primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
}

.dialog-footer .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>