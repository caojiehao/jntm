import { get, post, put } from '@/utils/http'
import type { ApiResponse } from '@/types'

export interface ThemeSwitchRequest {
  theme_key: string
  switch_reason?: string
}

export interface ThemePreferencesRequest {
  preferences: Record<string, any>
}

export interface ToolUsageRequest {
  tool_name: string
  usage_data?: Record<string, any>
}

export const themeApi = {
  /**
   * 获取所有可用主题
   */
  getThemes: (): Promise<ApiResponse<{ themes: any[] }>> => {
    return get('/themes')
  },

  /**
   * 获取用户当前主题
   */
  getCurrentTheme: (): Promise<ApiResponse<{ currentTheme: any }>> => {
    return get('/themes/current')
  },

  /**
   * 切换主题
   */
  switchTheme: (data: ThemeSwitchRequest): Promise<ApiResponse<{ newTheme: any; previousTheme: string }>> => {
    return post('/themes/switch', data)
  },

  /**
   * 获取主题切换历史
   */
  getHistory: (page = 1, limit = 20): Promise<ApiResponse<{ history: any[]; pagination: any }>> => {
    return get('/themes/history', { page, limit })
  },

  /**
   * 更新用户主题偏好
   */
  updatePreferences: (data: ThemePreferencesRequest): Promise<ApiResponse<{ preferences: any }>> => {
    return put('/themes/preferences', data)
  },

  /**
   * 记录工具使用情况
   */
  recordToolUsage: (data: ToolUsageRequest): Promise<ApiResponse<null>> => {
    return post('/themes/tools/usage', data)
  },

  /**
   * 获取主题使用统计
   */
  getThemeStats: (): Promise<ApiResponse<{ themeUsage: any[]; toolUsage: any[] }>> => {
    return get('/themes/stats')
  }
}