<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>📊 仪表板</h1>
      <p class="subtitle">欢迎回来，{{ userStore.user?.nickname || userStore.user?.username }}！</p>
    </div>

    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon" style="background: #409EFF;">
          💰
        </div>
        <div class="stat-content">
          <div class="stat-title">总资产</div>
          <div class="stat-value">¥ {{ formatNumber(totalAssets) }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #67C23A;">
          📈
        </div>
        <div class="stat-content">
          <div class="stat-title">总收益</div>
          <div class="stat-value" :class="totalReturn >= 0 ? 'positive' : 'negative'">
            {{ totalReturn >= 0 ? '+' : '' }}{{ formatNumber(totalReturn) }}
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #E6A23C;">
          📊
        </div>
        <div class="stat-content">
          <div class="stat-title">收益率</div>
          <div class="stat-value" :class="returnRate >= 0 ? 'positive' : 'negative'">
            {{ returnRate >= 0 ? '+' : '' }}{{ returnRate.toFixed(2) }}%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #F56C6C;">
          🎯
        </div>
        <div class="stat-content">
          <div class="stat-title">基金数量</div>
          <div class="stat-value">{{ fundCount }}支</div>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="content-left">
        <div class="card">
          <div class="card-header">
            <h3>🎯 当前主题</h3>
            <el-button type="primary" size="small" @click="switchTheme">
              切换主题
            </el-button>
          </div>
          <div class="theme-info">
            <div class="theme-icon">
              {{ getThemeIcon(userStore.user?.currentTheme) }}
            </div>
            <div class="theme-details">
              <h4>{{ getThemeName(userStore.user?.currentTheme) }}</h4>
              <p>{{ getThemeDescription(userStore.user?.currentTheme) }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>💼 我的基金</h3>
            <el-button type="primary" size="small" @click="$router.push('/portfolio/add')">
              添加基金
            </el-button>
          </div>
          <div class="fund-list">
            <div class="fund-item" v-for="fund in mockFunds" :key="fund.id">
              <div class="fund-info">
                <div class="fund-name">{{ fund.name }}</div>
                <div class="fund-code">{{ fund.code }}</div>
              </div>
              <div class="fund-stats">
                <div class="fund-price">¥{{ fund.price }}</div>
                <div class="fund-return" :class="fund.returnRate >= 0 ? 'positive' : 'negative'">
                  {{ fund.returnRate >= 0 ? '+' : '' }}{{ fund.returnRate }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="content-right">
        <div class="card">
          <div class="card-header">
            <h3>🤖 AI投资建议</h3>
            <el-button type="primary" size="small" @click="$router.push('/analysis/ai-chat')">
              AI对话
            </el-button>
          </div>
          <div class="ai-suggestions">
            <div class="suggestion-item" v-for="(suggestion, index) in aiSuggestions" :key="index">
              <div class="suggestion-icon">
                💡
              </div>
              <div class="suggestion-content">
                <p>{{ suggestion }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>📈 市场概览</h3>
          </div>
          <div class="market-overview">
            <div class="market-item">
              <div class="market-label">上证指数</div>
              <div class="market-value">3,123.45</div>
              <div class="market-change positive">+1.23%</div>
            </div>
            <div class="market-item">
              <div class="market-label">深证成指</div>
              <div class="market-value">9,876.54</div>
              <div class="market-change negative">-0.45%</div>
            </div>
            <div class="market-item">
              <div class="market-label">创业板指</div>
              <div class="market-value">1,987.65</div>
              <div class="market-change positive">+2.15%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const userStore = useAuthStore()

// 模拟数据
const totalAssets = ref(1500000)
const totalReturn = ref(50000)
const returnRate = ref(3.33)
const fundCount = ref(5)

const mockFunds = ref([
  {
    id: 1,
    name: '易方达消费行业股票',
    code: '110022',
    price: 2.456,
    returnRate: 5.8
  },
  {
    id: 2,
    name: '华夏回报混合',
    code: '002001',
    price: 1.234,
    returnRate: 2.3
  },
  {
    id: 3,
    name: '富国天惠沪深300',
    code: '161005',
    price: 0.987,
    returnRate: 4.1
  }
])

const aiSuggestions = ref([
  '基于FIRE主题，建议您的股票配置比例调整为60%，债券配置调整为40%',
  '当前市场波动较大，建议定期检查投资组合表现',
  '考虑增加一些国际化配置以分散风险'
])

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num)
}

const getThemeIcon = (theme: string) => {
  const icons = {
    fire: '🏖️',
    global: '🌍',
    inflation: '💰'
  }
  return icons[theme as keyof typeof icons] || '📊'
}

const getThemeName = (theme: string) => {
  const names = {
    fire: '提前退休',
    global: '全球配置',
    inflation: '跑赢通胀'
  }
  return names[theme as keyof typeof names] || '未知主题'
}

const getThemeDescription = (theme: string) => {
  const descriptions = {
    fire: '专注于实现财务独立和提前退休的目标',
    global: '通过全球分散投资降低风险',
    inflation: '关注保值增值，对抗通胀风险'
  }
  return descriptions[theme as keyof typeof descriptions] || '未知描述'
}

const switchTheme = () => {
  ElMessage.info('主题切换功能开发中...')
}

onMounted(() => {
  // 模拟获取用户数据
  if (!userStore.user) {
    userStore.setUser({
      id: 1,
      username: 'demo',
      email: 'demo@jntm.com',
      nickname: '演示用户',
      currentTheme: 'fire',
      token: 'mock-token'
    })
  }
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  color: #333;
}

.subtitle {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.stats-overview {
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

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

@media (max-width: 1024px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}

.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.theme-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.theme-details h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
}

.theme-details p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.fund-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fund-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
}

.fund-info {
  flex: 1;
}

.fund-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.fund-code {
  font-size: 12px;
  color: #999;
}

.fund-stats {
  text-align: right;
}

.fund-price {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.fund-return {
  font-size: 12px;
  font-weight: 500;
}

.fund-return.positive {
  color: #67C23A;
}

.fund-return.negative {
  color: #F56C6C;
}

.suggestions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.suggestion-icon {
  width: 32px;
  height: 32px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.suggestion-content {
  flex: 1;
}

.suggestion-content p {
  margin: 0;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.market-overview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.market-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
}

.market-label {
  font-size: 14px;
  color: #666;
}

.market-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.market-change {
  font-size: 14px;
  font-weight: 500;
}

.market-change.positive {
  color: #67C23A;
}

.market-change.negative {
  color: #F56C6C;
}
</style>