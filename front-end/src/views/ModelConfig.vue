<template>
  <div class="config-container">
    <div class="config-header">
      <el-button @click="$router.push('/chat')">返回聊天</el-button>
      <h2>AI 模型配置</h2>
      <el-button type="primary" @click="showAdd = true">添加配置</el-button>
    </div>

    <el-table :data="configs" style="width: 100%">
      <el-table-column prop="name" label="配置名称" />
      <el-table-column prop="api_base_url" label="API 地址" />
      <el-table-column prop="model_name" label="模型名称" />
      <el-table-column prop="max_context_messages" label="上下文数" width="100" />
      <el-table-column prop="timeout" label="超时(秒)" width="100" />
      <el-table-column prop="is_default" label="默认" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.is_default" type="success">是</el-tag>
          <el-tag v-else type="info">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="is_active" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.is_active ? 'success' : 'danger'">
            {{ row.is_active ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showAdd" :title="isEdit ? '编辑配置' : '添加配置'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="配置名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="API 基础地址">
          <el-input v-model="form.api_base_url" placeholder="https://api.openai.com/v1" />
        </el-form-item>
        <el-form-item label="API 密钥">
          <el-input v-model="form.api_key" type="password" show-password />
        </el-form-item>
        <el-form-item label="模型名称">
          <el-input v-model="form.model_name" placeholder="gpt-3.5-turbo" />
        </el-form-item>
        <el-form-item label="最大上下文">
          <el-input-number v-model="form.max_context_messages" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="超时时间(秒)">
          <el-input-number v-model="form.timeout" :min="5" :max="120" />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="form.is_default" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.is_active" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdd = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import {
  getModelConfigs,
  createModelConfig,
  updateModelConfig,
  deleteModelConfig
} from '@/api/modelConfigs'

const router = useRouter()
const userStore = useUserStore()

const configs = ref([])
const showAdd = ref(false)
const isEdit = ref(false)

const form = reactive({
  id: null,
  user_id: null,
  name: '',
  api_base_url: '',
  api_key: '',
  model_name: '',
  max_context_messages: 10,
  timeout: 30,
  is_default: false,
  is_active: true
})

onMounted(async () => {
  if (!userStore.userInfo) {
    router.push('/login')
    return
  }
  if (userStore.userInfo.role !== 'admin') {
    router.push('/home')
    return
  }
  await loadConfigs()
})

const loadConfigs = async () => {
  try {
    const res = await getModelConfigs({ user_id: userStore.userInfo.id })
    configs.value = res.data.list
  } catch (error) {
    ElMessage.error('加载配置失败')
  }
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  showAdd.value = true
}

const handleSave = async () => {
  try {
    form.user_id = userStore.userInfo.id
    if (isEdit.value) {
      await updateModelConfig(form.id, form)
      ElMessage.success('更新成功')
    } else {
      await createModelConfig(form)
      ElMessage.success('添加成功')
    }
    showAdd.value = false
    isEdit.value = false
    await loadConfigs()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除此配置?', '提示', {
      type: 'warning'
    })
    await deleteModelConfig(id)
    ElMessage.success('删除成功')
    await loadConfigs()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
</script>

<style scoped>
.config-container {
  padding: 20px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.config-header h2 {
  margin: 0;
}
</style>
