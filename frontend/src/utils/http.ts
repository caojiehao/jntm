import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

// 创建axios实例
const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    // 添加认证头
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    // 添加请求ID（用于追踪）
    config.headers['X-Request-ID'] = generateRequestId()

    // 开发环境下打印请求信息
    if (import.meta.env.VITE_DEV_SHOW_DEBUG === 'true') {
      console.log('🚀 HTTP Request:', {
        url: config.url,
        method: config.method,
        data: config.data,
        params: config.params,
        headers: config.headers
      })
    }

    return config
  },
  (error) => {
    console.error('❌ HTTP Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    // 开发环境下打印响应信息
    if (import.meta.env.VITE_DEV_SHOW_DEBUG === 'true') {
      console.log('✅ HTTP Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      })
    }

    return response
  },
  async (error) => {
    const { response } = error

    // 开发环境下打印错误信息
    if (import.meta.env.VITE_DEV_SHOW_DEBUG === 'true') {
      console.error('❌ HTTP Response Error:', {
        url: response?.config?.url,
        status: response?.status,
        data: response?.data,
        error: error.message
      })
    }

    // 处理不同类型的HTTP错误
    if (response) {
      switch (response.status) {
        case 401:
          // 未授权 - 清除认证状态并跳转到登录页
          await handleUnauthorized()
          break

        case 403:
          // 禁止访问
          ElMessage.error('访问被拒绝，权限不足')
          break

        case 404:
          // 资源未找到
          ElMessage.error('请求的资源不存在')
          break

        case 429:
          // 请求过于频繁
          ElMessage.error('请求过于频繁，请稍后再试')
          break

        case 500:
          // 服务器内部错误
          ElMessage.error('服务器内部错误，请稍后再试')
          break

        case 502:
        case 503:
        case 504:
          // 服务不可用
          ElMessage.error('服务暂时不可用，请稍后再试')
          break

        default:
          // 其他错误
          handleError(response.data)
      }
    } else if (error.code === 'ECONNABORTED') {
      // 请求超时
      ElMessage.error('请求超时，请检查网络连接')
    } else if (error.message === 'Network Error') {
      // 网络错误
      ElMessage.error('网络连接失败，请检查网络')
    } else {
      // 其他未知错误
      ElMessage.error('未知错误，请稍后再试')
    }

    return Promise.reject(error)
  }
)

/**
 * 处理401未授权错误
 */
const handleUnauthorized = async () => {
  const authStore = useAuthStore()

  try {
    // 尝试刷新token
    await authStore.refreshToken()
    ElMessage.success('登录状态已更新')
  } catch (refreshError) {
    // 刷新失败，清除认证状态
    authStore.clearAuth()

    // 显示提示并跳转到登录页
    ElMessageBox.confirm(
      '登录状态已过期，请重新登录',
      '提示',
      {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      const currentRoute = router.currentRoute.value
      const redirect = currentRoute.path !== '/login' ? currentRoute.fullPath : undefined
      router.push({
        name: 'Login',
        query: redirect ? { redirect } : undefined
      })
    }).catch(() => {
      // 用户取消，仍然跳转到登录页
      router.push({ name: 'Login' })
    })
  }
}

/**
 * 处理业务错误
 */
const handleError = (data: any) => {
  if (data && data.error) {
    const { code, message, details } = data.error

    // 根据错误代码显示不同的提示
    switch (code) {
      case 'VALIDATION_ERROR':
        if (details && Array.isArray(details)) {
          const errorMessages = details.map((detail: any) => detail.message).join('; ')
          ElMessage.error(`数据验证失败: ${errorMessages}`)
        } else {
          ElMessage.error(message || '数据验证失败')
        }
        break

      case 'USER_EXISTS':
        ElMessage.error(message || '用户已存在')
        break

      case 'INVALID_CREDENTIALS':
        ElMessage.error(message || '用户名或密码错误')
        break

      case 'FUND_NOT_FOUND':
        ElMessage.error(message || '基金不存在')
        break

      case 'FUND_ALREADY_OWNED':
        ElMessage.error(message || '您已持有该基金')
        break

      case 'RATE_LIMIT_EXCEEDED':
        ElMessage.error(message || '请求过于频繁，请稍后再试')
        break

      default:
        ElMessage.error(message || '操作失败')
    }
  } else {
    ElMessage.error('操作失败，请稍后再试')
  }
}

/**
 * 生成请求ID
 */
const generateRequestId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 封装GET请求
 */
export const get = <T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> => {
  return http.get(url, { ...config, params }).then(response => response.data)
}

/**
 * 封装POST请求
 */
export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return http.post(url, data, config).then(response => response.data)
}

/**
 * 封装PUT请求
 */
export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return http.put(url, data, config).then(response => response.data)
}

/**
 * 封装DELETE请求
 */
export const del = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return http.delete(url, config).then(response => response.data)
}

/**
 * 封装文件上传
 */
export const upload = <T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> => {
  return http.post(url, formData, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(response => response.data)
}

/**
 * 下载文件
 */
export const download = (url: string, filename?: string, config?: AxiosRequestConfig): Promise<void> => {
  return http.get(url, {
    ...config,
    responseType: 'blob'
  }).then(response => {
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  })
}

export default http