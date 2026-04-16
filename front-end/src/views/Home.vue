<template>
  <div class="home-container">
    <!-- 顶部导航 -->
    <header class="home-header">
      <div class="header-brand">
        <span class="brand-icon">💬</span>
        <div class="brand-text">
          <h1>专业导引聊天室</h1>
          <p>AI 智能聊天社区平台</p>
        </div>
      </div>
      <div class="header-actions">
        <el-dropdown @command="handleCommand">
          <div class="user-info">
            <el-avatar :size="36" :src="userStore.userInfo?.avatar_url">
              {{ userStore.userInfo?.username?.[0] || 'U' }}
            </el-avatar>
            <span class="username">{{ userStore.userInfo?.username }}</span>
            <el-icon class="arrow"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="config">AI 配置</el-dropdown-item>
              <el-dropdown-item command="debug">下载调试日志</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="home-main">
      <!-- 欢迎区域 -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h2>欢迎回来，{{ userStore.userInfo?.username }}！</h2>
          <p>选择一个功能开始使用</p>
        </div>
        <div class="welcome-decoration">🌟</div>
      </div>

      <!-- 功能卡片网格 -->
      <div class="features-grid">
        <!-- 聊天功能 -->
        <div class="feature-card chat-card" @click="goToChat">
          <div class="card-icon">💬</div>
          <div class="card-content">
            <h3>进入聊天</h3>
            <p>与 AI 机器人对话，多人在线聊天</p>
            <div class="card-tags">
              <span class="tag primary">热门</span>
              <span class="tag">多人聊天</span>
            </div>
          </div>
          <div class="card-arrow">→</div>
          <div class="card-decoration"></div>
        </div>

        <!-- 社区功能 -->
        <div class="feature-card community-card" @click="showCommunity">
          <div class="card-icon">🏘️</div>
          <div class="card-content">
            <h3>聊天社区</h3>
            <p>加入社区交流，获取帮助和支持</p>
            <div class="card-tags">
              <span class="tag success">新功能</span>
              <span class="tag">交流</span>
            </div>
          </div>
          <div class="card-arrow">→</div>
          <div class="card-decoration"></div>
        </div>

        <!-- AI 配置 - 仅管理员可见 -->
        <div v-if="userStore.userInfo?.role === 'admin'" class="feature-card config-card" @click="goToConfig">
          <div class="card-icon">⚙️</div>
          <div class="card-content">
            <h3>AI 模型配置</h3>
            <p>配置 AI 模型参数，个性化设置</p>
            <div class="card-tags">
              <span class="tag warning">实用</span>
              <span class="tag">自定义</span>
            </div>
          </div>
          <div class="card-arrow">→</div>
          <div class="card-decoration"></div>
        </div>

        <!-- 个人中心 -->
        <div class="feature-card profile-card" @click="showProfile">
          <div class="card-icon">👤</div>
          <div class="card-content">
            <h3>个人中心</h3>
            <p>管理个人信息，设置头像</p>
            <div class="card-tags">
              <span class="tag">账户</span>
            </div>
          </div>
          <div class="card-arrow">→</div>
          <div class="card-decoration"></div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="quick-actions">
        <h3>快捷操作</h3>
        <div class="actions-row">
          <div class="action-item" @click="openAddBotDialog">
            <span class="action-icon">🤖</span>
            <span>添加机器人</span>
          </div>
          <div class="action-item" @click="goToChat">
            <span class="action-icon">💬</span>
            <span>进入聊天</span>
          </div>
          <div class="action-item" @click="showCommunity">
            <span class="action-icon">🏘️</span>
            <span>聊天社区</span>
          </div>
          <div class="action-item" @click="showHelp">
            <span class="action-icon">❓</span>
            <span>使用帮助</span>
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section">
        <div class="stat-card">
          <span class="stat-icon">👥</span>
          <div class="stat-info">
            <span class="stat-value">{{ stats.users }}</span>
            <span class="stat-label">社区成员</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">💬</span>
          <div class="stat-info">
            <span class="stat-value">{{ stats.rooms }}</span>
            <span class="stat-label">聊天室</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🤖</span>
          <div class="stat-info">
            <span class="stat-value">{{ stats.bots }}</span>
            <span class="stat-label">AI 机器人</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">📊</span>
          <div class="stat-info">
            <span class="stat-value">{{ stats.messages }}</span>
            <span class="stat-label">今日消息</span>
          </div>
        </div>
      </div>
    </main>

    <!-- 社区弹窗 -->
    <CommunityDialog v-model="showCommunityDialog" @enterRoom="handleEnterRoom" />

    <!-- 个人中心弹窗 -->
    <el-dialog v-model="showProfileDialog" title="个人中心" width="500px" align-center>
      <div class="profile-content">
        <div class="profile-avatar-section">
          <el-avatar :size="80" :src="profileForm.avatar_url" class="profile-avatar">
            {{ profileForm.username?.[0] || 'U' }}
          </el-avatar>
          <div class="avatar-actions">
            <el-upload
              :show-file-list="false"
              :before-upload="handleAvatarUpload"
              accept="image/*"
              class="avatar-uploader"
            >
              <el-button size="small" type="primary">
                <el-icon><Upload /></el-icon> 上传头像
              </el-button>
            </el-upload>
            <el-button size="small" @click="showAvatarSelector = true">选择预设</el-button>
          </div>
        </div>
        <el-divider />
        <el-form :model="profileForm" label-width="80px">
          <el-form-item label="用户名">
            <el-input v-model="profileForm.username" placeholder="修改用户名" />
          </el-form-item>
          <el-form-item label="头像URL">
            <el-input v-model="profileForm.avatar_url" placeholder="输入头像图片地址或上传" />
          </el-form-item>
          <el-form-item label="用户ID">
            <el-input :value="userStore.userInfo?.id" disabled />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showProfileDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateProfile">保存</el-button>
      </template>
    </el-dialog>

    <!-- 头像选择器 -->
    <el-dialog v-model="showAvatarSelector" title="选择头像" width="500px" align-center>
      <div class="avatar-grid">
        <div
          v-for="(avatar, index) in presetAvatars"
          :key="index"
          :class="['avatar-option', { selected: profileForm.avatar_url === avatar }]"
          @click="selectAvatar(avatar)"
        >
          <el-avatar :size="60" :src="avatar" />
        </div>
      </div>
    </el-dialog>

    <!-- 创建房间弹窗 -->
    <el-dialog v-model="showCreateRoom" title="创建聊天室" width="450px" align-center>
      <el-form :model="roomForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="roomForm.name" placeholder="输入聊天室名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="roomForm.description" type="textarea" :rows="2" placeholder="输入聊天室描述(可选)" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateRoom = false">取消</el-button>
        <el-button type="primary" @click="handleCreateRoom">创建</el-button>
      </template>
    </el-dialog>

    <!-- 帮助弹窗 -->
    <el-dialog v-model="showHelpDialog" title="使用帮助" width="550px" align-center>
      <div class="help-content">
        <div class="help-section">
          <h4>💬 如何开始聊天？</h4>
          <p>点击"进入聊天"选择一个聊天室，输入消息即可与 AI 机器人对话。使用 @机器人名 可以召唤特定的 AI。</p>
        </div>
        <div class="help-section">
          <h4>🤖 如何添加机器人？</h4>
          <p>在聊天页面点击"邀请成员"→"添加机器人"，选择模型和性格预设即可添加。</p>
        </div>
        <div class="help-section">
          <h4>🏘️ 如何加入社区？</h4>
          <p>点击"聊天社区"查看社区信息，可通过扫码或链接加入官方群组。</p>
        </div>
        <div class="help-section">
          <h4>⚙️ 如何配置 AI？</h4>
          <p>在"AI 模型配置"页面可以添加、编辑 AI 模型的 API 地址和密钥。</p>
        </div>
        <div class="help-section">
          <h4>🔒 如何保护账户安全？</h4>
          <p>请勿将账户密码透露给他人，定期更换密码，发现异常立即修改。</p>
        </div>
      </div>
    </el-dialog>

    <!-- 机器人管理弹窗 -->
    <el-dialog v-model="showBotManagerDialog" title="机器人管理" width="500px" align-center>
      <div class="bot-list" v-if="roomBots.length > 0">
        <div v-for="bot in roomBots" :key="bot.id" class="bot-item">
          <div class="bot-info">
            <div class="bot-name">{{ bot.name }}</div>
            <div class="bot-model">模型: {{ bot.modelName }}</div>
            <div class="bot-personality">性格: {{ bot.personality?.substring(0, 50) }}...</div>
          </div>
          <div class="bot-actions">
            <el-button type="success" size="small" @click="openShareBotDialog(bot)">公开</el-button>
            <el-button type="danger" size="small" @click="removeBot(bot.id)">删除</el-button>
          </div>
        </div>
      </div>
      <div v-else class="no-bots">
        <p>暂无机器人</p>
        <el-button type="primary" @click="goToChat">去添加</el-button>
      </div>
      <el-divider />
      <div class="shared-bots-section">
        <h4>公开机器人市场</h4>
        <el-button type="primary" plain size="small" @click="loadAndShowSharedBots">
          <el-icon><Search /></el-icon> 浏览共享机器人
        </el-button>
      </div>
    </el-dialog>

    <!-- 分享机器人弹窗 -->
    <el-dialog v-model="showShareBotDialog" title="公开机器人" width="450px" align-center>
      <div v-if="selectedBotToShare" class="share-bot-info">
        <div class="share-bot-name">{{ selectedBotToShare.name }}</div>
        <div class="share-bot-model">模型: {{ selectedBotToShare.modelName }}</div>
      </div>
      <p class="share-tip">公开后，其他用户可以使用此机器人。公开是免费的，可以随时取消。</p>
      <template #footer>
        <el-button @click="showShareBotDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmShareBot">确认公开</el-button>
      </template>
    </el-dialog>

    <!-- 共享机器人市场弹窗 -->
    <el-dialog v-model="showSharedBotsDialog" title="共享机器人市场" width="600px" align-center>
      <el-tabs v-model="sharedBotsTab">
        <el-tab-pane label="热门机器人" name="popular">
          <div class="shared-bot-list" v-if="sharedBots.length > 0">
            <div v-for="bot in sharedBots" :key="bot.id" class="shared-bot-item">
              <div class="shared-bot-avatar">
                <el-avatar :size="48" style="background: linear-gradient(135deg, #667eea, #764ba2);">
                  {{ bot.name?.[0] || 'B' }}
                </el-avatar>
              </div>
              <div class="shared-bot-info">
                <div class="shared-bot-name">{{ bot.name }}</div>
                <div class="shared-bot-creator">创建者: {{ bot.creator_name || '未知' }}</div>
                <div class="shared-bot-model">模型: {{ bot.model_name }}</div>
              </div>
              <div class="shared-bot-stats">
                <span class="usage-count">使用 {{ bot.usage_count || 0 }} 次</span>
              </div>
              <el-button type="primary" size="small" @click="useSharedBot(bot)">添加到聊天室</el-button>
            </div>
          </div>
          <div v-else class="no-shared-bots">
            <p>暂无共享机器人</p>
          </div>
        </el-tab-pane>
        <el-tab-pane label="我的公开" name="mine">
          <div class="shared-bot-list" v-if="mySharedBots.length > 0">
            <div v-for="bot in mySharedBots" :key="bot.id" class="shared-bot-item">
              <div class="shared-bot-avatar">
                <el-avatar :size="48" style="background: linear-gradient(135deg, #10b981, #059669);">
                  {{ bot.name?.[0] || 'B' }}
                </el-avatar>
              </div>
              <div class="shared-bot-info">
                <div class="shared-bot-name">{{ bot.name }}</div>
                <div class="shared-bot-model">模型: {{ bot.model_name }}</div>
              </div>
              <div class="shared-bot-stats">
                <span class="usage-count">使用 {{ bot.usage_count || 0 }} 次</span>
              </div>
              <el-button type="danger" size="small" @click="unpublishBotConfirm(bot)">取消公开</el-button>
            </div>
          </div>
          <div v-else class="no-shared-bots">
            <p>您还没有公开任何机器人</p>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 添加机器人弹窗 -->
    <el-dialog v-model="showAddBotDialog" title="添加机器人" width="500px" align-center>
      <div v-if="aiConfigs.length === 0" class="no-configs-tip">
        <p>暂无 AI 模型配置，请联系管理员添加</p>
      </div>
      <el-form v-else :model="botForm" label-width="90px">
        <el-form-item label="机器人名称">
          <el-input v-model="botForm.name" placeholder="给机器人起个名字" />
        </el-form-item>
        <el-form-item label="选择模型">
          <el-select v-model="botForm.configId" placeholder="选择模型" style="width: 100%">
            <el-option
              v-for="c in aiConfigs"
              :key="c.id"
              :label="c.model_name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="性格预设">
          <el-select v-model="botForm.personalityPreset" placeholder="选择性格" style="width: 100%" @change="onPersonalityPresetChange">
            <el-option label="助手 - 乐于助人" value="助手" />
            <el-option label="朋友 - 幽默风趣" value="朋友" />
            <el-option label="老师 - 专业严谨" value="老师" />
            <el-option label="女友 - 温柔体贴" value="女友" />
            <el-option label="自定义" value="自定义" />
          </el-select>
        </el-form-item>
        <el-form-item label="性格设定">
          <el-input
            v-model="botForm.personality"
            type="textarea"
            :rows="3"
            placeholder="输入机器人的性格设定，如：你是我的专属助手，友善、专业..."
          />
        </el-form-item>
        <el-form-item label="开场白">
          <el-input
            v-model="botForm.welcomeMsg"
            type="textarea"
            :rows="2"
            placeholder="机器人加入时的开场白，可留空"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddBotDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddBot">添加</el-button>
      </template>
    </el-dialog>

    <!-- 欢迎协议弹窗 -->
    <WelcomeDialog v-model="showWelcome" @confirm="onWelcomeConfirmed" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { createRoom, getPublicBots, getMyPublicBots, publishBot, unpublishBot, usePublicBot } from '@/api/rooms'
import { getCommunityStats } from '@/api/users'
import { getAiConfigs } from '@/api/aiConfigs'
import { downloadLogs } from '@/utils/debug'
import { ArrowDown, Search, Upload } from '@element-plus/icons-vue'
import CommunityDialog from '@/components/CommunityDialog.vue'
import WelcomeDialog from '@/components/WelcomeDialog.vue'

const router = useRouter()
const userStore = useUserStore()

const showCommunityDialog = ref(false)
const showProfileDialog = ref(false)
const showCreateRoom = ref(false)
const showHelpDialog = ref(false)
const showBotManagerDialog = ref(false)
const showAvatarSelector = ref(false)
const showWelcome = ref(false)
const showAddBotDialog = ref(false)
const showShareBotDialog = ref(false)
const showSharedBotsDialog = ref(false)
const selectedBotToShare = ref(null)
const sharedBots = ref([])
const mySharedBots = ref([])
const sharedBotsTab = ref('popular')

const aiConfigs = ref([])
const botForm = reactive({
  name: '',
  configId: null,
  personality: '',
  personalityPreset: '',
  welcomeMsg: ''
})

const profileForm = reactive({
  username: '',
  avatar_url: ''
})

const roomForm = reactive({
  name: '',
  description: ''
})

const presetAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=6',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=7',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=8',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=10',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=11',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=12',
]

const stats = ref({
  users: 0,
  rooms: 0,
  bots: 0,
  messages: 0
})

// 获取真实统计数据
const fetchStats = async () => {
  try {
    const res = await getCommunityStats()
    stats.value = {
      users: res.data?.members || 0,
      rooms: res.data?.joined || 0,
      bots: 0,
      messages: res.data?.messagesToday || 0
    }
  } catch (e) {
    console.error('获取统计失败', e)
  }
}

// 用于强制刷新机器人列表
const botRefreshKey = ref(0)

const roomBots = computed(() => {
  // 依赖 botRefreshKey 触发更新
  botRefreshKey.value
  const bots = JSON.parse(localStorage.getItem('room_bots') || '{}')
  // 优先获取 default 房间的机器人（首页创建的）
  if (bots['default'] && bots['default'].length > 0) {
    return bots['default']
  }
  // 否则获取第一个有机器人的房间
  for (const roomId in bots) {
    if (bots[roomId] && bots[roomId].length > 0) {
      return bots[roomId]
    }
  }
  return []
})

onMounted(() => {
  if (!userStore.userInfo) {
    router.push('/login')
    return
  }
  profileForm.username = userStore.userInfo.username || ''
  profileForm.avatar_url = userStore.userInfo.avatar_url || ''

  // 检查是否已同意用户协议
  const agreed = localStorage.getItem('user_agreement_accepted')
  if (!agreed) {
    showWelcome.value = true
  }

  // 获取真实统计数据
  fetchStats()
})

const goToChat = () => {
  router.push('/chat')
}

const goToConfig = () => {
  router.push('/config')
}

const showCommunity = () => {
  showCommunityDialog.value = true
}

const showProfile = () => {
  showProfileDialog.value = true
}

const handleEnterRoom = (roomName) => {
  localStorage.setItem('pendingEnterRoom', roomName)
  router.push('/chat')
}

const openCreateRoomDialog = () => {
  showCreateRoom.value = true
}

const showHelp = () => {
  showHelpDialog.value = true
}

const openAddBotDialog = async () => {
  // 先加载 AI 配置
  try {
    const res = await getAiConfigs()
    aiConfigs.value = res.data.list || []
  } catch (e) {
    console.error('加载AI配置失败', e)
    aiConfigs.value = []
  }
  showAddBotDialog.value = true
}

const personalityPresets = {
  '助手': '你是一个乐于助人、智能高效的AI助手。你友好、专业，能够准确理解用户需求并提供有用的帮助。回答问题时简洁明了，如果有不确定的地方会诚实告知。',
  '朋友': '你是一个幽默风趣、亲切友善的朋友。你喜欢用轻松的方式聊天，会开玩笑但不会冒犯他人。偶尔会用表情符号或网络用语，让对话更加有趣。',
  '老师': '你是一个专业知识渊博、讲解清晰的教育工作者。你耐心细致，善于用通俗易懂的语言解释复杂概念。会根据对方的理解程度调整解释方式。',
  '女友': '你是一个温柔体贴、善解人意的女朋友。你会关心对方的感受，聊天时语气温暖。偶尔会撒娇或闹小脾气，但总体很甜蜜。会记住对方说过的重要事情。'
}

const onPersonalityPresetChange = (preset) => {
  if (preset && preset !== '自定义' && personalityPresets[preset]) {
    botForm.personality = personalityPresets[preset]
  }
}

const handleAddBot = () => {
  if (!botForm.name.trim()) {
    ElMessage.warning('请输入机器人名称')
    return
  }
  if (!botForm.configId) {
    ElMessage.warning('请选择模型')
    return
  }
  // 保存到 localStorage
  const config = aiConfigs.value.find(c => c.id === botForm.configId)
  const bots = JSON.parse(localStorage.getItem('room_bots') || '{}')
  const defaultRoomId = 'default'
  if (!bots[defaultRoomId]) {
    bots[defaultRoomId] = []
  }
  bots[defaultRoomId].push({
    id: Math.floor(Date.now() / 1000) % 1000000000,
    name: botForm.name,
    configId: botForm.configId,
    modelName: config?.model_name || '',
    personality: botForm.personality || '你是一个有帮助的AI助手。',
    welcomeMsg: botForm.welcomeMsg,
    createdAt: new Date().toISOString()
  })
  localStorage.setItem('room_bots', JSON.stringify(bots))
  botRefreshKey.value++ // 触发刷新
  ElMessage.success(`机器人 "${botForm.name}" 添加成功！`)
  showAddBotDialog.value = false
  botForm.name = ''
  botForm.configId = null
  botForm.personality = ''
  botForm.personalityPreset = ''
  botForm.welcomeMsg = ''
}

const handleCreateRoom = async () => {
  if (!roomForm.name.trim()) {
    ElMessage.warning('请输入聊天室名称')
    return
  }
  try {
    await createRoom({
      name: roomForm.name,
      description: roomForm.description,
      owner_id: userStore.userInfo.id
    })
    ElMessage.success('创建成功')
    showCreateRoom.value = false
    roomForm.name = ''
    roomForm.description = ''
  } catch (error) {
    ElMessage.error('创建失败')
  }
}

const handleAvatarUpload = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    profileForm.avatar_url = e.target.result
    ElMessage.success('头像上传成功')
  }
  reader.onerror = () => {
    ElMessage.error('头像上传失败')
  }
  reader.readAsDataURL(file)
  return false // 阻止默认上传
}

const selectAvatar = (avatar) => {
  profileForm.avatar_url = avatar
  showAvatarSelector.value = false
}

const handleUpdateProfile = async () => {
  if (!profileForm.username.trim()) {
    ElMessage.warning('用户名不能为空')
    return
  }
  try {
    const { updateUser } = await import('@/api/users')
    await updateUser(userStore.userInfo.id, {
      username: profileForm.username,
      avatar_url: profileForm.avatar_url
    })
    userStore.setUser({
      ...userStore.userInfo,
      username: profileForm.username,
      avatar_url: profileForm.avatar_url
    })
    ElMessage.success('修改成功')
    showProfileDialog.value = false
  } catch (error) {
    ElMessage.error('修改失败')
  }
}

const removeBot = (botId) => {
  const bots = JSON.parse(localStorage.getItem('room_bots') || '{}')
  for (const roomId in bots) {
    bots[roomId] = bots[roomId].filter(b => b.id !== botId)
    localStorage.setItem('room_bots', JSON.stringify(bots))
    botRefreshKey.value++ // 触发刷新
    ElMessage.success('机器人已删除')
    break
  }
}

const openShareBotDialog = (bot) => {
  selectedBotToShare.value = bot
  showShareBotDialog.value = true
}

const confirmShareBot = async () => {
  if (!selectedBotToShare.value) return
  try {
    await publishBot({
      user_id: userStore.userInfo.id,
      name: selectedBotToShare.value.name,
      config_id: selectedBotToShare.value.configId,
      model_name: selectedBotToShare.value.modelName,
      personality: selectedBotToShare.value.personality,
      welcome_msg: selectedBotToShare.value.welcomeMsg
    })
    ElMessage.success('机器人已公开，可以被其他用户使用了')
    showShareBotDialog.value = false
    selectedBotToShare.value = null
  } catch (e) {
    ElMessage.error('公开失败')
  }
}

const loadAndShowSharedBots = async () => {
  try {
    const res = await getPublicBots()
    sharedBots.value = res.data || []
    // 加载我的公开机器人
    const myRes = await getMyPublicBots(userStore.userInfo.id)
    mySharedBots.value = myRes.data || []
    showSharedBotsDialog.value = true
  } catch (e) {
    console.error('加载共享机器人失败', e)
    ElMessage.error('加载共享机器人失败')
  }
}

const useSharedBot = async (bot) => {
  // 将共享机器人添加到用户的默认房间
  const bots = JSON.parse(localStorage.getItem('room_bots') || '{}')
  const defaultRoomId = 'default'
  if (!bots[defaultRoomId]) {
    bots[defaultRoomId] = []
  }
  bots[defaultRoomId].push({
    id: Math.floor(Date.now() / 1000) % 1000000000,
    name: bot.name,
    configId: bot.config_id,
    modelName: bot.model_name,
    personality: bot.personality || '你是一个有帮助的AI助手。',
    welcomeMsg: bot.welcome_msg || '',
    createdAt: new Date().toISOString(),
    isShared: true,
    sharedBotId: bot.id
  })
  localStorage.setItem('room_bots', JSON.stringify(bots))
  botRefreshKey.value++

  // 记录使用
  try {
    await usePublicBot(bot.id)
  } catch (e) {
    console.error('记录使用失败', e)
  }

  ElMessage.success(`已将 "${bot.name}" 添加到您的机器人列表`)
  showSharedBotsDialog.value = false
}

const unpublishBotConfirm = async (bot) => {
  try {
    await unpublishBot(bot.id)
    ElMessage.success('已取消公开')
    // 重新加载我的公开机器人
    const myRes = await getMyPublicBots(userStore.userInfo.id)
    mySharedBots.value = myRes.data || []
  } catch (e) {
    ElMessage.error('取消公开失败')
  }
}

const onWelcomeConfirmed = () => {
  ElMessage.success('感谢您加入我们，开始探索 AI 聊天之旅吧！')
}

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      showProfile()
      break
    case 'config':
      goToConfig()
      break
    case 'debug':
      downloadLogs()
      ElMessage.success('调试日志已下载')
      break
    case 'logout':
      userStore.logout()
      router.push('/login')
      break
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
}

/* Header */
.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-icon {
  font-size: 40px;
}

.brand-text h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-text p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #94a3b8;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 24px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f1f5f9;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

/* Main */
.home-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Welcome Section */
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 24px;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
}

.welcome-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.welcome-content h2 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.welcome-content p {
  margin: 0;
  font-size: 15px;
  color: rgba(255,255,255,0.8);
}

.welcome-decoration {
  font-size: 80px;
  opacity: 0.3;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.feature-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 28px;
  background: #fff;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.1);
}

.feature-card.chat-card:hover {
  border-color: #667eea;
}

.feature-card.community-card:hover {
  border-color: #10b981;
}

.feature-card.config-card:hover {
  border-color: #f59e0b;
}

.feature-card.profile-card:hover {
  border-color: #6366f1;
}

.card-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  opacity: 0.05;
  border-radius: 0 20px 0 100px;
}

.chat-card .card-decoration {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.community-card .card-decoration {
  background: linear-gradient(135deg, #10b981, #059669);
}

.config-card .card-decoration {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.profile-card .card-decoration {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
}

.card-icon {
  font-size: 48px;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-content h3 {
  margin: 0 0 6px;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.card-content p {
  margin: 0 0 12px;
  font-size: 14px;
  color: #64748b;
}

.card-tags {
  display: flex;
  gap: 8px;
}

.tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 12px;
  background: #f1f5f9;
  color: #64748b;
}

.tag.primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}

.tag.success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
}

.tag.warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
}

.card-arrow {
  font-size: 24px;
  color: #cbd5e1;
  transition: all 0.3s;
}

.feature-card:hover .card-arrow {
  color: #667eea;
  transform: translateX(4px);
}

/* Quick Actions */
.quick-actions {
  background: #fff;
  border-radius: 20px;
  padding: 24px 28px;
  margin-bottom: 32px;
}

.quick-actions h3 {
  margin: 0 0 20px;
  font-size: 16px;
  font-weight: 600;
  color: #334155;
}

.actions-row {
  display: flex;
  gap: 16px;
}

.action-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 16px;
  background: #f8fafc;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-item:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  transform: translateY(-2px);
}

.action-icon {
  font-size: 28px;
}

.action-item span:last-child {
  font-size: 13px;
  font-weight: 500;
  color: #475569;
}

/* Stats Section */
.stats-section {
  display: flex;
  gap: 16px;
}

.stat-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px;
  background: #fff;
  border-radius: 16px;
}

.stat-icon {
  font-size: 32px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 12px;
  color: #94a3b8;
}

/* Profile Dialog */
.profile-content {
  padding: 10px 0;
}

.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 10px 0 20px;
}

.profile-avatar {
  font-size: 24px;
  font-weight: 600;
}

.avatar-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.avatar-uploader {
  display: inline-block;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  padding: 16px;
}

.avatar-option {
  cursor: pointer;
  border-radius: 50%;
  padding: 4px;
  transition: all 0.3s;
  border: 3px solid transparent;
}

.avatar-option:hover {
  transform: scale(1.1);
  border-color: #667eea;
}

.avatar-option.selected {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

/* Help Dialog */
.help-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.help-section {
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.help-section h4 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.help-section p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
}

/* Bot List */
.bot-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bot-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.2s;
}

.bot-item:hover {
  background: #f1f5f9;
}

.bot-info {
  flex: 1;
}

.bot-name {
  font-weight: 600;
  font-size: 15px;
  color: #334155;
  margin-bottom: 4px;
}

.bot-model {
  font-size: 12px;
  color: #667eea;
  margin-bottom: 2px;
}

.bot-personality {
  font-size: 12px;
  color: #94a3b8;
}

.no-bots {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}

.no-bots p {
  margin: 0 0 16px;
}

.no-configs-tip {
  text-align: center;
  padding: 30px;
  color: #f59e0b;
  background: #fffbeb;
  border-radius: 8px;
  margin: 10px 0;
}

.no-configs-tip p {
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }

  .stats-section {
    flex-wrap: wrap;
  }

  .stat-card {
    flex: 1 1 calc(50% - 8px);
    min-width: 140px;
  }

  .actions-row {
    flex-wrap: wrap;
  }

  .action-item {
    flex: 1 1 calc(50% - 8px);
  }
}
</style>