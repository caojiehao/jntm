# 系统架构设计

## 架构概览

### 系统目标
- **主题化体验**：支持多种投资理念主题，提供个性化服务
- **轻量级启动**：最小化初期开发和运维成本
- **渐进式扩展**：支持从小规模内测到大规模商用
- **高可用性**：确保服务稳定性和用户体验
- **成本可控**：合理利用资源，控制运营成本

### 技术架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        前端展示层                                │
├─────────────────────────────────────────────────────────────────┤
│  Web应用 (Vue3)  │  PWA (移动端)  │  管理后台 (Admin)             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API网关层                                │
├─────────────────────────────────────────────────────────────────┤
│  Express.js  │  身份验证  │  限流控制  │  请求路由  │  日志记录    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        业务服务层                                │
├─────────────────────────────────────────────────────────────────┤
│  用户管理   │  持仓管理   │  OCR识别   │  AI分析   │  主题化服务   │
│  Service    │  Service    │  Service   │  Service  │  ThemeService │
│             │             │           │           │               │
│  数据分析   │  工具计算   │  内容推荐   │  通知服务  │               │
│  Service    │  ToolService│ ContentSvc │ NotifySvc│               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        数据访问层                                │
├─────────────────────────────────────────────────────────────────┤
│  数据访问对象  │  缓存管理  │  文件存储  │  外部API集成           │
│  (DAO/ORM)    │  (Redis)   │  (OSS)     │  (基金数据/AI服务)     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        数据存储层                                │
├─────────────────────────────────────────────────────────────────┤
│  SQLite/MySQL  │  Redis缓存  │  对象存储  │  日志存储             │
└─────────────────────────────────────────────────────────────────┘
```

## 分层架构设计

### 1. 前端架构 (Frontend Architecture)

#### 技术栈
- **框架**: Vue 3.4+ (Composition API)
- **构建工具**: Vite 5+
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **图表库**: Apache ECharts
- **类型检查**: TypeScript
- **样式方案**: SCSS + CSS Modules

#### 组件架构
```
frontend/src/
├── components/           # 公共组件
│   ├── common/          # 基础组件 (Button, Input, Modal)
│   ├── business/        # 业务组件 (FundCard, PortfolioChart)
│   ├── layout/          # 布局组件 (Header, Sidebar, Footer)
│   ├── charts/          # 图表组件 (PieChart, LineChart)
│   └── themes/          # 主题化组件 (ThemeSelector, ThemeCard)
├── views/               # 页面组件
│   ├── auth/           # 认证相关页面
│   ├── dashboard/      # 主题化仪表盘
│   ├── portfolio/      # 投资组合管理
│   ├── analysis/       # 主题化分析页面
│   ├── tools/          # 主题化投资工具
│   └── settings/       # 设置页面
├── themes/              # 主题配置
│   ├── fire/           # 提前退休主题
│   ├── global/         # 全球化配置主题
│   └── inflation/      # 跑赢通胀主题
├── stores/             # Pinia状态管理
├── services/           # API服务层
├── utils/              # 工具函数
├── hooks/              # Vue 3 Composition Hooks
└── assets/             # 静态资源
```

#### 主题化状态管理设计
```typescript
// stores/index.ts
export const useAppStore = defineStore('app', () => {
  // 全局状态
  const user = ref(null)
  const theme = ref('light')
  const loading = ref(false)
  const investmentTheme = ref('fire') // 投资主题：fire/global/inflation

  // 计算属性
  const isAuthenticated = computed(() => !!user.value)
  const isInvestmentTheme = computed(() => !!investmentTheme.value)

  // 方法
  const setUser = (userData: User) => {
    user.value = userData
  }

  const setInvestmentTheme = (theme: string) => {
    investmentTheme.value = theme
  }

  return {
    user,
    theme,
    loading,
    investmentTheme,
    isAuthenticated,
    isInvestmentTheme,
    setUser,
    setInvestmentTheme
  }
})

// stores/themeStore.ts
export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref('fire')
  const themeConfig = ref({})
  const themeTools = ref([])
  const loading = ref(false)

  // 获取主题配置
  const fetchThemeConfig = async (theme: string) => {
    loading.value = true
    try {
      const response = await themeApi.getThemeConfig(theme)
      themeConfig.value = response.data.config
      themeTools.value = response.data.tools
      currentTheme.value = theme
    } finally {
      loading.value = false
    }
  }

  // 切换主题
  const switchTheme = async (theme: string) => {
    await fetchThemeConfig(theme)
    // 保存用户偏好
    await userApi.updateThemePreference(theme)
  }

  return {
    currentTheme,
    themeConfig,
    themeTools,
    loading,
    fetchThemeConfig,
    switchTheme
  }
})

// stores/fundStore.ts
export const useFundStore = defineStore('fund', () => {
  const funds = ref<Fund[]>([])
  const portfolios = ref<Portfolio[]>([])
  const loading = ref(false)

  const totalValue = computed(() =>
    portfolios.value.reduce((sum, p) => sum + p.currentValue, 0)
  )

  // 根据主题计算特定指标
  const themeBasedMetrics = computed(() => {
    const themeStore = useThemeStore()
    const theme = themeStore.currentTheme

    switch (theme) {
      case 'fire':
        return calculateFireMetrics(portfolios.value)
      case 'global':
        return calculateGlobalMetrics(portfolios.value)
      case 'inflation':
        return calculateInflationMetrics(portfolios.value)
      default:
        return {}
    }
  })

  const fetchFunds = async () => {
    loading.value = true
    try {
      const response = await fundApi.getFunds()
      funds.value = response.data
    } finally {
      loading.value = false
    }
  }

  return {
    funds,
    portfolios,
    loading,
    totalValue,
    themeBasedMetrics,
    fetchFunds
  }
})
```

### 2. 后端架构 (Backend Architecture)

#### 技术栈
- **运行时**: Node.js 18+
- **框架**: Express.js 4.x
- **数据库**: SQLite (开发) / MySQL (生产)
- **缓存**: Redis
- **ORM**: Sequelize / Prisma
- **认证**: JWT + Passport.js
- **文件上传**: Multer
- **日志**: Winston
- **测试**: Jest + Supertest

#### 项目结构
```
backend/src/
├── controllers/         # 控制器层
│   ├── auth.controller.js
│   ├── fund.controller.js
│   ├── portfolio.controller.js
│   ├── ocr.controller.js
│   └── ai.controller.js
├── services/           # 业务逻辑层
│   ├── auth.service.js
│   ├── fund.service.js
│   ├── portfolio.service.js
│   ├── ocr.service.js
│   ├── ai.service.js
│   └── notification.service.js
├── models/            # 数据模型层
│   ├── User.js
│   ├── Fund.js
│   ├── Portfolio.js
│   └── AIAnalysis.js
├── routes/            # 路由定义
│   ├── auth.routes.js
│   ├── fund.routes.js
│   ├── portfolio.routes.js
│   ├── ocr.routes.js
│   └── ai.routes.js
├── middleware/        # 中间件
│   ├── auth.middleware.js
│   ├── validation.middleware.js
│   ├── rateLimit.middleware.js
│   ├── error.middleware.js
│   └── logging.middleware.js
├── utils/             # 工具函数
│   ├── database.js
│   ├── redis.js
│   ├── logger.js
│   ├── validator.js
│   └── helpers.js
├── config/            # 配置文件
│   ├── database.js
│   ├── redis.js
│   ├── jwt.js
│   └── ai.js
└── app.js             # 应用入口
```

#### 服务分层设计

##### 控制器层 (Controller Layer)
```javascript
// controllers/portfolio.controller.js
class PortfolioController {
  constructor(portfolioService) {
    this.portfolioService = portfolioService
  }

  async getPortfolios(req, res, next) {
    try {
      const userId = req.user.id
      const result = await this.portfolioService.getUserPortfolios(userId)

      sendSuccess(res, result, '获取持仓列表成功')
    } catch (error) {
      next(error)
    }
  }

  async addPortfolio(req, res, next) {
    try {
      const userId = req.user.id
      const portfolioData = { ...req.body, userId }

      const result = await this.portfolioService.addPortfolio(portfolioData)

      sendSuccess(res, result, '添加持仓成功', 201)
    } catch (error) {
      next(error)
    }
  }
}
```

##### 服务层 (Service Layer)
```javascript
// services/portfolio.service.js
class PortfolioService {
  constructor(portfolioModel, fundModel, cacheService) {
    this.portfolioModel = portfolioModel
    this.fundModel = fundModel
    this.cacheService = cacheService
  }

  async getUserPortfolios(userId) {
    // 尝试从缓存获取
    const cacheKey = `portfolios:${userId}`
    const cached = await this.cacheService.get(cacheKey)

    if (cached) {
      return cached
    }

    // 从数据库查询
    const portfolios = await this.portfolioModel.findByUserId(userId, {
      include: [this.fundModel]
    })

    // 计算实时价值
    const portfolioWithValues = await this.calculatePortfolioValues(portfolios)

    // 缓存结果
    await this.cacheService.set(cacheKey, portfolioWithValues, 300) // 5分钟

    return portfolioWithValues
  }

  async addPortfolio(portfolioData) {
    // 验证基金是否存在
    const fund = await this.fundModel.findByCode(portfolioData.fundCode)
    if (!fund) {
      throw new AppError('基金不存在', 404)
    }

    // 检查是否已存在
    const existing = await this.portfolioModel.findByUserAndFund(
      portfolioData.userId,
      portfolioData.fundCode
    )

    if (existing) {
      throw new AppError('该基金已在持仓中', 409)
    }

    // 创建持仓记录
    const portfolio = await this.portfolioModel.create(portfolioData)

    // 清除相关缓存
    await this.cacheService.delete(`portfolios:${portfolioData.userId}`)

    return portfolio
  }
}
```

##### 主题化服务层 (Theme Service Layer)
```javascript
// services/theme.service.js
class ThemeService {
  constructor(userModel, themeConfigModel, cacheService) {
    this.userModel = userModel
    this.themeConfigModel = themeConfigModel
    this.cacheService = cacheService
    this.themeAnalyzers = {
      fire: new FireThemeAnalyzer(),
      global: new GlobalThemeAnalyzer(),
      inflation: new InflationThemeAnalyzer()
    }
  }

  // 获取用户当前主题
  async getUserTheme(userId) {
    const cacheKey = `user_theme:${userId}`
    const cached = await this.cacheService.get(cacheKey)

    if (cached) {
      return cached
    }

    const user = await this.userModel.findById(userId)
    const theme = user.currentTheme || 'fire'

    await this.cacheService.set(cacheKey, theme, 3600)
    return theme
  }

  // 切换用户主题
  async switchUserTheme(userId, newTheme) {
    // 验证主题有效性
    if (!this.themeAnalyzers[newTheme]) {
      throw new AppError('无效的主题', 400)
    }

    // 更新数据库
    await this.userModel.updateTheme(userId, newTheme)

    // 清除相关缓存
    await this.cacheService.delete(`user_theme:${userId}`)
    await this.cacheService.delete(`theme_metrics:${userId}`)

    // 记录切换行为
    await this.logThemeSwitch(userId, newTheme)

    return { success: true, theme: newTheme }
  }

  // 获取主题配置
  async getThemeConfig(theme) {
    const cacheKey = `theme_config:${theme}`
    const cached = await this.cacheService.get(cacheKey)

    if (cached) {
      return cached
    }

    const config = await this.themeConfigModel.findByTheme(theme)

    await this.cacheService.set(cacheKey, config, 86400) // 24小时缓存
    return config
  }

  // 获取主题化指标
  async getThemeBasedMetrics(userId, portfolios) {
    const theme = await this.getUserTheme(userId)
    const analyzer = this.themeAnalyzers[theme]

    if (!analyzer) {
      throw new AppError('主题分析器不存在', 500)
    }

    return await analyzer.analyze(portfolios)
  }

  // 记录主题切换日志
  async logThemeSwitch(userId, newTheme) {
    const logData = {
      userId,
      action: 'theme_switch',
      fromTheme: await this.getUserTheme(userId),
      toTheme: newTheme,
      timestamp: new Date(),
      userAgent: null // 可以从请求中获取
    }

    // 写入操作日志表
    await this.operationLogModel.create(logData)
  }
}

// 主题分析器基类
class BaseThemeAnalyzer {
  async analyze(portfolios) {
    throw new Error('子类必须实现analyze方法')
  }

  // 通用指标计算
  calculateBasicMetrics(portfolios) {
    const totalValue = portfolios.reduce((sum, p) => sum + p.currentValue, 0)
    const totalCost = portfolios.reduce((sum, p) => sum + p.costAmount, 0)
    const totalProfit = totalValue - totalCost
    const returnRate = totalCost > 0 ? (totalProfit / totalCost * 100) : 0

    return {
      totalValue,
      totalCost,
      totalProfit,
      returnRate
    }
  }
}

// FIRE主题分析器
class FireThemeAnalyzer extends BaseThemeAnalyzer {
  async analyze(portfolios) {
    const basicMetrics = this.calculateBasicMetrics(portfolios)

    // FIRE特定指标
    const fireMetrics = {
      // 退休目标进度
      retirementProgress: this.calculateRetirementProgress(portfolios),
      // 被动收入覆盖率
      passiveIncomeCoverage: this.calculatePassiveIncome(portfolios),
      // 4%法则验证
      fourPercentRule: this.validateFourPercentRule(portfolios),
      // 建议配置
      recommendedAllocation: this.getRecommendedAllocation(portfolios)
    }

    return {
      ...basicMetrics,
      themeSpecific: fireMetrics,
      theme: 'fire',
      themeName: '提前退休'
    }
  }

  calculateRetirementProgress(portfolios) {
    // 实现退休进度计算逻辑
    // 这里需要结合用户设定的退休目标和当前资产
    return {
      targetAmount: 5000000, // 示例目标
      currentAmount: portfolios.reduce((sum, p) => sum + p.currentValue, 0),
      progress: 0.25,
      estimatedTime: '8年6个月'
    }
  }

  calculatePassiveIncome(portfolios) {
    // 计算年化被动收入（基于分红和利息）
    const annualPassiveIncome = portfolios.reduce((sum, p) => {
      return sum + (p.currentValue * 0.03) // 假设3%年化收益
    }, 0)

    return {
      annualIncome: annualPassiveIncome,
      monthlyIncome: annualPassiveIncome / 12,
      coverageRate: 0.32 // 覆盖率32%
    }
  }

  validateFourPercentRule(portfolios) {
    const totalValue = portfolios.reduce((sum, p) => sum + p.currentValue, 0)
    const annualWithdrawal = totalValue * 0.04

    return {
      annualWithdrawal,
      monthlyWithdrawal: annualWithdrawal / 12,
      sustainability: '96%', // 基于历史数据
      recommendation: '建议提取比例在3.5-4%之间'
    }
  }

  getRecommendedAllocation(portfolios) {
    return {
      stocks: 60,
      bonds: 20,
      reits: 15,
      cash: 5
    }
  }
}

// 全球化主题分析器
class GlobalThemeAnalyzer extends BaseThemeAnalyzer {
  async analyze(portfolios) {
    const basicMetrics = this.calculateBasicMetrics(portfolios)

    const globalMetrics = {
      // 全球资产配置分析
      globalAllocation: this.analyzeGlobalAllocation(portfolios),
      // 汇率风险分析
      currencyRisk: this.analyzeCurrencyRisk(portfolios),
      // QDII使用情况
      qdiiUsage: this.analyzeQdiiUsage(portfolios),
      // 全球市场对比
      globalComparison: this.getGlobalMarketComparison(portfolios)
    }

    return {
      ...basicMetrics,
      themeSpecific: globalMetrics,
      theme: 'global',
      themeName: '这还是国内吗'
    }
  }

  analyzeGlobalAllocation(portfolios) {
    // 分析全球资产配置比例
    const domesticValue = portfolios
      .filter(p => p.fundType === '国内基金')
      .reduce((sum, p) => sum + p.currentValue, 0)

    const globalValue = portfolios
      .filter(p => p.fundType === 'QDII' || p.fundType === '海外基金')
      .reduce((sum, p) => sum + p.currentValue, 0)

    const total = domesticValue + globalValue

    return {
      domestic: {
        value: domesticValue,
        percentage: total > 0 ? (domesticValue / total * 100) : 0
      },
      global: {
        value: globalValue,
        percentage: total > 0 ? (globalValue / total * 100) : 0
      },
      recommendation: '建议全球配置比例在20-40%之间'
    }
  }

  analyzeCurrencyRisk(portfolios) {
    // 分析汇率风险敞口
    const usdExposure = portfolios
      .filter(p => p.currency === 'USD')
      .reduce((sum, p) => sum + p.currentValue, 0)

    return {
      usdExposure,
      currencyRisk: '中等',
      hedgingSuggestions: [
        '考虑购买外汇看跌期权',
        '适当配置人民币资产对冲'
      ]
    }
  }

  analyzeQdiiUsage(portfolios) {
    // QDII额度使用分析
    const qdiiFunds = portfolios.filter(p => p.fundType === 'QDII')

    return {
      qdiiCount: qdiiFunds.length,
      qdiiValue: qdiiFunds.reduce((sum, p) => sum + p.currentValue, 0),
      quotaUsage: '45%', // 假设使用率
      availableQuota: '55%'
    }
  }

  getGlobalMarketComparison(portfolios) {
    return {
      aShareReturn: 12.5,
      usReturn: 15.2,
      hkReturn: -5.3,
      euReturn: 8.7,
      jpReturn: 10.1,
      currencyAdjusted: true
    }
  }
}

// 通胀主题分析器
class InflationThemeAnalyzer extends BaseThemeAnalyzer {
  async analyze(portfolios) {
    const basicMetrics = this.calculateBasicMetrics(portfolios)

    const inflationMetrics = {
      // 实际收益率计算
      realReturns: this.calculateRealReturns(portfolios),
      // 抗通胀资产分析
      inflationHedging: this.analyzeInflationHedging(portfolios),
      // 购买力保护
      purchasingPowerProtection: this.analyzePurchasingPower(portfolios)
    }

    return {
      ...basicMetrics,
      themeSpecific: inflationMetrics,
      theme: 'inflation',
      themeName: '跑赢通涨'
    }
  }

  calculateRealReturns(portfolios) {
    const currentCpi = 2.1 // 当前CPI
    const nominalReturn = portfolios.reduce((sum, p) => sum + p.currentValue, 0) /
                          portfolios.reduce((sum, p) => sum + p.costAmount, 0) - 1

    const realReturn = (1 + nominalReturn) / (1 + currentCpi / 100) - 1

    return {
      nominalReturn: nominalReturn * 100,
      cpiRate: currentCpi,
      realReturn: realReturn * 100,
      beatsInflation: realReturn > 0
    }
  }

  analyzeInflationHedging(portfolios) {
    // 分析抗通胀资产配置
    const inflationHedgingAssets = [
      'REITs基金', '黄金ETF', '大宗商品基金', '通胀保值债券'
    ]

    const hedgingValue = portfolios
      .filter(p => inflationHedgingAssets.some(asset => p.name.includes(asset)))
      .reduce((sum, p) => sum + p.currentValue, 0)

    const totalValue = portfolios.reduce((sum, p) => sum + p.currentValue, 0)

    return {
      hedgingValue,
      hedgingRatio: totalValue > 0 ? (hedgingValue / totalValue * 100) : 0,
      recommendedRatio: 15,
      status: hedgingRatio >= 15 ? '充足' : '不足'
    }
  }

  analyzePurchasingPower(portfolios) {
    const totalValue = portfolios.reduce((sum, p) => sum + p.currentValue, 0)
    const cpiHistory = [2.1, 2.3, 2.5, 2.8, 3.1] // 近5年CPI

    // 计算5年后的购买力
    let futureValue = totalValue
    for (const cpi of cpiHistory) {
      futureValue = futureValue * (1 + cpi / 100)
    }

    return {
      currentValue: totalValue,
      fiveYearPurchasingPower: futureValue,
      lossRate: ((futureValue - totalValue) / totalValue * 100).toFixed(2) + '%',
      protectionStrategies: [
        '增加抗通胀资产配置',
        '考虑实物资产投资',
        '提高投资收益率至5%以上'
      ]
    }
  }
}
```

### 3. 数据访问层 (Data Access Layer)

#### 数据库设计原则
- **规范化设计**: 遵循第三范式，减少数据冗余
- **性能优化**: 合理设置索引，优化查询性能
- **扩展性**: 预留扩展字段，支持功能迭代
- **数据安全**: 敏感数据加密存储

#### 数据库连接管理
```javascript
// utils/database.js
const { Sequelize } = require('sequelize')

class DatabaseManager {
  constructor() {
    this.connection = null
    this.models = {}
  }

  async connect(config) {
    if (this.connection) {
      return this.connection
    }

    this.connection = new Sequelize({
      dialect: config.dialect,
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.username,
      password: config.password,
      logging: config.logging || false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    })

    await this.connection.authenticate()
    await this.initModels()

    return this.connection
  }

  async initModels() {
    // 导入模型
    const User = require('../models/User')
    const Fund = require('../models/Fund')
    const Portfolio = require('../models/Portfolio')
    const AIAnalysis = require('../models/AIAnalysis')

    // 定义模型关联
    User.hasMany(Portfolio, { foreignKey: 'userId' })
    Portfolio.belongsTo(User, { foreignKey: 'userId' })

    Fund.hasMany(Portfolio, { foreignKey: 'fundCode' })
    Portfolio.belongsTo(Fund, { foreignKey: 'fundCode' })

    User.hasMany(AIAnalysis, { foreignKey: 'userId' })
    AIAnalysis.belongsTo(User, { foreignKey: 'userId' })

    this.models = {
      User,
      Fund,
      Portfolio,
      AIAnalysis
    }

    // 同步数据库结构
    if (process.env.NODE_ENV === 'development') {
      await this.connection.sync({ alter: true })
    }
  }

  getModel(name) {
    return this.models[name]
  }

  getConnection() {
    return this.connection
  }
}

module.exports = new DatabaseManager()
```

### 4. 缓存架构设计

#### 多级缓存策略
```javascript
// services/cache.service.js
class CacheService {
  constructor(redisClient) {
    this.redis = redisClient
    this.memoryCache = new Map()
    this.stats = {
      hits: 0,
      misses: 0
    }
  }

  async get(key) {
    // 1. 检查内存缓存
    if (this.memoryCache.has(key)) {
      this.stats.hits++
      return this.memoryCache.get(key)
    }

    // 2. 检查Redis缓存
    const value = await this.redis.get(key)
    if (value) {
      this.stats.hits++
      const parsed = JSON.parse(value)

      // 回写到内存缓存
      this.memoryCache.set(key, parsed)

      return parsed
    }

    this.stats.misses++
    return null
  }

  async set(key, value, ttl = 3600) {
    const serialized = JSON.stringify(value)

    // 设置内存缓存
    this.memoryCache.set(key, value)

    // 设置Redis缓存
    await this.redis.setex(key, ttl, serialized)
  }

  async delete(key) {
    // 删除内存缓存
    this.memoryCache.delete(key)

    // 删除Redis缓存
    await this.redis.del(key)
  }

  // 缓存预热
  async warmup(preloadData) {
    for (const [key, value] of Object.entries(preloadData)) {
      await this.set(key, value, 86400) // 24小时
    }
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses
    return {
      ...this.stats,
      hitRate: total > 0 ? (this.stats.hits / total * 100).toFixed(2) + '%' : '0%'
    }
  }
}
```

### 5. 外部服务集成架构

#### AI服务集成
```javascript
// services/ai.service.js
class AIModelManager {
  constructor() {
    this.models = {
      deepseek: new DeepSeekModel(),
      qwen: new QwenModel()
    }
    this.usageMonitor = new UsageMonitor()
    this.circuitBreaker = new CircuitBreaker()
  }

  async analyze(data, options = {}) {
    const modelName = options.model || 'deepseek'
    const model = this.models[modelName]

    // 检查熔断器状态
    if (this.circuitBreaker.isOpen(modelName)) {
      throw new Error(`AI模型 ${modelName} 当前不可用`)
    }

    try {
      // 检查使用限制
      await this.usageMonitor.checkUsage(modelName)

      // 构建请求
      const prompt = this.buildPrompt(data, options.type)

      // 调用AI模型
      const result = await model.chat(prompt, {
        maxTokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.7
      })

      // 记录使用情况
      await this.usageMonitor.recordUsage(modelName, result.tokens)

      // 重置熔断器
      this.circuitBreaker.recordSuccess(modelName)

      return {
        content: result.content,
        model: modelName,
        tokens: result.tokens,
        usage: result.usage
      }

    } catch (error) {
      // 记录失败
      this.circuitBreaker.recordFailure(modelName)

      // 尝试降级到备用模型
      if (modelName !== 'qwen') {
        return this.analyze(data, { ...options, model: 'qwen' })
      }

      throw error
    }
  }

  buildPrompt(data, type) {
    const templates = {
      riskAnalysis: this.getRiskAnalysisTemplate(),
      portfolioOptimization: this.getPortfolioOptimizationTemplate(),
      marketInsight: this.getMarketInsightTemplate()
    }

    return templates[type] || templates.riskAnalysis
      .replace('{data}', JSON.stringify(data))
  }
}

// 熔断器实现
class CircuitBreaker {
  constructor() {
    this.states = {
      deepseek: { failures: 0, lastFailure: null, state: 'CLOSED' },
      qwen: { failures: 0, lastFailure: null, state: 'CLOSED' }
    }
    this.threshold = 5 // 失败阈值
    this.timeout = 60000 // 熔断时间
  }

  isOpen(modelName) {
    const state = this.states[modelName]

    if (state.state === 'OPEN') {
      // 检查是否可以进入半开状态
      if (Date.now() - state.lastFailure > this.timeout) {
        state.state = 'HALF_OPEN'
        return false
      }
      return true
    }

    return false
  }

  recordSuccess(modelName) {
    const state = this.states[modelName]
    state.failures = 0
    state.state = 'CLOSED'
  }

  recordFailure(modelName) {
    const state = this.states[modelName]
    state.failures++
    state.lastFailure = Date.now()

    if (state.failures >= this.threshold) {
      state.state = 'OPEN'
    }
  }
}
```

## 部署架构

### 云原生部署方案

#### 1. 开发环境 (Local)
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DB_HOST=database
      - REDIS_HOST=redis
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - database
      - redis

  database:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_DATABASE=jntm_dev
    ports:
      - "3306:3306"
    volumes:
      - mysql_dev_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mysql_dev_data:
```

#### 2. 测试环境 (Kubernetes)
```yaml
# k8s/test/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jntm-api
  labels:
    app: jntm-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: jntm-api
  template:
    metadata:
      labels:
        app: jntm-api
    spec:
      containers:
      - name: api
        image: jntm/api:test
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "test"
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: host
        - name: REDIS_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: redis-host
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### 3. 生产环境 (云函数)
```javascript
// serverless.yml
service: jntm-api

provider:
  name: tencent
  runtime: Nodejs18.15
  region: ap-beijing

  # 环境变量
  environment:
    NODE_ENV: production
    DB_HOST: ${file(./config.production.json):DB_HOST}
    REDIS_HOST: ${file(./config.production.json):REDIS_HOST}

  # VPC 配置
  vpcConfig:
    vpcId: ${file(./config.production.json):VPC_ID}
    subnetIds:
      - ${file(./config.production.json):SUBNET_ID}

functions:
  api:
    handler: index.main
    memorySize: 512
    timeout: 30
    events:
      - apigw:
          path: /
          method: ANY
          cors: true
      - apigw:
          path: /{proxy+}
          method: ANY
          cors: true

    # 环境变量
    environment:
      FUNCTION_NAME: api

    # 定时任务
    events:
      - timer:
          name: daily-backup
          cron: "0 0 2 * * *"
          input:
            action: backup

# 插件配置
plugins:
  - serverless-webpack
  - serverless-offline

custom:
  webpack:
    webpackConfig: 'webpack.config.js'
    includeModules: true

  serverless-offline:
    httpPort: 3000
    websocketPort: 3001
```

## 安全架构设计

### 1. 认证授权
```javascript
// middleware/auth.middleware.js
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')

class AuthMiddleware {
  constructor() {
    this.jwtMiddleware = this.jwtAuth.bind(this)
    this.rateLimiters = {
      auth: rateLimit({
        windowMs: 15 * 60 * 1000, // 15分钟
        max: 5, // 最多5次登录尝试
        skipSuccessfulRequests: true
      }),
      api: rateLimit({
        windowMs: 1 * 60 * 1000, // 1分钟
        max: 100 // 最多100次API调用
      }),
      ocr: rateLimit({
        windowMs: 1 * 60 * 1000, // 1分钟
        max: 10 // 最多10次OCR调用
      }),
      ai: rateLimit({
        windowMs: 1 * 60 * 1000, // 1分钟
        max: 5 // 最多5次AI调用
      })
    }
  }

  jwtAuth(req, res, next) {
    const token = this.extractToken(req)

    if (!token) {
      return sendError(res, new AppError('未提供认证令牌', 401))
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = decoded
      next()
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return sendError(res, new AppError('令牌已过期', 401))
      }
      return sendError(res, new AppError('令牌无效', 401))
    }
  }

  extractToken(req) {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7)
    }
    return null
  }

  // RBAC 权限控制
  requireRole(...roles) {
    return (req, res, next) => {
      if (!req.user) {
        return sendError(res, new AppError('未认证用户', 401))
      }

      if (roles.length && !roles.includes(req.user.role)) {
        return sendError(res, new AppError('权限不足', 403))
      }

      next()
    }
  }
}
```

### 2. 数据保护
```javascript
// utils/security.js
const crypto = require('crypto')
const bcrypt = require('bcrypt')

class SecurityUtils {
  constructor() {
    this.algorithm = 'aes-256-gcm'
    this.secretKey = process.env.ENCRYPTION_KEY
    this.saltRounds = 12
  }

  // 密码加密
  async hashPassword(password) {
    return await bcrypt.hash(password, this.saltRounds)
  }

  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash)
  }

  // 敏感数据加密
  encrypt(text) {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(this.algorithm, this.secretKey)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    }
  }

  decrypt(encryptedData) {
    const decipher = crypto.createDecipher(this.algorithm, this.secretKey)
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'))

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  // SQL 注入防护
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input
    }

    return input
      .replace(/['"\\;]/g, '')
      .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/gi, '')
      .trim()
  }

  // XSS 防护
  sanitizeHtml(html) {
    const cheerio = require('cheerio')
    const $ = cheerio.load(html)

    // 移除所有script标签和危险属性
    $('script').remove()
    $('[onload]').removeAttr('onload')
    $('[onclick]').removeAttr('onclick')

    return $.html()
  }
}
```

## 性能优化策略

### 1. 数据库优化
```sql
-- 创建复合索引优化查询
CREATE INDEX idx_user_portfolio_active ON user_portfolios(user_id, is_active);
CREATE INDEX idx_fund_code_nav ON funds(fund_code, nav_date);

-- 分区表优化大数据量查询
CREATE TABLE fund_nav_history (
    id BIGINT AUTO_INCREMENT,
    fund_code VARCHAR(10),
    nav DECIMAL(10,4),
    nav_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, nav_date),
    INDEX idx_fund_date (fund_code, nav_date)
) PARTITION BY RANGE (YEAR(nav_date)) (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026)
);
```

### 2. API 性能优化
```javascript
// middleware/performance.middleware.js
const compression = require('compression')
const helmet = require('helmet')

class PerformanceMiddleware {
  static setup(app) {
    // 启用 gzip 压缩
    app.use(compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false
        }
        return compression.filter(req, res)
      },
      threshold: 1024
    }))

    // 安全头
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"]
        }
      }
    }))

    // 缓存控制
    app.use((req, res, next) => {
      if (req.path.startsWith('/api/')) {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      } else {
        res.set('Cache-Control', 'public, max-age=3600')
      }
      next()
    })
  }

  // 响应时间监控
  static responseTime() {
    return (req, res, next) => {
      const start = Date.now()

      res.on('finish', () => {
        const duration = Date.now() - start
        console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`)

        // 记录慢查询
        if (duration > 1000) {
          console.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`)
        }
      })

      next()
    }
  }
}
```

这个系统架构设计文档提供了完整的技术架构蓝图，包含了前端、后端、数据库、缓存、安全等各个层面的设计方案。