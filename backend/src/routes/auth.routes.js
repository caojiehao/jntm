import express from 'express'
import bcrypt from 'bcryptjs'
import {
  authenticateToken,
  generateToken
} from '../middleware/auth.middleware.js'
import {
  validateUserRegistration,
  validateUserLogin
} from '../middleware/validation.middleware.js'
import { getDB, runSQL, getSQL } from '../config/database.js'

const router = express.Router()

/**
 * 用户注册
 * POST /api/v1/auth/register
 */
router.post('/register', validateUserRegistration, async (req, res, next) => {
  try {
    const { username, email, password, phone } = req.body
    const db = getDB()

    // 检查用户名是否已存在
    const existingUser = await getSQL(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    )

    if (existingUser) {
      const error = new Error('用户名或邮箱已存在')
      error.statusCode = 409
      error.code = 'USER_EXISTS'
      throw error
    }

    // 加密密码
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // 创建新用户
    const result = await runSQL(
      `INSERT INTO users (username, email, password_hash, phone, current_theme)
       VALUES (?, ?, ?, ?, ?)`,
      [username, email, passwordHash, phone, 'fire']
    )

    // 获取新创建的用户信息（不包含密码）
    const newUser = await getSQL(
      'SELECT id, username, email, phone, current_theme, created_at FROM users WHERE id = ?',
      [result.lastID]
    )

    // 生成JWT令牌
    const token = generateToken(newUser.id)

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: newUser,
        token
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 用户登录
 * POST /api/v1/auth/login
 */
router.post('/login', validateUserLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body
    const db = getDB()

    // 查找用户
    const user = await getSQL(
      'SELECT id, username, email, password_hash, phone, current_theme, is_active FROM users WHERE email = ?',
      [email]
    )

    if (!user) {
      const error = new Error('邮箱或密码错误')
      error.statusCode = 401
      error.code = 'INVALID_CREDENTIALS'
      throw error
    }

    if (!user.is_active) {
      const error = new Error('账户已被禁用，请联系管理员')
      error.statusCode = 401
      error.code = 'ACCOUNT_DISABLED'
      throw error
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      const error = new Error('邮箱或密码错误')
      error.statusCode = 401
      error.code = 'INVALID_CREDENTIALS'
      throw error
    }

    // 更新最后登录时间
    await runSQL(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    )

    // 生成JWT令牌
    const token = generateToken(user.id)

    // 移除密码哈希
    delete user.password_hash

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user,
        token
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 验证令牌
 * GET /api/v1/auth/verify
 */
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    // 从数据库重新获取最新的用户信息
    const user = await getSQL(
      'SELECT id, username, email, phone, current_theme, is_active FROM users WHERE id = ?',
      [req.user.id]
    )

    res.json({
      success: true,
      message: '令牌有效',
      data: {
        user: user || req.user
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 刷新令牌
 * POST /api/v1/auth/refresh
 */
router.post('/refresh', authenticateToken, async (req, res, next) => {
  try {
    const newToken = generateToken(req.user.id)

    res.json({
      success: true,
      message: '令牌刷新成功',
      data: {
        token: newToken
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 登出（客户端处理，服务端记录）
 * POST /api/v1/auth/logout
 */
router.post('/logout', authenticateToken, async (req, res) => {
  // 在实际应用中，可以将令牌加入黑名单
  // 目前只返回成功响应
  res.json({
    success: true,
    message: '登出成功'
  })
})

export default router