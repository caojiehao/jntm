import express from 'express'
import { authenticateToken } from '../middleware/auth.middleware.js'
import { validateUserProfileUpdate } from '../middleware/validation.middleware.js'
import { getDB } from '../config/database.js'

const router = express.Router()

/**
 * 获取用户资料
 * GET /api/v1/users/profile
 */
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const db = getDB()
    const user = await db.get(
      `SELECT id, username, email, phone, avatar, current_theme, investment_goal,
              risk_tolerance, created_at, updated_at, last_login_at
       FROM users WHERE id = ?`,
      [req.user.id]
    )

    res.json({
      success: true,
      data: {
        user
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 更新用户资料
 * PUT /api/v1/users/profile
 */
router.put('/profile', authenticateToken, validateUserProfileUpdate, async (req, res, next) => {
  try {
    const { username, phone, investment_goal, risk_tolerance } = req.body
    const db = getDB()

    // 检查用户名是否已存在（如果要更新用户名）
    if (username && username !== req.user.username) {
      const existingUser = await db.get(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, req.user.id]
      )

      if (existingUser) {
        const error = new Error('用户名已存在')
        error.statusCode = 409
        error.code = 'USERNAME_EXISTS'
        throw error
      }
    }

    // 构建更新字段
    const updateFields = []
    const updateValues = []

    if (username !== undefined) {
      updateFields.push('username = ?')
      updateValues.push(username)
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?')
      updateValues.push(phone)
    }
    if (investment_goal !== undefined) {
      updateFields.push('investment_goal = ?')
      updateValues.push(investment_goal)
    }
    if (risk_tolerance !== undefined) {
      updateFields.push('risk_tolerance = ?')
      updateValues.push(risk_tolerance)
    }

    if (updateFields.length === 0) {
      const error = new Error('没有需要更新的字段')
      error.statusCode = 400
      error.code = 'NO_UPDATE_FIELDS'
      throw error
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP')
    updateValues.push(req.user.id)

    // 执行更新
    await db.run(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    )

    // 获取更新后的用户信息
    const updatedUser = await db.get(
      `SELECT id, username, email, phone, avatar, current_theme, investment_goal,
              risk_tolerance, created_at, updated_at, last_login_at
       FROM users WHERE id = ?`,
      [req.user.id]
    )

    res.json({
      success: true,
      message: '用户资料更新成功',
      data: {
        user: updatedUser
      }
    })
  } catch (error) {
    next(error)
  }
})

export default router