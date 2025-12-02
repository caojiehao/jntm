// 用户相关类型
export interface User {
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

// 基金相关类型
export interface Fund {
  fund_code: string
  fund_name: string
  fund_type: string
  fund_company: string
  nav: number | null
  nav_date: string | null
  total_assets?: number | null
  established_date?: string | null
  manager?: string
  benchmark?: string
  fee_rate?: number | null
  min_investment?: number | null
  is_active: boolean
}

// 用户基金持仓类型
export interface UserFund {
  id: number
  user_id: number
  fund_code: string
  shares: number
  cost_price: number
  purchase_date: string
  is_active: boolean
  created_at: string
  updated_at: string
  // 关联的基金信息
  fund_name?: string
  fund_type?: string
  fund_company?: string
  nav?: number | null
  nav_date?: string | null
  // 计算字段
  currentValue?: number
  costValue?: number
  profit?: number
  profitRate?: number
}

// 投资组合汇总类型
export interface PortfolioSummary {
  summary: {
    totalValue: number
    totalCost: number
    totalProfit: number
    totalProfitRate: number
    fundCount: number
  }
  details: UserFund[]
}

// 主题相关类型
export interface Theme {
  theme_key: string
  theme_name: string
  theme_description: string
  config: ThemeConfig
}

export interface ThemeConfig {
  primaryColor: string
  icon: string
  features: string[]
  defaultMetrics: string[]
}

export interface UserThemePreferences {
  theme_key: string
  preferences: Record<string, any>
}

// 主题分析结果类型
export interface ThemeAnalysis {
  theme: string
  totalValue: number
  totalCost: number
  totalProfit: number
  totalProfitRate: number
  fundCount: number
  metrics: Record<string, any>
  insights: string[]
}

// AI分析相关类型
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

export interface AIAnalysisRecord {
  id: number
  analysis_type: string
  request_text: string
  response_text: string
  model_used: string
  tokens_used: number
  processing_time: number
  created_at: string
}

// OCR相关类型
export interface OCRRequest {
  fund_code_hint?: string
}

export interface OCRResponse {
  fundCode: string | null
  confidence: number
  ocrResult: any
  processingTime: number
}

export interface OCRRecord {
  id: number
  extracted_fund_code: string | null
  confidence_score: number
  processing_time: number
  created_at: string
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data: T
  error?: {
    code: string
    message: string
    details?: any[]
  }
  timestamp?: string
  path?: string
}

// 分页类型
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> extends ApiResponse<{
  items: T[]
  pagination: Pagination
}> {}

// 路由元信息类型
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    layout?: 'main' | 'auth' | 'error'
    keepAlive?: boolean
    hideInMenu?: boolean
    icon?: string
    order?: number
  }
}

// 工具函数类型
export type TreeNodeData = {
  id: string | number
  label: string
  children?: TreeNodeData[]
  [key: string]: any
}

export type SelectOption = {
  label: string
  value: string | number
  disabled?: boolean
  [key: string]: any
}

// 图表数据类型
export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
    [key: string]: any
  }[]
}

// ECharts 配置类型
export interface ECOption {
  title?: any
  tooltip?: any
  legend?: any
  grid?: any
  xAxis?: any
  yAxis?: any
  series?: any[]
  radar?: any
  color?: string[]
  backgroundColor?: string
  [key: string]: any
}

// 表格列配置类型
export interface TableColumn {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean
  formatter?: (row: any, column: any, cellValue: any, index: number) => string
  [key: string]: any
}

// 表单验证规则类型
export type FormRule = {
  required?: boolean
  message?: string
  trigger?: string | string[]
  min?: number
  max?: number
  len?: number
  pattern?: RegExp
  validator?: (rule: any, value: any, callback: any) => void
  [key: string]: any
}

export interface FormRules {
  [key: string]: FormRule | FormRule[]
}

// 环境变量类型
export interface EnvConfig {
  VITE_API_BASE_URL: string
  VITE_APP_TITLE: string
  VITE_ENABLE_AI: boolean
  VITE_ENABLE_OCR: boolean
  VITE_ENABLE_THEMES: boolean
  VITE_DEFAULT_THEME: string
  VITE_AVAILABLE_THEMES: string[]
  VITE_CHART_ANIMATION: boolean
  VITE_CHART_REFRESH_INTERVAL: number
  VITE_DEV_MOCK_DATA: boolean
  VITE_DEV_SHOW_DEBUG: boolean
}