<template>
  <div class="fund-detail" v-if="fund">
    <div class="page-header">
      <el-button @click="$router.back()" :icon="ArrowLeft">返回</el-button>
      <h1>{{ fund.name }}</h1>
      <el-button type="primary" @click="editFund">编辑</el-button>
    </div>

    <div class="fund-overview">
      <div class="overview-card">
        <div class="fund-basic-info">
          <div class="fund-title">
            <h2>{{ fund.name }}</h2>
            <div class="fund-meta">
              <span class="fund-code">{{ fund.code }}</span>
              <el-tag :type="getFundTypeTag(fund.type)" size="large">{{ fund.typeName }}</el-tag>
            </div>
          </div>

          <div class="fund-current-stats">
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
            <div class="stat-item">
              <span class="label">更新时间</span>
              <span class="value">{{ fund.updateTime }}</span>
            </div>
          </div>
        </div>

        <div class="my-investment">
          <h3>我的投资</h3>
          <div class="investment-stats">
            <div class="stat-card">
              <span class="label">持有份额</span>
              <span class="value">{{ fund.myShares }}份</span>
            </div>
            <div class="stat-card">
              <span class="label">持仓市值</span>
              <span class="value">¥{{ formatNumber(fund.myValue) }}</span>
            </div>
            <div class="stat-card">
              <span class="label">买入成本</span>
              <span class="value">¥{{ formatNumber(fund.myCost) }}</span>
            </div>
            <div class="stat-card">
              <span class="label">浮动盈亏</span>
              <span class="value" :class="fund.myProfit >= 0 ? 'positive' : 'negative'">
                {{ fund.myProfit >= 0 ? '+' : '' }}¥{{ formatNumber(fund.myProfit) }}
              </span>
            </div>
            <div class="stat-card">
              <span class="label">收益率</span>
              <span class="value" :class="fund.myReturnRate >= 0 ? 'positive' : 'negative'">
                {{ fund.myReturnRate >= 0 ? '+' : '' }}{{ fund.myReturnRate.toFixed(2) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-content">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="净值走势" name="chart">
          <div class="chart-section">
            <div class="chart-controls">
              <el-radio-group v-model="chartPeriod" size="default">
                <el-radio-button label="1M">1月</el-radio-button>
                <el-radio-button label="3M">3月</el-radio-button>
                <el-radio-button label="6M">6月</el-radio-button>
                <el-radio-button label="1Y">1年</el-radio-button>
                <el-radio-button label="3Y">3年</el-radio-button>
              </el-radio-group>
            </div>
            <div ref="chartContainer" class="chart-container"></div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="基金资料" name="info">
          <div class="fund-info-section">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="基金代码">{{ fund.code }}</el-descriptions-item>
              <el-descriptions-item label="基金类型">{{ fund.typeName }}</el-descriptions-item>
              <el-descriptions-item label="基金公司">{{ fund.company }}</el-descriptions-item>
              <el-descriptions-item label="基金经理">{{ fund.manager }}</el-descriptions-item>
              <el-descriptions-item label="成立日期">{{ fund.establishDate }}</el-descriptions-item>
              <el-descriptions-item label="基金规模">{{ fund.scale }}亿</el-descriptions-item>
              <el-descriptions-item label="托管银行">{{ fund.custodian }}</el-descriptions-item>
              <el-descriptions-item label="业绩比较基准">{{ fund.benchmark }}</el-descriptions-item>
              <el-descriptions-item label="投资策略" :span="2">{{ fund.strategy }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>

        <el-tab-pane label="持仓分析" name="holdings">
          <div class="holdings-section">
            <h4>前十重仓股</h4>
            <el-table :data="fund.holdings" style="width: 100%">
              <el-table-column prop="stock" label="股票名称" />
              <el-table-column prop="code" label="股票代码" />
              <el-table-column prop="ratio" label="持仓比例" align="right">
                <template #default="{ row }">
                  {{ row.ratio }}%
                </template>
              </el-table-column>
              <el-table-column prop="shares" label="持股数(万股)" align="right" />
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="交易记录" name="transactions">
          <div class="transactions-section">
            <div class="section-header">
              <h4>交易记录</h4>
              <el-button type="primary" @click="showAddTransaction">
                <el-icon><Plus /></el-icon>
                添加记录
              </el-button>
            </div>

            <el-table :data="transactions" style="width: 100%">
              <el-table-column prop="date" label="交易日期" width="120" />
              <el-table-column prop="type" label="交易类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.type === 'buy' ? 'success' : 'danger'">
                    {{ row.type === 'buy' ? '买入' : '卖出' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="shares" label="交易份额" align="right" />
              <el-table-column prop="nav" label="净值" align="right">
                <template #default="{ row }">
                  ¥{{ row.nav }}
                </template>
              </el-table-column>
              <el-table-column prop="amount" label="金额" align="right">
                <template #default="{ row }">
                  ¥{{ formatNumber(row.amount) }}
                </template>
              </el-table-column>
              <el-table-column prop="fee" label="手续费" align="right">
                <template #default="{ row }">
                  ¥{{ row.fee }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 添加交易记录对话框 -->
    <el-dialog
      v-model="transactionDialogVisible"
      title="添加交易记录"
      width="500px"
    >
      <el-form
        ref="transactionForm"
        :model="transactionData"
        :rules="transactionRules"
        label-width="100px"
      >
        <el-form-item label="交易类型" prop="type">
          <el-radio-group v-model="transactionData.type">
            <el-radio value="buy">买入</el-radio>
            <el-radio value="sell">卖出</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="交易日期" prop="date">
          <el-date-picker
            v-model="transactionData.date"
            type="date"
            placeholder="请选择交易日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="交易份额" prop="shares">
          <el-input-number
            v-model="transactionData.shares"
            :min="0.01"
            :step="0.01"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="净值" prop="nav">
          <el-input-number
            v-model="transactionData.nav"
            :min="0.0001"
            :step="0.0001"
            :precision="4"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transactionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addTransaction">确认</el-button>
      </template>
    </el-dialog>
  </div>

  <div v-else class="loading">
    <el-skeleton :rows="8" animated />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const route = useRoute()
const router = useRouter()

const fundCode = computed(() => route.params.fundCode as string)
const activeTab = ref('chart')
const chartPeriod = ref('1Y')
const chartContainer = ref<HTMLElement>()
const transactionDialogVisible = ref(false)

const fund = ref(null)
const transactions = ref([
  {
    date: '2024-01-15',
    type: 'buy',
    shares: 1000,
    nav: 2.350,
    amount: 2350,
    fee: 2.35
  },
  {
    date: '2024-02-20',
    type: 'buy',
    shares: 500,
    nav: 2.420,
    amount: 1210,
    fee: 1.21
  }
])

const transactionForm = ref()
const transactionData = reactive({
  type: 'buy',
  date: null,
  shares: null,
  nav: null
})

const transactionRules = {
  type: [
    { required: true, message: '请选择交易类型', trigger: 'change' }
  ],
  date: [
    { required: true, message: '请选择交易日期', trigger: 'change' }
  ],
  shares: [
    { required: true, message: '请输入交易份额', trigger: 'blur' }
  ],
  nav: [
    { required: true, message: '请输入净值', trigger: 'blur' }
  ]
}

// 模拟基金数据
const mockFundData = {
  '110022': {
    code: '110022',
    name: '易方达消费行业股票',
    type: 'stock',
    typeName: '股票型',
    company: '易方达基金',
    manager: '萧楠',
    nav: 2.456,
    dailyChange: 1.23,
    updateTime: '2024-12-02 15:00',
    myShares: 1500,
    myValue: 3684,
    myCost: 3560,
    myProfit: 124,
    myReturnRate: 3.48,
    establishDate: '2010-08-20',
    scale: 85.6,
    custodian: '中国工商银行',
    benchmark: '中证消费行业指数收益率×80%+中债总指数收益率×20%',
    strategy: '本基金主要投资于消费行业股票，通过深入的基本面研究，精选具有核心竞争力的消费企业，力求实现基金资产的长期稳健增值。',
    holdings: [
      { stock: '贵州茅台', code: '600519', ratio: 9.85, shares: 156.8 },
      { stock: '五粮液', code: '000858', ratio: 8.76, shares: 234.5 },
      { stock: '泸州老窖', code: '000568', ratio: 7.23, shares: 189.3 },
      { stock: '伊利股份', code: '600887', ratio: 6.54, shares: 445.6 },
      { stock: '海天味业', code: '603288', ratio: 5.89, shares: 123.4 }
    ]
  }
}

const getFundTypeTag = (type: string) => {
  const typeMap = {
    stock: 'danger',
    bond: 'success',
    mixed: 'warning',
    index: 'info',
    qdii: 'primary'
  }
  return typeMap[type as keyof typeof typeMap] || 'default'
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num)
}

const initChart = () => {
  if (!chartContainer.value) return

  const chart = echarts.init(chartContainer.value)

  // 生成模拟数据
  const dates = []
  const navData = []
  const today = new Date()

  for (let i = 365; i >= 0; i -= 7) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
    navData.push((2.1 + Math.random() * 0.4).toFixed(4))
  }

  const option = {
    title: {
      text: '净值走势图',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const date = params[0].axisValue
        const nav = params[0].value
        return `${date}<br/>净值: ¥${nav}`
      }
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        interval: Math.floor(dates.length / 8)
      }
    },
    yAxis: {
      type: 'value',
      name: '净值(元)',
      min: 2.0,
      max: 2.6
    },
    series: [{
      data: navData,
      type: 'line',
      smooth: true,
      lineStyle: {
        color: '#409EFF'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(64, 158, 255, 0.4)'
          }, {
            offset: 1, color: 'rgba(64, 158, 255, 0.05)'
          }]
        }
      }
    }]
  }

  chart.setOption(option)

  // 响应式调整
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

const editFund = () => {
  ElMessage.info('编辑功能开发中...')
}

const showAddTransaction = () => {
  transactionDialogVisible.value = true
  transactionData.type = 'buy'
  transactionData.date = null
  transactionData.shares = null
  transactionData.nav = fund.value?.nav || null
}

const addTransaction = async () => {
  try {
    await transactionForm.value.validate()

    // 模拟添加交易记录
    const newTransaction = {
      date: transactionData.date.toISOString().split('T')[0],
      type: transactionData.type,
      shares: transactionData.shares,
      nav: transactionData.nav,
      amount: transactionData.shares * transactionData.nav,
      fee: (transactionData.shares * transactionData.nav) * 0.001
    }

    transactions.value.unshift(newTransaction)

    ElMessage.success('交易记录添加成功')
    transactionDialogVisible.value = false
  } catch (error) {
    // 表单验证失败
  }
}

const loadFundDetail = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    fund.value = mockFundData[fundCode.value]

    if (!fund.value) {
      ElMessage.error('未找到该基金信息')
      router.push('/portfolio')
      return
    }

    // 图表需要在DOM渲染完成后初始化
    if (activeTab.value === 'chart') {
      await nextTick()
      initChart()
    }
  } catch (error) {
    ElMessage.error('加载基金详情失败')
    router.push('/portfolio')
  }
}

onMounted(() => {
  loadFundDetail()
})

// 监听tab切换，初始化图表
watch(activeTab, async (newTab) => {
  if (newTab === 'chart' && chartContainer.value) {
    await nextTick()
    initChart()
  }
})
</script>

<style scoped>
.fund-detail {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  color: #333;
  flex: 1;
  text-align: center;
}

.fund-overview {
  margin-bottom: 30px;
}

.overview-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.fund-basic-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.fund-title h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #333;
}

.fund-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.fund-code {
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

.fund-current-stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  text-align: center;
}

.stat-item .label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.stat-item .value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.my-investment h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
}

.investment-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.investment-stats .stat-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.investment-stats .stat-card .label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.investment-stats .stat-card .value {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.detail-content {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-section {
  padding: 20px;
}

.chart-controls {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.chart-container {
  height: 400px;
  width: 100%;
}

.fund-info-section,
.holdings-section,
.transactions-section {
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h4 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.positive {
  color: #67C23A;
}

.negative {
  color: #F56C6C;
}

.loading {
  padding: 20px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .page-header h1 {
    text-align: left;
  }

  .fund-basic-info {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }

  .fund-current-stats {
    justify-content: space-around;
  }

  .investment-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
}
</style>