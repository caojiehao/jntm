<template>
  <div class="ocr-scanner">
    <div class="scanner-header">
      <h1>📷 基金截图识别</h1>
      <p class="subtitle">智能识别基金持仓截图，自动添加到您的投资组合</p>
    </div>

    <div class="scanner-content">
      <div class="upload-section">
        <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileSelect"
            style="display: none"
          />

          <div v-if="!selectedImage" class="upload-placeholder">
            <div class="upload-icon">📷</div>
            <h3>点击或拖拽上传基金截图</h3>
            <p>支持 JPG、PNG 格式，建议图片清晰且完整</p>
          </div>

          <div v-else class="image-preview">
            <img :src="selectedImage" alt="基金截图" />
            <div class="image-actions">
              <el-button @click="triggerFileInput" :icon="Refresh">重新选择</el-button>
              <el-button type="primary" @click="scanImage" :loading="scanning">
                {{ scanning ? '识别中...' : '开始识别' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="instructions-section">
        <h3>📖 使用说明</h3>
        <div class="instructions-grid">
          <div class="instruction-item">
            <div class="instruction-icon">①</div>
            <h4>上传截图</h4>
            <p>点击上传区域选择基金持仓截图，或直接拖拽图片到上传区域</p>
          </div>
          <div class="instruction-item">
            <div class="instruction-icon">②</div>
            <h4>智能识别</h4>
            <p>AI自动识别截图中的基金信息，包括基金代码、名称、净值等</p>
          </div>
          <div class="instruction-item">
            <div class="instruction-icon">③</div>
            <h4>确认添加</h4>
            <p>检查识别结果，确认无误后添加到您的投资组合中</p>
          </div>
        </div>
      </div>

      <div class="supported-platforms">
        <h3>🎯 支持的平台</h3>
        <div class="platforms-grid">
          <div class="platform-item">
            <div class="platform-icon">💳</div>
            <h4>支付宝</h4>
            <p>支付宝 - 理财 - 基金持仓页面</p>
          </div>
          <div class="platform-item">
            <div class="platform-icon">💬</div>
            <h4>微信</h4>
            <p>微信 - 理财通 - 基金持仓页面</p>
          </div>
          <div class="platform-item">
            <div class="platform-icon">📱</div>
            <h4>天天基金</h4>
            <p>天天基金APP - 我的持仓页面</p>
          </div>
          <div class="platform-item">
            <div class="platform-icon">🔍</div>
            <h4>其他平台</h4>
            <p>包含基金代码和净值信息的截图均可识别</p>
          </div>
        </div>
      </div>

      <!-- 识别结果 -->
      <div v-if="scanResult" class="result-section">
        <h3>🔍 识别结果</h3>
        <div class="result-card">
          <div class="result-header">
            <h4>识别到 {{ scanResult.funds.length }} 支基金</h4>
            <div class="result-actions">
              <el-button @click="rescan" :icon="Refresh">重新识别</el-button>
              <el-button type="primary" @click="confirmAddFunds" :loading="adding">
                {{ adding ? '添加中...' : '确认添加' }}
              </el-button>
            </div>
          </div>

          <div class="funds-list">
            <div
              v-for="(fund, index) in scanResult.funds"
              :key="index"
              class="fund-result-item"
            >
              <div class="fund-info">
                <div class="fund-basic">
                  <h5>{{ fund.name }}</h5>
                  <span class="fund-code">{{ fund.code }}</span>
                  <el-tag :type="getFundTypeTag(fund.type)" size="small">{{ fund.typeName }}</el-tag>
                </div>
                <div class="fund-details">
                  <div class="detail-item">
                    <span class="label">净值</span>
                    <span class="value">¥{{ fund.nav }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">持有份额</span>
                    <span class="value">{{ fund.shares }}份</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">市值</span>
                    <span class="value">¥{{ formatNumber(fund.totalValue) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">置信度</span>
                    <span class="confidence" :class="getConfidenceClass(fund.confidence)">
                      {{ (fund.confidence * 100).toFixed(1) }}%
                    </span>
                  </div>
                </div>
              </div>

              <div class="fund-actions">
                <el-checkbox v-model="fund.selected" :disabled="fund.confidence < 0.8">
                  添加
                </el-checkbox>
                <el-button size="small" @click="editFundInfo(fund)">编辑</el-button>
              </div>
            </div>
          </div>

          <div v-if="scanResult.unrecognizedText" class="unrecognized-section">
            <h5>未识别的文本</h5>
            <div class="unrecognized-text">
              {{ scanResult.unrecognizedText }}
            </div>
          </div>
        </div>
      </div>

      <!-- 历史记录 -->
      <div class="history-section">
        <h3>📜 识别历史</h3>
        <div class="history-list">
          <div
            v-for="history in scanHistory"
            :key="history.id"
            class="history-item"
          >
            <div class="history-info">
              <div class="history-time">{{ formatTime(history.timestamp) }}</div>
              <div class="history-summary">识别了 {{ history.fundCount }} 支基金</div>
            </div>
            <div class="history-status">
              <el-tag :type="history.success ? 'success' : 'danger'" size="small">
                {{ history.success ? '成功' : '失败' }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑基金信息对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑基金信息"
      width="500px"
    >
      <el-form
        ref="editForm"
        :model="editingFund"
        :rules="editRules"
        label-width="100px"
      >
        <el-form-item label="基金代码" prop="code">
          <el-input v-model="editingFund.code" placeholder="请输入6位基金代码" />
        </el-form-item>
        <el-form-item label="基金名称" prop="name">
          <el-input v-model="editingFund.name" placeholder="请输入基金名称" />
        </el-form-item>
        <el-form-item label="基金类型" prop="type">
          <el-select v-model="editingFund.type" placeholder="请选择基金类型">
            <el-option label="股票型" value="stock" />
            <el-option label="债券型" value="bond" />
            <el-option label="混合型" value="mixed" />
            <el-option label="指数型" value="index" />
          </el-select>
        </el-form-item>
        <el-form-item label="净值" prop="nav">
          <el-input-number
            v-model="editingFund.nav"
            :min="0.0001"
            :step="0.0001"
            :precision="4"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="持有份额" prop="shares">
          <el-input-number
            v-model="editingFund.shares"
            :min="0.01"
            :step="0.01"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveFundEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

const router = useRouter()

const fileInput = ref()
const selectedImage = ref('')
const scanning = ref(false)
const adding = ref(false)
const editDialogVisible = ref(false)

const scanResult = ref(null)
const editingFund = reactive({
  code: '',
  name: '',
  type: '',
  nav: null,
  shares: null
})

const editForm = ref()
const editRules = {
  code: [
    { required: true, message: '请输入基金代码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '基金代码必须是6位数字', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入基金名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择基金类型', trigger: 'change' }
  ],
  nav: [
    { required: true, message: '请输入净值', trigger: 'blur' }
  ],
  shares: [
    { required: true, message: '请输入持有份额', trigger: 'blur' }
  ]
}

const scanHistory = ref([
  {
    id: 1,
    timestamp: new Date(Date.now() - 86400000),
    fundCount: 3,
    success: true
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 172800000),
    fundCount: 2,
    success: true
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 259200000),
    fundCount: 0,
    success: false
  }
])

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    processFile(file)
  } else {
    ElMessage.error('请上传图片文件')
  }
}

const processFile = (file: File) => {
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过10MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    selectedImage.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const scanImage = async () => {
  if (!selectedImage.value) {
    ElMessage.warning('请先上传图片')
    return
  }

  scanning.value = true

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 3000))

    // 模拟识别结果
    scanResult.value = {
      funds: [
        {
          code: '110022',
          name: '易方达消费行业股票',
          type: 'stock',
          typeName: '股票型',
          nav: 2.456,
          shares: 1000,
          totalValue: 2456,
          confidence: 0.95,
          selected: true
        },
        {
          code: '002001',
          name: '华夏回报混合',
          type: 'mixed',
          typeName: '混合型',
          nav: 1.234,
          shares: 2000,
          totalValue: 2468,
          confidence: 0.88,
          selected: true
        },
        {
          code: '161005',
          name: '富国天惠沪深300',
          type: 'index',
          typeName: '指数型',
          nav: 0.987,
          shares: 1500,
          totalValue: 1480,
          confidence: 0.76,
          selected: false
        }
      ],
      unrecognizedText: '基金净值日期：2024-12-01 15:00:00'
    }

    ElMessage.success('识别完成！')

    // 添加到历史记录
    scanHistory.value.unshift({
      id: Date.now(),
      timestamp: new Date(),
      fundCount: scanResult.value.funds.length,
      success: true
    })

  } catch (error) {
    ElMessage.error('识别失败，请重试')
  } finally {
    scanning.value = false
  }
}

const getFundTypeTag = (type: string) => {
  const typeMap = {
    stock: 'danger',
    bond: 'success',
    mixed: 'warning',
    index: 'info'
  }
  return typeMap[type as keyof typeof typeMap] || 'default'
}

const getConfidenceClass = (confidence: number) => {
  if (confidence >= 0.9) return 'high'
  if (confidence >= 0.8) return 'medium'
  return 'low'
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num)
}

const formatTime = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const days = Math.floor(diff / 86400000)

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return timestamp.toLocaleDateString()
}

const rescan = () => {
  scanResult.value = null
  scanImage()
}

const editFundInfo = (fund: any) => {
  Object.assign(editingFund, fund)
  editingFund.confidence = undefined
  editingFund.selected = undefined
  editingFund.totalValue = undefined
  editingFund.typeName = undefined
  editDialogVisible.value = true
}

const saveFundEdit = async () => {
  try {
    await editForm.value.validate()

    // 找到对应的基金并更新信息
    const fundIndex = scanResult.value.funds.findIndex(
      (f: any) => f.code === editingFund.code
    )
    if (fundIndex !== -1) {
      Object.assign(scanResult.value.funds[fundIndex], editingFund)

      // 更新显示名称
      const typeMap: { [key: string]: string } = {
        stock: '股票型',
        bond: '债券型',
        mixed: '混合型',
        index: '指数型'
      }
      scanResult.value.funds[fundIndex].typeName = typeMap[editingFund.type]
    }

    ElMessage.success('基金信息已更新')
    editDialogVisible.value = false
  } catch (error) {
    // 表单验证失败
  }
}

const confirmAddFunds = async () => {
  const selectedFunds = scanResult.value.funds.filter((fund: any) => fund.selected)

  if (selectedFunds.length === 0) {
    ElMessage.warning('请选择要添加的基金')
    return
  }

  adding.value = true

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))

    ElMessage.success(`成功添加 ${selectedFunds.length} 支基金到投资组合`)

    // 跳转到投资组合页面
    router.push('/portfolio')

  } catch (error) {
    ElMessage.error('添加失败，请重试')
  } finally {
    adding.value = false
  }
}
</script>

<style scoped>
.ocr-scanner {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.scanner-header {
  text-align: center;
  margin-bottom: 40px;
}

.scanner-header h1 {
  margin: 0;
  font-size: 32px;
  color: #333;
}

.subtitle {
  margin: 8px 0 0 0;
  color: #666;
  font-size: 16px;
}

.scanner-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.upload-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 60px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #409EFF;
  background: #f8f9ff;
}

.upload-placeholder {
  color: #666;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-placeholder h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #333;
}

.upload-placeholder p {
  margin: 0;
  font-size: 14px;
}

.image-preview {
  position: relative;
}

.image-preview img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.instructions-section,
.supported-platforms {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.instructions-section h3,
.supported-platforms h3 {
  margin: 0 0 24px 0;
  font-size: 20px;
  color: #333;
  text-align: center;
}

.instructions-grid,
.platforms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.instruction-item,
.platform-item {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;
}

.instruction-item:hover,
.platform-item:hover {
  background: #e7f3ff;
  transform: translateY(-2px);
}

.instruction-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #409EFF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  margin: 0 auto 16px auto;
}

.platform-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.instruction-item h4,
.platform-item h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.instruction-item p,
.platform-item p {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.result-section,
.history-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-section h3,
.history-section h3 {
  margin: 0 0 24px 0;
  font-size: 20px;
  color: #333;
}

.result-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.result-header h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.result-actions {
  display: flex;
  gap: 12px;
}

.funds-list {
  padding: 20px;
}

.fund-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 16px;
}

.fund-info {
  flex: 1;
}

.fund-basic {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.fund-basic h5 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.fund-code {
  font-size: 14px;
  color: #666;
  font-family: monospace;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
}

.fund-details {
  display: flex;
  gap: 24px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item .label {
  font-size: 12px;
  color: #666;
}

.detail-item .value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.confidence.high {
  color: #67C23A;
}

.confidence.medium {
  color: #E6A23C;
}

.confidence.low {
  color: #F56C6C;
}

.fund-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.unrecognized-section {
  margin-top: 20px;
  padding: 20px;
  background: #fef9e7;
  border-radius: 8px;
}

.unrecognized-section h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #333;
}

.unrecognized-text {
  font-size: 13px;
  color: #666;
  font-family: monospace;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.history-info {
  flex: 1;
}

.history-time {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
}

.history-summary {
  font-size: 12px;
  color: #666;
}

.history-status {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .instructions-grid,
  .platforms-grid {
    grid-template-columns: 1fr;
  }

  .result-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .fund-result-item {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .fund-details {
    flex-wrap: wrap;
    gap: 16px;
  }

  .fund-actions {
    justify-content: space-between;
  }
}
</style>