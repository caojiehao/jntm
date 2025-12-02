import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { authApi } from '@/api/auth'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // 初始化认证状态
  const initializeAuth = async () => {
    try {
      const savedToken = localStorage.getItem('jntm_token')
      const savedUser = localStorage.getItem('jntm_user')

      if (savedToken && savedUser) {
        token.value = savedToken
        user.value = JSON.parse(savedUser)

        // 验证token是否有效
        await verifyToken()
      }
    } catch (error) {
      console.error('初始化认证状态失败:', error)
      clearAuth()
    } finally {
      isInitialized.value = true
    }
  }

  // 验证token
  const verifyToken = async () => {
    try {
      const response = await authApi.verify()
      if (response.success) {
        user.value = response.data.user
      } else {
        throw new Error('Token验证失败')
      }
    } catch (error) {
      clearAuth()
      throw error
    }
  }

  // 登录
  const login = async (credentials: { email: string; password: string }) => {
    try {
      isLoading.value = true
      const response = await authApi.login(credentials)

      if (response.success) {
        token.value = response.data.token
        user.value = response.data.user

        // 保存到本地存储
        localStorage.setItem('jntm_token', response.data.token)
        localStorage.setItem('jntm_user', JSON.stringify(response.data.user))

        return response.data
      } else {
        throw new Error(response.message || '登录失败')
      }
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 注册
  const register = async (userData: {
    username: string
    email: string
    password: string
    phone?: string
  }) => {
    try {
      isLoading.value = true
      const response = await authApi.register(userData)

      if (response.success) {
        token.value = response.data.token
        user.value = response.data.user

        // 保存到本地存储
        localStorage.setItem('jntm_token', response.data.token)
        localStorage.setItem('jntm_user', JSON.stringify(response.data.user))

        return response.data
      } else {
        throw new Error(response.message || '注册失败')
      }
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      // 调用服务端登出接口
      if (token.value) {
        await authApi.logout()
      }
    } catch (error) {
      console.error('服务端登出失败:', error)
    } finally {
      clearAuth()
    }
  }

  // 清除认证状态
  const clearAuth = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('jntm_token')
    localStorage.removeItem('jntm_user')
  }

  // 刷新token
  const refreshToken = async () => {
    try {
      if (!token.value) {
        throw new Error('没有可刷新的token')
      }

      const response = await authApi.refresh()
      if (response.success) {
        token.value = response.data.token
        localStorage.setItem('jntm_token', response.data.token)
        return response.data.token
      } else {
        throw new Error('Token刷新失败')
      }
    } catch (error) {
      console.error('Token刷新失败:', error)
      clearAuth()
      throw error
    }
  }

  // 设置用户信息
  const setUser = (userData: User) => {
    user.value = userData
    token.value = userData.token || 'mock-token'

    // 保存到本地存储
    localStorage.setItem('jntm_user', JSON.stringify(userData))
    localStorage.setItem('jntm_token', token.value)
  }

  // 设置Token
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('jntm_token', newToken)
  }

  // 更新用户信息
  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData }
      localStorage.setItem('jntm_user', JSON.stringify(user.value))
    }
  }

  // 检查是否已登录（用于路由守卫）
  const checkAuthStatus = () => {
    return !!token.value && !!user.value
  }

  // 获取认证头
  const getAuthHeader = () => {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  return {
    // 状态
    user: readonly(user),
    token: readonly(token),
    isLoading: readonly(isLoading),
    isInitialized: readonly(isInitialized),

    // 计算属性
    isAuthenticated,

    // 方法
    initializeAuth,
    login,
    register,
    logout,
    clearAuth,
    refreshToken,
    updateUser,
    setUser,
    setToken,
    verifyToken,
    checkAuthStatus,
    getAuthHeader
  }
})