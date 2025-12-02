import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Theme, UserThemePreferences } from '@/types'
import { themeApi } from '@/api/theme'

export const useThemeStore = defineStore('theme', () => {
  // 状态
  const currentTheme = ref<string>('fire')
  const availableThemes = ref<Theme[]>([])
  const userPreferences = ref<Record<string, any>>({})
  const isDarkMode = ref(false)
  const isLoading = ref(false)
  const isInitialized = ref(false)

  // 计算属性
  const currentThemeConfig = computed(() => {
    return availableThemes.value.find(theme => theme.theme_key === currentTheme.value)
  })

  const themeIcon = computed(() => {
    return currentThemeConfig.value?.config?.icon || '🎯'
  })

  const themeColor = computed(() => {
    return currentThemeConfig.value?.config?.primaryColor || '#409eff'
  })

  const themeFeatures = computed(() => {
    return currentThemeConfig.value?.config?.features || []
  })

  // 初始化主题
  const initializeTheme = async () => {
    try {
      isLoading.value = true

      // 获取可用主题列表
      const themesResponse = await themeApi.getThemes()
      if (themesResponse.success) {
        availableThemes.value = themesResponse.data.themes
      }

      // 从本地存储获取主题设置
      const savedTheme = localStorage.getItem('jntm_theme') || 'fire'
      const savedDarkMode = localStorage.getItem('jntm_dark_mode') === 'true'
      const savedPreferences = localStorage.getItem('jntm_theme_preferences')

      currentTheme.value = savedTheme
      isDarkMode.value = savedDarkMode

      if (savedPreferences) {
        try {
          userPreferences.value = JSON.parse(savedPreferences)
        } catch (error) {
          console.error('解析主题偏好失败:', error)
        }
      }

      // 应用主题
      applyTheme()
    } catch (error) {
      console.error('初始化主题失败:', error)
    } finally {
      isInitialized.value = true
      isLoading.value = false
    }
  }

  // 切换主题
  const switchTheme = async (themeKey: string, reason?: string) => {
    try {
      isLoading.value = true

      const response = await themeApi.switchTheme({
        theme_key: themeKey,
        switch_reason: reason
      })

      if (response.success) {
        currentTheme.value = themeKey
        localStorage.setItem('jntm_theme', themeKey)

        // 更新用户偏好
        if (response.data.newTheme) {
          updateThemeConfig(response.data.newTheme)
        }

        // 应用主题样式
        applyTheme()

        return response.data
      } else {
        throw new Error(response.message || '主题切换失败')
      }
    } catch (error) {
      console.error('主题切换失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 更新主题配置
  const updateThemeConfig = (theme: Theme) => {
    const index = availableThemes.value.findIndex(t => t.theme_key === theme.theme_key)
    if (index !== -1) {
      availableThemes.value[index] = theme
    } else {
      availableThemes.value.push(theme)
    }
  }

  // 应用主题样式
  const applyTheme = () => {
    const root = document.documentElement

    // 应用主题色彩
    if (currentThemeConfig.value) {
      const { primaryColor } = currentThemeConfig.value.config

      // 设置CSS变量
      root.style.setProperty('--el-color-primary', primaryColor)
      root.style.setProperty('--theme-primary', primaryColor)

      // 主题特定的颜色
      if (currentTheme.value === 'fire') {
        root.style.setProperty('--theme-light', '#f6ffed')
        root.style.setProperty('--theme-dark', '#389e0d')
      } else if (currentTheme.value === 'global') {
        root.style.setProperty('--theme-light', '#e6f7ff')
        root.style.setProperty('--theme-dark', '#0958d9')
      } else if (currentTheme.value === 'inflation') {
        root.style.setProperty('--theme-light', '#fff7e6')
        root.style.setProperty('--theme-dark', '#d46b08')
      }
    }

    // 应用暗色模式
    if (isDarkMode.value) {
      root.classList.add('dark')
      document.body.classList.add('dark-theme')
    } else {
      root.classList.remove('dark')
      document.body.classList.remove('dark-theme')
    }

    // 添加主题类名
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .trim()
    document.body.classList.add(`theme-${currentTheme.value}`)
  }

  // 切换暗色模式
  const toggleDarkMode = (enable?: boolean) => {
    isDarkMode.value = enable !== undefined ? enable : !isDarkMode.value
    localStorage.setItem('jntm_dark_mode', isDarkMode.value.toString())
    applyTheme()
  }

  // 更新用户偏好
  const updateUserPreferences = async (preferences: Record<string, any>) => {
    try {
      const response = await themeApi.updatePreferences({ preferences })

      if (response.success) {
        userPreferences.value = {
          ...userPreferences.value,
          [currentTheme.value]: preferences
        }
        localStorage.setItem('jntm_theme_preferences', JSON.stringify(userPreferences.value))
        return response.data
      } else {
        throw new Error(response.message || '更新偏好失败')
      }
    } catch (error) {
      console.error('更新用户偏好失败:', error)
      throw error
    }
  }

  // 获取当前主题的偏好设置
  const getCurrentPreferences = () => {
    return userPreferences.value[currentTheme.value] || {}
  }

  // 设置偏好值
  const setPreference = (key: string, value: any) => {
    userPreferences.value = {
      ...userPreferences.value,
      [currentTheme.value]: {
        ...userPreferences.value[currentTheme.value],
        [key]: value
      }
    }
    localStorage.setItem('jntm_theme_preferences', JSON.stringify(userPreferences.value))
  }

  // 获取偏好值
  const getPreference = (key: string, defaultValue?: any) => {
    const preferences = userPreferences.value[currentTheme.value] || {}
    return key in preferences ? preferences[key] : defaultValue
  }

  // 重置主题设置
  const resetTheme = () => {
    currentTheme.value = 'fire'
    isDarkMode.value = false
    userPreferences.value = {}

    localStorage.removeItem('jntm_theme')
    localStorage.removeItem('jntm_dark_mode')
    localStorage.removeItem('jntm_theme_preferences')

    applyTheme()
  }

  // 获取主题工具列表
  const getThemeTools = async (themeKey?: string) => {
    try {
      const targetTheme = themeKey || currentTheme.value
      const response = await themeApi.getThemeTools(targetTheme)

      if (response.success) {
        return response.data.tools
      } else {
        throw new Error(response.message || '获取主题工具失败')
      }
    } catch (error) {
      console.error('获取主题工具失败:', error)
      return []
    }
  }

  // 记录工具使用
  const recordToolUsage = async (toolName: string, usageData?: any) => {
    try {
      await themeApi.recordToolUsage({
        tool_name: toolName,
        usage_data: usageData
      })
    } catch (error) {
      console.error('记录工具使用失败:', error)
    }
  }

  // 获取主题使用统计
  const getThemeStats = async () => {
    try {
      const response = await themeApi.getThemeStats()

      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || '获取主题统计失败')
      }
    } catch (error) {
      console.error('获取主题统计失败:', error)
      return {
        themeUsage: [],
        toolUsage: []
      }
    }
  }

  return {
    // 状态
    currentTheme: readonly(currentTheme),
    availableThemes: readonly(availableThemes),
    userPreferences: readonly(userPreferences),
    isDarkMode: readonly(isDarkMode),
    isLoading: readonly(isLoading),
    isInitialized: readonly(isInitialized),

    // 计算属性
    currentThemeConfig,
    themeIcon,
    themeColor,
    themeFeatures,

    // 方法
    initializeTheme,
    switchTheme,
    applyTheme,
    toggleDarkMode,
    updateUserPreferences,
    getCurrentPreferences,
    setPreference,
    getPreference,
    resetTheme,
    getThemeTools,
    recordToolUsage,
    getThemeStats,
    updateThemeConfig
  }
})