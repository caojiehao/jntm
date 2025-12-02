import axios from 'axios'
import { getDB } from '../config/database.js'

/**
 * AI分析服务
 */
class AiService {
  constructor() {
    this.deepseekApiKey = process.env.DEEPSEEK_API_KEY
    this.deepseekBaseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
    this.qwenApiKey = process.env.QWEN_API_KEY
    this.qwenBaseUrl = process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/api/v1'

    // 熔断器配置
    this.circuitBreaker = {
      deepseek: { failures: 0, lastFailure: 0, state: 'CLOSED' },
      qwen: { failures: 0, lastFailure: 0, state: 'CLOSED' }
    }

    this.failureThreshold = 3
    this.recoveryTimeout = 60000 // 1分钟
  }

  /**
   * 生成投资分析
   */
  async generateAnalysis(userId, analysisType, requestText, contextData = {}) {
    try {
      const startTime = Date.now()

      // 获取用户投资组合数据
      const portfolioData = await this.getUserPortfolioData(userId)
      const userTheme = await this.getUserTheme(userId)

      // 构建提示词
      const prompt = this.buildPrompt(analysisType, requestText, portfolioData, userTheme, contextData)

      // 尝试调用AI模型
      let response
      let modelUsed = ''

      if (this.isModelAvailable('deepseek')) {
        try {
          response = await this.callDeepseekAPI(prompt)
          modelUsed = 'deepseek'
        } catch (error) {
          console.warn('DeepSeek API调用失败，切换到Qwen:', error.message)
          this.recordFailure('deepseek')
          response = await this.callQwenAPI(prompt)
          modelUsed = 'qwen'
        }
      } else {
        response = await this.callQwenAPI(prompt)
        modelUsed = 'qwen'
      }

      // 记录成功调用
      this.recordSuccess(modelUsed)

      const processingTime = Date.now() - startTime
      const tokensUsed = response.usage?.total_tokens || 0

      // 保存分析记录
      await this.saveAnalysisRecord(userId, analysisType, requestText, response.content, modelUsed, tokensUsed, processingTime)

      return {
        content: response.content,
        modelUsed,
        tokensUsed,
        processingTime
      }
    } catch (error) {
      console.error('AI分析生成失败:', error)
      throw new Error(`AI分析失败: ${error.message}`)
    }
  }

  /**
   * 调用DeepSeek API
   */
  async callDeepseekAPI(prompt) {
    const response = await axios.post(
      `${this.deepseekBaseUrl}/v1/chat/completions`,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是基你太美智能基金管家的专业投资顾问，擅长基金分析和投资建议。请用专业、客观的语言提供分析，并给出具体的建议。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${this.deepseekApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )

    return response.data.choices[0].message
  }

  /**
   * 调用Qwen API
   */
  async callQwenAPI(prompt) {
    const response = await axios.post(
      `${this.qwenBaseUrl}/services/aigc/text-generation/generation`,
      {
        model: 'qwen-turbo',
        input: {
          messages: [
            {
              role: 'system',
              content: '你是基你太美智能基金管家的专业投资顾问，擅长基金分析和投资建议。请用专业、客观的语言提供分析，并给出具体的建议。'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        parameters: {
          temperature: 0.7,
          max_tokens: 2000
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.qwenApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )

    return {
      content: response.data.output.text,
      usage: response.data.usage
    }
  }

  /**
   * 构建AI提示词
   */
  buildPrompt(analysisType, requestText, portfolioData, userTheme, contextData) {
    const { summary, details } = portfolioData
    const themeConfig = userTheme.config || {}

    let basePrompt = `作为一名专业的基金投资顾问，请基于以下信息为用户分析：

## 用户基本信息
- 当前投资主题：${userTheme.theme_name}
- 投资组合总值：${summary.totalValue?.toFixed(2) || 0}元
- 持有基金数量：${summary.fundCount || 0}只
- 总收益率：${summary.totalProfitRate?.toFixed(2) || 0}%

## 投资组合详情
`

    // 添加基金详情
    if (details && details.length > 0) {
      details.forEach((fund, index) => {
        basePrompt += `${index + 1}. ${fund.fund_name}(${fund.fund_code})
   - 持有份额：${fund.shares}份
   - 成本价格：${fund.cost_price}元
   - 当前净值：${fund.nav || fund.cost_price}元
   - 收益率：${fund.profitRate?.toFixed(2) || 0}%
   - 基金类型：${fund.fund_type}

`
      })
    } else {
      basePrompt += '用户暂无基金持仓\n'
    }

    // 根据分析类型添加特定要求
    switch (analysisType) {
      case 'portfolio_review':
        basePrompt += `
## 投资组合复盘要求
请对用户的投资组合进行全面的复盘分析，包括：
1. 组合配置合理性分析
2. 风险收益特征评估
3. 与投资主题的匹配度
4. 具体的优化建议
5. 未来关注的重点

用户的提问：${requestText}
`
        break

      case 'risk_assessment':
        basePrompt += `
## 风险评估要求
请评估用户投资组合的风险状况，包括：
1. 集中度风险分析
2. 行业和风格风险
3. 市场风险敞口
4. 风险承受能力匹配度
5. 风险控制建议

用户的提问：${requestText}
`
        break

      case 'market_outlook':
        basePrompt += `
## 市场展望要求
请基于当前市场环境，为用户提供市场展望和投资建议，包括：
1. 当前市场环境分析
2. 影响因素解读
3. 投资机会识别
4. 风险提示
5. 配置建议

用户的提问：${requestText}
`
        break

      case 'recommendation':
        basePrompt += `
## 投资建议要求
请为用户提供具体的投资建议，包括：
1. 基金筛选建议
2. 配置比例建议
3. 加仓减仓时机
4. 长期持有建议
5. 风险控制策略

用户的提问：${requestText}
`
        break

      default:
        basePrompt += `
用户的提问：${requestText}
`
    }

    // 添加主题特定要求
    if (userTheme.theme_key === 'fire') {
      basePrompt += `

## FIRE主题特别要求
请特别关注退休规划和被动收入，重点分析：
1. 当前组合能否支持退休目标
2. 被动收入情况
3. 取款策略建议
4. 长期可持续性评估
`
    } else if (userTheme.theme_key === 'global') {
      basePrompt += `

## 全球配置主题特别要求
请特别关注全球资产配置，重点分析：
1. 地域配置合理性
2. 汇率风险影响
3. 多元化程度
4. 国际化配置建议
`
    } else if (userTheme.theme_key === 'inflation') {
      basePrompt += `

## 通胀保值主题特别要求
请特别关注通胀对投资的影响，重点分析：
1. 实际收益率情况
2. 通胀保护能力
3. 购买力保值效果
4. 抗通胀资产配置建议
`
    }

    basePrompt += `

## 回复要求
请用专业但易懂的语言进行分析，避免过于技术性的术语。如果需要数据，请基于已有信息合理估算。如果信息不足，请明确指出需要哪些补充信息。
`

    return basePrompt
  }

  /**
   * 获取用户投资组合数据
   */
  async getUserPortfolioData(userId) {
    try {
      const db = getDB()

      const portfolio = await db.all(
        `SELECT uf.*, f.fund_name, f.fund_type, f.fund_company, f.nav, f.nav_date
         FROM user_funds uf
         JOIN funds f ON uf.fund_code = f.fund_code
         WHERE uf.user_id = ? AND uf.is_active = 1
         ORDER BY uf.created_at DESC`,
        [userId]
      )

      let totalValue = 0
      let totalCost = 0
      let totalProfit = 0
      const details = []

      for (const holding of portfolio) {
        const currentValue = holding.shares * (holding.nav || holding.cost_price)
        const costValue = holding.shares * holding.cost_price
        const profit = currentValue - costValue
        const profitRate = costValue > 0 ? (profit / costValue) * 100 : 0

        totalValue += currentValue
        totalCost += costValue
        totalProfit += profit

        details.push({
          ...holding,
          currentValue,
          costValue,
          profit,
          profitRate
        })
      }

      const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

      return {
        summary: {
          totalValue,
          totalCost,
          totalProfit,
          totalProfitRate,
          fundCount: portfolio.length
        },
        details
      }
    } catch (error) {
      console.error('获取用户投资组合数据失败:', error)
      return {
        summary: {
          totalValue: 0,
          totalCost: 0,
          totalProfit: 0,
          totalProfitRate: 0,
          fundCount: 0
        },
        details: []
      }
    }
  }

  /**
   * 获取用户主题信息
   */
  async getUserTheme(userId) {
    try {
      const db = getDB()

      const user = await db.get(
        'SELECT current_theme FROM users WHERE id = ?',
        [userId]
      )

      if (!user) {
        return { theme_key: 'fire', theme_name: '提前退休', config: {} }
      }

      const theme = await db.get(
        'SELECT * FROM theme_configs WHERE theme_key = ? AND is_active = 1',
        [user.current_theme || 'fire']
      )

      if (!theme) {
        return { theme_key: 'fire', theme_name: '提前退休', config: {} }
      }

      return {
        theme_key: theme.theme_key,
        theme_name: theme.theme_name,
        config: JSON.parse(theme.config_json || '{}')
      }
    } catch (error) {
      console.error('获取用户主题信息失败:', error)
      return { theme_key: 'fire', theme_name: '提前退休', config: {} }
    }
  }

  /**
   * 保存分析记录
   */
  async saveAnalysisRecord(userId, analysisType, requestText, responseText, modelUsed, tokensUsed, processingTime) {
    const db = getDB()

    await db.run(
      `INSERT INTO ai_analysis
       (user_id, analysis_type, request_text, response_text, model_used, tokens_used, processing_time)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, analysisType, requestText, responseText, modelUsed, tokensUsed, processingTime]
    )
  }

  /**
   * 检查模型是否可用（熔断器逻辑）
   */
  isModelAvailable(model) {
    const breaker = this.circuitBreaker[model]
    const now = Date.now()

    switch (breaker.state) {
      case 'CLOSED':
        return breaker.failures < this.failureThreshold

      case 'OPEN':
        if (now - breaker.lastFailure > this.recoveryTimeout) {
          breaker.state = 'HALF_OPEN'
          return true
        }
        return false

      case 'HALF_OPEN':
        return true

      default:
        return false
    }
  }

  /**
   * 记录失败
   */
  recordFailure(model) {
    const breaker = this.circuitBreaker[model]
    breaker.failures++
    breaker.lastFailure = Date.now()

    if (breaker.failures >= this.failureThreshold) {
      breaker.state = 'OPEN'
    }
  }

  /**
   * 记录成功
   */
  recordSuccess(model) {
    const breaker = this.circuitBreaker[model]
    breaker.failures = 0
    breaker.state = 'CLOSED'
  }

  /**
   * 获取AI分析历史
   */
  async getAnalysisHistory(userId, page = 1, limit = 20) {
    const db = getDB()
    const offset = (page - 1) * limit

    const records = await db.all(
      `SELECT id, analysis_type, request_text, response_text, model_used,
              tokens_used, processing_time, created_at
       FROM ai_analysis
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    )

    const total = await db.get(
      'SELECT COUNT(*) as count FROM ai_analysis WHERE user_id = ?',
      [userId]
    )

    return {
      records: records.map(record => ({
        ...record,
        request_text: record.request_text.substring(0, 100) + (record.request_text.length > 100 ? '...' : ''),
        response_text: record.response_text.substring(0, 200) + (record.response_text.length > 200 ? '...' : '')
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        totalPages: Math.ceil(total.count / limit)
      }
    }
  }

  /**
   * 获取AI使用统计
   */
  async getAiUsageStats(userId) {
    const db = getDB()

    const stats = await db.all(
      `SELECT analysis_type, COUNT(*) as count,
              AVG(processing_time) as avg_processing_time,
              SUM(tokens_used) as total_tokens
       FROM ai_analysis
       WHERE user_id = ?
       GROUP BY analysis_type`,
      [userId]
    )

    const modelStats = await db.all(
      `SELECT model_used, COUNT(*) as count
       FROM ai_analysis
       WHERE user_id = ?
       GROUP BY model_used`,
      [userId]
    )

    return {
      analysisTypeStats: stats,
      modelStats
    }
  }
}

export default AiService