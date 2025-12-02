import { get, post, put, del, upload } from '@/utils/http'
import type { ApiResponse } from '@/types'

export interface AddFundRequest {
  fund_code: string
  shares: number
  cost_price: number
  purchase_date: string
}

export interface UpdateFundRequest {
  shares?: number
  cost_price?: number
}

export interface BatchUpdateRequest {
  fund_codes: string[]
}

export const fundApi = {
  /**
   * 获取用户投资组合
   */
  getPortfolio: (): Promise<ApiResponse<any>> => {
    return get('/funds')
  },

  /**
   * 获取基金详情
   */
  getFundDetail: (fundCode: string): Promise<ApiResponse<{ fund: any }>> => {
    return get(`/funds/${fundCode}`)
  },

  /**
   * 搜索基金
   */
  searchFunds: (keyword: string, limit = 20): Promise<ApiResponse<{ funds: any[]; keyword: string }>> => {
    return get(`/funds/search/${encodeURIComponent(keyword)}`, { limit })
  },

  /**
   * 添加基金到投资组合
   */
  addFund: (data: AddFundRequest): Promise<ApiResponse<{ holding: any }>> => {
    return post('/funds', data)
  },

  /**
   * 更新基金持仓
   */
  updateFund: (holdingId: number, data: UpdateFundRequest): Promise<ApiResponse<null>> => {
    return put(`/funds/${holdingId}`, data)
  },

  /**
   * 删除基金持仓
   */
  deleteFund: (holdingId: number): Promise<ApiResponse<null>> => {
    return del(`/funds/${holdingId}`)
  },

  /**
   * OCR识别基金截图
   */
  recognizeFundOCR: (file: File, fundCodeHint?: string): Promise<ApiResponse<any>> => {
    const formData = new FormData()
    formData.append('image', file)
    if (fundCodeHint) {
      formData.append('fund_code_hint', fundCodeHint)
    }
    return upload('/funds/ocr', formData)
  },

  /**
   * 获取OCR识别历史
   */
  getOCRHistory: (page = 1, limit = 20): Promise<ApiResponse<any>> => {
    return get('/funds/ocr/history', { page, limit })
  },

  /**
   * 批量更新基金数据
   */
  batchUpdateFunds: (data: BatchUpdateRequest): Promise<ApiResponse<any>> => {
    return post('/funds/batch-update', data)
  },

  /**
   * 获取基金净值历史
   */
  getFundNavHistory: (fundCode: string, startDate?: string, endDate?: string): Promise<ApiResponse<{ history: any[] }>> => {
    const params: any = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate
    return get(`/funds/${fundCode}/nav-history`, params)
  }
}