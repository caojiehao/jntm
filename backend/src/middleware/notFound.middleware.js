/**
 * 404 Not Found 中间件
 */
export const notFound = (req, res, next) => {
  const error = new Error(`路径 ${req.originalUrl} 未找到`)
  error.statusCode = 404
  error.code = 'NOT_FOUND'
  next(error)
}