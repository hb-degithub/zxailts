<template>
  <div :class="['chat-bubble', message.message_type === 'ai_response' ? 'ai' : 'user']">
    <div class="bubble-content">
      <el-avatar :size="32" class="avatar" :style="getAvatarStyle()">
        {{ getDisplayName() }}
      </el-avatar>
      <div class="bubble-wrapper">
        <div class="username" :style="{ color: message.message_type === 'ai_response' ? '#667eea' : '#333' }">
          {{ getDisplayName() }}
          <span v-if="message.message_type === 'ai_response' && message.bot_id" class="bot-tag">机器人</span>
        </div>
        <div class="bubble" v-html="formattedContent" />
        <div class="actions" v-if="message.message_type !== 'system'">
          <el-button size="small" text @click.stop="$emit('report', message)">举报</el-button>
        </div>
      </div>
    </div>
    <div class="time">{{ formatTime(message.created_at) }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

defineEmits(['report'])

const md = new MarkdownIt()

// 机器人颜色列表
const botColors = ['#667eea', '#e94560', '#00b894', '#fdcb6e', '#6c5ce7', '#fd79a8']

const getBotName = () => {
  if (props.message.bot_id) {
    const bots = JSON.parse(localStorage.getItem('room_bots') || '{}')
    for (const roomId in bots) {
      const bot = bots[roomId].find(b => b.id === props.message.bot_id)
      if (bot) return bot.name
    }
  }
  return ''
}

const getDisplayName = () => {
  if (props.message.message_type === 'ai_response') {
    return getBotName() || 'AI助手'
  }
  return props.message.username || '用户'
}

const getAvatarStyle = () => {
  if (props.message.message_type === 'ai_response' && props.message.bot_id) {
    const colorIndex = props.message.bot_id % botColors.length
    return { background: botColors[colorIndex] }
  }
  return { background: props.message.message_type === 'ai_response' ? '#667eea' : '#333' }
}

const formattedContent = computed(() => {
  if (props.message.message_type === 'ai_response') {
    return md.render(props.message.content)
  }
  // 渲染时高亮@提及
  let content = props.message.content || ''
  content = content.replace(/@(\S+)/g, '<span class="at-mention">@$1</span>')
  return content
})

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
</script>

/* 消息气泡样式 */
.chat-bubble {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  max-width: 72%;
  animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.chat-bubble.user {
  align-self: flex-end;
  align-items: flex-end;
}

.chat-bubble.ai {
  align-self: flex-start;
  align-items: flex-start;
}

.bubble-content {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  transition: transform 0.25s ease;
}

.chat-bubble.user .bubble-content {
  flex-direction: row-reverse;
}

.chat-bubble:hover .bubble-content {
  transform: translateX(0) scale(1.01);
}

.chat-bubble.user:hover .bubble-content {
  transform: translateX(0) scale(1.01);
}

.avatar {
  flex-shrink: 0;
  transition: all 0.25s ease;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.chat-bubble:hover .avatar {
  transform: scale(1.1) translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

.bubble-wrapper {
  position: relative;
  max-width: 100%;
}

.username {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
  padding: 0 6px;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.3px;
}

.chat-bubble.user .username {
  text-align: right;
  justify-content: flex-end;
}

.bubble {
  padding: 14px 20px;
  border-radius: 20px;
  line-height: 1.7;
  word-break: break-word;
  font-size: 15px;
  transition: all 0.25s ease;
  position: relative;
}

.chat-bubble.user .bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-bottom-right-radius: 8px;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.35);
}

.chat-bubble.ai .bubble {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #1e293b;
  border-bottom-left-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.chat-bubble:hover .bubble {
  transform: translateY(-2px);
}

.chat-bubble.user:hover .bubble {
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.45);
  transform: translateY(-3px);
}

.chat-bubble.ai:hover .bubble {
  box-shadow: 0 12px 30px rgba(0,0,0,0.12);
  border-color: rgba(102, 126, 234, 0.2);
}

:deep(.at-mention) {
  color: #667eea;
  font-weight: 700;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.18), rgba(118, 75, 162, 0.15));
  padding: 4px 10px;
  border-radius: 8px;
  display: inline-block;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.chat-bubble.user :deep(.at-mention) {
  color: #fff;
  background: rgba(255,255,255,0.2);
  border-color: rgba(255,255,255,0.3);
}

.bot-tag {
  font-size: 11px;
  color: #fff;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 3px 10px;
  border-radius: 12px;
  margin-left: 0;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.actions {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: all 0.25s ease;
  right: -60px;
}

.chat-bubble.user .actions {
  left: -60px;
  right: auto;
}

.chat-bubble:hover .actions {
  opacity: 1;
  transform: translateY(-50%) scale(1.1);
}

.chat-bubble.user:hover .actions {
  transform: translateY(-50%) scale(1.1);
}

.time {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 8px;
  padding: 0 6px;
  animation: fadeIn 0.4s ease-out 0.15s both;
  font-weight: 500;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Markdown 样式 */
:deep(.bubble p) {
  margin: 0 0 12px 0;
}

:deep(.bubble p:last-child) {
  margin-bottom: 0;
}

:deep(.bubble code) {
  background: rgba(0,0,0,0.08);
  padding: 4px 8px;
  border-radius: 6px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 13.5px;
  font-weight: 500;
}

.chat-bubble.ai :deep(.bubble code) {
  background: rgba(102, 126, 234, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.15);
}

.chat-bubble.user :deep(.bubble code) {
  background: rgba(255,255,255,0.2);
  color: #fff;
}

:deep(.bubble pre) {
  background: #1e1e1e;
  padding: 16px 20px;
  border-radius: 14px;
  overflow-x: auto;
  margin: 14px 0;
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.2);
}

:deep(.bubble pre code) {
  background: transparent;
  padding: 0;
  color: #e2e8f0;
  font-size: 13px;
  line-height: 1.6;
}

:deep(.bubble ul), :deep(.bubble ol) {
  margin: 12px 0;
  padding-left: 26px;
}

:deep(.bubble li) {
  margin: 6px 0;
}

:deep(.bubble blockquote) {
  margin: 14px 0;
  padding: 12px 18px;
  border-left: 4px solid #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.05));
  border-radius: 0 12px 12px 0;
  color: #475569;
}

:deep(.bubble strong) {
  color: inherit;
  font-weight: 700;
}

:deep(.bubble a) {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

:deep(.bubble a:hover) {
  border-bottom-color: #667eea;
}

.chat-bubble.user :deep(.bubble a) {
  color: #fff;
}

.chat-bubble.user :deep(.bubble a:hover) {
  border-bottom-color: rgba(255,255,255,0.6);
}