import { getDB } from '../config/database.js'

/**
 * 主题化系统基类
 */
class BaseThemeAnalyzer {
  constructor(themeConfig) {
    this.themeConfig = themeConfig
    this.config = JSON.parse(themeConfig.config_json || '{}')
  }

  /**
   * 计算基础指标
   */
  calculateBasicMetrics(portfolios) {
    if (!portfolios || portfolios.length === 0) {
      return {
        totalValue: 0,
        totalCost: 0,
        totalProfit: 0,
        totalProfitRate: 0,
        fundCount: 0
      }
    }

    const totalValue = portfolios.reduce((sum, fund) => sum + (fund.shares * fund.nav || 0), 0)
    const totalCost = portfolios.reduce((sum, fund) => sum + (fund.shares * fund.cost_price), 0)
    const totalProfit = totalValue - totalCost
    const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

    return {
      totalValue,
      totalCost,
      totalProfit,
      totalProfitRate,
      fundCount: portfolios.length
    }
  }

  /**
   * 抽象方法：主题特定分析
   */
  async analyze(portfolios, userPreferences = {}) {
    throw new Error('子类必须实现 analyze 方法')
  }
}

/**
 * FIRE主题分析器
 */
class FireThemeAnalyzer extends BaseThemeAnalyzer {
  async analyze(portfolios, userPreferences = {}) {
    const basicMetrics = this.calculateBasicMetrics(portfolios)

    // FIRE特定计算
    const annualWithdrawalRate = userPreferences.withdrawalRate || 0.04 // 默认4%法则
    const currentAnnualExpenses = userPreferences.annualExpenses || 120000 // 默认12万/年
    const fireNumber = currentAnnualExpenses / annualWithdrawalRate // FIRE目标金额

    // 计算被动收入
    const annualPassiveIncome = basicMetrics.totalValue * annualWithdrawalRate

    // 计算退休准备度
    const retirementReadiness = basicMetrics.totalValue > 0
      ? (basicMetrics.totalValue / fireNumber) * 100
      : 0

    // 计算距离退休年限
    const monthlySavingsRate = userPreferences.monthlySavings || 5000
    const assumedReturn = userPreferences.assumedReturn || 0.07 // 7%年化收益
    const yearsToRetirement = this.calculateYearsToRetirement(
      basicMetrics.totalValue,
      monthlySavingsRate,
      fireNumber,
      assumedReturn
    )

    return {
      ...basicMetrics,
      theme: 'fire',
      metrics: {
        fireNumber,
        annualPassiveIncome,
        retirementReadiness,
        yearsToRetirement,
        withdrawalRate: annualWithdrawalRate,
        annualExpenses: currentAnnualExpenses,
        monthlySavings: monthlySavingsRate,
        assumedReturn
      },
      insights: this.generateFireInsights({
        fireNumber,
        annualPassiveIncome,
        retirementReadiness,
        yearsToRetirement
      })
    }
  }

  /**
   * 计算距离退休的年限
   */
  calculateYearsToRetirement(currentSavings, monthlySavings, target, annualReturn) {
    if (currentSavings >= target) return 0

    const monthlyReturn = annualReturn / 12
    let months = 0
    let value = currentSavings

    while (value < target && months < 600) { // 最多计算50年
      value = value * (1 + monthlyReturn) + monthlySavings
      months++
    }

    return Math.ceil(months / 12)
  }

  /**
   * 生成FIRE主题洞察
   */
  generateFireInsights(metrics) {
    const insights = []

    if (metrics.retirementReadiness >= 100) {
      insights.push('🎉 恭喜！您已经可以提前退休了！')
    } else if (metrics.retirementReadiness >= 75) {
      insights.push('🔥 您的退休准备已经很充分，继续加油！')
    } else if (metrics.retirementReadiness >= 50) {
      insights.push('💪 您已经走了一半的路，保持当前的储蓄节奏')
    } else {
      insights.push('🚀 退休之路才刚刚开始，制定清晰的储蓄计划很重要')
    }

    if (metrics.yearsToRetirement <= 5) {
      insights.push(`⏰ 距离退休约${metrics.yearsToRetirement}年，可以考虑降低风险`)
    } else if (metrics.yearsToRetirement <= 15) {
      insights.push(`⏳ 距离退休约${metrics.yearsToRetirement}年，建议平衡成长和稳健`)
    } else {
      insights.push(`🌱 还有${metrics.yearsToRetirement}年退休，可以承担更多风险追求高收益`)
    }

    return insights
  }
}

/**
 * 全球配置主题分析器
 */
class GlobalThemeAnalyzer extends BaseThemeAnalyzer {
  async analyze(portfolios, userPreferences = {}) {
    const basicMetrics = this.calculateBasicMetrics(portfolios)

    // 全球配置特定计算
    const allocation = this.calculateGlobalAllocation(portfolios)
    const currencyRisk = this.calculateCurrencyRisk(allocation)
    const diversificationScore = this.calculateDiversificationScore(allocation)

    return {
      ...basicMetrics,
      theme: 'global',
      metrics: {
        allocation,
        currencyRisk,
        diversificationScore,
        qdiiRatio: this.calculateQdiiRatio(portfolios),
        domesticRatio: this.calculateDomesticRatio(portfolios),
        emergingMarketsExposure: allocation.emergingMarkets + allocation.china,
        developedMarketsExposure: allocation.us + allocation.europe + allocation.japan
      },
      insights: this.generateGlobalInsights({
        allocation,
        diversificationScore,
        currencyRisk
      })
    }
  }

  /**
   * 计算全球资产配置
   */
  calculateGlobalAllocation(portfolios) {
    const total = portfolios.reduce((sum, fund) => sum + (fund.shares * fund.nav || 0), 0)
    if (total === 0) return { us: 0, europe: 0, japan: 0, china: 0, emergingMarkets: 0, others: 0 }

    // 简化的地区分类（基于基金类型和名称）
    let us = 0, europe = 0, japan = 0, china = 0, emergingMarkets = 0, others = 0

    portfolios.forEach(fund => {
      const value = fund.shares * (fund.nav || fund.cost_price)
      const name = fund.fund_name?.toLowerCase() || ''
      const type = fund.fund_type?.toLowerCase() || ''

      if (name.includes('美股') || name.includes('美国') || name.includes('nasdaq') || name.includes('s&p')) {
        us += value
      } else if (name.includes('欧洲') || name.includes('德国') || name.includes('英国')) {
        europe += value
      } else if (name.includes('日本') || name.includes('日经')) {
        japan += value
      } else if (name.includes('qdii') || type.includes('qdii')) {
        // QDII基金按名称进一步细分
        if (name.includes('美国') || name.includes('美股')) us += value
        else if (name.includes('欧洲')) europe += value
        else if (name.includes('日本')) japan += value
        else if (name.includes('新兴') || name.includes('印度') || name.includes('越南')) {
          emergingMarkets += value
        } else {
          others += value
        }
      } else {
        // 默认归类为国内
        china += value
      }
    })

    return {
      us: (us / total) * 100,
      europe: (europe / total) * 100,
      japan: (japan / total) * 100,
      china: (china / total) * 100,
      emergingMarkets: (emergingMarkets / total) * 100,
      others: (others / total) * 100
    }
  }

  /**
   * 计算汇率风险
   */
  calculateCurrencyRisk(allocation) {
    const foreignExposure = allocation.us + allocation.europe + allocation.japan + allocation.emergingMarkets + allocation.others
    return {
      foreignExposure,
      domesticExposure: allocation.china,
      riskLevel: foreignExposure > 50 ? 'high' : foreignExposure > 20 ? 'medium' : 'low'
    }
  }

  /**
   * 计算多元化评分
   */
  calculateDiversificationScore(allocation) {
    const allocations = Object.values(allocation).filter(val => val > 0)
    if (allocations.length === 0) return 0

    // 使用赫芬达尔指数计算集中度
    const total = allocations.reduce((sum, val) => sum + val, 0)
    const herfindahl = allocations.reduce((sum, val) => {
      const share = val / total
      return sum + share * share
    }, 0)

    // 多元化评分 = (1 - 赫芬达尔指数) * 100
    return Math.round((1 - herfindahl) * 100)
  }

  calculateQdiiRatio(portfolios) {
    const qdiiFunds = portfolios.filter(fund =>
      fund.fund_name?.toLowerCase().includes('qdii') ||
      fund.fund_type?.toLowerCase().includes('qdii')
    )

    const total = portfolios.reduce((sum, fund) => sum + (fund.shares * fund.nav || 0), 0)
    const qdiiTotal = qdiiFunds.reduce((sum, fund) => sum + (fund.shares * fund.nav || 0), 0)

    return total > 0 ? (qdiiTotal / total) * 100 : 0
  }

  calculateDomesticRatio(portfolios) {
    const total = portfolios.reduce((sum, fund) => sum + (fund.shares * fund.nav || 0), 0)
    const qdiiRatio = this.calculateQdiiRatio(portfolios)
    return 100 - qdiiRatio
  }

  /**
   * 生成全球配置主题洞察
   */
  generateGlobalInsights(metrics) {
    const insights = []

    if (metrics.diversificationScore >= 70) {
      insights.push('🌍 您的投资组合非常多元化，很好地分散了地域风险')
    } else if (metrics.diversificationScore >= 40) {
      insights.push('🌏 您的投资组合有一定多元化，可以考虑增加更多市场')
    } else {
      insights.push('🏠 投资组合集中度较高，建议增加全球配置')
    }

    if (metrics.currencyRisk.riskLevel === 'high') {
      insights.push('💱 海外资产占比较高，需要关注汇率波动风险')
    } else if (metrics.currencyRisk.riskLevel === 'low') {
      insights.push('🇨🇳 以人民币资产为主，汇率风险较低')
    }

    if (metrics.qdiiRatio > 50) {
      insights.push('🎯 QDII基金配置积极，把握全球投资机会')
    } else if (metrics.qdiiRatio < 10) {
      insights.push('🔍 QDII配置较低，可以考虑适度增加海外投资')
    }

    return insights
  }
}

/**
 * 通胀保值主题分析器
 */
class InflationThemeAnalyzer extends BaseThemeAnalyzer {
  async analyze(portfolios, userPreferences = {}) {
    const basicMetrics = this.calculateBasicMetrics(portfolios)

    // 通胀保值特定计算
    const currentInflationRate = 0.032 // 假设当前通胀率3.2%
    const realReturn = this.calculateRealReturn(basicMetrics, currentInflationRate)
    const inflationBeatingRate = this.calculateInflationBeatingRate(portfolios, currentInflationRate)
    const purchasingPower = this.calculatePurchasingPower(basicMetrics.totalValue, currentInflationRate)

    return {
      ...basicMetrics,
      theme: 'inflation',
      metrics: {
        currentInflationRate,
        realReturn,
        inflationBeatingRate,
        purchasingPower,
        inflationProtection: this.calculateInflationProtection(portfolios),
        realAnnualReturn: realReturn.annual,
        realTotalReturn: realReturn.total
      },
      insights: this.generateInflationInsights({
        realReturn,
        inflationBeatingRate,
        purchasingPower
      })
    }
  }

  /**
   * 计算实际收益率
   */
  calculateRealReturn(basicMetrics, inflationRate) {
    const nominalReturnRate = basicMetrics.totalCost > 0
      ? basicMetrics.totalProfit / basicMetrics.totalCost
      : 0

    // 费雪方程式: (1 + 实际利率) = (1 + 名义利率) / (1 + 通胀率)
    const realReturnRate = (1 + nominalReturnRate) / (1 + inflationRate) - 1

    return {
      annual: realReturnRate * 100, // 年化实际收益率
      total: (Math.pow(1 + realReturnRate, 1) - 1) * 100 // 总实际收益率
    }
  }

  /**
   * 计算跑赢通胀的比例
   */
  calculateInflationBeatingRate(portfolios, inflationRate) {
    const beatingFunds = portfolios.filter(fund => {
      const fundReturn = ((fund.nav || fund.cost_price) - fund.cost_price) / fund.cost_price
      return fundReturn > inflationRate
    })

    return portfolios.length > 0 ? (beatingFunds.length / portfolios.length) * 100 : 0
  }

  /**
   * 计算购买力变化
   */
  calculatePurchasingPower(currentValue, inflationRate) {
    // 计算在不同时间点的购买力
    const oneYearAgo = currentValue / Math.pow(1 + inflationRate, 1)
    const threeYearsAgo = currentValue / Math.pow(1 + inflationRate, 3)
    const fiveYearsAgo = currentValue / Math.pow(1 + inflationRate, 5)

    return {
      currentValue,
      oneYearLoss: currentValue - oneYearAgo,
      threeYearLoss: currentValue - threeYearsAgo,
      fiveYearLoss: currentValue - fiveYearsAgo,
      annualInflationLoss: currentValue * inflationRate
    }
  }

  /**
   * 计算通胀保护能力
   */
  calculateInflationProtection(portfolios) {
    let protectionScore = 0
    let totalValue = 0

    portfolios.forEach(fund => {
      const value = fund.shares * (fund.nav || fund.cost_price)
      totalValue += value

      // 根据基金类型给不同的保护评分
      const name = fund.fund_name?.toLowerCase() || ''
      const type = fund.fund_type?.toLowerCase() || ''

      if (name.includes('通胀') || name.includes('物价')) {
        protectionScore += value * 1.0 // 直接通胀主题基金
      } else if (name.includes('商品') || name.includes('黄金') || name.includes('资源')) {
        protectionScore += value * 0.8 // 商品基金
      } else if (name.includes('reits') || name.includes('不动产')) {
        protectionScore += value * 0.6 // REITs
      } else if (name.includes('股票') || type.includes('股票')) {
        protectionScore += value * 0.5 // 股票型基金
      } else if (name.includes('债券') || type.includes('债券')) {
        protectionScore += value * 0.2 // 债券型基金
      } else {
        protectionScore += value * 0.3 // 其他默认
      }
    })

    return totalValue > 0 ? (protectionScore / totalValue) * 100 : 0
  }

  /**
   * 生成通胀保值主题洞察
   */
  generateInflationInsights(metrics) {
    const insights = []

    if (metrics.realReturn.annual > 0) {
      insights.push('📈 您的投资组合正在跑赢通胀，保护了购买力')
    } else {
      insights.push('⚠️ 投资收益低于通胀，购买力正在下降')
    }

    if (metrics.inflationBeatingRate >= 70) {
      insights.push('🎯 大部分基金跑赢通胀，资产配置合理')
    } else if (metrics.inflationBeatingRate >= 40) {
      insights.push('🔄 约一半基金跑赢通胀，有优化空间')
    } else {
      insights.push('📉 大部分基金未跑赢通胀，建议调整配置')
    }

    if (metrics.inflationProtection >= 60) {
      insights.push('🛡️ 投资组合通胀保护能力较强')
    } else if (metrics.inflationProtection >= 30) {
      insights.push('⚖️ 投资组合有一定通胀保护能力')
    } else {
      insights.push('🔍 建议增加通胀保护类资产配置')
    }

    const annualInflationLoss = metrics.purchasingPower.annualInflationLoss
    insights.push(`💰 当前资产每年因通胀损失约${annualInflationLoss.toFixed(2)}元购买力`)

    return insights
  }
}

/**
 * 主题服务管理器
 */
class ThemeService {
  constructor() {
    this.analyzers = new Map([
      ['fire', FireThemeAnalyzer],
      ['global', GlobalThemeAnalyzer],
      ['inflation', InflationThemeAnalyzer]
    ])
  }

  /**
   * 分析用户投资组合
   */
  async analyzePortfolio(userId, themeKey, userPreferences = {}) {
    const db = getDB()

    // 获取主题配置
    const themeConfig = await db.get(
      'SELECT * FROM theme_configs WHERE theme_key = ? AND is_active = 1',
      [themeKey]
    )

    if (!themeConfig) {
      throw new Error(`主题 ${themeKey} 不存在`)
    }

    // 获取用户基金持仓
    const portfolios = await db.all(
      `SELECT uf.*, f.fund_name, f.fund_type, f.fund_company, f.nav, f.nav_date
       FROM user_funds uf
       JOIN funds f ON uf.fund_code = f.fund_code
       WHERE uf.user_id = ? AND uf.is_active = 1`,
      [userId]
    )

    // 获取用户主题偏好
    const preferences = await db.get(
      'SELECT preferences_json FROM user_theme_preferences WHERE user_id = ? AND theme_key = ?',
      [userId, themeKey]
    )

    const finalPreferences = {
      ...JSON.parse(preferences?.preferences_json || '{}'),
      ...userPreferences
    }

    // 获取对应的分析器
    const AnalyzerClass = this.analyzers.get(themeKey)
    if (!AnalyzerClass) {
      throw new Error(`主题 ${themeKey} 没有对应的分析器`)
    }

    const analyzer = new AnalyzerClass(themeConfig)
    return await analyzer.analyze(portfolios, finalPreferences)
  }

  /**
   * 获取所有可用主题
   */
  async getAvailableThemes() {
    const db = getDB()
    const themes = await db.all(
      'SELECT theme_key, theme_name, theme_description, config_json FROM theme_configs WHERE is_active = 1 ORDER BY theme_key'
    )

    return themes.map(theme => ({
      ...theme,
      config: JSON.parse(theme.config_json || '{}')
    }))
  }

  /**
   * 获取主题特定工具
   */
  async getThemeTools(themeKey) {
    const tools = {
      fire: [
        { name: 'fire_calculator', label: 'FIRE计算器', description: '计算退休目标和储蓄计划' },
        { name: 'withdrawal_simulator', label: '取款模拟器', description: '模拟退休后的取款策略' },
        { name: 'retirement_planner', label: '退休规划器', description: '制定详细的退休计划' }
      ],
      global: [
        { name: 'currency_converter', label: '货币转换器', description: '实时汇率换算' },
        { name: 'global_allocation', label: '全球配置分析', description: '分析全球资产配置' },
        { name: 'qdii_screener', label: 'QDII筛选器', description: '筛选优质QDII基金' }
      ],
      inflation: [
        { name: 'inflation_calculator', label: '通胀计算器', description: '计算通胀对购买力的影响' },
        { name: 'real_return', label: '实际收益计算', description: '计算扣除通胀后的真实收益' },
        { name: 'purchasing_power', label: '购买力分析', description: '分析资产购买力变化' }
      ]
    }

    return tools[themeKey] || []
  }
}

export default ThemeService
export { BaseThemeAnalyzer, FireThemeAnalyzer, GlobalThemeAnalyzer, InflationThemeAnalyzer }