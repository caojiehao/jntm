<template>
  <div class="analysis">
    <div class="analysis-header">
      <h1>📊 投资分析</h1>
      <p class="subtitle">深度分析您的投资组合，获得专业的投资建议</p>
    </div>

    <div class="analysis-overview">
      <div class="overview-card">
        <div class="overview-header">
          <h3>组合概览</h3>
          <el-select v-model="timeRange" placeholder="时间范围" @change="updateAnalysis">
            <el-option label="最近1个月" value="1M" />
            <el-option label="最近3个月" value="3M" />
            <el-option label="最近6个月" value="6M" />
            <el-option label="最近1年" value="1Y" />
            <el-option label="成立至今" value="ALL" />
          </el-select>
        </div>

        <div class="overview-metrics">
          <div class="metric-card">
            <div class="metric-icon" style="background: #409EFF;">
              💰
            </div>
            <div class="metric-content">
              <div class="metric-title">总市值</div>
              <div class="metric-value">¥ {{ formatNumber(overview.totalValue) }}</div>
              <div class="metric-change" :class="overview.valueChange >= 0 ? 'positive' : 'negative'">
                {{ overview.valueChange >= 0 ? '+' : '' }}{{ formatNumber(overview.valueChange) }}
              </div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon" style="background: #67C23A;">
              📈
            </div>
            <div class="metric-content">
              <div class="metric-title">总收益率</div>
              <div class="metric-value" :class="overview.totalReturn >= 0 ? 'positive' : 'negative'">
                {{ overview.totalReturn >= 0 ? '+' : '' }}{{ overview.totalReturn.toFixed(2) }}%
              </div>
              <div class="metric-change">
                同期基准: {{ overview.benchmarkReturn.toFixed(2) }}%
              </div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon" style="background: #E6A23C;">
              ⚡
            </div>
            <div class="metric-content">
              <div class="metric-title">风险评分</div>
              <div class="metric-value">{{ overview.riskScore }}</div>
              <div class="metric-change">{{ getRiskLevel(overview.riskScore) }}</div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon" style="background: #F56C6C;">
              🎯
            </div>
            <div class="metric-content">
              <div class="metric-title">夏普比率</div>
              <div class="metric-value">{{ overview.sharpeRatio.toFixed(2) }}</div>
              <div class="metric-change">{{ getSharpeLevel(overview.sharpeRatio) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="analysis-content">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="收益分析" name="performance">
          <div class="performance-section">
            <div class="performance-chart">
              <div class="chart-header">
                <h4>收益走势</h4>
                <div class="chart-controls">
                  <el-radio-group v-model="performanceChartType" size="small">
                    <el-radio-button value="cumulative">累计收益</el-radio-button>
                    <el-radio-button value="daily">每日收益</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
              <div ref="performanceChart" class="chart-container"></div>
            </div>

            <div class="performance-stats">
              <h4>收益统计</h4>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="label">期间最大收益</span>
                  <span class="value positive">+{{ performanceStats.maxGain.toFixed(2) }}%</span>
                </div>
                <div class="stat-item">
                  <span class="label">期间最大亏损</span>
                  <span class="value negative">{{ performanceStats.maxLoss.toFixed(2) }}%</span>
                </div>
                <div class="stat-item">
                  <span class="label">胜率</span>
                  <span class="value">{{ (performanceStats.winRate * 100).toFixed(1) }}%</span>
                </div>
                <div class="stat-item">
                  <span class="label">平均日收益</span>
                  <span class="value" :class="performanceStats.avgDailyReturn >= 0 ? 'positive' : 'negative'">
                    {{ performanceStats.avgDailyReturn >= 0 ? '+' : '' }}{{ performanceStats.avgDailyReturn.toFixed(4) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="风险分析" name="risk">
          <div class="risk-section">
            <div class="risk-metrics">
              <h4>风险指标</h4>
              <div class="risk-cards">
                <div class="risk-card">
                  <h5>波动率</h5>
                  <div class="risk-value">{{ (riskMetrics.volatility * 100).toFixed(2) }}%</div>
                  <div class="risk-desc">衡量收益波动的程度</div>
                </div>
                <div class="risk-card">
                  <h5>最大回撤</h5>
                  <div class="risk-value negative">{{ (riskMetrics.maxDrawdown * 100).toFixed(2) }}%</div>
                  <div class="risk-desc">历史最大亏损幅度</div>
                </div>
                <div class="risk-card">
                  <h5>VaR (95%)</h5>
                  <div class="risk-value negative">-{{ (riskMetrics.var95 * 100).toFixed(2) }}%</div>
                  <div class="risk-desc">95%置信度下的最大损失</div>
                </div>
                <div class="risk-card">
                  <h5>Beta系数</h5>
                  <div class="risk-value">{{ riskMetrics.beta.toFixed(2) }}</div>
                  <div class="risk-desc">相对市场基准的敏感度</div>
                </div>
              </div>
            </div>

            <div class="risk-analysis">
              <h4>风险分析</h4>
              <div class="analysis-content">
                <div class="analysis-item">
                  <h5>集中度风险</h5>
                  <el-progress
                    :percentage="concentrationRisk.percentage"
                    :color="getConcentrationRiskColor(concentrationRisk.level)"
                    :show-text="true"
                  />
                  <p>{{ concentrationRisk.description }}</p>
                </div>

                <div class="analysis-item">
                  <h5>行业分布</h5>
                  <div ref="industryChart" class="small-chart-container"></div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="资产配置" name="allocation">
          <div class="allocation-section">
            <div class="allocation-overview">
              <div class="chart-side">
                <h4>资产配置图</h4>
                <div ref="allocationChart" class="chart-container"></div>
              </div>
              <div class="details-side">
                <h4>配置详情</h4>
                <div class="allocation-list">
                  <div
                    v-for="item in allocationData"
                    :key="item.category"
                    class="allocation-item"
                  >
                    <div class="allocation-info">
                      <span class="category-name">{{ item.category }}</span>
                      <span class="category-percentage">{{ item.percentage }}%</span>
                    </div>
                    <el-progress
                      :percentage="item.percentage"
                      :color="item.color"
                      :show-text="false"
                      :stroke-width="8"
                    />
                    <div class="allocation-desc">{{ item.description }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="allocation-recommendations">
              <h4>配置建议</h4>
              <div class="recommendations-list">
                <el-alert
                  v-for="recommendation in allocationRecommendations"
                  :key="recommendation.type"
                  :title="recommendation.title"
                  :type="recommendation.type"
                  :description="recommendation.description"
                  :closable="false"
                  show-icon
                />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="对比分析" name="comparison">
          <div class="comparison-section">
            <div class="comparison-controls">
              <h4>基准对比</h4>
              <div class="benchmark-selector">
                <el-checkbox-group v-model="selectedBenchmarks">
                  <el-checkbox value="hs300">沪深300</el-checkbox>
                  <el-checkbox value="csi500">中证500</el-checkbox>
                  <el-checkbox value="cyb300">创业板指</el-checkbox>
                  <el-checkbox value="bond">中债综合</el-checkbox>
                </el-checkbox-group>
              </div>
            </div>

            <div class="comparison-chart">
              <div ref="comparisonChart" class="chart-container"></div>
            </div>

            <div class="comparison-table">
              <h4>表现对比</h4>
              <el-table :data="comparisonData" style="width: 100%">
                <el-table-column prop="name" label="指标" />
                <el-table-column prop="portfolio" label="我的组合" align="right">
                  <template #default="{ row }">
                    <span :class="row.portfolio >= 0 ? 'positive' : 'negative'">
                      {{ row.portfolio >= 0 ? '+' : '' }}{{ row.portfolio }}%
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="hs300" label="沪深300" align="right">
                  <template #default="{ row }">
                    <span :class="row.hs300 >= 0 ? 'positive' : 'negative'">
                      {{ row.hs300 >= 0 ? '+' : '' }}{{ row.hs300 }}%
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="csi500" label="中证500" align="right">
                  <template #default="{ row }">
                    <span :class="row.csi500 >= 0 ? 'positive' : 'negative'">
                      {{ row.csi500 >= 0 ? '+' : '' }}{{ row.csi500 }}%
                    </span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

const activeTab = ref('performance')
const timeRange = ref('1Y')
const performanceChartType = ref('cumulative')
const selectedBenchmarks = ref(['hs300'])

// 图表引用
const performanceChart = ref<HTMLElement>()
const industryChart = ref<HTMLElement>()
const allocationChart = ref<HTMLElement>()
const comparisonChart = ref<HTMLElement>()

// 概览数据
const overview = ref({
  totalValue: 156789,
  valueChange: 5234,
  totalReturn: 8.56,
  benchmarkReturn: 6.23,
  riskScore: 65,
  sharpeRatio: 1.25
})

// 收益统计
const performanceStats = ref({
  maxGain: 12.5,
  maxLoss: -8.3,
  winRate: 0.65,
  avgDailyReturn: 0.08
})

// 风险指标
const riskMetrics = ref({
  volatility: 0.15,
  maxDrawdown: -0.12,
  var95: 0.08,
  beta: 1.05
})

// 集中度风险
const concentrationRisk = ref({
  percentage: 75,
  level: 'medium',
  description: '当前投资组合的集中度适中，建议适当分散投资以降低风险'
})

// 资产配置数据
const allocationData = ref([
  {
    category: '股票型基金',
    percentage: 45,
    color: '#F56C6C',
    description: '主要投资于股票市场的基金'
  },
  {
    category: '混合型基金',
    percentage: 25,
    color: '#E6A23C',
    description: '股债混合配置的平衡型基金'
  },
  {
    category: '债券型基金',
    percentage: 20,
    color: '#67C23A',
    description: '主要投资于债券市场的基金'
  },
  {
    category: '货币型基金',
    percentage: 10,
    color: '#409EFF',
    description: '流动性好，风险极低的基金'
  }
])

// 配置建议
const allocationRecommendations = ref([
  {
    type: 'warning',
    title: '债券配置偏低',
    description: '您的债券配置比例为20%，建议增加到25-30%以降低组合波动性'
  },
  {
    type: 'info',
    title: '分散度良好',
    description: '您的投资涵盖了多种基金类型，分散化程度较好'
  }
])

// 对比数据
const comparisonData = ref([
  {
    name: '近1月收益',
    portfolio: 2.3,
    hs300: 1.8,
    csi500: 2.1
  },
  {
    name: '近3月收益',
    portfolio: 5.6,
    hs300: 4.2,
    csi500: 6.8
  },
  {
    name: '近6月收益',
    portfolio: 8.9,
    hs300: 7.5,
    csi500: 9.2
  },
  {
    name: '近1年收益',
    portfolio: 15.6,
    hs300: 12.3,
    csi500: 18.7
  }
])

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num)
}

const getRiskLevel = (score: number) => {
  if (score <= 30) return '低风险'
  if (score <= 60) return '中等风险'
  return '高风险'
}

const getSharpeLevel = (ratio: number) => {
  if (ratio >= 1.5) return '优秀'
  if (ratio >= 1.0) return '良好'
  if (ratio >= 0.5) return '一般'
  return '较差'
}

const getConcentrationRiskColor = (level: string) => {
  const colorMap = {
    low: '#67C23A',
    medium: '#E6A23C',
    high: '#F56C6C'
  }
  return colorMap[level as keyof typeof colorMap] || '#909399'
}

const updateAnalysis = () => {
  ElMessage.info(`更新分析数据: ${timeRange.value}`)
  // 这里应该调用API更新数据
}

const initPerformanceChart = () => {
  if (!performanceChart.value) return

  const chart = echarts.init(performanceChart.value)

  // 生成模拟数据
  const dates = []
  const portfolioData = []
  const benchmarkData = []

  for (let i = 365; i >= 0; i -= 7) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])

    if (performanceChartType.value === 'cumulative') {
      portfolioData.push((Math.random() * 20 - 5).toFixed(2))
      benchmarkData.push((Math.random() * 15 - 3).toFixed(2))
    } else {
      portfolioData.push((Math.random() * 4 - 2).toFixed(2))
      benchmarkData.push((Math.random() * 3 - 1.5).toFixed(2))
    }
  }

  const option = {
    title: {
      text: performanceChartType.value === 'cumulative' ? '累计收益走势' : '每日收益分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['我的组合', '基准指数'],
      top: 30
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
      name: '收益率(%)',
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '我的组合',
        type: performanceChartType.value === 'cumulative' ? 'line' : 'bar',
        data: portfolioData,
        smooth: true,
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '基准指数',
        type: performanceChartType.value === 'cumulative' ? 'line' : 'bar',
        data: benchmarkData,
        smooth: true,
        itemStyle: {
          color: '#67C23A'
        }
      }
    ]
  }

  chart.setOption(option)
}

const initIndustryChart = () => {
  if (!industryChart.value) return

  const chart = echarts.init(industryChart.value)

  const option = {
    tooltip: {
      trigger: 'item'
    },
    series: [{
      name: '行业分布',
      type: 'pie',
      radius: '60%',
      data: [
        { value: 35, name: '消费' },
        { value: 25, name: '科技' },
        { value: 20, name: '医疗' },
        { value: 12, name: '金融' },
        { value: 8, name: '其他' }
      ]
    }]
  }

  chart.setOption(option)
}

const initAllocationChart = () => {
  if (!allocationChart.value) return

  const chart = echarts.init(allocationChart.value)

  const option = {
    tooltip: {
      trigger: 'item'
    },
    series: [{
      name: '资产配置',
      type: 'pie',
      radius: ['40%', '70%'],
      data: allocationData.value.map(item => ({
        name: item.category,
        value: item.percentage
      }))
    }]
  }

  chart.setOption(option)
}

const initComparisonChart = () => {
  if (!comparisonChart.value) return

  const chart = echarts.init(comparisonChart.value)

  const periods = ['1月', '3月', '6月', '1年']
  const portfolioReturns = [2.3, 5.6, 8.9, 15.6]
  const hs300Returns = [1.8, 4.2, 7.5, 12.3]
  const csi500Returns = [2.1, 6.8, 9.2, 18.7]

  const option = {
    title: {
      text: '收益对比',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['我的组合', '沪深300', '中证500'],
      top: 30
    },
    xAxis: {
      type: 'category',
      data: periods
    },
    yAxis: {
      type: 'value',
      name: '收益率(%)',
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '我的组合',
        type: 'line',
        data: portfolioReturns,
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '沪深300',
        type: 'line',
        data: hs300Returns,
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '中证500',
        type: 'line',
        data: csi500Returns,
        itemStyle: {
          color: '#E6A23C'
        }
      }
    ]
  }

  chart.setOption(option)
}

const initCharts = async () => {
  await nextTick()

  switch (activeTab.value) {
    case 'performance':
      if (performanceChart.value) initPerformanceChart()
      break
    case 'risk':
      if (industryChart.value) initIndustryChart()
      break
    case 'allocation':
      if (allocationChart.value) initAllocationChart()
      break
    case 'comparison':
      if (comparisonChart.value) initComparisonChart()
      break
  }
}

onMounted(() => {
  initCharts()
})

// 监听tab切换和图表类型变化
watch([activeTab, performanceChartType], () => {
  initCharts()
})

// 响应式调整
window.addEventListener('resize', () => {
  const charts = [
    performanceChart.value,
    industryChart.value,
    allocationChart.value,
    comparisonChart.value
  ].filter(Boolean)

  charts.forEach(chart => {
    const instance = echarts.getInstanceByDom(chart)
    if (instance) {
      instance.resize()
    }
  })
})
</script>

<style scoped>
.analysis {
  padding: 20px;
}

.analysis-header {
  text-align: center;
  margin-bottom: 30px;
}

.analysis-header h1 {
  margin: 0;
  font-size: 32px;
  color: #333;
}

.subtitle {
  margin: 8px 0 0 0;
  color: #666;
  font-size: 16px;
}

.analysis-overview {
  margin-bottom: 30px;
}

.overview-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.overview-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.overview-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.metric-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
}

.metric-content {
  flex: 1;
}

.metric-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.metric-change {
  font-size: 12px;
  color: #666;
}

.detail-content {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.performance-section,
.risk-section,
.allocation-section,
.comparison-section {
  padding: 30px;
}

.performance-chart,
.risk-metrics,
.allocation-overview,
.comparison-controls {
  margin-bottom: 30px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h4 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.chart-container {
  height: 400px;
  width: 100%;
}

.small-chart-container {
  height: 200px;
  width: 100%;
}

.performance-stats {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 24px;
}

.performance-stats h4 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: white;
  border-radius: 6px;
}

.stat-item .label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.stat-item .value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.risk-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.risk-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.risk-card h5 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
}

.risk-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.risk-desc {
  font-size: 12px;
  color: #666;
}

.risk-analysis h4 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #333;
}

.analysis-item {
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.analysis-item h5 {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #333;
}

.analysis-item p {
  margin: 12px 0 0 0;
  color: #666;
  font-size: 14px;
}

.allocation-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.chart-side h4,
.details-side h4 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #333;
}

.allocation-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.allocation-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.allocation-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.category-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.category-percentage {
  font-size: 14px;
  color: #409EFF;
  font-weight: bold;
}

.allocation-desc {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

.allocation-recommendations h4 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #333;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.benchmark-selector {
  margin-bottom: 20px;
}

.comparison-table {
  margin-top: 30px;
}

.comparison-table h4 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #333;
}

.positive {
  color: #67C23A;
}

.negative {
  color: #F56C6C;
}

@media (max-width: 768px) {
  .analysis-header {
    text-align: left;
  }

  .overview-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .overview-metrics {
    grid-template-columns: repeat(2, 1fr);
  }

  .allocation-overview {
    grid-template-columns: 1fr;
  }

  .stats-grid,
  .risk-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}
</style>