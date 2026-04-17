<template>
  <div class="chat-container">
    <!-- 左侧房间列表 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h3>我的聊天室</h3>
        <el-button type="primary" size="small" circle @click="showCreateRoom = true">+</el-button>
      </div>
      <el-scrollbar class="room-list">
        <div
          v-for="room in rooms"
          :key="room.id"
          :class="['room-item', { active: currentRoom?.id === room.id }]"
          @click="selectRoom(room)"
        >
          <div class="room-avatar">#</div>
          <div class="room-info">
            <div class="room-name">{{ room.name }}</div>
            <div class="room-desc">{{ room.description || '暂无描述' }}</div>
          </div>
          <el-button v-if="![3,4,5,6].includes(Number(room.id))" type="info" size="small" plain class="room-action-btn" @click.stop="handleLeaveRoom(room)">退出</el-button>
          <el-button v-if="room.owner_id === userStore.userInfo?.id && ![3,4,5,6].includes(Number(room.id))" type="danger" size="small" plain class="room-action-btn room-delete-btn" @click.stop="handleDeleteRoom(room)">删</el-button>
        </div>
      </el-scrollbar>
    </div>

    <!-- 中间消息区域 -->
    <div class="chat-main">
      <template v-if="currentRoom">
        <div class="chat-header">
          <div class="header-left">
            <el-button class="back-btn" @click="router.push('/home')">
              <el-icon><ArrowLeft /></el-icon> 返回主页
            </el-button>
            <div class="chat-title">{{ currentRoom.name }}</div>
          </div>
          <div class="header-right">
            <div class="user-dropdown" @click="userMenuVisible = !userMenuVisible">
              <el-avatar :size="32" :src="userStore.userInfo?.avatar_url">{{ userStore.userInfo?.username?.[0] || 'U' }}</el-avatar>
              <span class="user-name">{{ userStore.userInfo?.username }}</span>
              <el-icon class="arrow"><ArrowDown /></el-icon>
              <div class="dropdown-menu" v-if="userMenuVisible" @click.stop>
                <div class="dropdown-item" @click="showProfile = true">个人中心</div>
                <div class="dropdown-item danger" @click="handleLogout">退出登录</div>
              </div>
            </div>
          </div>
        </div>

        <el-scrollbar class="message-list" ref="messageScroll">
          <div v-if="messages.length === 0 && !aiRequesting" class="empty-state">
            <div class="empty-icon">💬</div>
            <div class="empty-text">开始发送消息吧</div>
          </div>
          <ChatBubble
            v-for="msg in messages"
            :key="msg.id"
            :message="msg"
            @report="showReportDialog(msg)"
          />
          <div v-if="aiRequesting" class="ai-thinking">
            <span>AI 正在回复...</span>
          </div>
        </el-scrollbar>

        <div class="chat-input">
          <div class="input-wrapper">
            <el-input
              ref="inputRef"
              v-model="inputMessage"
              type="textarea"
              :rows="2"
              placeholder="输入消息... (@选择机器人)"
              @keydown="handleInputKeydown"
              @input="onInputChange"
            />
            <!-- @提及下拉列表 -->
            <div v-if="showMentionList" class="mention-dropdown" :style="mentionDropdownStyle">
              <div
                v-for="(item, index) in mentionList"
                :key="item.id || index"
                :class="['mention-item', { active: mentionIndex === index }]"
                @click="selectMention(item)"
              >
                <el-avatar :size="24">{{ item.name?.[0] || 'U' }}</el-avatar>
                <span>{{ item.name }}</span>
                <span class="mention-type">{{ item.type }}</span>
              </div>
            </div>
          </div>
          <el-button type="primary" @click="sendMessage" :disabled="!inputMessage.trim()">
            <el-icon><Promotion /></el-icon>
          </el-button>
        </div>
      </template>

      <div v-else class="no-room">
        <div class="no-room-content">
          <div class="no-room-icon">👋</div>
          <div class="no-room-text">选择一个聊天室开始聊天</div>
        </div>
      </div>
    </div>

    <!-- 右侧边栏 -->
    <div class="right-sidebar" v-if="currentRoom">
      <!-- 操作按钮 -->
      <div class="sidebar-actions">
        <el-button size="small" type="primary" @click="showInvite = true">
          <el-icon><Plus /></el-icon> 添加成员
        </el-button>
        <el-button size="small" @click="openAddBot">
          <el-icon><Plus /></el-icon> 添加机器人
        </el-button>
      </div>

      <!-- 成员列表 -->
      <div class="right-sidebar-section">
        <div class="right-sidebar-header" @click="membersCollapsed = !membersCollapsed">
          <span>成员 ({{ roomMembers.length }})</span>
          <el-icon class="collapse-icon" :class="{ collapsed: membersCollapsed }"><ArrowUp /></el-icon>
        </div>
        <el-collapse-transition>
          <div v-show="!membersCollapsed" class="member-list" :class="{ collapsed: membersCollapsed }">
            <div v-if="roomMembers.length === 0" class="list-empty">
              <span>暂无成员</span>
            </div>
            <div
              v-for="user in roomMembers"
              :key="user.id"
              class="member-item"
            >
              <el-avatar :size="32">{{ user.username?.[0] || 'U' }}</el-avatar>
              <div class="member-info">
                <div class="member-name">{{ user.username }}</div>
              </div>
              <el-dropdown v-if="user.id !== userStore.userInfo?.id" @command="(cmd) => handleMemberCommand(cmd, user)">
                <el-icon class="member-action"><MoreFilled /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="remove">移出房间</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-collapse-transition>
      </div>

      <!-- 机器人列表 -->
      <div class="right-sidebar-section">
        <div class="right-sidebar-header" @click="botsCollapsed = !botsCollapsed">
          <span>机器人 ({{ roomBots.length }})</span>
          <el-icon class="collapse-icon" :class="{ collapsed: botsCollapsed }"><ArrowUp /></el-icon>
        </div>
        <el-collapse-transition>
          <div v-show="!botsCollapsed" class="member-list" :class="{ collapsed: botsCollapsed }">
            <div v-if="roomBots.length === 0" class="list-empty">
              <span>暂无机器人</span>
            </div>
            <div
              v-for="bot in roomBots"
              :key="bot.id"
              class="member-item"
            >
              <el-avatar :size="32" style="background: linear-gradient(135deg, #667eea, #764ba2);">{{ bot.name?.[0] || 'B' }}</el-avatar>
              <div class="member-info">
                <div class="member-name">{{ bot.name }}</div>
                <div class="member-role">{{ bot.modelName }}</div>
              </div>
              <el-icon class="member-action" @click="removeBot(bot.id)"><Delete /></el-icon>
            </div>
          </div>
        </el-collapse-transition>
      </div>
    </div>

    <!-- 创建房间对话框 -->
    <el-dialog v-model="showCreateRoom" title="创建聊天室" width="450px">
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

    <!-- 邀请对话框 -->
    <el-dialog v-model="showInvite" title="邀请加入" width="450px">
      <el-tabs v-model="inviteTab">
        <el-tab-pane label="邀请用户" name="user">
          <el-form :model="inviteForm" label-width="80px">
            <el-form-item label="用户">
              <el-select v-model="inviteForm.userId" filterable placeholder="搜索用户" @focus="loadUsers">
                <el-option
                  v-for="u in userList"
                  :key="u.id"
                  :label="u.username"
                  :value="u.id"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="添加机器人" name="bot">
          <div v-if="aiConfigs.length === 0" class="no-configs-tip">
            <p>暂无 AI 模型配置，请联系管理员添加</p>
          </div>
          <div v-else class="add-bot-section">
            <!-- 已有机器人列表 -->
            <div v-if="roomBots.length > 0" class="existing-bots">
              <div class="section-label">已有机器人</div>
              <el-select v-model="selectedBotId" placeholder="选择已有机器人" style="width: 100%; margin-bottom: 12px;">
                <el-option
                  v-for="bot in roomBots"
                  :key="bot.id"
                  :label="bot.name"
                  :value="bot.id"
                />
              </el-select>
              <el-button size="small" type="primary" @click="useSelectedBot" :disabled="!selectedBotId">
                使用选中机器人
              </el-button>
            </div>

            <el-divider v-if="roomBots.length > 0" />

            <!-- 添加新机器人 -->
            <div class="section-label">添加新机器人</div>
            <el-form :model="botForm" label-width="80px">
              <el-form-item label="名称">
                <el-input v-model="botForm.name" placeholder="给机器人起个名字" />
              </el-form-item>
              <el-form-item label="模型">
                <el-select v-model="botForm.configId" placeholder="选择模型">
                  <el-option
                    v-for="c in aiConfigs"
                    :key="c.id"
                    :label="c.model_name"
                    :value="c.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="性格预设">
                <el-select v-model="botForm.personalityPreset" placeholder="选择性格" @change="onPersonalityPresetChange">
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
                  placeholder="输入机器人的性格设定，如：你是我的专属助手，友善、专业、乐于解答问题..."
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
          </div>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="showInvite = false">取消</el-button>
        <el-button type="primary" @click="handleInvite">{{ inviteTab === 'user' ? '邀请' : '添加' }}</el-button>
      </template>
    </el-dialog>

    <!-- 举报对话框 -->
    <el-dialog v-model="showReport" title="举报消息" width="400px">
      <el-form :model="reportForm" label-width="80px">
        <el-form-item label="内容">
          <div class="report-content">{{ reportForm.content }}</div>
        </el-form-item>
        <el-form-item label="原因">
          <el-select v-model="reportForm.reason" placeholder="选择举报原因">
            <el-option label="垃圾广告" value="spam" />
            <el-option label="恶意攻击" value="attack" />
            <el-option label="色情内容" value="porn" />
            <el-option label="政治敏感" value="political" />
            <el-option label="其他违规" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="reportForm.description" type="textarea" :rows="3" placeholder="请详细描述..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReport = false">取消</el-button>
        <el-button type="danger" @click="handleReport">提交举报</el-button>
      </template>
    </el-dialog>

    <!-- 机器人管理对话框 -->
    <el-dialog v-model="showBotManager" title="机器人管理" width="500px">
      <div class="bot-list" v-if="roomBots.length > 0">
        <div v-for="bot in roomBots" :key="bot.id" class="bot-item">
          <div class="bot-info">
            <div class="bot-name">{{ bot.name }}</div>
            <div class="bot-model">模型: {{ bot.modelName }}</div>
            <div class="bot-personality">性格: {{ bot.personality.substring(0, 50) }}...</div>
          </div>
          <el-button type="danger" size="small" @click="removeBot(bot.id)">删除</el-button>
        </div>
      </div>
      <div v-else class="no-bots">
        <p>暂无机器人</p>
      </div>
    </el-dialog>

    <!-- 个人中心对话框 -->
    <el-dialog v-model="showProfile" title="个人中心" width="450px">
      <div class="profile-info">
        <div class="avatar-upload">
          <el-avatar :size="80" :src="profileForm.avatar_url" class="profile-avatar">
            {{ profileForm.username?.[0] || 'U' }}
          </el-avatar>
          <div class="avatar-actions">
            <el-button size="small" @click="showAvatarSelector = true">选择头像</el-button>
          </div>
        </div>
        <div class="profile-detail">
          <h3>{{ profileForm.username }}</h3>
          <el-tag :type="userStore.userInfo?.role === 'admin' ? 'danger' : 'primary'" size="small">
            {{ userStore.userInfo?.role === 'admin' ? '管理员' : '普通用户' }}
          </el-tag>
        </div>
      </div>
      <el-divider />
      <el-form :model="profileForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="profileForm.username" placeholder="修改用户名" />
        </el-form-item>
        <el-form-item label="头像URL">
          <el-input v-model="profileForm.avatar_url" placeholder="输入头像图片地址" />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input :value="userStore.userInfo?.id" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showProfile = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateProfile">保存</el-button>
      </template>
    </el-dialog>

    <!-- 头像选择器对话框 -->
    <el-dialog v-model="showAvatarSelector" title="选择头像" width="500px">
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
  </div>

  <!-- 社区弹窗 -->
  <el-dialog v-model="showCommunity" title="" width="650px" align-center class="community-dialog">
    <template #header>
      <div class="community-header">
        <div class="community-icon">🏘️</div>
        <div class="community-title">
          <h2>聊天社区</h2>
          <p>与全球用户交流，获取帮助，参与活动</p>
        </div>
      </div>
    </template>

    <div class="community-content">
      <div class="community-stats">
        <div class="stat-item">
          <span class="stat-value">{{ communityStats.members }}</span>
          <span class="stat-label">社区成员</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ communityStats.joined }}</span>
          <span class="stat-label">已加入</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ communityStats.messagesToday }}</span>
          <span class="stat-label">今日消息</span>
        </div>
      </div>

      <!-- 热门频道 -->
      <div class="community-channels">
        <h4>热门频道</h4>
        <div class="channels-list">
          <div class="channel-item clickable" @click="handleOfficialAnnounce">
            <span class="channel-icon">📢</span>
            <div class="channel-info">
              <strong>官方公告</strong>
              <p>功能更新、维护通知、活动公告</p>
            </div>
            <el-tag type="success" size="small">官方</el-tag>
          </div>
          <div class="channel-item clickable" @click="handleGeneralChat">
            <span class="channel-icon">💬</span>
            <div class="channel-info">
              <strong>综合讨论</strong>
              <p>日常聊天、功能建议、问题反馈、大型公开社区</p>
            </div>
            <el-tag size="small">推荐</el-tag>
          </div>
          <div class="channel-item clickable" @click="handleAITips">
            <span class="channel-icon">🤖</span>
            <div class="channel-info">
              <strong>AI 技巧</strong>
              <p>分享 AI 使用技巧、提示词工程、官方公告</p>
            </div>
            <el-tag type="warning" size="small">热门</el-tag>
          </div>
          <div class="channel-item clickable" @click="handleFeedback">
            <span class="channel-icon">🐛</span>
            <div class="channel-info">
              <strong>反馈建议</strong>
              <p>提交 bug、功能建议、改进意见</p>
            </div>
            <el-tag type="info" size="small">反馈</el-tag>
          </div>
        </div>
      </div>

      <!-- 快速入口 -->
      <div class="community-join">
        <h4>快捷入口</h4>
        <div class="join-links">
          <div class="join-link-item">
            <span class="link-icon">💁</span>
            <span class="link-name">官方客服群</span>
            <el-button size="small" type="primary" @click="handleCustomerService">进入客服</el-button>
          </div>
          <div class="join-link-item">
            <span class="link-icon">🌐</span>
            <span class="link-name">作者网站</span>
            <el-button size="small" type="primary" @click="handleVisitWebsite">访问</el-button>
          </div>
          <div class="join-link-item">
            <span class="link-icon">📧</span>
            <span class="link-name">意见反馈</span>
            <el-button size="small" type="primary" @click="handleFeedback">反馈</el-button>
          </div>
        </div>
      </div>

      <!-- 社区规范 -->
      <div class="community-rules">
        <h4 @click="showRulesDetail = !showRulesDetail" class="rules-toggle">
          <span>📋</span> 社区规范
          <el-icon class="collapse-icon"><ArrowDown v-if="!showRulesDetail" /><ArrowUp v-else /></el-icon>
        </h4>
        <el-collapse-transition>
          <div v-show="showRulesDetail" class="rules-detail">
            <div class="rule-section">
              <h5>✅ 鼓励行为</h5>
              <ul>
                <li>友善交流，尊重他人观点</li>
                <li>分享使用心得和技术经验</li>
                <li>积极帮助新手用户</li>
                <li>提出建设性的改进建议</li>
                <li>参与社区活动，分享有趣内容</li>
              </ul>
            </div>
            <div class="rule-section">
              <h5>❌ 禁止行为</h5>
              <ul>
                <li>人身攻击、侮辱、诽谤他人</li>
                <li>发布垃圾广告、推广链接</li>
                <li>传播色情、暴力、政治敏感内容</li>
                <li>冒充官方人员或机器人</li>
                <li>恶意刷屏、扰乱社区秩序</li>
                <li>未经允许公开他人隐私信息</li>
              </ul>
            </div>
            <div class="rule-section">
              <h5>⚠️ 违规处理</h5>
              <ul>
                <li>情节轻微：警告并删除内容</li>
                <li>情节严重：临时禁言1-7天</li>
                <li>情节恶劣：永久封禁账号</li>
              </ul>
            </div>
          </div>
        </el-collapse-transition>
        <div class="rules-summary">
          <span>友善交流 • 尊重他人 • 分享知识 • 共同成长</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="community-footer">
        <el-button @click="showCommunity = false">关闭</el-button>
        <el-button type="primary" @click="joinCommunity">加入社区</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 欢迎协议弹窗 -->
  <WelcomeDialog v-model="showWelcome" @confirm="onWelcomeConfirmed" />
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'
import { getRooms, createRoom, deleteRoom, getRoomMembers, addRoomMember, removeRoomMember } from '@/api/rooms'
import { getMessages, createMessage } from '@/api/messages'
import { getUsers, joinCommunity as apiJoinCommunity, getCommunityStats } from '@/api/users'
import { getAiConfigs } from '@/api/aiConfigs'
import { aiChat } from '@/api/ai'
import { logError, logInfo, downloadLogs } from '@/utils/debug'
import ChatBubble from '@/components/ChatBubble.vue'
import WelcomeDialog from '@/components/WelcomeDialog.vue'
import { ArrowDown, ArrowUp, ArrowLeft, MoreFilled, Delete, Close, Plus, Promotion, ChatDotRound, User } from '@element-plus/icons-vue'

const router = useRouter()
const chatStore = useChatStore()
const userStore = useUserStore()

const rooms = ref([])
const messages = ref([])
const currentRoom = ref(null)
const inputMessage = ref('')
const inputRef = ref(null)
const showMentionList = ref(false)
const mentionIndex = ref(0)
const mentionList = ref([])
const mentionQuery = ref('')
const mentionDropdownStyle = ref({})
const showCreateRoom = ref(false)
const showInvite = ref(false)
const showReport = ref(false)
const showProfile = ref(false)
const messageScroll = ref(null)
const inviteTab = ref('user')
const userList = ref([])
const aiConfigs = ref([])
const selectedAiConfigId = ref(null)
const roomMembers = ref([])
const membersCollapsed = ref(false)
const botsCollapsed = ref(false)
const showBotManager = ref(false)
const showWelcome = ref(false)
const showCommunity = ref(false)
const communityStats = ref({ members: 0, joined: 0, messagesToday: 0 })
const showRulesDetail = ref(false)

const getRoomBots = () => {
  const bots = JSON.parse(localStorage.getItem('room_bots') || '{}')
  const roomId = currentRoom.value?.id
  // 优先获取当前房间的机器人，如果没有则获取默认机器人
  const roomBots = bots[roomId]
  if (roomBots && roomBots.length > 0) {
    return roomBots
  }
  // 如果当前房间没有机器人，返回默认机器人
  return bots['default'] || []
}

const roomBots = ref([])

const refreshRoomBots = () => {
  roomBots.value = getRoomBots()
}

const removeBot = (botId) => {
  const bots = JSON.parse(localStorage.getItem('room_bots') || '{}')
  if (bots[currentRoom.value?.id]) {
    bots[currentRoom.value.id] = bots[currentRoom.value.id].filter(b => b.id !== botId)
    localStorage.setItem('room_bots', JSON.stringify(bots))
    refreshRoomBots()
    ElMessage.success('机器人已删除')
  }
}

const userMenuVisible = ref(false)
const aiRequesting = ref(false)

const profileForm = reactive({ username: '', avatar_url: '' })
const showAvatarSelector = ref(false)

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
    showProfile.value = false
  } catch (error) {
    ElMessage.error('修改失败')
  }
}

const roomForm = reactive({ name: '', description: '' })
const inviteForm = reactive({ userId: null })
const botForm = reactive({
  name: '',
  configId: null,
  personality: '',
  personalityPreset: '',
  welcomeMsg: ''
})
const selectedBotId = ref(null)

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

const useSelectedBot = () => {
  if (!selectedBotId.value) return
  const bot = roomBots.value.find(b => b.id === selectedBotId.value)
  if (bot) {
    // 直接在输入框中填入 @机器人名
    inputMessage.value = `@${bot.name} `
    showInvite.value = false
    // 清空选中
    selectedBotId.value = null
    ElMessage.success(`已选择机器人 ${bot.name}，按 Enter 开始对话`)
    // 聚焦输入框
    nextTick(() => {
      if (inputRef.value) {
        inputRef.value.focus?.()
        const textarea = inputRef.value.textarea || inputRef.value.$refs?.textarea
        if (textarea) textarea.focus()
      }
    })
  }
}

const reportForm = reactive({ messageId: null, content: '', reason: '', description: '' })

onMounted(async () => {
  if (!userStore.userInfo) {
    router.push('/login')
    return
  }
  profileForm.username = userStore.userInfo.username || ''
  profileForm.avatar_url = userStore.userInfo.avatar_url || ''

  // 检查是否有待进入的房间（从首页社区跳转）- 提前获取
  const pendingRoomName = localStorage.getItem('pendingEnterRoom')
  if (pendingRoomName) {
    localStorage.removeItem('pendingEnterRoom')
  }

  // 加载房间和配置
  await loadRooms()
  await loadAiConfigs()

  // 如果有待进入的房间，优先进入该房间
  if (pendingRoomName) {
    const targetRoom = rooms.value.find(r => r.name === pendingRoomName)
    if (targetRoom) {
      await selectRoom(targetRoom)
    } else {
      // 如果找不到指定房间，选择第一个
      if (rooms.value.length > 0) {
        await selectRoom(rooms.value[0])
      }
    }
  } else if (!currentRoom.value && rooms.value.length > 0) {
    // 默认选择第一个房间
    await selectRoom(rooms.value[0])
  }

  // 如果房间没有机器人，自动添加默认机器人
  if (roomBots.value.length === 0) {
    if (aiConfigs.value.length > 0) {
      addDefaultBot()
      ElMessage.success('已为房间添加默认助手机器人')
    } else {
      ElMessage.warning('暂无AI配置，请在管理后台添加AI模型配置')
    }
  }

  // 检查是否已同意用户协议
  const agreed = localStorage.getItem('user_agreement_accepted')
  if (!agreed) {
    showWelcome.value = true
  }

  // 全局点击关闭用户下拉菜单
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-dropdown')) {
      userMenuVisible.value = false
    }
  })
})

const onWelcomeConfirmed = async () => {
  // 协议确认后的回调
}

const joinCommunity = async () => {
  // 先获取社区统计
  try {
    const res = await getCommunityStats()
    communityStats.value = res.data
  } catch (e) {
    console.error('获取社区统计失败', e)
  }

  if (!userStore.userInfo?.id) {
    ElMessage.warning('请先登录')
    return
  }
  try {
    await apiJoinCommunity(userStore.userInfo.id)
    userStore.setUser({
      ...userStore.userInfo,
      community_joined: true
    })
    ElMessage.success('恭喜您已成功加入社区！')
    showCommunity.value = false
  } catch (error) {
    ElMessage.error('加入社区失败，请重试')
  }
}

// 官方客服群 - 进入官方客服群聊天室
const handleCustomerService = async () => {
  try {
    const res = await getRooms()
    const roomList = res.data?.list || res.list || []
    const customerServiceRoom = roomList.find(r => r.name === '官方客服群')

    if (customerServiceRoom) {
      await selectRoom(customerServiceRoom)
      showCommunity.value = false
      ElMessage.success('正在进入官方客服群...')
    } else {
      ElMessage.error('暂无可用的客服群，请联系管理员')
    }
  } catch (error) {
    console.error('进入客服群失败', error)
    ElMessage.error('进入客服群失败')
  }
}

// 官方网站 - 作者网站
const handleVisitWebsite = () => {
  window.open('https://hlydwz.com', '_blank')
}

// 官方公告
const handleOfficialAnnounce = () => {
  ElMessage.info('官方公告：请关注作者网站获取最新资讯')
  window.open('https://hlydwz.com', '_blank')
}

// 综合讨论 - 进入大型公开聊天室
const handleGeneralChat = async () => {
  try {
    const res = await getRooms()
    const roomList = res.data?.list || res.list || []
    const generalRoom = roomList.find(r => r.name === '综合讨论' || r.type === 'public')

    if (generalRoom) {
      await selectRoom(generalRoom)
      showCommunity.value = false
      ElMessage.success('正在进入综合讨论...')
    } else {
      // 创建综合讨论室
      const createRes = await createRoom({
        name: '综合讨论',
        description: '大型公开聊天社区，欢迎所有用户加入讨论',
        owner_id: userStore.userInfo?.id
      })
      const newRoom = createRes.data || createRes
      if (newRoom && newRoom.id) {
        await selectRoom(newRoom)
        showCommunity.value = false
        ElMessage.success('综合讨论室已创建，正在进入...')
      }
    }
  } catch (error) {
    console.error('进入综合讨论失败', error)
    ElMessage.error('进入讨论区失败')
  }
}

// AI技巧 - 显示技巧并跳转
const handleAITips = () => {
  ElMessage.info('AI技巧：善用@机器人名召唤特定AI，使用自然语言描述需求')
  window.open('https://hlydwz.com', '_blank')
}

// 意见反馈
const handleFeedback = () => {
  ElMessage.info('反馈功能：请联系作者网站获取联系方式')
  window.open('https://hlydwz.com', '_blank')
}

const loadRooms = async () => {
  try {
    logInfo('loadRooms', '开始加载房间')
    const res = await getRooms()
    logInfo('loadRooms', '房间加载成功', res)
    // 处理 API 返回格式：可能是 { data: { list: [...] } } 或直接 { list: [...] }
    const roomList = res.data?.list || res.list || []
    // 过滤掉已退出的非官方房间（官方房间始终显示）
    const leftRooms = JSON.parse(localStorage.getItem('left_rooms') || '{}')
    rooms.value = roomList.filter(r => !leftRooms[r.id] || [3,4,5,6].includes(r.id))
    chatStore.setRooms(rooms.value)

    // 调试：检查房间数据
    console.log('房间列表:', rooms.value)
    console.log('当前房间:', currentRoom.value)

    if (rooms.value.length > 0 && !currentRoom.value) {
      selectRoom(rooms.value[0])
    } else if (rooms.value.length === 0) {
      logInfo('loadRooms', '没有房间，创建默认房间')
      try {
        const createRes = await createRoom({ name: '公共聊天室', description: '欢迎加入' })
        logInfo('loadRooms', '创建房间成功', createRes)
        // createRoom 返回的是 { code, message, data: room }
        const newRoom = createRes.data || createRes
        if (newRoom && newRoom.id) {
          rooms.value = [newRoom]
          selectRoom(rooms.value[0])
        }
      } catch (e) {
        logError('loadRooms', e, { action: 'createRoom' })
      }
    }
  } catch (error) {
    logError('loadRooms', error, {})
    ElMessage.error('加载房间失败')
  }
}

const loadUsers = async () => {
  try {
    const res = await getUsers()
    userList.value = res.data.list.filter(u => u.id !== userStore.userInfo.id)
  } catch (error) {
    console.error('加载用户列表失败')
  }
}

const openAddBot = () => {
  inviteTab.value = 'bot'
  showInvite.value = true
}

const loadAiConfigs = async () => {
  try {
    logInfo('loadAiConfigs', '开始加载AI配置')
    const res = await getAiConfigs()
    logInfo('loadAiConfigs', 'AI配置加载成功', { data: res.data })
    aiConfigs.value = res.data.list || []
    if (aiConfigs.value.length > 0 && !selectedAiConfigId.value) {
      selectedAiConfigId.value = aiConfigs.value[0].id
    }
  } catch (error) {
    logError('loadAiConfigs', error, {})
    ElMessage.warning('加载 AI 配置失败，部分功能可能不可用')
  }
}

const selectRoom = async (room) => {
  currentRoom.value = room
  chatStore.setCurrentRoom(room)
  // 加入房间成员
  try {
    await addRoomMember(room.id, { user_id: userStore.userInfo.id, role: 'member' })
  } catch (e) {
    // 忽略错误，可能已经存在
  }
  await loadMessages()
  await loadRoomMembers()
  refreshRoomBots()
  // 如果房间没有机器人，自动添加
  if (roomBots.value.length === 0 && aiConfigs.value.length > 0) {
    addDefaultBot()
  }
}

// 添加默认机器人
const addDefaultBot = () => {
  const bots = JSON.parse(localStorage.getItem('room_bots') || '{}')
  const roomId = currentRoom.value?.id
  const defaultRoomId = 'default'

  // 初始化数组
  if (!bots[roomId]) bots[roomId] = []
  if (!bots[defaultRoomId]) bots[defaultRoomId] = []

  // 如果已经有默认机器人，复制到当前房间
  if (bots[defaultRoomId].length > 0) {
    bots[roomId] = [...bots[defaultRoomId]]
  } else {
    // 创建新的默认助手机器人，使用较小的ID
    const defaultBot = {
      id: Math.floor(Date.now() / 1000) % 1000000000, // 使用秒级时间戳模10亿
      name: '小助手',
      configId: aiConfigs.value[0].id,
      modelName: aiConfigs.value[0].model_name,
      personality: '你是一个乐于助人、智能高效的AI助手。你友好、专业，能够准确理解用户需求并提供有用的帮助。回答问题时简洁明了。',
      welcomeMsg: '你好！我是AI助手，有什么可以帮助你的吗？',
      createdAt: new Date().toISOString()
    }
    bots[roomId].push(defaultBot)
    bots[defaultRoomId].push(defaultBot)
  }

  localStorage.setItem('room_bots', JSON.stringify(bots))
  refreshRoomBots()
  console.log('已添加默认机器人到房间:', currentRoom.value?.name)
}

const loadMessages = async () => {
  if (!currentRoom.value) {
    messages.value = []
    chatStore.setMessages([])
    return
  }
  try {
    const res = await getMessages({ room_id: currentRoom.value.id })
    // 处理 API 返回格式
    messages.value = res.data?.list || res.list || []
    chatStore.setMessages(messages.value)
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('加载消息失败:', error)
    messages.value = []
    ElMessage.error('加载消息失败')
  }
}

const loadRoomMembers = async () => {
  if (!currentRoom.value) {
    roomMembers.value = []
    return
  }
  try {
    const res = await getRoomMembers(currentRoom.value.id)
    roomMembers.value = res.data || []
  } catch (error) {
    console.error('加载成员失败')
    // 如果 API 失败，显示当前用户
    roomMembers.value = [userStore.userInfo]
  }
}

// 处理输入变化，检测@
const onInputChange = () => {
  const text = inputMessage.value
  const cursorPos = text.length

  // 查找最后一个@
  const lastAtIndex = text.lastIndexOf('@')

  if (lastAtIndex !== -1 && (lastAtIndex === 0 || text[lastAtIndex - 1] === ' ')) {
    // 提取@后面的内容
    const afterAt = text.slice(lastAtIndex + 1, cursorPos)
    const hasSpaceAfterAt = afterAt.includes(' ')

    if (!hasSpaceAfterAt) {
      // 显示提及列表
      mentionQuery.value = afterAt
      updateMentionList()
      showMentionList.value = true

      // 计算下拉框位置
      nextTick(() => {
        if (inputRef.value) {
          mentionDropdownStyle.value = {
            bottom: '60px',
            left: '16px'
          }
        }
      })
      return
    }
  }

  showMentionList.value = false
}

// 更新提及列表
const updateMentionList = () => {
  // 使用 roomBots.value 而不是直接读 localStorage
  const roomBotsList = roomBots.value || []
  const query = mentionQuery.value.toLowerCase()

  // 合并机器人和成员
  const list = [
    ...roomBotsList.map(b => ({ id: b.id, name: b.name, type: '机器人' })),
    ...roomMembers.value.map(m => ({ id: m.id, name: m.username, type: '成员' }))
  ]

  if (query) {
    mentionList.value = list.filter(item => item.name.toLowerCase().includes(query))
  } else {
    mentionList.value = list
  }

  mentionIndex.value = 0
}

// 选择提及项
const selectMention = (item) => {
  const text = inputMessage.value
  const lastAtIndex = text.lastIndexOf('@')

  if (lastAtIndex !== -1) {
    // 保留@前面的内容，加上选择的名字和空格
    const beforeAt = text.slice(0, lastAtIndex)
    inputMessage.value = beforeAt + '@' + item.name + ' '
    showMentionList.value = false

    // 聚焦回输入框
    nextTick(() => {
      if (inputRef.value) {
        // el-input 组件的 focus 方法
        inputRef.value.focus?.()
        // 尝试获取内部的 textarea 并聚焦
        const textarea = inputRef.value.textarea || inputRef.value.$refs?.textarea
        if (textarea) {
          textarea.focus()
        }
      }
    })
  }
}

// 处理输入框键盘事件
const handleInputKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    if (showMentionList.value && mentionList.value.length > 0) {
      e.preventDefault()
      selectMention(mentionList.value[mentionIndex.value])
    } else if (!showMentionList.value) {
      e.preventDefault()
      sendMessage()
    }
    return
  }

  if (!showMentionList.value) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    mentionIndex.value = Math.min(mentionIndex.value + 1, mentionList.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    mentionIndex.value = Math.max(mentionIndex.value - 1, 0)
  } else if (e.key === 'Escape') {
    showMentionList.value = false
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || !currentRoom.value) return
  let content = inputMessage.value.trim()

  // 获取该房间的机器人列表
  const bots = JSON.parse(localStorage.getItem('room_bots') || '{}')
  const roomBots = bots[currentRoom.value?.id] || []

  // 解析@提及 - 格式 @机器人名
  let mentionedBot = null
  const atMatch = content.match(/@(\S+)/)

  if (atMatch) {
    const mentionedName = atMatch[1]
    // 查找对应的机器人（支持模糊匹配）
    mentionedBot = roomBots.find(b =>
      b.name === mentionedName ||
      b.name.toLowerCase().includes(mentionedName.toLowerCase())
    )
    // 如果找到，移除@提及部分
    if (mentionedBot) {
      content = content.replace(/@\S+\s*/, '').trim()
    }
  }

  try {
    // 检查是否选择了房间
    if (!currentRoom.value || !currentRoom.value.id) {
      ElMessage.warning('请先选择一个聊天室')
      return
    }

    // 保存用户消息
    const msg = {
      room_id: currentRoom.value.id,
      user_id: userStore.userInfo.id,
      content: inputMessage.value.trim(), // 保存原始消息包含@
      message_type: 'text'
    }
    console.log('Sending message:', JSON.stringify(msg))
    try {
      const result = await createMessage(msg)
      console.log('Message sent successfully:', result)
    } catch (error) {
      console.error('Create message error:', error)
      ElMessage.error('发送消息失败: ' + (error.message || '未知错误'))
      return
    }
    inputMessage.value = ''
    await loadMessages()

    // 如果有被@的机器人，或者有默认配置的机器人，则触发AI回复
    const targetBot = mentionedBot || (roomBots.length > 0 ? roomBots[0] : null)

    if (targetBot) {
      const config = aiConfigs.value.find(c => c.id === targetBot.configId)
      if (config) {
        aiRequesting.value = true

        try {
          // 获取该机器人自己的对话历史上下文
          const botContext = JSON.parse(localStorage.getItem(`bot_context_${targetBot.id}`) || '[]')

          // 构建消息列表（只取最近10条相关上下文）
          const recentContext = botContext.slice(-10)

          // 通过后端代理调用 AI，不暴露 API 密钥
          const response = await aiChat({
            config_id: targetBot.configId,
            messages: [
              { role: 'system', content: targetBot.personality },
              ...recentContext,
              { role: 'user', content: content }
            ],
            max_tokens: config.max_tokens || 2048,
            temperature: parseFloat(config.temperature) || 0.7
          })

          const data = response.data
          console.log('AI API response:', data)

          if (data.choices?.[0]?.message?.content) {
            const aiReply = {
              room_id: currentRoom.value.id,
              user_id: userStore.userInfo.id,
              bot_id: targetBot.id,
              content: data.choices[0].message.content,
              message_type: 'ai_response'
            }
            console.log('Creating AI response message:', JSON.stringify(aiReply))
            try {
              await createMessage(aiReply)
              console.log('AI response message created successfully')
            } catch (err) {
              console.error('Failed to create AI response message:', err)
            }

            // 更新该机器人的对话上下文
            const newContext = [
              ...recentContext,
              { role: 'user', content: content },
              { role: 'assistant', content: data.choices[0].message.content }
            ]
            localStorage.setItem(`bot_context_${targetBot.id}`, JSON.stringify(newContext))

            await loadMessages()
            aiRequesting.value = false
          } else {
            ElMessage.error(data.error?.message || 'AI 回复失败')
            aiRequesting.value = false
          }
        } catch (error) {
          console.error('AI call failed:', error)
          ElMessage.error('AI 服务暂时不可用')
          aiRequesting.value = false
        }
      }
    } else {
      aiRequesting.value = false
    }
  } catch (error) {
    console.error('Send message failed:', error)
    ElMessage.error('发送失败')
    aiRequesting.value = false
  }
}

const handleCreateRoom = async () => {
  try {
    const res = await createRoom({ name: roomForm.name, description: roomForm.description, owner_id: userStore.userInfo.id })
    const newRoom = res.data || res
    if (newRoom && newRoom.id) {
      // 将创建者添加为房间成员
      try {
        await addRoomMember(newRoom.id, { user_id: userStore.userInfo.id, role: 'owner' })
      } catch (e) {
        console.error('添加创建者为房间成员失败:', e)
      }
    }
    ElMessage.success('创建成功')
    showCreateRoom.value = false
    roomForm.name = ''
    roomForm.description = ''
    await loadRooms()
  } catch (error) {
    console.error('创建房间失败:', error)
    ElMessage.error('创建失败')
  }
}

const handleDeleteRoom = async (room) => {
  // 保护官方房间，不能删除
  if ([3, 4, 5, 6].includes(Number(room.id))) {
    ElMessage.warning('官方房间不能删除')
    return
  }
  try {
    await ElMessageBox.confirm(`确定删除聊天室 "${room.name}" 吗？`, '提示', { type: 'warning' })
    console.log('开始删除房间:', room.id, typeof room.id, 'room:', room)
    // 确保 ID 是数字类型
    const roomId = Number(room.id)
    const res = await deleteRoom(roomId)
    console.log('删除房间响应:', res)
    ElMessage.success('删除成功')
    if (currentRoom.value?.id === room.id || currentRoom.value?.id === roomId) {
      currentRoom.value = null
      chatStore.setCurrentRoom(null)
      messages.value = []
      chatStore.setMessages([])
    }
    // 重新加载房间列表
    await loadRooms()
  } catch (error) {
    console.error('删除房间失败:', error)
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleLeaveRoom = async (room) => {
  if ([3, 4, 5, 6].includes(Number(room.id))) {
    ElMessage.warning('官方房间不能退出')
    return
  }
  try {
    await ElMessageBox.confirm(`确定退出聊天室 "${room.name}" 吗？`, '提示', { type: 'warning' })
    await removeRoomMember(room.id, userStore.userInfo.id)
    // 记录退出的房间
    const leftRooms = JSON.parse(localStorage.getItem('left_rooms') || '{}')
    leftRooms[room.id] = true
    localStorage.setItem('left_rooms', JSON.stringify(leftRooms))
    ElMessage.success('已退出房间')
    if (currentRoom.value?.id === room.id) {
      currentRoom.value = null
      chatStore.setCurrentRoom(null)
      messages.value = []
      chatStore.setMessages([])
    }
    await loadRooms()
  } catch (error) {
    console.error('退出房间失败:', error)
    if (error !== 'cancel') {
      ElMessage.error(error.message || '退出失败')
    }
  }
}

const handleInvite = async () => {
  if (inviteTab.value === 'user') {
    if (!inviteForm.userId) {
      ElMessage.warning('请选择要邀请的用户')
      return
    }
    if (!currentRoom.value?.id) {
      ElMessage.warning('请先选择一个聊天室')
      return
    }
    try {
      await addRoomMember(currentRoom.value.id, { user_id: inviteForm.userId, role: 'member' })
      ElMessage.success('已添加该用户到房间')
      await loadRoomMembers()
    } catch (error) {
      console.error('添加成员失败:', error)
      ElMessage.error('添加失败')
    }
    showInvite.value = false
    inviteForm.userId = null
  } else {
    if (!botForm.name || !botForm.configId) {
      ElMessage.warning('请填写机器人名称并选择模型')
      return
    }
    if (!currentRoom.value?.id) {
      ElMessage.warning('请先选择一个聊天室')
      return
    }
    // 保存机器人信息到 localStorage
    const bots = JSON.parse(localStorage.getItem('room_bots') || '{}')
    if (!bots[currentRoom.value.id]) {
      bots[currentRoom.value.id] = []
    }
    if (!bots['default']) {
      bots['default'] = []
    }
    const config = aiConfigs.value.find(c => c.id === botForm.configId)
    const newBot = {
      id: Math.floor(Date.now() / 1000) % 1000000000,
      name: botForm.name,
      configId: botForm.configId,
      modelName: config?.model_name || '',
      personality: botForm.personality || '你是一个有帮助的AI助手。',
      welcomeMsg: botForm.welcomeMsg,
      createdAt: new Date().toISOString()
    }
    // 添加到当前房间
    bots[currentRoom.value.id].push(newBot)
    // 同时添加到默认列表，使其在所有房间可用
    bots['default'].push(newBot)
    localStorage.setItem('room_bots', JSON.stringify(bots))

    // 刷新机器人列表
    refreshRoomBots()

    ElMessage.success(`机器人 "${botForm.name}" 已添加！`)
    showInvite.value = false
    botForm.name = ''
    botForm.configId = null
    botForm.personality = ''
    botForm.personalityPreset = ''
    botForm.welcomeMsg = ''
  }
}

const handleMemberCommand = async (command, user) => {
  if (command === 'remove') {
    try {
      await ElMessageBox.confirm(`确定将 "${user.username}" 移出房间吗？`, '提示', { type: 'warning' })
      await removeRoomMember(currentRoom.value.id, user.id)
      // 从本地列表移除
      roomMembers.value = roomMembers.value.filter(m => m.id !== user.id)
      ElMessage.success(`已将 ${user.username} 移出房间`)
    } catch (error) {
      console.error('移除成员失败:', error)
      if (error !== 'cancel') ElMessage.error('操作失败')
    }
  }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

const showReportDialog = (msg) => {
  reportForm.messageId = msg.id
  reportForm.content = msg.content
  reportForm.reason = ''
  reportForm.description = ''
  showReport.value = true
}

const handleReport = async () => {
  if (!reportForm.reason || !reportForm.description) {
    ElMessage.warning('请填写举报原因和详细说明')
    return
  }
  ElMessage.success('举报已提交')
  showReport.value = false
}

const scrollToBottom = () => {
  if (messageScroll.value) {
    messageScroll.value.scrollTo({ top: 999999, behavior: 'smooth' })
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f8fafc 100%);
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.chat-container::before {
  content: '';
  position: absolute;
  top: -20%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.chat-container::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

/* 侧边栏 */
.sidebar {
  width: 300px;
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 40px rgba(0,0,0,0.3);
  position: relative;
  z-index: 10;
  border-right: 1px solid rgba(255,255,255,0.1);
}

.sidebar-header {
  padding: 28px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.1));
}

.sidebar-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
  text-shadow: 0 2px 10px rgba(102, 126, 234, 0.5);
}

.sidebar-header .el-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
}

.sidebar-header .el-button:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.room-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
}

.room-list::-webkit-scrollbar {
  width: 4px;
}

.room-list::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.4);
  border-radius: 4px;
}

.room-item {
  padding: 16px 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 16px;
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 10px;
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;
  background: rgba(255,255,255,0.03);
}

.room-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: linear-gradient(180deg, #667eea, #764ba2);
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 0 4px 4px 0;
}

.room-item:hover {
  background: rgba(102, 126, 234, 0.15);
  transform: translateX(6px);
  border-color: rgba(102, 126, 234, 0.3);
}

.room-item:hover::before {
  opacity: 1;
}

.room-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.25));
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.25);
}

.room-item.active::before {
  opacity: 1;
}

.room-item.active .room-desc {
  color: rgba(255,255,255,0.8);
}

.room-avatar {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  flex-shrink: 0;
}

.room-item:hover .room-avatar {
  transform: scale(1.1) rotate(4deg);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.room-info {
  flex: 1;
  overflow: hidden;
}

.room-name {
  font-weight: 600;
  color: #fff;
  margin-bottom: 6px;
  font-size: 15px;
  text-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.room-desc {
  font-size: 12px;
  color: rgba(255,255,255,0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s;
}

.room-delete {
  opacity: 0;
  color: rgba(255,255,255,0.6);
  transition: all 0.2s;
  padding: 6px;
  border-radius: 8px;
  background: rgba(245, 108, 108, 0.1);
}

.room-item:hover .room-delete {
  opacity: 1;
}

.room-delete:hover {
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.2);
  transform: scale(1.1);
}

.room-action-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.5;
  transition: all 0.2s;
  font-size: 12px;
  padding: 2px 8px;
  height: 24px;
}

.room-delete-btn {
  right: 56px;
}

.room-item:hover .room-action-btn {
  opacity: 1;
}

/* 主聊天区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 10;
  margin: 16px;
  margin-left: 0;
  border-radius: 24px 0 0 24px;
  box-shadow: -10px 0 40px rgba(0,0,0,0.15);
  overflow: hidden;
}

.chat-header {
  padding: 20px 32px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(180deg, #fff 0%, rgba(248, 250, 252, 0.8) 100%);
  animation: slideDown 0.4s ease-out;
}

.chat-header .el-button {
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.3s;
}

.chat-header .el-button:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  transform: translateX(-4px);
}

.chat-title {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.08));
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  color: #667eea;
  font-weight: 600;
  transition: all 0.3s;
}

.back-btn:hover {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border-color: transparent;
  transform: translateX(-4px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.35);
}

.back-btn .el-icon {
  font-size: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  z-index: 200;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 14px;
  position: relative;
  transition: all 0.3s;
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.user-dropdown:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.1));
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.15);
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.arrow {
  color: #667eea;
  font-size: 12px;
  transition: transform 0.3s;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #fff;
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  min-width: 160px;
  z-index: 100;
  padding: 10px;
  animation: dropdownFade 0.2s ease-out;
}

@keyframes dropdownFade {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dropdown-item {
  padding: 12px 18px;
  font-size: 14px;
  color: #334155;
  transition: all 0.2s;
  border-radius: 10px;
  font-weight: 500;
}

.dropdown-item:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.08));
  color: #667eea;
  transform: translateX(4px);
}

.dropdown-item.danger {
  color: #f56c6c;
}

.dropdown-item.danger:hover {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

/* 消息列表 */
.message-list {
  flex: 1;
  padding: 28px 32px;
  overflow-y: auto;
  background: linear-gradient(180deg, #f8fafc 0%, #fff 50%, #f8fafc 100%);
  animation: fadeIn 0.5s ease-out;
}

.message-list::-webkit-scrollbar {
  width: 8px;
}

.message-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #667eea, #764ba2);
  border-radius: 4px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
  animation: floatIn 0.6s ease-out;
}

.ai-thinking {
  padding: 16px;
  text-align: center;
  color: #667eea;
  font-size: 14px;
  animation: pulse 1.5s infinite;
}

@keyframes floatIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.empty-icon {
  font-size: 72px;
  margin-bottom: 20px;
  opacity: 0.8;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
}

.empty-text {
  font-size: 16px;
  font-weight: 500;
  color: #64748b;
}

/* 无房间状态 */
.no-room {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  backdrop-filter: blur(10px);
}

.no-room-content {
  text-align: center;
  animation: floatIn 0.6s ease-out;
}

.no-room-icon {
  font-size: 88px;
  margin-bottom: 24px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.no-room-text {
  font-size: 18px;
  color: #64748b;
  font-weight: 500;
}

/* 输入区域 */
.chat-input {
  padding: 24px 32px;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  display: flex;
  gap: 16px;
  align-items: flex-end;
  background: linear-gradient(180deg, #fff 0%, rgba(248, 250, 252, 0.95) 100%);
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.input-wrapper {
  flex: 1;
  position: relative;
}

.chat-input :deep(.el-textarea__inner) {
  border-radius: 18px;
  padding: 16px 20px;
  font-size: 15px;
  border: 2px solid rgba(102, 126, 234, 0.15);
  transition: all 0.3s;
  background: rgba(102, 126, 234, 0.03);
  min-height: 56px !important;
}

.chat-input :deep(.el-textarea__inner:hover) {
  border-color: rgba(102, 126, 234, 0.4);
}

.chat-input :deep(.el-textarea__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.12);
  background: #fff;
}

.chat-input :deep(.el-button--primary) {
  border-radius: 16px;
  padding: 16px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
  font-weight: 600;
}

.chat-input :deep(.el-button--primary:hover) {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 10px 35px rgba(102, 126, 234, 0.5);
}

.chat-input :deep(.el-button--primary:disabled) {
  background: #cbd5e1;
  box-shadow: none;
}

/* @提及下拉 */
.mention-dropdown {
  position: absolute;
  bottom: 70px;
  left: 0;
  background: #fff;
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  max-height: 280px;
  overflow-y: auto;
  z-index: 1000;
  min-width: 280px;
  padding: 10px;
  animation: dropdownFade 0.25s ease-out;
}

.mention-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 12px;
  border: 1px solid transparent;
}

.mention-item:hover,
.mention-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.12), rgba(118, 75, 162, 0.1));
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateX(4px);
}

.mention-type {
  font-size: 11px;
  color: #667eea;
  margin-left: auto;
  background: rgba(102, 126, 234, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
}

/* 右侧边栏 */
.right-sidebar {
  width: 280px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  border-left: 1px solid rgba(102, 126, 234, 0.1);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
}

.sidebar-actions {
  padding: 20px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.08);
  display: flex;
  gap: 10px;
}

.sidebar-actions .el-button:first-child {
  flex: 1;
}

.sidebar-actions .el-button {
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s;
}

.sidebar-actions .el-button:first-child {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: #fff;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.sidebar-actions .el-button:first-child:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.sidebar-actions .el-button:last-child:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
  color: #667eea;
}

.right-sidebar-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: 600;
  color: #1e293b;
  transition: all 0.3s;
  background: rgba(102, 126, 234, 0.02);
}

.right-sidebar-header:hover {
  background: rgba(102, 126, 234, 0.06);
  color: #667eea;
}

.collapse-icon {
  color: #667eea;
  transition: transform 0.3s;
}

.collapse-icon.collapsed {
  transform: rotate(180deg);
}

.right-sidebar-section {
  border-bottom: 1px solid rgba(102, 126, 234, 0.08);
}

.member-list {
  overflow-y: auto;
  padding: 12px;
  max-height: 300px;
  transition: max-height 0.3s ease-out, padding 0.3s ease-out, opacity 0.3s ease-out;
}

.member-list.collapsed {
  max-height: 0;
  padding: 0 12px;
  overflow: hidden;
  opacity: 0;
}

.member-list::-webkit-scrollbar {
  width: 4px;
}

.member-list::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 2px;
}

.list-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: #94a3b8;
  font-size: 14px;
}

.member-item {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  min-height: 52px;
}

.member-item:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.05));
  border-color: rgba(102, 126, 234, 0.15);
}

.member-item .el-avatar {
  flex-shrink: 0;
}

.member-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.member-name {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-role {
  font-size: 12px;
  color: #667eea;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-action {
  flex-shrink: 0;
  color: #94a3b8;
  transition: all 0.2s;
  padding: 6px;
  border-radius: 8px;
  cursor: pointer;
}

.member-action:hover {
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.1);
}

/* 弹窗样式 */
:deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0,0,0,0.2);
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 24px 28px;
  margin: 0;
}

:deep(.el-dialog__title) {
  color: #fff;
  font-weight: 700;
  font-size: 18px;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: rgba(255,255,255,0.8);
}

:deep(.el-dialog__body) {
  padding: 28px;
}

:deep(.el-dialog__footer) {
  padding: 20px 28px;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #334155;
}

:deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 14px 16px;
  transition: all 0.3s;
  border: 2px solid #e2e8f0;
}

:deep(.el-input__wrapper:hover) {
  border-color: rgba(102, 126, 234, 0.4);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 12px;
}

/* 个人中心 */
.profile-info {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.05));
  border-radius: 16px;
  margin-bottom: 20px;
}

.profile-avatar {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.profile-detail {
  flex: 1;
}

.profile-detail h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #1e293b;
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
  transform: scale(1.15);
  border-color: #667eea;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.avatar-option.selected {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
}

/* 机器人列表 */
.bot-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bot-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  background: linear-gradient(135deg, #fff, rgba(248, 250, 252, 0.8));
  border-radius: 16px;
  transition: all 0.3s;
  border: 2px solid rgba(102, 126, 234, 0.1);
}

.bot-item:hover {
  background: #fff;
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateX(6px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
}

.bot-info {
  flex: 1;
}

.bot-name {
  font-weight: 700;
  font-size: 15px;
  color: #1e293b;
  margin-bottom: 6px;
}

.bot-model {
  font-size: 12px;
  color: #667eea;
  margin-bottom: 4px;
  font-weight: 600;
}

.bot-personality {
  font-size: 12px;
  color: #64748b;
}

.no-bots {
  text-align: center;
  padding: 48px 24px;
  color: #94a3b8;
}

.no-bots p {
  margin: 0 0 16px;
  font-size: 14px;
}

.no-configs-tip {
  text-align: center;
  padding: 24px;
  color: #b45309;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 14px;
  margin: 12px 0;
  border: 1px solid #f59e0b;
}

.no-configs-tip p {
  margin: 0;
  font-weight: 500;
}

.section-label {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-label::before {
  content: '';
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, #667eea, #764ba2);
  border-radius: 2px;
}

/* 举报内容 */
.report-content {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  padding: 16px;
  border-radius: 14px;
  max-height: 120px;
  overflow-y: auto;
  word-break: break-all;
  color: #334155;
  border: 1px solid rgba(102, 126, 234, 0.1);
  font-size: 14px;
  line-height: 1.6;
}

/* 社区弹窗 */
:deep(.community-dialog .el-dialog) {
  border-radius: 24px;
  max-width: 640px;
}

:deep(.community-dialog .el-dialog__header) {
  padding: 28px 32px 0;
  background: transparent;
}

:deep(.community-dialog .el-dialog__body) {
  padding: 24px 32px 32px;
}

.community-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 24px;
}

.community-icon {
  font-size: 48px;
}

.community-title h2 {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}

.community-title p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.community-stats {
  display: flex;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 20px;
  margin-bottom: 28px;
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.stat-label {
  font-size: 13px;
  color: rgba(255,255,255,0.85);
  font-weight: 500;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 18px 12px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 14px;
  text-align: center;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.feature-item:hover {
  background: #fff;
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.12);
}

.feature-icon {
  font-size: 28px;
}

.feature-text {
  font-size: 12px;
  color: #475569;
  font-weight: 600;
}

.channel-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: linear-gradient(135deg, #f8fafc, #fff);
  border-radius: 14px;
  transition: all 0.3s;
  border: 1px solid rgba(102, 126, 234, 0.08);
  margin-bottom: 10px;
}

.channel-item:hover {
  background: #fff;
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateX(6px);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.1);
}

.channel-item.clickable {
  cursor: pointer;
}

.channel-icon {
  font-size: 26px;
}

.channel-info {
  flex: 1;
}

.channel-info strong {
  display: block;
  font-size: 15px;
  color: #1e293b;
  margin-bottom: 4px;
}

.channel-info p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

.community-footer {
  display: flex;
  justify-content: center;
  gap: 14px;
  padding-top: 8px;
}

.community-footer .el-button--primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  padding: 14px 32px;
  font-weight: 600;
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
}

.community-footer .el-button--primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 35px rgba(102, 126, 234, 0.5);
}

.community-footer .el-button:not(.el-button--primary) {
  border: 2px solid rgba(102, 126, 234, 0.3);
  color: #667eea;
  font-weight: 600;
}

.community-footer .el-button:not(.el-button--primary):hover {
  background: rgba(102, 126, 234, 0.08);
}

/* 社区规范详情 */
.rules-toggle {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
}

.rules-toggle .collapse-icon {
  transition: transform 0.3s;
  margin-left: auto;
}

.rules-detail {
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  margin-top: 12px;
}

.rule-section {
  margin-bottom: 16px;
}

.rule-section:last-child {
  margin-bottom: 0;
}

.rule-section h5 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #334155;
}

.rule-section ul {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.8;
}

.rules-summary {
  text-align: center;
  padding: 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.05));
  border-radius: 8px;
  margin-top: 12px;
  font-size: 13px;
  color: #667eea;
  font-weight: 500;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .sidebar {
    width: 260px;
  }
  .right-sidebar {
    width: 240px;
  }
}

@media (max-width: 992px) {
  .right-sidebar {
    display: none;
  }
  .chat-main {
    margin: 16px;
    border-radius: 24px;
  }
  .sidebar {
    width: 240px;
  }
}
</style>