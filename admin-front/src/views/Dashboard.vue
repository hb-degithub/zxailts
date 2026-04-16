<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card class="stat-card clickable" @click="showUsersDialog">
          <div class="stat-icon users"><el-icon><User /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-label">用户总数</div>
          </div>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card clickable" @click="showRoomsDialog">
          <div class="stat-icon rooms"><el-icon><ChatDotRound /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalRooms }}</div>
            <div class="stat-label">聊天室总数</div>
          </div>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon messages"><el-icon><ChatLineSquare /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalMessages }}</div>
            <div class="stat-label">消息总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon ai"><el-icon><Cpu /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalAiConfigs }}</div>
            <div class="stat-label">AI 配置数</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon today"><el-icon><Bell /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.todayMessages }}</div>
            <div class="stat-label">今日消息</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon online"><el-icon><CircleCheck /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.todayActiveUsers }}</div>
            <div class="stat-label">今日活跃用户</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon bots"><el-icon><MagicStick /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalPublicBots }}</div>
            <div class="stat-label">公开机器人</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon codes"><el-icon><Ticket /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalCodes }}</div>
            <div class="stat-label">邀请码</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="recent-messages">
          <template #header>
            <div class="card-header">
              <span>最近消息</span>
              <el-button size="small" @click="loadMessages">刷新</el-button>
            </div>
          </template>
          <el-table :data="recentMessages" stripe style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="username" label="用户" width="120">
              <template #default="{ row }">
                <span class="username-link" @click="showUserDetail(row.user_id)">{{ row.username || '未知' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="room_name" label="聊天室" width="150" />
            <el-table-column prop="content" label="内容" show-overflow-tooltip />
            <el-table-column prop="message_type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.message_type === 'ai_response' ? 'success' : 'primary'" size="small">
                  {{ row.message_type === 'ai_response' ? 'AI' : row.message_type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.created_at) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="quick-actions">
          <template #header>
            <span>快捷操作</span>
          </template>
          <div class="action-list">
            <el-button type="primary" class="action-btn" @click="createCustomerService">
              <el-icon><Service /></el-icon>
              创建官方客服群
            </el-button>
            <el-button type="success" class="action-btn" @click="showRoomsDialog">
              <el-icon><ChatDotRound /></el-icon>
              管理聊天室
            </el-button>
            <el-button type="warning" class="action-btn" @click="showUsersDialog">
              <el-icon><User /></el-icon>
              管理用户
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 用户列表对话框 -->
    <el-dialog v-model="usersDialogVisible" title="用户管理" width="900px">
      <el-table :data="usersList" stripe @row-click="handleUserRowClick" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'" size="small">
              {{ row.role === 'admin' ? '管理员' : '用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message_count" label="消息数" width="100" />
        <el-table-column prop="room_count" label="房间数" width="100" />
        <el-table-column prop="created_at" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" @click.stop="showUserDetail(row.id)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="usersPage"
          :page-size="usersPageSize"
          :total="usersTotal"
          layout="prev, pager, next"
          @current-change="loadUsers"
        />
      </div>
    </el-dialog>

    <!-- 聊天室列表对话框 -->
    <el-dialog v-model="roomsDialogVisible" title="聊天室管理" width="900px">
      <el-table :data="roomsList" stripe @row-click="handleRoomRowClick" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" width="150" />
        <el-table-column prop="owner_name" label="房主" width="120" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoomTypeTag(row.type)" size="small">
              {{ getRoomTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="member_count" label="成员数" width="100" />
        <el-table-column prop="message_count" label="消息数" width="100" />
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" @click.stop="showRoomDetail(row.id)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="roomsPage"
          :page-size="roomsPageSize"
          :total="roomsTotal"
          layout="prev, pager, next"
          @current-change="loadRooms"
        />
      </div>
    </el-dialog>

    <!-- 用户详情对话框 -->
    <el-dialog v-model="userDetailVisible" title="用户详情" width="700px">
      <div v-if="currentUser" class="user-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ currentUser.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag :type="currentUser.role === 'admin' ? 'danger' : 'primary'">
              {{ currentUser.role === 'admin' ? '管理员' : '用户' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="消息数">{{ currentUser.message_count || 0 }}</el-descriptions-item>
          <el-descriptions-item label="聊天室数">{{ currentUser.room_count || 0 }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ formatTime(currentUser.created_at) }}</el-descriptions-item>
        </el-descriptions>

        <h4>最近消息</h4>
        <el-scrollbar max-height="300px">
          <div v-for="msg in currentUser.recentMessages" :key="msg.id" class="message-item">
            <span class="msg-room">{{ msg.room_name }}</span>
            <span class="msg-content">{{ msg.content }}</span>
            <span class="msg-time">{{ formatTime(msg.created_at) }}</span>
          </div>
          <div v-if="!currentUser.recentMessages?.length" class="empty-tip">暂无消息</div>
        </el-scrollbar>

        <h4>拥有的聊天室</h4>
        <div class="room-list">
          <div v-for="room in currentUser.userRooms" :key="room.id" class="room-item" @click="showRoomDetail(room.id)">
            {{ room.name }}
          </div>
          <div v-if="!currentUser.userRooms?.length" class="empty-tip">暂无聊天室</div>
        </div>
      </div>
    </el-dialog>

    <!-- 聊天室详情对话框 -->
    <el-dialog v-model="roomDetailVisible" title="聊天室详情" width="700px">
      <div v-if="currentRoom" class="room-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ currentRoom.id }}</el-descriptions-item>
          <el-descriptions-item label="名称">{{ currentRoom.name }}</el-descriptions-item>
          <el-descriptions-item label="房主">{{ currentRoom.owner_name || '系统' }}</el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag :type="getRoomTypeTag(currentRoom.type)">
              {{ getRoomTypeName(currentRoom.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ currentRoom.description || '无' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatTime(currentRoom.created_at) }}</el-descriptions-item>
        </el-descriptions>

        <h4>成员列表 ({{ currentRoom.members?.length || 0 }})</h4>
        <el-scrollbar max-height="200px">
          <div v-for="member in currentRoom.members" :key="member.id" class="member-item">
            <el-avatar :size="32">{{ member.username?.[0] || 'U' }}</el-avatar>
            <span class="member-name">{{ member.username }}</span>
            <el-tag size="small">{{ member.role }}</el-tag>
          </div>
          <div v-if="!currentRoom.members?.length" class="empty-tip">暂无成员</div>
        </el-scrollbar>

        <h4>最近消息</h4>
        <el-scrollbar max-height="300px">
          <div v-for="msg in currentRoom.recentMessages" :key="msg.id" class="message-item">
            <span class="msg-user">{{ msg.username }}:</span>
            <span class="msg-content">{{ msg.content }}</span>
            <span class="msg-time">{{ formatTime(msg.created_at) }}</span>
          </div>
          <div v-if="!currentRoom.recentMessages?.length" class="empty-tip">暂无消息</div>
        </el-scrollbar>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getStats, getRecentMessages, getUsers, getUser, getRooms, getRoom, createOfficialCustomerService } from '@/api/dashboard'
import { User, ChatDotRound, ChatLineSquare, Cpu, Bell, CircleCheck, MagicStick, Ticket, Service, ArrowRight } from '@element-plus/icons-vue'

const stats = ref({
  totalUsers: 0,
  totalRooms: 0,
  totalMessages: 0,
  todayMessages: 0,
  todayActiveUsers: 0,
  totalCodes: 0,
  totalAiConfigs: 0,
  totalPublicBots: 0
})

const recentMessages = ref([])

// 用户列表相关
const usersDialogVisible = ref(false)
const usersList = ref([])
const usersPage = ref(1)
const usersPageSize = ref(20)
const usersTotal = ref(0)

// 聊天室列表相关
const roomsDialogVisible = ref(false)
const roomsList = ref([])
const roomsPage = ref(1)
const roomsPageSize = ref(20)
const roomsTotal = ref(0)

// 用户详情相关
const userDetailVisible = ref(false)
const currentUser = ref(null)

// 聊天室详情相关
const roomDetailVisible = ref(false)
const currentRoom = ref(null)

const loadStats = async () => {
  try {
    const res = await getStats()
    console.log('Stats API response:', res)
    if (res && res.data) {
      stats.value = res.data
    } else if (res) {
      stats.value = res
    }
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}

const loadMessages = async () => {
  try {
    const res = await getRecentMessages(20)
    console.log('Messages API response:', res)
    if (res && res.data) {
      recentMessages.value = res.data
    } else if (res) {
      recentMessages.value = res
    }
  } catch (error) {
    console.error('加载消息失败', error)
  }
}

const loadUsers = async () => {
  try {
    const res = await getUsers({ page: usersPage.value, pageSize: usersPageSize.value })
    usersList.value = res.data.list || []
    usersTotal.value = res.data.total || 0
  } catch (error) {
    console.error('加载用户列表失败', error)
  }
}

const loadRooms = async () => {
  try {
    const res = await getRooms({ page: roomsPage.value, pageSize: roomsPageSize.value })
    roomsList.value = res.data.list || []
    roomsTotal.value = res.data.total || 0
  } catch (error) {
    console.error('加载聊天室列表失败', error)
  }
}

const showUsersDialog = async () => {
  usersDialogVisible.value = true
  await loadUsers()
}

const showRoomsDialog = async () => {
  roomsDialogVisible.value = true
  await loadRooms()
}

const handleUserRowClick = (row) => {
  showUserDetail(row.id)
}

const handleRoomRowClick = (row) => {
  showRoomDetail(row.id)
}

const showUserDetail = async (id) => {
  try {
    const res = await getUser(id)
    currentUser.value = res.data
    userDetailVisible.value = true
    usersDialogVisible.value = false
  } catch (error) {
    console.error('加载用户详情失败', error)
    ElMessage.error('加载用户详情失败')
  }
}

const showRoomDetail = async (id) => {
  try {
    const res = await getRoom(id)
    currentRoom.value = res.data
    roomDetailVisible.value = true
    roomsDialogVisible.value = false
  } catch (error) {
    console.error('加载聊天室详情失败', error)
    ElMessage.error('加载聊天室详情失败')
  }
}

const createCustomerService = async () => {
  try {
    await createOfficialCustomerService({ name: '官方客服群', description: '官方客服，为您解答问题' })
    ElMessage.success('官方客服群已创建/已存在')
    await loadStats()
  } catch (error) {
    console.error('创建客服群失败', error)
    ElMessage.error('创建失败')
  }
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

const getRoomTypeName = (type) => {
  const map = {
    'public': '公开',
    'private': '私有',
    'ai_chat': 'AI客服'
  }
  return map[type] || type
}

const getRoomTypeTag = (type) => {
  const map = {
    'public': 'success',
    'private': 'warning',
    'ai_chat': 'danger'
  }
  return map[type] || 'info'
}

onMounted(async () => {
  await Promise.all([loadStats(), loadMessages()])
})
</script>

<style scoped>
.dashboard {
  padding: 24px;
  animation: fadeIn 0.4s ease-out;
  background: #f5f7fa;
  min-height: 100vh;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.stat-cards { margin-bottom: 20px; }

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: none;
  background: #fff;
  position: relative;
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.stat-card .arrow-icon {
  position: absolute;
  right: 16px;
  color: #c0c4cc;
  font-size: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
}

.stat-icon.users { background: linear-gradient(135deg, #667eea, #764ba2); }
.stat-icon.rooms { background: linear-gradient(135deg, #f093fb, #f5576c); }
.stat-icon.messages { background: linear-gradient(135deg, #4facfe, #00f2fe); }
.stat-icon.ai { background: linear-gradient(135deg, #43e97b, #38f9d7); }
.stat-icon.today { background: linear-gradient(135deg, #fa709a, #fee140); }
.stat-icon.online { background: linear-gradient(135deg, #30cfd0, #330867); }
.stat-icon.bots { background: linear-gradient(135deg, #a18cd1, #fbc2eb); }
.stat-icon.codes { background: linear-gradient(135deg, #fccb90, #d57eeb); }

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.stat-label {
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  margin-top: 4px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.recent-messages {
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recent-messages :deep(.el-card__header) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-weight: 600;
  padding: 16px 20px;
  border: none;
}

.quick-actions {
  border-radius: 12px;
  height: 100%;
}

.quick-actions :deep(.el-card__header) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-weight: 600;
  padding: 16px 20px;
  border: none;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  width: 100%;
  justify-content: flex-start;
  padding: 16px 20px;
}

.action-btn .el-icon {
  margin-right: 8px;
}

:deep(.el-table th) {
  background: #f8fafc !important;
  color: #475569;
  font-weight: 600;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: #fafbfc;
}

:deep(.el-table tr) {
  cursor: pointer;
}

.username-link {
  color: #667eea;
  cursor: pointer;
}

.username-link:hover {
  text-decoration: underline;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.user-detail h4,
.room-detail h4 {
  margin: 20px 0 12px;
  font-size: 14px;
  color: #334155;
  font-weight: 600;
}

.message-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 13px;
}

.msg-room {
  color: #667eea;
  font-weight: 500;
  min-width: 80px;
}

.msg-user {
  color: #334155;
  font-weight: 500;
}

.msg-content {
  flex: 1;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.msg-time {
  color: #94a3b8;
  font-size: 12px;
  min-width: 140px;
  text-align: right;
}

.room-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.room-item {
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 20px;
  font-size: 13px;
  color: #667eea;
  cursor: pointer;
  transition: all 0.2s;
}

.room-item:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
  transform: translateY(-2px);
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
  margin-bottom: 8px;
}

.member-name {
  flex: 1;
  font-weight: 500;
  color: #334155;
}

.empty-tip {
  text-align: center;
  color: #94a3b8;
  padding: 20px;
}
</style>
