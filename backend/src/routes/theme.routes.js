import express from 'express'
import { authenticateToken, validateTheme } from '../middleware/auth.middleware.js'
import { validateThemeSwitch } from '../middleware/validation.middleware.js'
import { getDB } from '../config/database.js'
import ThemeService from '../services/theme.service.js'

const router = express.Router()
const themeService = new ThemeService()

/**
 * 获取所有可用主题
 * GET /api/v1/themes
 */
router.get('/', async (req, res, next) => {
  try {
    const db = getDB()
    const themes = await db.all(
      'SELECT theme_key, theme_name, theme_description, config_json FROM theme_configs WHERE is_active = 1 ORDER BY theme_key'
    )

    // 解析配置JSON
    const formattedThemes = themes.map(theme => ({
      ...theme,
      config: JSON.parse(theme.config_json || '{}')
    }))

    res.json({
      success: true,
      data: {
        themes: formattedThemes
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 获取用户当前主题
 * GET /api/v1/themes/current
 */
router.get('/current', authenticateToken, async (req, res, next) => {
  try {
    const db = getDB()
    const theme = await db.get(
      'SELECT * FROM theme_configs WHERE theme_key = ? AND is_active = 1',
      [req.user.current_theme || 'fire']
    )

    if (!theme) {
      const error = new Error('当前主题不存在')
      error.statusCode = 404
      error.code = 'THEME_NOT_FOUND'
      throw error
    }

    // 获取用户的主题偏好
    const userPreferences = await db.get(
      'SELECT preferences_json FROM user_theme_preferences WHERE user_id = ? AND theme_key = ?',
      [req.user.id, theme.theme_key]
    )

    const response = {
      ...theme,
      config: JSON.parse(theme.config_json || '{}'),
      userPreferences: userPreferences ? JSON.parse(userPreferences.preferences_json || '{}') : {}
    }

    res.json({
      success: true,
      data: {
        currentTheme: response
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 切换用户主题
 * POST /api/v1/themes/switch
 */
router.post('/switch', authenticateToken, validateThemeSwitch, async (req, res, next) => {
  try {
    const { theme_key, switch_reason } = req.body
    const db = getDB()

    // 验证主题是否存在
    const newTheme = await db.get(
      'SELECT * FROM theme_configs WHERE theme_key = ? AND is_active = 1',
      [theme_key]
    )

    if (!newTheme) {
      const error = new Error('目标主题不存在')
      error.statusCode = 404
      error.code = 'THEME_NOT_FOUND'
      throw error
    }

    const oldTheme = req.user.current_theme

    // 更新用户当前主题
    await db.run(
      'UPDATE users SET current_theme = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [theme_key, req.user.id]
    )

    // 记录主题切换历史
    await db.run(
      'INSERT INTO theme_switch_history (user_id, from_theme, to_theme, switch_reason) VALUES (?, ?, ?, ?)',
      [req.user.id, oldTheme, theme_key, switch_reason || null]
    )

    // 如果用户没有该主题的偏好设置，创建默认偏好
    const existingPreferences = await db.get(
      'SELECT id FROM user_theme_preferences WHERE user_id = ? AND theme_key = ?',
      [req.user.id, theme_key]
    )

    if (!existingPreferences) {
      const defaultPreferences = {
        notifications: true,
        autoAnalysis: true,
        riskLevel: 3,
        investmentHorizon: 'medium'
      }

      await db.run(
        'INSERT INTO user_theme_preferences (user_id, theme_key, preferences_json) VALUES (?, ?, ?)',
        [req.user.id, theme_key, JSON.stringify(defaultPreferences)]
      )
    }

    // 返回新主题信息
    const responseTheme = {
      ...newTheme,
      config: JSON.parse(newTheme.config_json || '{}')
    }

    res.json({
      success: true,
      message: `主题已切换到：${newTheme.theme_name}`,
      data: {
        newTheme: responseTheme,
        previousTheme: oldTheme
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 获取主题切换历史
 * GET /api/v1/themes/history
 */
router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit
    const db = getDB()

    const history = await db.all(
      `SELECT tsh.*, tc.theme_name as from_theme_name, tc2.theme_name as to_theme_name
       FROM theme_switch_history tsh
       LEFT JOIN theme_configs tc ON tsh.from_theme = tc.theme_key
       LEFT JOIN theme_configs tc2 ON tsh.to_theme = tc2.theme_key
       WHERE tsh.user_id = ?
       ORDER BY tsh.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, limit, offset]
    )

    const total = await db.get(
      'SELECT COUNT(*) as count FROM theme_switch_history WHERE user_id = ?',
      [req.user.id]
    )

    res.json({
      success: true,
      data: {
        history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total.count,
          totalPages: Math.ceil(total.count / limit)
        }
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 更新用户主题偏好
 * PUT /api/v1/themes/preferences
 */
router.put('/preferences', authenticateToken, validateTheme, async (req, res, next) => {
  try {
    const { preferences } = req.body
    const db = getDB()

    // 验证偏好设置数据
    if (!preferences || typeof preferences !== 'object') {
      const error = new Error('偏好设置格式无效')
      error.statusCode = 400
      error.code = 'INVALID_PREFERENCES'
      throw error
    }

    // 更新或插入用户偏好
    await db.run(
      `INSERT INTO user_theme_preferences (user_id, theme_key, preferences_json, updated_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, theme_key)
       DO UPDATE SET preferences_json = excluded.preferences_json, updated_at = CURRENT_TIMESTAMP`,
      [req.user.id, req.theme.theme_key, JSON.stringify(preferences)]
    )

    res.json({
      success: true,
      message: '主题偏好更新成功',
      data: {
        preferences
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 记录工具使用情况
 * POST /api/v1/themes/tools/usage
 */
router.post('/tools/usage', authenticateToken, async (req, res, next) => {
  try {
    const { tool_name, usage_data } = req.body

    if (!tool_name) {
      const error = new Error('工具名称是必填项')
      error.statusCode = 400
      error.code = 'TOOL_NAME_REQUIRED'
      throw error
    }

    const db = getDB()
    await db.run(
      'INSERT INTO theme_tool_usage (user_id, theme_key, tool_name, usage_data) VALUES (?, ?, ?, ?)',
      [req.user.id, req.user.current_theme || 'fire', tool_name, JSON.stringify(usage_data || {})]
    )

    res.json({
      success: true,
      message: '工具使用记录已保存'
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 获取主题使用统计
 * GET /api/v1/themes/stats
 */
router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    const db = getDB()

    // 获取各主题使用次数
    const themeUsage = await db.all(
      `SELECT theme_key, COUNT(*) as usage_count
       FROM theme_switch_history
       WHERE user_id = ?
       GROUP BY theme_key
       ORDER BY usage_count DESC`,
      [req.user.id]
    )

    // 获取工具使用统计
    const toolUsage = await db.all(
      `SELECT theme_key, tool_name, COUNT(*) as usage_count
       FROM theme_tool_usage
       WHERE user_id = ?
       GROUP BY theme_key, tool_name
       ORDER BY usage_count DESC
       LIMIT 10`,
      [req.user.id]
    )

    res.json({
      success: true,
      data: {
        themeUsage,
        toolUsage
      }
    })
  } catch (error) {
    next(error)
  }
})

export default router