<template>
  <div class="themes">
    <div class="themes-header">
      <h1>🎯 投资主题</h1>
      <p class="subtitle">选择符合您投资理念的主题，获得个性化的投资建议</p>
    </div>

    <div class="current-theme" v-if="userStore.user?.currentTheme">
      <h3>当前主题</h3>
      <div class="current-theme-card" :class="userStore.user.currentTheme">
        <div class="theme-header">
          <div class="theme-icon">
            {{ getThemeIcon(userStore.user.currentTheme) }}
          </div>
          <div class="theme-info">
            <h4>{{ getThemeName(userStore.user.currentTheme) }}</h4>
            <p>{{ getThemeDescription(userStore.user.currentTheme) }}</p>
          </div>
          <el-button type="primary" @click="showThemeDetail(userStore.user.currentTheme)">
            查看详情
          </el-button>
        </div>

        <div class="theme-progress">
          <div class="progress-item">
            <span class="label">主题匹配度</span>
            <el-progress :percentage="85" :color="getThemeColor(userStore.user.currentTheme)" />
          </div>
          <div class="progress-item">
            <span class="label">目标完成度</span>
            <el-progress :percentage="60" :color="getThemeColor(userStore.user.currentTheme)" />
          </div>
        </div>
      </div>
    </div>

    <div class="all-themes">
      <h3>选择投资主题</h3>
      <div class="themes-grid">
        <div
          v-for="theme in availableThemes"
          :key="theme.key"
          class="theme-card"
          :class="{ active: userStore.user?.currentTheme === theme.key }"
          @click="selectTheme(theme.key)"
        >
          <div class="theme-header">
            <div class="theme-icon">{{ theme.icon }}</div>
            <div class="theme-status">
              <el-tag v-if="userStore.user?.currentTheme === theme.key" type="success" size="small">
                当前主题
              </el-tag>
            </div>
          </div>

          <div class="theme-content">
            <h4>{{ theme.name }}</h4>
            <p>{{ theme.description }}</p>

            <div class="theme-features">
              <h5>主题特点</h5>
              <ul>
                <li v-for="feature in theme.features" :key="feature">{{ feature }}</li>
              </ul>
            </div>

            <div class="theme-metrics">
              <div class="metric-item">
                <span class="label">适合人群</span>
                <span class="value">{{ theme.targetUser }}</span>
              </div>
              <div class="metric-item">
                <span class="label">风险等级</span>
                <div class="risk-level">
                  <div
                    v-for="i in 5"
                    :key="i"
                    class="risk-dot"
                    :class="{ active: i <= theme.riskLevel }"
                  ></div>
                </div>
              </div>
              <div class="metric-item">
                <span class="label">建议持有</span>
                <span class="value">{{ theme.holdingPeriod }}</span>
              </div>
            </div>
          </div>

          <div class="theme-actions">
            <el-button
              v-if="userStore.user?.currentTheme !== theme.key"
              type="primary"
              @click.stop="switchTheme(theme.key)"
            >
              选择此主题
            </el-button>
            <el-button @click.stop="showThemeDetail(theme.key)">
              了解详情
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 主题切换确认对话框 -->
    <el-dialog
      v-model="switchDialogVisible"
      title="切换投资主题"
      width="500px"
    >
      <div class="switch-dialog-content">
        <div class="theme-comparison">
          <div class="current-theme-info">
            <h4>当前主题</h4>
            <div class="theme-item">
              <span class="theme-icon">{{ getThemeIcon(userStore.user?.currentTheme) }}</span>
              <span>{{ getThemeName(userStore.user?.currentTheme) }}</span>
            </div>
          </div>

          <div class="arrow">→</div>

          <div class="new-theme-info">
            <h4>新主题</h4>
            <div class="theme-item">
              <span class="theme-icon">{{ getThemeIcon(selectedTheme) }}</span>
              <span>{{ getThemeName(selectedTheme) }}</span>
            </div>
          </div>
        </div>

        <div class="switch-notice">
          <el-alert
            title="温馨提示"
            type="info"
            :closable="false"
            show-icon
          >
            切换主题后，您的投资建议和分析角度将会相应调整。这不会影响您已有的基金持仓。
          </el-alert>
        </div>
      </div>

      <template #footer>
        <el-button @click="switchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSwitchTheme">确认切换</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const userStore = useAuthStore()

const switchDialogVisible = ref(false)
const selectedTheme = ref('')

const availableThemes = ref([
  {
    key: 'fire',
    name: '提前退休 (FIRE)',
    icon: '🏖️',
    description: '专注于实现财务独立和提前退休的目标，通过稳健的投资策略早日实现财务自由',
    features: [
      '4%法则验证和退休金计算',
      '被动收入分析',
      '退休年龄预测',
      '通胀调整后的收益计算'
    ],
    targetUser: '追求财务自由的年轻职场人',
    riskLevel: 3,
    holdingPeriod: '10年以上',
    color: '#67C23A'
  },
  {
    key: 'global',
    name: '全球配置',
    icon: '🌍',
    description: '通过全球分散投资降低风险，把握国际市场机遇，实现资产全球化配置',
    features: [
      'QDII基金筛选和分析',
      '汇率风险评估',
      '全球市场对比',
      '跨市场资产配置'
    ],
    targetUser: '希望全球分散风险的投资者',
    riskLevel: 4,
    holdingPeriod: '5-10年',
    color: '#409EFF'
  },
  {
    key: 'inflation',
    name: '跑赢通胀',
    icon: '💰',
    description: '关注保值增值，对抗通胀风险，确保资产购买力不受侵蚀',
    features: [
      '实际收益率计算',
      '通胀跟踪分析',
      '保值资产推荐',
      '购买力保护策略'
    ],
    targetUser: '关注资产保值的保守投资者',
    riskLevel: 2,
    holdingPeriod: '3-5年',
    color: '#E6A23C'
  }
])

const getThemeIcon = (theme: string) => {
  const themeItem = availableThemes.value.find(t => t.key === theme)
  return themeItem?.icon || '📊'
}

const getThemeName = (theme: string) => {
  const themeItem = availableThemes.value.find(t => t.key === theme)
  return themeItem?.name || '未知主题'
}

const getThemeDescription = (theme: string) => {
  const themeItem = availableThemes.value.find(t => t.key === theme)
  return themeItem?.description || ''
}

const getThemeColor = (theme: string) => {
  const themeItem = availableThemes.value.find(t => t.key === theme)
  return themeItem?.color || '#409EFF'
}

const selectTheme = (themeKey: string) => {
  if (userStore.user?.currentTheme === themeKey) {
    showThemeDetail(themeKey)
  } else {
    switchTheme(themeKey)
  }
}

const switchTheme = (themeKey: string) => {
  selectedTheme.value = themeKey
  switchDialogVisible.value = true
}

const confirmSwitchTheme = () => {
  // 这里应该调用API切换主题
  userStore.updateTheme(selectedTheme.value)

  ElMessage.success(`已切换到${getThemeName(selectedTheme.value)}主题`)
  switchDialogVisible.value = false
}

const showThemeDetail = (themeKey: string) => {
  router.push(`/themes/${themeKey}`)
}
</script>

<style scoped>
.themes {
  padding: 20px;
}

.themes-header {
  text-align: center;
  margin-bottom: 40px;
}

.themes-header h1 {
  margin: 0;
  font-size: 32px;
  color: #333;
}

.subtitle {
  margin: 8px 0 0 0;
  color: #666;
  font-size: 16px;
}

.current-theme {
  margin-bottom: 40px;
}

.current-theme h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #333;
}

.current-theme-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #67C23A;
}

.current-theme-card.global {
  border-left-color: #409EFF;
}

.current-theme-card.inflation {
  border-left-color: #E6A23C;
}

.theme-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.theme-icon {
  font-size: 48px;
  margin-right: 20px;
}

.theme-info {
  flex: 1;
}

.theme-info h4 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #333;
}

.theme-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.theme-progress {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress-item .label {
  min-width: 100px;
  font-size: 14px;
  color: #666;
}

.progress-item .el-progress {
  flex: 1;
}

.all-themes h3 {
  margin: 0 0 30px 0;
  font-size: 20px;
  color: #333;
}

.themes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.theme-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.theme-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.theme-card.active {
  border-color: #409EFF;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
}

.theme-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.theme-content h4 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #333;
}

.theme-content p {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.theme-features h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #333;
}

.theme-features ul {
  margin: 0 0 20px 0;
  padding-left: 16px;
}

.theme-features li {
  margin-bottom: 6px;
  color: #666;
  font-size: 13px;
}

.theme-metrics {
  margin-bottom: 20px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.metric-item .label {
  font-size: 13px;
  color: #666;
}

.metric-item .value {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.risk-level {
  display: flex;
  gap: 4px;
}

.risk-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e0e0e0;
}

.risk-dot.active {
  background: #E6A23C;
}

.theme-actions {
  display: flex;
  gap: 12px;
}

.switch-dialog-content {
  padding: 20px 0;
}

.theme-comparison {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.current-theme-info,
.new-theme-info {
  flex: 1;
  text-align: center;
}

.current-theme-info h4,
.new-theme-info h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
}

.theme-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.arrow {
  font-size: 24px;
  color: #409EFF;
  margin: 0 20px;
}

.switch-notice {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .themes-grid {
    grid-template-columns: 1fr;
  }

  .theme-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .theme-comparison {
    flex-direction: column;
    gap: 20px;
  }

  .arrow {
    transform: rotate(90deg);
    margin: 0;
  }

  .theme-actions {
    flex-direction: column;
  }
}
</style>