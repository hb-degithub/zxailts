// 错误日志工具
const LOG_KEY = 'app_debug_logs'

export function logError(context, error, extra = {}) {
  const logs = getLogs()
  const entry = {
    type: 'error',
    context,
    message: error?.message || error?.msg || String(error),
    stack: error?.stack,
    extra,
    timestamp: new Date().toISOString()
  }
  logs.push(entry)
  // 只保留最近 50 条
  if (logs.length > 50) logs.shift()
  saveLogs(logs)
  console.error(`[DEBUG ERROR] ${context}:`, error, extra)
}

export function logInfo(context, message, extra = {}) {
  const logs = getLogs()
  const entry = {
    type: 'info',
    context,
    message,
    extra,
    timestamp: new Date().toISOString()
  }
  logs.push(entry)
  if (logs.length > 50) logs.shift()
  saveLogs(logs)
  console.log(`[DEBUG INFO] ${context}:`, message, extra)
}

export function getLogs() {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) || '[]')
  } catch {
    return []
  }
}

function saveLogs(logs) {
  localStorage.setItem(LOG_KEY, JSON.stringify(logs))
}

export function clearLogs() {
  localStorage.removeItem(LOG_KEY)
}

export function downloadLogs() {
  const logs = getLogs()
  const content = JSON.stringify(logs, null, 2)
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `debug-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 页面加载时自动记录
if (import.meta.env.DEV) {
  window.addEventListener('error', (e) => {
    logError('window.onerror', { message: e.message, filename: e.filename, lineno: e.lineno }, {})
  })
  window.addEventListener('unhandledrejection', (e) => {
    logError('unhandledrejection', e.reason, {})
  })
}
