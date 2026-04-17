<template>
  <div class="model-config">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>AI 模型配置</span>
          <el-button type="primary" @click="handleAdd">添加配置</el-button>
        </div>
      </template>
      <el-table :data="configs" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="room_id" label="房间ID" width="80" />
        <el-table-column prop="provider" label="提供商" width="100" />
        <el-table-column prop="api_base_url" label="API地址" show-overflow-tooltip />
        <el-table-column prop="model_name" label="模型" width="120" />
        <el-table-column prop="is_public" label="公开" width="80">
          <template #default="{ row }">
            <el-tag :type="row.is_public ? 'success' : 'info'">{{ row.is_public ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="success" @click="handleTest(row)">测试</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑配置' : '添加配置'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="房间ID">
          <el-input-number v-model="form.room_id" :min="1" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="提供商">
          <el-input v-model="form.provider" placeholder="如: openai, anthropic" />
        </el-form-item>
        <el-form-item label="API地址">
          <el-input v-model="form.api_base_url" placeholder="如: https://api.openai.com/v1" />
        </el-form-item>
        <el-form-item label="API密钥">
          <el-input v-model="form.api_key" type="password" show-password placeholder="sk-..." />
        </el-form-item>
        <el-form-item label="模型名称">
          <el-input v-model="form.model_name" placeholder="如: gpt-4o-mini" />
        </el-form-item>
        <el-form-item label="系统提示词">
          <el-input v-model="form.system_prompt" type="textarea" :rows="3" placeholder="设置AI角色和行为..." />
        </el-form-item>
        <el-form-item label="最大Token">
          <el-input-number v-model="form.max_tokens" :min="100" :max="8192" />
        </el-form-item>
        <el-form-item label="温度参数">
          <el-input-number v-model="form.temperature" :min="0" :max="2" :step="0.1" :precision="2" />
        </el-form-item>
        <el-form-item label="公开给用户">
          <el-switch v-model="form.is_public" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getModelConfigs, createModelConfig, updateModelConfig, deleteModelConfig, testModelConfig } from '@/api/modelConfig'

const loading = ref(false)
const configs = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = reactive({
  id: null,
  room_id: 1,
  provider: '',
  api_base_url: '',
  api_key: '',
  model_name: '',
  system_prompt: '',
  max_tokens: 2048,
  temperature: 0.7,
  is_public: false
})

onMounted(() => loadConfigs())

const loadConfigs = async () => {
  loading.value = true
  try {
    const res = await getModelConfigs({ page: 1, pageSize: 100 })
    configs.value = res.data.list
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, { id: null, room_id: 1, provider: '', api_base_url: '', api_key: '', model_name: '', system_prompt: '', max_tokens: 2048, temperature: 0.7, is_public: false })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleSave = async () => {
  try {
    if (isEdit.value) {
      await updateModelConfig(form.id, form)
      ElMessage.success('更新成功')
    } else {
      await createModelConfig(form)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadConfigs()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const handleDelete = async (id) => {
  try {
    await deleteModelConfig(id)
    ElMessage.success('删除成功')
    loadConfigs()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleTest = async (row) => {
  try {
    const res = await testModelConfig({
      api_base_url: row.api_base_url,
      api_key: row.api_key,
      model_name: row.model_name
    })
    ElMessage.success('测试成功: ' + JSON.stringify(res.data))
  } catch (error) {
    ElMessage.error('测试失败: ' + (error.response?.data?.message || error.message))
  }
}
</script>

<style scoped>
.model-config {
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

:deep(.el-button) {
  border-radius: 8px;
}
</style>