import { get, post } from '@/utils/http'
import type { ApiResponse } from '@/types'

export interface AIAnalysisRequest {
  analysis_type: 'portfolio_review' | 'risk_assessment' | 'market_outlook' | 'recommendation'
  request_text: string
  context_data?: Record<string, any>
}

export interface AIAnalysisResponse {
  content: string
  modelUsed: string
  tokensUsed: number
  processingTime: number
}

export const aiApi = {
  /**
   * 生成AI分析
   */
  generateAnalysis: (data: AIAnalysisRequest): Promise<ApiResponse<AIAnalysisResponse>> => {
    return post('/ai/analysis', data)
  },

  /**
   * 获取AI分析历史
   */
  getHistory: (page = 1, limit = 20): Promise<ApiResponse<any>> => {
    return get('/ai/history', { page, limit })
  },

  /**
   * 获取AI使用统计
   */
  getStats: (): Promise<ApiResponse<{ analysisTypeStats: any[]; modelStats: any[] }>> => {
    return get('/ai/stats')
  },

  /**
   * 获取AI分析类型列表
   */
  getAnalysisTypes: (): Promise<ApiResponse<{ types: any[] }>> => {
    return get('/ai/types')
  }
}