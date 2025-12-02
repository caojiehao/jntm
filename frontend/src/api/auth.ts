import { get, post } from '@/utils/http'
import type { ApiResponse } from '@/types'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  phone?: string
}

export interface LoginResponse {
  user: {
    id: number
    username: string
    email: string
    phone?: string
    avatar?: string
    current_theme: string
    investment_goal?: string
    risk_tolerance: number
    created_at: string
    updated_at: string
    last_login_at?: string
    is_active: boolean
  }
  token: string
}

export const authApi = {
  /**
   * 用户登录
   */
  login: (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return post('/auth/login', credentials)
  },

  /**
   * 用户注册
   */
  register: (userData: RegisterRequest): Promise<ApiResponse<LoginResponse>> => {
    return post('/auth/register', userData)
  },

  /**
   * 验证token
   */
  verify: (): Promise<ApiResponse<{ user: any }>> => {
    return get('/auth/verify')
  },

  /**
   * 刷新token
   */
  refresh: (): Promise<ApiResponse<{ token: string }>> => {
    return post('/auth/refresh')
  },

  /**
   * 登出
   */
  logout: (): Promise<ApiResponse<null>> => {
    return post('/auth/logout')
  }
}