import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// 导入路由
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import fundRoutes from './routes/fund.routes.js'
import themeRoutes from './routes/theme.routes.js'
import aiRoutes from './routes/ai.routes.js'
import ocrRoutes from './routes/ocr.routes.js'

// 导入中间件
import { errorHandler } from './middleware/error.middleware.js'
import { notFound } from './middleware/notFound.middleware.js'

// 导入数据库
import { initDatabase } from './config/database.js'

// 配置环境变量
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '../.env') })

const app = express()
const PORT = process.env.PORT || 3000
const NODE_ENV = process.env.NODE_ENV || 'development'

// 基础中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// 请求速率限制
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分钟
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 限制每个IP 100个请求
  message: {
    error: '请求过于频繁，请稍后再试',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
})
app.use(limiter)

// 基础中间件
app.use(compression())
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1',
    environment: NODE_ENV
  })
})

// API路由
const apiVersion = process.env.API_VERSION || 'v1'
const apiRouter = express.Router()

// 注册路由
apiRouter.use('/auth', authRoutes)
apiRouter.use('/users', userRoutes)
apiRouter.use('/funds', fundRoutes)
apiRouter.use('/themes', themeRoutes)
apiRouter.use('/ai', aiRoutes)
apiRouter.use('/ocr', ocrRoutes)

// 应用API路由前缀
app.use(`/api/${apiVersion}`, apiRouter)

// 静态文件服务（用于上传的文件）
app.use('/uploads', express.static(join(__dirname, '../uploads')))

// 错误处理中间件
app.use(notFound)
app.use(errorHandler)

// 启动服务器
const startServer = async () => {
  try {
    // 初始化数据库
    await initDatabase()
    console.log('✅ 数据库初始化成功')

    app.listen(PORT, () => {
      console.log(`🚀 JNTM后端服务启动成功！`)
      console.log(`📍 服务地址: http://localhost:${PORT}`)
      console.log(`🌍 环境: ${NODE_ENV}`)
      console.log(`📊 API版本: ${apiVersion}`)
    })
  } catch (error) {
    console.error('❌ 服务器启动失败:', error)
    process.exit(1)
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在优雅关闭服务器...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在优雅关闭服务器...')
  process.exit(0)
})

// 未捕获的异常处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason)
  console.error('Promise:', promise)
  process.exit(1)
})

export default app