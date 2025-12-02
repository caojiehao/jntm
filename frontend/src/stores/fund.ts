import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Fund, UserFund, PortfolioSummary } from '@/types'
import { fundApi } from '@/api/fund'

export const useFundStore = defineStore('fund', () => {
  // 状态
  const portfolio = ref<PortfolioSummary | null>(null)
  const funds = ref<Fund[]>([])
  const searchResults = ref<Fund[]>([])
  const isLoading = ref(false)
  const searchLoading = ref(false)

  // 计算属性
  const portfolioSummary = computed(() => portfolio.value?.summary || {
    totalValue: 0,
    totalCost: 0,
    totalProfit: 0,
    totalProfitRate: 0,
    fundCount: 0
  })

  const portfolioDetails = computed(() => portfolio.value?.details || [])

  const hasHoldings = computed(() => portfolioDetails.value.length > 0)

  const totalProfitRate = computed(() => portfolioSummary.value.totalProfitRate)

  const isProfitable = computed(() => portfolioSummary.value.totalProfit > 0)

  // 获取用户投资组合
  const fetchPortfolio = async () => {
    try {
      isLoading.value = true
      const response = await fundApi.getPortfolio()

      if (response.success) {
        portfolio.value = response.data
        return response.data
      } else {
        throw new Error(response.message || '获取投资组合失败')
      }
    } catch (error) {
      console.error('获取投资组合失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 搜索基金
  const searchFunds = async (keyword: string, limit = 20) => {
    try {
      searchLoading.value = true
      const response = await fundApi.searchFunds(keyword, limit)

      if (response.success) {
        searchResults.value = response.data.funds
        return response.data.funds
      } else {
        throw new Error(response.message || '搜索基金失败')
      }
    } catch (error) {
      console.error('搜索基金失败:', error)
      searchResults.value = []
      throw error
    } finally {
      searchLoading.value = false
    }
  }

  // 获取基金详情
  const getFundDetail = async (fundCode: string) => {
    try {
      const response = await fundApi.getFundDetail(fundCode)

      if (response.success) {
        // 更新基金列表中的信息
        const index = funds.value.findIndex(f => f.fund_code === fundCode)
        if (index !== -1) {
          funds.value[index] = response.data.fund
        } else {
          funds.value.push(response.data.fund)
        }

        return response.data.fund
      } else {
        throw new Error(response.message || '获取基金详情失败')
      }
    } catch (error) {
      console.error('获取基金详情失败:', error)
      throw error
    }
  }

  // 添加基金到投资组合
  const addFund = async (fundData: {
    fund_code: string
    shares: number
    cost_price: number
    purchase_date: string
  }) => {
    try {
      isLoading.value = true
      const response = await fundApi.addFund(fundData)

      if (response.success) {
        // 刷新投资组合
        await fetchPortfolio()
        return response.data
      } else {
        throw new Error(response.message || '添加基金失败')
      }
    } catch (error) {
      console.error('添加基金失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 更新基金持仓
  const updateFund = async (holdingId: number, updateData: {
    shares?: number
    cost_price?: number
  }) => {
    try {
      isLoading.value = true
      const response = await fundApi.updateFund(holdingId, updateData)

      if (response.success) {
        // 刷新投资组合
        await fetchPortfolio()
        return response.data
      } else {
        throw new Error(response.message || '更新基金失败')
      }
    } catch (error) {
      console.error('更新基金失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 删除基金持仓
  const removeFund = async (holdingId: number) => {
    try {
      isLoading.value = true
      const response = await fundApi.deleteFund(holdingId)

      if (response.success) {
        // 刷新投资组合
        await fetchPortfolio()
        return response.data
      } else {
        throw new Error(response.message || '删除基金失败')
      }
    } catch (error) {
      console.error('删除基金失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 批量更新基金数据
  const batchUpdateFunds = async (fundCodes: string[]) => {
    try {
      isLoading.value = true
      const response = await fundApi.batchUpdateFunds({ fund_codes: fundCodes })

      if (response.success) {
        // 刷新投资组合
        await fetchPortfolio()
        return response.data
      } else {
        throw new Error(response.message || '批量更新失败')
      }
    } catch (error) {
      console.error('批量更新失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 获取基金净值历史
  const getFundNavHistory = async (fundCode: string, startDate?: string, endDate?: string) => {
    try {
      const response = await fundApi.getFundNavHistory(fundCode, startDate, endDate)

      if (response.success) {
        return response.data.history
      } else {
        throw new Error(response.message || '获取净值历史失败')
      }
    } catch (error) {
      console.error('获取净值历史失败:', error)
      return []
    }
  }

  // 清空搜索结果
  const clearSearchResults = () => {
    searchResults.value = []
  }

  // 重置状态
  const resetState = () => {
    portfolio.value = null
    funds.value = []
    searchResults.value = []
    isLoading.value = false
    searchLoading.value = false
  }

  // 计算收益率颜色
  const getProfitRateColor = (rate: number) => {
    if (rate > 0) return '#67c23a' // 绿色
    if (rate < 0) return '#f56c6c' // 红色
    return '#909399' // 灰色
  }

  // 格式化金额
  const formatAmount = (amount: number, decimals = 2) => {
    if (amount === 0) return '0.00'

    const absAmount = Math.abs(amount)
    let formatted = ''

    if (absAmount >= 100000000) {
      formatted = (amount / 100000000).toFixed(decimals) + '亿'
    } else if (absAmount >= 10000) {
      formatted = (amount / 10000).toFixed(decimals) + '万'
    } else {
      formatted = amount.toFixed(decimals)
    }

    return formatted
  }

  // 格式化收益率
  const formatProfitRate = (rate: number) => {
    const sign = rate >= 0 ? '+' : ''
    return `${sign}${rate.toFixed(2)}%`
  }

  // 根据基金代码查找持仓
  const findHoldingByCode = (fundCode: string) => {
    return portfolioDetails.value.find(holding => holding.fund_code === fundCode)
  }

  // 计算持仓市值
  const calculateHoldingValue = (holding: UserFund) => {
    const nav = holding.nav || holding.cost_price
    return holding.shares * nav
  }

  // 计算持仓收益
  const calculateHoldingProfit = (holding: UserFund) => {
    const currentValue = calculateHoldingValue(holding)
    const costValue = holding.shares * holding.cost_price
    return {
      amount: currentValue - costValue,
      rate: costValue > 0 ? ((currentValue - costValue) / costValue) * 100 : 0
    }
  }

  return {
    // 状态
    portfolio: readonly(portfolio),
    funds: readonly(funds),
    searchResults: readonly(searchResults),
    isLoading: readonly(isLoading),
    searchLoading: readonly(searchLoading),

    // 计算属性
    portfolioSummary,
    portfolioDetails,
    hasHoldings,
    totalProfitRate,
    isProfitable,

    // 方法
    fetchPortfolio,
    searchFunds,
    getFundDetail,
    addFund,
    updateFund,
    removeFund,
    batchUpdateFunds,
    getFundNavHistory,
    clearSearchResults,
    resetState,

    // 工具方法
    getProfitRateColor,
    formatAmount,
    formatProfitRate,
    findHoldingByCode,
    calculateHoldingValue,
    calculateHoldingProfit
  }
})