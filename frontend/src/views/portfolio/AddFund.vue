<template>
  <div class="add-fund">
    <div class="page-header">
      <h1>➕ 添加基金</h1>
      <p class="subtitle">通过搜索或扫描添加您的基金</p>
    </div>

    <div class="add-methods">
      <el-radio-group v-model="addMethod" size="large">
        <el-radio-button label="search">🔍 搜索添加</el-radio-button>
        <el-radio-button label="scan">📷 扫描添加</el-radio-button>
        <el-radio-button label="manual">✏️ 手动输入</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 搜索添加 -->
    <div v-if="addMethod === 'search'" class="add-method-content">
      <div class="search-section">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入基金代码或基金名称"
          size="large"
          @keyup.enter="searchFunds"
        >
          <template #append>
            <el-button @click="searchFunds" :loading="searching">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </template>
        </el-input>
      </div>

      <div v-if="searchResults.length > 0" class="search-results">
        <h3>搜索结果</h3>
        <div class="result-list">
          <div
            class="result-item"
            v-for="fund in searchResults"
            :key="fund.code"
            @click="selectFund(fund)"
          >
            <div class="fund-info">
              <h4>{{ fund.name }}</h4>
              <p class="fund-meta">
                <span class="fund-code">{{ fund.code }}</span>
                <span class="fund-type">{{ fund.typeName }}</span>
                <span class="fund-company">{{ fund.company }}</span>
              </p>
            </div>
            <div class="fund-stats">
              <div class="stat-item">
                <span class="label">最新净值</span>
                <span class="value">¥{{ fund.nav }}</span>
              </div>
              <div class="stat-item">
                <span class="label">日涨跌</span>
                <span class="value" :class="fund.dailyChange >= 0 ? 'positive' : 'negative'">
                  {{ fund.dailyChange >= 0 ? '+' : '' }}{{ fund.dailyChange }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 扫描添加 -->
    <div v-if="addMethod === 'scan'" class="add-method-content">
      <div class="scan-section">
        <div class="scan-area" @click="showOCRScanner">
          <div class="scan-icon">📷</div>
          <h3>点击扫描基金截图</h3>
          <p>支持支付宝、微信、天天基金等平台的基金持仓截图</p>
        </div>

        <div class="scan-tips">
          <h4>扫描小贴士</h4>
          <ul>
            <li>确保截图清晰，基金代码和名称完整可见</li>
            <li>建议截图包含基金净值和涨跌信息</li>
            <li>系统会自动识别基金信息并填充表单</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 手动输入 -->
    <div v-if="addMethod === 'manual'" class="add-method-content">
      <el-form
        ref="manualForm"
        :model="manualFundData"
        :rules="manualRules"
        label-width="120px"
        size="large"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="基金代码" prop="code">
              <el-input
                v-model="manualFundData.code"
                placeholder="请输入6位基金代码"
                maxlength="6"
                @blur="validateFundCode"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="基金名称" prop="name">
              <el-input
                v-model="manualFundData.name"
                placeholder="请输入基金名称"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="基金类型" prop="type">
              <el-select v-model="manualFundData.type" placeholder="请选择基金类型">
                <el-option label="股票型" value="stock" />
                <el-option label="债券型" value="bond" />
                <el-option label="混合型" value="mixed" />
                <el-option label="指数型" value="index" />
                <el-option label="QDII型" value="qdii" />
                <el-option label="货币型" value="money" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="基金公司" prop="company">
              <el-input
                v-model="manualFundData.company"
                placeholder="请输入基金公司"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="持有份额" prop="shares">
              <el-input-number
                v-model="manualFundData.shares"
                :min="0.01"
                :step="0.01"
                :precision="2"
                placeholder="请输入持有份额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="买入净值" prop="buyNav">
              <el-input-number
                v-model="manualFundData.buyNav"
                :min="0.0001"
                :step="0.0001"
                :precision="4"
                placeholder="请输入买入时的净值"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="买入日期" prop="buyDate">
              <el-date-picker
                v-model="manualFundData.buyDate"
                type="date"
                placeholder="请选择买入日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="当前净值" prop="currentNav">
              <el-input-number
                v-model="manualFundData.currentNav"
                :min="0.0001"
                :step="0.0001"
                :precision="4"
                placeholder="系统自动获取"
                :disabled="true"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 确认添加区域 -->
    <div v-if="selectedFund" class="confirm-section">
      <h3>确认添加基金</h3>
      <div class="fund-preview">
        <div class="preview-header">
          <h4>{{ selectedFund.name }}</h4>
          <el-tag :type="getFundTypeTag(selectedFund.type)">{{ selectedFund.typeName }}</el-tag>
        </div>

        <el-form
          ref="confirmForm"
          :model="confirmData"
          :rules="confirmRules"
          label-width="120px"
          size="large"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="持有份额" prop="shares">
                <el-input-number
                  v-model="confirmData.shares"
                  :min="0.01"
                  :step="0.01"
                  :precision="2"
                  placeholder="请输入持有份额"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="买入净值" prop="buyNav">
                <el-input-number
                  v-model="confirmData.buyNav"
                  :min="0.0001"
                  :step="0.0001"
                  :precision="4"
                  placeholder="请输入买入净值"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="买入日期" prop="buyDate">
                <el-date-picker
                  v-model="confirmData.buyDate"
                  type="date"
                  placeholder="请选择买入日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="投资主题" prop="theme">
                <el-select v-model="confirmData.theme" placeholder="请选择投资主题">
                  <el-option label="提前退休 (FIRE)" value="fire" />
                  <el-option label="全球配置" value="global" />
                  <el-option label="跑赢通胀" value="inflation" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <div class="action-buttons">
        <el-button size="large" @click="cancelAdd">取消</el-button>
        <el-button
          type="primary"
          size="large"
          :loading="adding"
          @click="confirmAddFund"
        >
          {{ adding ? '添加中...' : '确认添加' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const router = useRouter()

const addMethod = ref('search')
const searching = ref(false)
const adding = ref(false)
const searchKeyword = ref('')
const selectedFund = ref(null)

const searchResults = ref([
  {
    code: '110022',
    name: '易方达消费行业股票',
    type: 'stock',
    typeName: '股票型',
    company: '易方达基金',
    nav: 2.456,
    dailyChange: 1.23
  },
  {
    code: '002001',
    name: '华夏回报混合',
    type: 'mixed',
    typeName: '混合型',
    company: '华夏基金',
    nav: 1.234,
    dailyChange: -0.45
  },
  {
    code: '161005',
    name: '富国天惠沪深300',
    type: 'index',
    typeName: '指数型',
    company: '富国基金',
    nav: 0.987,
    dailyChange: 0.78
  }
])

// 手动输入表单数据
const manualForm = ref()
const manualFundData = reactive({
  code: '',
  name: '',
  type: '',
  company: '',
  shares: null,
  buyNav: null,
  buyDate: null,
  currentNav: null
})

const manualRules = {
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
  shares: [
    { required: true, message: '请输入持有份额', trigger: 'blur' }
  ],
  buyNav: [
    { required: true, message: '请输入买入净值', trigger: 'blur' }
  ],
  buyDate: [
    { required: true, message: '请选择买入日期', trigger: 'change' }
  ]
}

// 确认表单数据
const confirmForm = ref()
const confirmData = reactive({
  shares: null,
  buyNav: null,
  buyDate: null,
  theme: ''
})

const confirmRules = {
  shares: [
    { required: true, message: '请输入持有份额', trigger: 'blur' }
  ],
  buyNav: [
    { required: true, message: '请输入买入净值', trigger: 'blur' }
  ],
  buyDate: [
    { required: true, message: '请选择买入日期', trigger: 'change' }
  ],
  theme: [
    { required: true, message: '请选择投资主题', trigger: 'change' }
  ]
}

const getFundTypeTag = (type: string) => {
  const typeMap = {
    stock: 'danger',
    bond: 'success',
    mixed: 'warning',
    index: 'info',
    qdii: 'primary',
    money: 'default'
  }
  return typeMap[type as keyof typeof typeMap] || 'default'
}

const searchFunds = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  searching.value = true
  try {
    // 模拟搜索API调用
    await new Promise(resolve => setTimeout(resolve, 800))

    // 模拟搜索结果
    ElMessage.success('搜索完成')
  } catch (error) {
    ElMessage.error('搜索失败，请重试')
  } finally {
    searching.value = false
  }
}

const selectFund = (fund: any) => {
  selectedFund.value = fund
  // 重置确认表单
  confirmData.shares = null
  confirmData.buyNav = fund.nav
  confirmData.buyDate = null
  confirmData.theme = ''

  ElMessage.success(`已选择基金：${fund.name}`)
}

const showOCRScanner = () => {
  ElMessage.info('OCR扫描功能开发中，敬请期待！')
}

const validateFundCode = async () => {
  if (manualFundData.code && /^\d{6}$/.test(manualFundData.code)) {
    try {
      // 模拟根据基金代码获取基金信息
      await new Promise(resolve => setTimeout(resolve, 500))

      // 这里应该调用API获取基金信息
      manualFundData.currentNav = 2.456 // 模拟数据
      ElMessage.success('基金代码验证成功')
    } catch (error) {
      ElMessage.error('未找到该基金信息')
    }
  }
}

const confirmAddFund = async () => {
  try {
    // 如果是手动输入，先验证手动表单
    if (addMethod.value === 'manual') {
      await manualForm.value.validate()
      selectedFund.value = { ...manualFundData }
    }

    // 验证确认表单
    await confirmForm.value.validate()

    adding.value = true

    // 模拟添加基金API调用
    await new Promise(resolve => setTimeout(resolve, 1500))

    ElMessage.success('基金添加成功！')
    router.push('/portfolio')

  } catch (error) {
    if (error !== false) { // 不是表单验证错误
      ElMessage.error('添加失败，请重试')
    }
  } finally {
    adding.value = false
  }
}

const cancelAdd = () => {
  selectedFund.value = null
  if (addMethod.value === 'manual') {
    manualForm.value.resetFields()
  }
  confirmForm.value.resetFields()
}
</script>

<style scoped>
.add-fund {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0;
  font-size: 32px;
  color: #333;
}

.subtitle {
  margin: 8px 0 0 0;
  color: #666;
  font-size: 16px;
}

.add-methods {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.add-method-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.search-section {
  max-width: 600px;
  margin: 0 auto;
}

.search-results {
  margin-top: 30px;
}

.search-results h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.result-item:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.fund-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.fund-meta {
  margin: 0;
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
}

.fund-code {
  font-weight: 500;
}

.fund-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  text-align: center;
}

.stat-item .label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.stat-item .value {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.scan-section {
  text-align: center;
}

.scan-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 60px 20px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 30px;
}

.scan-area:hover {
  border-color: #409EFF;
  background: #f8f9ff;
}

.scan-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.scan-area h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #333;
}

.scan-area p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.scan-tips {
  text-align: left;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
}

.scan-tips h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
}

.scan-tips ul {
  margin: 0;
  padding-left: 20px;
}

.scan-tips li {
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.confirm-section {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.confirm-section h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
  text-align: center;
}

.fund-preview {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.preview-header h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.positive {
  color: #67C23A;
}

.negative {
  color: #F56C6C;
}

@media (max-width: 768px) {
  .add-methods {
    flex-direction: column;
    align-items: center;
  }

  .result-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .fund-stats {
    width: 100%;
    justify-content: space-between;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .el-button {
    width: 100%;
  }
}
</style>