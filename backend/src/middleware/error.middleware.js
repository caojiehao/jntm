/**
 * 全局错误处理中间件
 */
export const errorHandler = (error, req, res, next) => {
  console.error('错误详情:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  })

  // 默认错误响应
  let statusCode = 500
  let message = '服务器内部错误'
  let code = 'INTERNAL_SERVER_ERROR'

  // 处理特定类型的错误
  if (error.name === 'ValidationError') {
    statusCode = 400
    message = '数据验证失败'
    code = 'VALIDATION_ERROR'
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401
    message = '未授权访问'
    code = 'UNAUTHORIZED'
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403
    message = '禁止访问'
    code = 'FORBIDDEN'
  } else if (error.name === 'NotFoundError') {
    statusCode = 404
    message = '资源未找到'
    code = 'NOT_FOUND'
  } else if (error.name === 'ConflictError') {
    statusCode = 409
    message = '资源冲突'
    code = 'CONFLICT'
  } else if (error.name === 'RateLimitError') {
    statusCode = 429
    message = '请求过于频繁'
    code = 'RATE_LIMIT_EXCEEDED'
  }

  // 自定义错误消息
  if (error.message) {
    message = error.message
  }

  // 开发环境返回详细错误信息
  const isDevelopment = process.env.NODE_ENV === 'development'

  const errorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(isDevelopment && {
        stack: error.stack,
        details: error.details || null
      })
    },
    timestamp: new Date().toISOString(),
    path: req.url
  }

  res.status(statusCode).json(errorResponse)
}

/**
 * 404 错误处理中间件
 */
export const notFound = (req, res, next) => {
  const error = new Error(`路径 ${req.originalUrl} 未找到`)
  error.statusCode = 404
  error.code = 'NOT_FOUND'
  next(error)
}