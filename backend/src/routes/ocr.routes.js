import express from 'express'
import { authenticateToken } from '../middleware/auth.middleware.js'
import { validateOcrRequest } from '../middleware/validation.middleware.js'

const router = express.Router()

// OCR路由已经集成到fund.routes.js中，这个文件保留但标记为已弃用
// 所有的OCR功能现在通过 /api/v1/funds/ocr 端点访问

/**
 * OCR识别接口（已弃用 - 请使用 /api/v1/funds/ocr）
 * POST /api/v1/ocr/recognize
 */
router.post('/recognize', authenticateToken, validateOcrRequest, async (req, res, next) => {
  try {
    res.status(301).json({
      success: false,
      message: 'OCR接口已迁移，请使用 /api/v1/funds/ocr',
      data: {
        newEndpoint: '/api/v1/funds/ocr'
      }
    })
  } catch (error) {
    next(error)
  }
})

export default router