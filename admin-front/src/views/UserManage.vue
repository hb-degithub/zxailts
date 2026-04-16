<template>
  <div class="user-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-input v-model="keyword" placeholder="搜索用户名或ID" style="width: 200px" clearable @change="loadUsers" />
        </div>
      </template>
      <el-table :data="users" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'">{{ row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="180" />
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="warning" @click="handleQuota(row)">额度</el-button>
            <el-button size="small" type="danger" :disabled="row.role === 'admin'" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadUsers"
        @current-change="loadUsers"
        style="margin-top: 20px"
      />
    </el-card>

    <el-dialog v-model="editDialog" title="编辑用户" width="400px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="editForm.role">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="quotaDialog" title="设置用户额度" width="400px">
      <el-form :model="quotaForm" label-width="100px">
        <el-form-item label="每日限制次数">
          <el-input-number v-model="quotaForm.dailyLimit" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="quotaDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveQuota">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsers, updateUser, deleteUser, setUserQuota } from '@/api/users'

const loading = ref(false)
const users = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const keyword = ref('')

const editDialog = ref(false)
const editForm = reactive({ id: null, username: '', role: '' })
const quotaDialog = ref(false)
const quotaForm = reactive({ userId: null, dailyLimit: 50 })

onMounted(() => loadUsers())

const loadUsers = async () => {
  loading.value = true
  try {
    const res = await getUsers({ page: page.value, pageSize: pageSize.value, keyword: keyword.value })
    users.value = res.data.list
    total.value = res.data.pagination.total
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleEdit = (row) => {
  editForm.id = row.id
  editForm.username = row.username
  editForm.role = row.role
  editDialog.value = true
}

const handleSaveEdit = async () => {
  try {
    await updateUser(editForm.id, { username: editForm.username, role: editForm.role })
    ElMessage.success('保存成功')
    editDialog.value = false
    loadUsers()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const handleQuota = (row) => {
  quotaForm.userId = row.id
  quotaForm.dailyLimit = row.daily_limit || 50
  quotaDialog.value = true
}

const handleSaveQuota = async () => {
  try {
    await setUserQuota(quotaForm.userId, { dailyLimit: quotaForm.dailyLimit })
    ElMessage.success('设置成功')
    quotaDialog.value = false
  } catch (error) {
    ElMessage.error('设置失败')
  }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该用户?', '警告', { type: 'warning' })
    await deleteUser(id)
    ElMessage.success('删除成功')
    loadUsers()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}
</script>

<style scoped>
.user-manage {
  padding: 24px;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-card) {
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}

:deep(.el-card__header) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-weight: 600;
  padding: 16px 20px;
  border: none;
}

:deep(.el-table th) {
  background: #f8fafc !important;
  color: #475569;
  font-weight: 600;
}

:deep(.el-tag) {
  border-radius: 8px;
  padding: 0 10px;
}

:deep(.el-button) {
  border-radius: 8px;
}
</style>
