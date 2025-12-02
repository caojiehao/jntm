import jwt from 'jsonwebtoken'
import { getDB } from '../config/database.js'

/**
 * JWT认证中间件
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      const error = new Error('访问令牌缺失')
      error.statusCode = 401
      error.code = 'TOKEN_MISSING'
      throw error
    }

    // 验证JWT令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 从数据库获取用户信息
    const db = getDB()
    const user = await db.get(
      'SELECT id, username, email, current_theme, is_active FROM users WHERE id = ?',
      [decoded.userId]
    )

    if (!user) {
      const error = new Error('用户不存在')
      error.statusCode = 401
      error.code = 'USER_NOT_FOUND'
      throw error
    }

    if (!user.is_active) {
      const error = new Error('用户账户已被禁用')
      error.statusCode = 401
      error.code = 'USER_INACTIVE'
      throw error
    }

    // 将用户信息添加到请求对象
    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      const jwtError = new Error('无效的访问令牌')
      jwtError.statusCode = 401
      jwtError.code = 'INVALID_TOKEN'
      return next(jwtError)
    } else if (error.name === 'TokenExpiredError') {
      const expiredError = new Error('访问令牌已过期')
      expiredError.statusCode = 401
      expiredError.code = 'TOKEN_EXPIRED'
      return next(expiredError)
    }
    next(error)
  }
}

/**
 * 可选认证中间件（不强制要求登录）
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const db = getDB()
      const user = await db.get(
        'SELECT id, username, email, current_theme FROM users WHERE id = ?',
        [decoded.userId]
      )
      req.user = user
    }

    next()
  } catch (error) {
    // 可选认证失败时不抛出错误，继续执行
    next()
  }
}

/**
 * 主题验证中间件 - 确保用户选择了有效的主题
 */
export const validateTheme = async (req, res, next) => {
  try {
    if (!req.user) {
      const error = new Error('需要用户认证')
      error.statusCode = 401
      error.code = 'AUTH_REQUIRED'
      throw error
    }

    const db = getDB()
    const theme = await db.get(
      'SELECT * FROM theme_configs WHERE theme_key = ? AND is_active = 1',
      [req.user.current_theme || 'fire']
    )

    if (!theme) {
      const error = new Error('无效的用户主题')
      error.statusCode = 400
      error.code = 'INVALID_THEME'
      throw error
    }

    req.theme = theme
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * 生成JWT令牌
 */
export const generateToken = (userId, expiresIn = process.env.JWT_EXPIRES_IN || '7d') => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn }
  )
}

/**
 * 验证令牌（不查询数据库）
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}