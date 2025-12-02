<template>
  <div class="portfolio">
    <div class="portfolio-header">
      <h1>💼 我的基金</h1>
      <p class="subtitle">管理您的投资组合，跟踪基金表现</p>
      <el-button type="primary" @click="$router.push('/portfolio/add')" size="large">
        <el-icon><Plus /></el-icon>
        添加基金
      </el-button>
    </div>

    <div class="portfolio-stats">
      <div class="stat-card">
        <div class="stat-icon" style="background: #409EFF;">
          💰
        </div>
        <div class="stat-content">
          <div class="stat-title">总市值</div>
          <div class="stat-value">¥ {{ formatNumber(totalValue) }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #67C23A;">
          📈
        </div>
        <div class="stat-content">
          <div class="stat-title">总收益</div>
          <div class="stat-value" :class="totalProfit >= 0 ? 'positive' : 'negative'">
            {{ totalProfit >= 0 ? '+' : '' }}¥ {{ formatNumber(totalProfit) }}
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #E6A23C;">
          📊
        </div>
        <div class="stat-content">
          <div class="stat-title">收益率</div>
          <div class="stat-value" :class="totalReturnRate >= 0 ? 'positive' : 'negative'">
            {{ totalReturnRate >= 0 ? '+' : '' }}{{ totalReturnRate.toFixed(2) }}%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #F56C6C;">
          🎯
        </div>
        <div class="stat-content">
          <div class="stat-title">基金数量</div>
          <div class="stat-value">{{ fundList.length }}支</div>
        </div>
      </div>
    </div>

    <div class="portfolio-content">
      <div class="content-header">
        <div class="filter-controls">
          <el-select v-model="sortBy" placeholder="排序方式" @change="sortFunds">
            <el-option label="按收益率排序" value="returnRate" />
            <el-option label="按市值排序" value="totalValue" />
            <el-option label="按添加时间排序" value="addTime" />
          </el-select>
          <el-select v-model="filterType" placeholder="筛选类型" @change="filterFunds">
            <el-option label="全部基金" value="all" />
            <el-option label="股票型" value="stock" />
            <el-option label="债券型" value="bond" />
            <el-option label="混合型" value="mixed" />
            <el-option label="指数型" value="index" />
          </el-select>
        </div>
        <div class="view-controls">
          <el-button-group>
            <el-button :type="viewMode === 'grid' ? 'primary' : 'default'" @click="viewMode = 'grid'">
              <el-icon><Grid /></el-icon>
            </el-button>
            <el-button :type="viewMode === 'list' ? 'primary' : 'default'" @click="viewMode = 'list'">
              <el-icon><List /></el-icon>
            </el-button>
          </el-button-group>
        </div>
      </div>

      <div v-if="filteredFunds.length === 0" class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>暂无基金数据</h3>
        <p>您还没有添加任何基金，点击上方按钮开始添加您的第一支基金</p>
        <el-button type="primary" size="large" @click="$router.push('/portfolio/add')">
          添加第一支基金
        </el-button>
      </div>

      <!-- 网格视图 -->
      <div v-else-if="viewMode === 'grid'" class="fund-grid">
        <div
          class="fund-card"
          v-for="fund in filteredFunds"
          :key="fund.code"
          @click="$router.push(`/portfolio/${fund.code}`)"
        >
          <div class="fund-header">
            <div class="fund-info">
              <h4>{{ fund.name }}</h4>
              <span class="fund-code">{{ fund.code }}</span>
            </div>
            <div class="fund-type" :class="fund.type.toLowerCase()">
              {{ fund.typeName }}
            </div>
          </div>

          <div class="fund-metrics">
            <div class="metric">
              <span class="label">净值</span>
              <span class="value">¥{{ fund.nav }}</span>
            </div>
            <div class="metric">
              <span class="label">持有份额</span>
              <span class="value">{{ fund.shares }}份</span>
            </div>
            <div class="metric">
              <span class="label">市值</span>
              <span class="value">¥{{ formatNumber(fund.totalValue) }}</span>
            </div>
          </div>

          <div class="fund-performance">
            <div class="return-item">
              <span class="label">日收益</span>
              <span class="value" :class="fund.dailyReturn >= 0 ? 'positive' : 'negative'">
                {{ fund.dailyReturn >= 0 ? '+' : '' }}¥{{ formatNumber(fund.dailyReturn) }}
              </span>
            </div>
            <div class="return-item">
              <span class="label">总收益率</span>
              <span class="value" :class="fund.totalReturnRate >= 0 ? 'positive' : 'negative'">
                {{ fund.totalReturnRate >= 0 ? '+' : '' }}{{ fund.totalReturnRate.toFixed(2) }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="fund-table">
        <el-table :data="filteredFunds" @row-click="goToFundDetail" style="width: 100%">
          <el-table-column prop="name" label="基金名称" min-width="200">
            <template #default="{ row }">
              <div>
                <div class="fund-name">{{ row.name }}</div>
                <div class="fund-code">{{ row.code }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="typeName" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getFundTypeTag(row.type)" size="small">
                {{ row.typeName }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="nav" label="净值" width="120" align="right">
            <template #default="{ row }">
              ¥{{ row.nav }}
            </template>
          </el-table-column>

          <el-table-column prop="shares" label="持有份额" width="120" align="right">
            <template #default="{ row }">
              {{ row.shares }}
            </template>
          </el-table-column>

          <el-table-column prop="totalValue" label="市值" width="140" align="right">
            <template #default="{ row }">
              ¥{{ formatNumber(row.totalValue) }}
            </template>
          </el-table-column>

          <el-table-column prop="dailyReturn" label="日收益" width="120" align="right">
            <template #default="{ row }">
              <span :class="row.dailyReturn >= 0 ? 'positive' : 'negative'">
                {{ row.dailyReturn >= 0 ? '+' : '' }}¥{{ formatNumber(row.dailyReturn) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="totalReturnRate" label="总收益率" width="120" align="right">
            <template #default="{ row }">
              <span :class="row.totalReturnRate >= 0 ? 'positive' : 'negative'">
                {{ row.totalReturnRate >= 0 ? '+' : '' }}{{ row.totalReturnRate.toFixed(2) }}%
              </span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click.stop="editFund(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Grid, List } from '@element-plus/icons-vue'

const router = useRouter()

const viewMode = ref<'grid' | 'list'>('grid')
const sortBy = ref('returnRate')
const filterType = ref('all')

// 模拟基金数据
const fundList = ref([
  {
    code: '110022',
    name: '易方达消费行业股票',
    type: 'stock',
    typeName: '股票型',
    nav: 2.456,
    shares: 1000,
    totalValue: 2456,
    dailyReturn: 15.6,
    totalReturnRate: 5.8,
    addTime: '2024-01-15'
  },
  {
    code: '002001',
    name: '华夏回报混合',
    type: 'mixed',
    typeName: '混合型',
    nav: 1.234,
    shares: 2000,
    totalValue: 2468,
    dailyReturn: -8.5,
    totalReturnRate: 2.3,
    addTime: '2024-02-10'
  },
  {
    code: '161005',
    name: '富国天惠沪深300',
    type: 'index',
    typeName: '指数型',
    nav: 0.987,
    shares: 3000,
    totalValue: 2961,
    dailyReturn: 12.3,
    totalReturnRate: 4.1,
    addTime: '2024-03-05'
  }
])

// 计算统计数据
const totalValue = computed(() =>
  fundList.value.reduce((sum, fund) => sum + fund.totalValue, 0)
)

const totalProfit = computed(() =>
  fundList.value.reduce((sum, fund) => sum + fund.dailyReturn, 0)
)

const totalReturnRate = computed(() => {
  const totalCost = fundList.value.reduce((sum, fund) =>
    sum + (fund.totalValue / (1 + fund.totalReturnRate / 100)), 0
  )
  return totalCost > 0 ? ((totalValue.value - totalCost) / totalCost) * 100 : 0
})

// 筛选和排序
const filteredFunds = computed(() => {
  let filtered = [...fundList.value]

  // 筛选
  if (filterType.value !== 'all') {
    filtered = filtered.filter(fund => fund.type === filterType.value)
  }

  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'returnRate':
        return b.totalReturnRate - a.totalReturnRate
      case 'totalValue':
        return b.totalValue - a.totalValue
      case 'addTime':
        return new Date(b.addTime).getTime() - new Date(a.addTime).getTime()
      default:
        return 0
    }
  })

  return filtered
})

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num)
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

const sortFunds = () => {
  // 排序逻辑在computed中处理
}

const filterFunds = () => {
  // 筛选逻辑在computed中处理
}

const goToFundDetail = (fund: any) => {
  router.push(`/portfolio/${fund.code}`)
}

const editFund = (fund: any) => {
  ElMessage.info(`编辑基金: ${fund.name}`)
}

onMounted(() => {
  // 这里将来可以从API获取数据
})
</script>

<style scoped>
.portfolio {
  padding: 20px;
}

.portfolio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.portfolio-header h1 {
  margin: 0;
  font-size: 32px;
  color: #333;
}

.subtitle {
  margin: 8px 0 0 0;
  color: #666;
  font-size: 16px;
}

.portfolio-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stat-value.positive {
  color: #67C23A;
}

.stat-value.negative {
  color: #F56C6C;
}

.portfolio-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 12px 0;
  font-size: 20px;
  color: #333;
}

.empty-state p {
  margin: 0 0 24px 0;
  color: #666;
  font-size: 16px;
}

.fund-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
}

.fund-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.fund-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
}

.fund-code {
  font-size: 12px;
  color: #999;
}

.fund-type {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.fund-type.stock {
  background: #FEF0F0;
  color: #F56C6C;
}

.fund-type.bond {
  background: #F0F9FF;
  color: #409EFF;
}

.fund-type.mixed {
  background: #FDF6EC;
  color: #E6A23C;
}

.fund-type.index {
  background: #F0F5FF;
  color: #6366F1;
}

.fund-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.metric {
  text-align: center;
}

.metric .label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.metric .value {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.fund-performance {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.return-item {
  text-align: center;
}

.return-item .label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.return-item .value {
  display: block;
  font-size: 14px;
  font-weight: 500;
}

.fund-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.positive {
  color: #67C23A;
}

.negative {
  color: #F56C6C;
}

@media (max-width: 768px) {
  .portfolio-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .portfolio-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-header {
    flex-direction: column;
    gap: 16px;
  }

  .fund-grid {
    grid-template-columns: 1fr;
  }
}
</style>