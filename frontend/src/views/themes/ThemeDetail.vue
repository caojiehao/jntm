<template>
  <div class="theme-detail" v-if="theme">
    <div class="page-header">
      <el-button @click="$router.back()" :icon="ArrowLeft">返回</el-button>
      <div class="header-content">
        <h1>
          <span class="theme-icon">{{ theme.icon }}</span>
          {{ theme.name }}
        </h1>
        <p class="subtitle">{{ theme.description }}</p>
      </div>
      <el-button
        v-if="userStore.user?.currentTheme !== themeKey"
        type="primary"
        size="large"
        @click="switchToTheme"
      >
        选择此主题
      </el-button>
      <el-tag v-else type="success" size="large">当前主题</el-tag>
    </div>

    <div class="detail-content">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="主题介绍" name="overview">
          <div class="overview-section">
            <div class="intro-card">
              <h3>核心理念</h3>
              <p>{{ theme.coreConcept }}</p>
            </div>

            <div class="features-section">
              <h3>主题特点</h3>
              <div class="features-grid">
                <div
                  v-for="feature in theme.detailedFeatures"
                  :key="feature.title"
                  class="feature-item"
                >
                  <div class="feature-icon">{{ feature.icon }}</div>
                  <h4>{{ feature.title }}</h4>
                  <p>{{ feature.description }}</p>
                </div>
              </div>
            </div>

            <div class="metrics-section">
              <h3>适合性评估</h3>
              <div class="metrics-grid">
                <div class="metric-card">
                  <h4>风险承受能力</h4>
                  <div class="risk-level">
                    <div
                      v-for="i in 5"
                      :key="i"
                      class="risk-dot"
                      :class="{ active: i <= theme.riskLevel }"
                    ></div>
                  </div>
                  <span class="risk-text">{{ getRiskText(theme.riskLevel) }}</span>
                </div>

                <div class="metric-card">
                  <h4>投资期限</h4>
                  <div class="period-display">
                    {{ theme.holdingPeriod }}
                  </div>
                </div>

                <div class="metric-card">
                  <h4>目标人群</h4>
                  <div class="target-users">
                    {{ theme.targetUser }}
                  </div>
                </div>

                <div class="metric-card">
                  <h4>预期收益</h4>
                  <div class="expected-return">
                    {{ theme.expectedReturn }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="专属工具" name="tools">
          <div class="tools-section">
            <div class="tools-grid">
              <div
                v-for="tool in theme.tools"
                :key="tool.key"
                class="tool-card"
                @click="useTool(tool.key)"
              >
                <div class="tool-header">
                  <div class="tool-icon">{{ tool.icon }}</div>
                  <h4>{{ tool.name }}</h4>
                </div>
                <p>{{ tool.description }}</p>
                <el-button type="primary" size="small">
                  {{ tool.available ? '立即使用' : '敬请期待' }}
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="投资建议" name="strategy">
          <div class="strategy-section">
            <div class="strategy-card">
              <h3>资产配置建议</h3>
              <div class="allocation-chart">
                <div ref="allocationChart" class="chart-container"></div>
              </div>
              <div class="allocation-details">
                <div
                  v-for="allocation in theme.assetAllocation"
                  :key="allocation.category"
                  class="allocation-item"
                >
                  <span class="category-name">{{ allocation.category }}</span>
                  <span class="category-percentage">{{ allocation.percentage }}%</span>
                  <span class="category-desc">{{ allocation.description }}</span>
                </div>
              </div>
            </div>

            <div class="strategy-card">
              <h3>投资策略</h3>
              <div class="strategy-list">
                <div
                  v-for="strategy in theme.investmentStrategies"
                  :key="strategy.title"
                  class="strategy-item"
                >
                  <h4>{{ strategy.title }}</h4>
                  <p>{{ strategy.content }}</p>
                  <div class="strategy-tips">
                    <span class="tips-label">💡 建议：</span>
                    <span>{{ strategy.tips }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="相关基金" name="funds">
          <div class="funds-section">
            <div class="section-header">
              <h3>推荐基金</h3>
              <el-select v-model="fundSortBy" placeholder="排序方式" size="default">
                <el-option label="收益率排序" value="return" />
                <el-option label="规模排序" value="scale" />
                <el-option label="晨星评级排序" value="rating" />
              </el-select>
            </div>

            <div class="funds-grid">
              <div
                v-for="fund in recommendedFunds"
                :key="fund.code"
                class="fund-card"
                @click="$router.push(`/portfolio/${fund.code}`)"
              >
                <div class="fund-header">
                  <h4>{{ fund.name }}</h4>
                  <el-tag :type="getFundTypeTag(fund.type)" size="small">
                    {{ fund.typeName }}
                  </el-tag>
                </div>
                <div class="fund-stats">
                  <div class="stat-item">
                    <span class="label">最新净值</span>
                    <span class="value">¥{{ fund.nav }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">近1年收益</span>
                    <span class="value" :class="fund.yearReturn >= 0 ? 'positive' : 'negative'">
                      {{ fund.yearReturn >= 0 ? '+' : '' }}{{ fund.yearReturn }}%
                    </span>
                  </div>
                </div>
                <div class="fund-footer">
                  <span class="fund-company">{{ fund.company }}</span>
                  <el-button size="small" @click.stop="addFund(fund)">添加</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>

  <div v-else class="loading">
    <el-skeleton :rows="8" animated />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import * as echarts from 'echarts'

const route = useRoute()
const router = useRouter()
const userStore = useAuthStore()

const themeKey = computed(() => route.params.themeKey as string)
const activeTab = ref('overview')
const fundSortBy = ref('return')
const allocationChart = ref<HTMLElement>()

const theme = ref(null)
const recommendedFunds = ref([])

const themesData = {
  fire: {
    key: 'fire',
    name: '提前退休 (FIRE)',
    icon: '🏖️',
    description: '专注于实现财务独立和提前退休的目标',
    coreConcept: 'FIRE（Financial Independence, Retire Early）理念强调通过积极的储蓄和投资，尽快积累足够的资产，实现财务独立，从而可以选择提前退休。核心是4%法则，即每年提取不超过4%的投资组合价值作为生活费。',
    detailedFeatures: [
      {
        title: '4%法则计算器',
        icon: '🧮',
        description: '根据您的年支出计算退休所需的目标资产，并追踪完成进度'
      },
      {
        title: '退休年龄预测',
        icon: '📅',
        description: '基于当前储蓄率和投资回报，预测您何时可以提前退休'
      },
      {
        title: '被动收入分析',
        icon: '💸',
        description: '分析投资组合的被动收入情况，评估覆盖生活开支的能力'
      },
      {
        title: '通胀调整追踪',
        icon: '📊',
        description: '考虑通胀因素后的实际购买力计算和退休计划调整'
      }
    ],
    riskLevel: 3,
    holdingPeriod: '10年以上',
    targetUser: '追求财务自由的年轻职场人，25-40岁',
    expectedReturn: '年化8-12%',
    tools: [
      {
        key: 'fire-calculator',
        name: 'FIRE计算器',
        icon: '🧮',
        description: '计算退休目标金额和达成时间',
        available: true
      },
      {
        key: 'retirement-planner',
        name: '退休规划器',
        icon: '📋',
        description: '制定详细的退休计划和时间表',
        available: true
      },
      {
        key: 'income-tracker',
        name: '被动收入追踪',
        icon: '💰',
        description: '跟踪投资组合的被动收入情况',
        available: false
      }
    ],
    assetAllocation: [
      {
        category: '股票基金',
        percentage: 60,
        description: '以指数基金和成长股基金为主，追求长期增长'
      },
      {
        category: '债券基金',
        percentage: 25,
        description: '提供稳定收入，降低组合波动性'
      },
      {
        category: 'REITs',
        percentage: 10,
        description: '房地产投资信托，提供通胀保护和收入'
      },
      {
        category: '现金储备',
        percentage: 5,
        description: '应急资金，确保生活稳定'
      }
    ],
    investmentStrategies: [
      {
        title: '核心-卫星策略',
        content: '以低成本的指数基金为核心，小部分配置于主动管理型基金作为卫星配置。',
        tips: '建议70-80%配置于核心指数基金，20-30%配置于卫星策略。'
      },
      {
        title: '定投策略',
        content: '定期定额投资，平摊成本，降低市场波动影响。',
        tips: '建议月薪的20-30%用于定投，坚持长期投资。'
      },
      {
        title: '资产再平衡',
        content: '定期调整资产配置比例，保持在目标范围内。',
        tips: '建议每半年或每年进行一次资产再平衡。'
      }
    ]
  },
  global: {
    key: 'global',
    name: '全球配置',
    icon: '🌍',
    description: '通过全球分散投资降低风险，把握国际市场机遇',
    coreConcept: '全球化配置理念强调不将投资局限于单一市场，通过配置不同国家和地区的资产，实现风险的分散化，同时把握全球各地的增长机遇。A股、港股、美股、欧股等多市场布局。',
    detailedFeatures: [
      {
        title: 'QDII基金筛选',
        icon: '🔍',
        description: '精选优质的QDII基金，覆盖美股、港股、欧洲等主要市场'
      },
      {
        title: '汇率风险评估',
        icon: '💱',
        description: '分析汇率波动对投资收益的影响，提供对冲建议'
      },
      {
        title: '全球市场对比',
        icon: '🌐',
        description: '对比不同市场的估值水平和投资机会'
      },
      {
        title: '跨市场配置',
        icon: '🔄',
        description: '根据各市场表现动态调整配置比例'
      }
    ],
    riskLevel: 4,
    holdingPeriod: '5-10年',
    targetUser: '希望全球分散风险的投资者，有一定投资经验',
    expectedReturn: '年化10-15%',
    tools: [
      {
        key: 'qdii-screener',
        name: 'QDII筛选器',
        icon: '🔍',
        description: '筛选和对比优质的QDII基金',
        available: true
      },
      {
        key: 'currency-analyzer',
        name: '汇率分析器',
        icon: '💱',
        description: '分析汇率风险和影响',
        available: false
      },
      {
        key: 'global-compare',
        name: '全球市场对比',
        icon: '🌐',
        description: '对比全球各市场投资机会',
        available: false
      }
    ],
    assetAllocation: [
      {
        category: 'A股基金',
        percentage: 40,
        description: '主要投资于中国A股市场'
      },
      {
        category: 'QDII基金',
        percentage: 35,
        description: '投资于海外市场，主要是美股和港股'
      },
      {
        category: '港股通',
        percentage: 15,
        description: '通过港股通投资港股市场'
      },
      {
        category: '其他新兴市场',
        percentage: 10,
        description: '配置于其他新兴市场基金'
      }
    ],
    investmentStrategies: [
      {
        title: '地域分散原则',
        content: '按经济发展水平和市场成熟度分配投资地域，避免过度集中。',
        tips: '建议发达市场与新兴市场按6:4比例配置。'
      },
      {
        title: '行业轮动配置',
        content: '根据全球经济周期，在不同地区的优势行业间轮动配置。',
        tips: '科技股偏重美股，消费股偏重A股，制造业主攻新兴市场。'
      },
      {
        title: '汇率中性策略',
        content: '通过货币对冲工具降低汇率波动对收益的影响。',
        tips: '关注汇率对冲基金，降低单一货币风险。'
      }
    ]
  },
  inflation: {
    key: 'inflation',
    name: '跑赢通胀',
    icon: '💰',
    description: '关注保值增值，对抗通胀风险，确保资产购买力不受侵蚀',
    coreConcept: '通胀保值理念的核心目标是确保资产的长期购买力。通过配置能够抵御通胀的资产类别，实现资产价值的稳定增长，避免财富在通胀环境下缩水。',
    detailedFeatures: [
      {
        title: '实际收益率计算',
        icon: '📊',
        description: '计算扣除通胀后的实际投资收益'
      },
      {
        title: '通胀追踪分析',
        icon: '📈',
        description: '跟踪CPI、PPI等通胀指标的变化趋势'
      },
      {
        title: '保值资产推荐',
        icon: '🛡️',
        description: '推荐具有抗通胀特性的投资品种'
      },
      {
        title: '购买力保护',
        icon: '🔒',
        description: '制定保护资产购买力的投资策略'
      }
    ],
    riskLevel: 2,
    holdingPeriod: '3-5年',
    targetUser: '关注资产保值的保守投资者，重视稳健增值',
    expectedReturn: '年化6-8%',
    tools: [
      {
        key: 'inflation-calculator',
        name: '通胀计算器',
        icon: '📊',
        description: '计算通胀对购买力的影响',
        available: true
      },
      {
        key: 'real-return',
        name: '实际收益计算',
        icon: '💹',
        description: '计算扣除通胀后的真实收益',
        available: false
      },
      {
        key: 'inflation-guard',
        name: '通胀预警',
        icon: '⚠️',
        description: '通胀风险监控和预警',
        available: false
      }
    ],
    assetAllocation: [
      {
        category: '通胀保值债券',
        percentage: 30,
        description: 'TIPS等通胀保值债券，直接对冲通胀风险'
      },
      {
        category: '实物资产基金',
        percentage: 25,
        description: 'REITs、商品基金等实物资产相关投资'
      },
      {
        category: '优质蓝筹基金',
        percentage: 20,
        description: '具有定价权和护城河的优质企业'
      },
      {
        category: '货币市场基金',
        percentage: 15,
        description: '流动性好，收益随利率上升而提高'
      },
      {
        category: '黄金ETF',
        percentage: 10,
        description: '传统通胀对冲工具'
      }
    ],
    investmentStrategies: [
      {
        title: '阶梯式配置',
        content: '根据通胀预期水平，阶梯式调整资产配置比例。',
        tips: '通胀高企时增加实物资产配置，通胀温和时侧重债券。'
      },
      {
        title: '品质优先原则',
        content: '选择具有强大护城河和定价权的优质企业股票。',
        tips: '关注消费、医疗、公用事业等防御性行业。'
      },
      {
        title: '流动性管理',
        content: '保持充足的现金类资产，把握投资机会。',
        tips: '建议保持10-15%的现金类资产。'
      }
    ]
  }
}

const getRiskText = (level: number) => {
  const riskLevels = ['极低风险', '低风险', '中等风险', '中高风险', '高风险']
  return riskLevels[level - 1] || '未知'
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

const initAllocationChart = () => {
  if (!allocationChart.value || !theme.value) return

  const chart = echarts.init(allocationChart.value)

  const data = theme.value.assetAllocation.map(item => ({
    name: item.category,
    value: item.percentage
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%'
    },
    series: [{
      name: '资产配置',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '18',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: data
    }]
  }

  chart.setOption(option)

  window.addEventListener('resize', () => {
    chart.resize()
  })
}

const switchToTheme = () => {
  // 这里应该调用API切换主题
  userStore.updateTheme(themeKey.value)
  ElMessage.success(`已切换到${theme.value.name}主题`)
}

const useTool = (toolKey: string) => {
  ElMessage.info(`工具 "${toolKey}" 功能开发中...`)
}

const addFund = (fund: any) => {
  ElMessage.info(`添加基金: ${fund.name}`)
}

const loadThemeDetail = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    theme.value = themesData[themeKey.value]

    if (!theme.value) {
      ElMessage.error('未找到该主题')
      router.push('/themes')
      return
    }

    // 生成推荐基金数据
    recommendedFunds.value = [
      {
        code: '110022',
        name: '易方达消费行业股票',
        type: 'stock',
        typeName: '股票型',
        company: '易方达基金',
        nav: 2.456,
        yearReturn: 15.6
      },
      {
        code: '513050',
        name: '中概互联网ETF',
        type: 'index',
        typeName: '指数型',
        company: '华夏基金',
        nav: 0.852,
        yearReturn: -12.3
      },
      {
        code: '040025',
        name: '华安黄金ETF',
        type: 'index',
        typeName: '指数型',
        company: '华安基金',
        nav: 4.856,
        yearReturn: 8.9
      }
    ]

    // 初始化图表
    if (activeTab.value === 'strategy') {
      await nextTick()
      initAllocationChart()
    }
  } catch (error) {
    ElMessage.error('加载主题详情失败')
    router.push('/themes')
  }
}

onMounted(() => {
  loadThemeDetail()
})

// 监听tab切换，初始化图表
watch(activeTab, async (newTab) => {
  if (newTab === 'strategy' && allocationChart.value) {
    await nextTick()
    initAllocationChart()
  }
})
</script>

<style scoped>
.theme-detail {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-content {
  flex: 1;
  text-align: center;
}

.header-content h1 {
  margin: 0;
  font-size: 32px;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.theme-icon {
  font-size: 36px;
}

.subtitle {
  margin: 8px 0 0 0;
  color: #666;
  font-size: 16px;
}

.detail-content {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.overview-section,
.tools-section,
.strategy-section,
.funds-section {
  padding: 30px;
}

.intro-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.intro-card h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
}

.intro-card p {
  margin: 0;
  color: #666;
  line-height: 1.6;
  font-size: 15px;
}

.features-section,
.metrics-section {
  margin-bottom: 30px;
}

.features-section h3,
.metrics-section h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.feature-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.feature-item h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.feature-item p {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.metric-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.metric-card h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
}

.risk-level {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 8px;
}

.risk-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e0e0e0;
}

.risk-dot.active {
  background: #E6A23C;
}

.risk-text {
  font-size: 14px;
  color: #666;
}

.period-display,
.target-users,
.expected-return {
  font-size: 16px;
  color: #409EFF;
  font-weight: 500;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.tool-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.tool-card:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.tool-header {
  margin-bottom: 16px;
}

.tool-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.tool-card h4 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #333;
}

.tool-card p {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.strategy-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
}

.strategy-card h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
}

.allocation-chart {
  margin-bottom: 24px;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.allocation-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.allocation-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.category-name {
  min-width: 100px;
  font-weight: 500;
  color: #333;
}

.category-percentage {
  min-width: 60px;
  font-weight: bold;
  color: #409EFF;
}

.category-desc {
  color: #666;
  font-size: 14px;
}

.strategy-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.strategy-item h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.strategy-item p {
  margin: 0 0 12px 0;
  color: #666;
  line-height: 1.5;
}

.strategy-tips {
  background: #e7f3ff;
  border-left: 3px solid #409EFF;
  padding: 12px;
  border-radius: 4px;
}

.tips-label {
  font-weight: 500;
  color: #409EFF;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.funds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.fund-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.fund-card:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.fund-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.fund-header h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
  flex: 1;
}

.fund-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
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

.fund-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fund-company {
  font-size: 12px;
  color: #999;
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

  .header-content {
    text-align: left;
  }

  .header-content h1 {
    flex-direction: column;
    gap: 8px;
  }

  .features-grid,
  .tools-grid,
  .funds-grid {
    grid-template-columns: 1fr;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .allocation-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}
</style>