<template>
  <div class="invite-codes">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>邀请码管理</span>
          <el-button type="primary" @click="showGenerate = true">生成邀请码</el-button>
        </div>
      </template>

      <el-table :data="codes" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="code" label="邀请码" width="150">
          <template #default="{ row }">
            <el-tag type="success" style="font-size: 16px; letter-spacing: 2px;">{{ row.code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="expires_at" label="过期时间" width="180" />
        <el-table-column prop="max_uses" label="可用次数" width="100" />
        <el-table-column prop="used_count" label="已使用" width="100" />
        <el-table-column prop="is_active" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'">{{ row.is_active ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" type="warning" @click="handleToggle(row)">
              {{ row.is_active ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadCodes"
        @current-change="loadCodes"
        style="margin-top: 20px"
      />
    </el-card>

    <el-dialog v-model="showGenerate" title="生成邀请码" width="450px">
      <el-form :model="generateForm" label-width="100px">
        <el-form-item label="生成数量">
          <el-input-number v-model="generateForm.count" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="有效期(天)">
          <el-input-number v-model="generateForm.expiresInDays" :min="1" :max="365" />
        </el-form-item>
        <el-form-item label="最大使用次数">
          <el-input-number v-model="generateForm.maxUses" :min="1" :max="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showGenerate = false">取消</el-button>
        <el-button type="primary" @click="handleGenerate">生成</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showResult" title="生成成功" width="400px">
      <div class="code-list">
        <el-tag v-for="code in generatedCodes" :key="code.code" type="success" style="margin: 5px; font-size: 14px; letter-spacing: 2px;">
          {{ code.code }}
        </el-tag>
      </div>
      <template #footer>
        <el-button type="primary" @click="showResult = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCodes, generateCodes, deleteCode, toggleCode } from '@/api/inviteCodes'

const loading = ref(false)
const codes = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const showGenerate = ref(false)
const showResult = ref(false)
const generatedCodes = ref([])

const generateForm = reactive({
  count: 1,
  expiresInDays: 7,
  maxUses: 1
})

onMounted(() => loadCodes())

const loadCodes = async () => {
  loading.value = true
  try {
    const res = await getCodes({ page: page.value, pageSize: pageSize.value })
    codes.value = res.data.list
    total.value = res.data.pagination.total
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleGenerate = async () => {
  try {
    const res = await generateCodes(generateForm)
    generatedCodes.value = res.data
    showGenerate.value = false
    showResult.value = true
    loadCodes()
  } catch (error) {
    ElMessage.error('生成失败')
  }
}

const handleToggle = async (row) => {
  try {
    await toggleCode(row.id, !row.is_active)
    ElMessage.success(row.is_active ? '已禁用' : '已启用')
    loadCodes()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该邀请码?', '警告', { type: 'warning' })
    await deleteCode(id)
    ElMessage.success('删除成功')
    loadCodes()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}
</script>

<style scoped>
.invite-codes {
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

.code-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  padding: 10px 0;
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

:deep(.el-tag) {
  border-radius: 8px;
  padding: 0 10px;
}

:deep(.el-button) {
  border-radius: 8px;
}

:deep(.el-pagination) {
  padding: 16px 0;
}
</style>
