import axios from 'axios'
import { getDB } from '../config/database.js'

/**
 * 基金数据服务
 */
class FundService {
  constructor() {
    this.fundApiBase = process.env.FUND_API_BASE_URL || 'https://fund.eastmoney.com'
    this.fundApiKey = process.env.FUND_API_KEY
  }

  /**
   * 查询基金基本信息
   */
  async getFundInfo(fundCode) {
    try {
      // 首先从数据库查询
      const db = getDB()
      let fundInfo = await db.get(
        'SELECT * FROM funds WHERE fund_code = ?',
        [fundCode]
      )

      if (fundInfo) {
        // 检查数据是否需要更新（超过1天）
        const lastUpdate = new Date(fundInfo.updated_at)
        const now = new Date()
        const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60)

        if (hoursDiff < 24) {
          return fundInfo
        }
      }

      // 从API获取最新数据
      const apiData = await this.fetchFundFromAPI(fundCode)

      if (fundInfo) {
        // 更新现有记录
        await this.updateFundInDB(fundCode, apiData)
        fundInfo = { ...fundInfo, ...apiData }
      } else {
        // 插入新记录
        await this.insertFundToDB(apiData)
        fundInfo = apiData
      }

      return fundInfo
    } catch (error) {
      console.error(`获取基金 ${fundCode} 信息失败:`, error)
      throw new Error(`基金信息获取失败: ${error.message}`)
    }
  }

  /**
   * 从API获取基金数据
   */
  async fetchFundFromAPI(fundCode) {
    try {
      // 东方财富基金API
      const response = await axios.get(
        `${this.fundApiBase}/js/fundgz_search.js`,
        {
          params: {
            keyword: fundCode,
            _: Date.now()
          },
          timeout: 10000
        }
      )

      // 解析JavaScript响应
      const dataStr = response.data
      const matches = dataStr.match(/var\s+r\s*=\s*(\[.*?\]);/)

      if (!matches || !matches[1]) {
        throw new Error('API响应格式错误')
      }

      const fundData = JSON.parse(matches[1])
      if (fundData.length === 0) {
        throw new Error('基金代码不存在')
      }

      const fund = fundData[0]
      return this.formatFundData(fund)
    } catch (error) {
      // 如果API失败，返回基础信息
      console.warn(`API调用失败，返回基础信息: ${error.message}`)
      return {
        fund_code: fundCode,
        fund_name: `基金${fundCode}`,
        fund_type: '未知',
        fund_company: '未知',
        nav: null,
        nav_date: null,
        total_assets: null,
        established_date: null,
        manager: '未知',
        benchmark: '未知',
        fee_rate: null,
        min_investment: null,
        is_active: 1
      }
    }
  }

  /**
   * 格式化基金数据
   */
  formatFundData(rawData) {
    return {
      fund_code: rawData.FUND_CODE || rawData.fundcode,
      fund_name: rawData.FUND_NAME || rawData.name || rawData.FUND_SHORT_NAME,
      fund_type: rawData.FUND_TYPE || rawData.TYPE || '未知类型',
      fund_company: rawData.FUND_COMPANY || rawData.FUNDMANAGER || '未知公司',
      nav: rawData.NAV || rawData.DWJZ ? parseFloat(rawData.DWJZ) : null,
      nav_date: rawData.NAV_DATE || rawData.FSRQ || new Date().toISOString().split('T')[0],
      total_assets: rawData.TOTAL_ASSETS || rawData.ZZC ? parseFloat(rawData.ZZC) : null,
      established_date: rawData.ESTABLISHED_DATE || rawData.CLRQ || null,
      manager: rawData.MANAGER || rawData.JJLL || '未知',
      benchmark: rawData.BENCHMARK || rawData.BZ || '业绩基准',
      fee_rate: rawData.FEE_RATE || rawData.SXF ? parseFloat(rawData.SXF) : null,
      min_investment: rawData.MIN_INVESTMENT || rawData.QSJE || 1,
      is_active: 1
    }
  }

  /**
   * 更新数据库中的基金信息
   */
  async updateFundInDB(fundCode, fundData) {
    const db = getDB()
    await db.run(
      `UPDATE funds SET
       fund_name = ?, fund_type = ?, fund_company = ?, nav = ?, nav_date = ?,
       total_assets = ?, established_date = ?, manager = ?, benchmark = ?,
       fee_rate = ?, min_investment = ?, updated_at = CURRENT_TIMESTAMP
       WHERE fund_code = ?`,
      [
        fundData.fund_name,
        fundData.fund_type,
        fundData.fund_company,
        fundData.nav,
        fundData.nav_date,
        fundData.total_assets,
        fundData.established_date,
        fundData.manager,
        fundData.benchmark,
        fundData.fee_rate,
        fundData.min_investment,
        fundCode
      ]
    )
  }

  /**
   * 插入新的基金信息到数据库
   */
  async insertFundToDB(fundData) {
    const db = getDB()
    await db.run(
      `INSERT INTO funds
       (fund_code, fund_name, fund_type, fund_company, nav, nav_date,
        total_assets, established_date, manager, benchmark, fee_rate, min_investment, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fundData.fund_code,
        fundData.fund_name,
        fundData.fund_type,
        fundData.fund_company,
        fundData.nav,
        fundData.nav_date,
        fundData.total_assets,
        fundData.established_date,
        fundData.manager,
        fundData.benchmark,
        fundData.fee_rate,
        fundData.min_investment,
        fundData.is_active
      ]
    )
  }

  /**
   * 搜索基金
   */
  async searchFunds(keyword, limit = 20) {
    try {
      const db = getDB()

      // 从数据库搜索
      const funds = await db.all(
        `SELECT fund_code, fund_name, fund_type, fund_company, nav, nav_date
         FROM funds
         WHERE (fund_code LIKE ? OR fund_name LIKE ?) AND is_active = 1
         ORDER BY
           CASE
             WHEN fund_code = ? THEN 1
             WHEN fund_code LIKE ? THEN 2
             WHEN fund_name LIKE ? THEN 3
             ELSE 4
           END,
           fund_name
         LIMIT ?`,
        [
          `${keyword}%`,
          `%${keyword}%`,
          keyword,
          `${keyword}%`,
          `%${keyword}%`,
          limit
        ]
      )

      return funds
    } catch (error) {
      console.error('搜索基金失败:', error)
      throw new Error(`基金搜索失败: ${error.message}`)
    }
  }

  /**
   * 获取用户持仓汇总
   */
  async getUserPortfolioSummary(userId) {
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

      // 计算汇总数据
      let totalValue = 0
      let totalCost = 0
      let totalProfit = 0
      const fundDetails = []

      for (const holding of portfolio) {
        const currentValue = holding.shares * (holding.nav || holding.cost_price)
        const costValue = holding.shares * holding.cost_price
        const profit = currentValue - costValue
        const profitRate = costValue > 0 ? (profit / costValue) * 100 : 0

        totalValue += currentValue
        totalCost += costValue
        totalProfit += profit

        fundDetails.push({
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
        details: fundDetails
      }
    } catch (error) {
      console.error('获取用户持仓汇总失败:', error)
      throw new Error(`获取持仓信息失败: ${error.message}`)
    }
  }

  /**
   * 获取基金净值历史
   */
  async getFundNavHistory(fundCode, startDate, endDate) {
    try {
      // TODO: 实现净值历史数据获取
      // 可以从东方财富或其他数据源获取历史净值
      return []
    } catch (error) {
      console.error('获取基金净值历史失败:', error)
      return []
    }
  }

  /**
   * 批量更新基金数据
   */
  async batchUpdateFunds(fundCodes) {
    const results = {
      success: [],
      failed: []
    }

    for (const fundCode of fundCodes) {
      try {
        await this.getFundInfo(fundCode)
        results.success.push(fundCode)
      } catch (error) {
        results.failed.push({ fundCode, error: error.message })
      }
    }

    return results
  }
}

export default FundService