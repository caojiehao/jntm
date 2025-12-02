import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { authenticateToken } from '../middleware/auth.middleware.js'
import { validateFundAddition } from '../middleware/validation.middleware.js'
import FundService from '../services/fund.service.js'
import OcrService from '../services/ocr.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const router = express.Router()
const fundService = new FundService()
const ocrService = new OcrService()

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的文件格式，请上传JPG或PNG图片'), false)
    }
  }
})

/**
 * 获取用户基金列表
 * GET /api/v1/funds
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const portfolio = await fundService.getUserPortfolioSummary(req.user.id)

    res.json({
      success: true,
      data: portfolio
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 获取基金信息
 * GET /api/v1/funds/:fundCode
 */
router.get('/:fundCode', authenticateToken, async (req, res, next) => {
  try {
    const { fundCode } = req.params
    const fundInfo = await fundService.getFundInfo(fundCode)

    res.json({
      success: true,
      data: {
        fund: fundInfo
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 搜索基金
 * GET /api/v1/funds/search/:keyword
 */
router.get('/search/:keyword', authenticateToken, async (req, res, next) => {
  try {
    const { keyword } = req.params
    const { limit = 20 } = req.query

    const funds = await fundService.searchFunds(keyword, parseInt(limit))

    res.json({
      success: true,
      data: {
        funds,
        keyword
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 添加基金到用户持仓
 * POST /api/v1/funds
 */
router.post('/', authenticateToken, validateFundAddition, async (req, res, next) => {
  try {
    const { fund_code, shares, cost_price, purchase_date } = req.body
    const db = getDB()

    // 首先获取基金信息
    const fundInfo = await fundService.getFundInfo(fund_code)

    // 检查用户是否已持有该基金
    const existingHolding = await db.get(
      'SELECT id FROM user_funds WHERE user_id = ? AND fund_code = ? AND is_active = 1',
      [req.user.id, fund_code]
    )

    if (existingHolding) {
      const error = new Error('您已持有该基金')
      error.statusCode = 409
      error.code = 'FUND_ALREADY_OWNED'
      throw error
    }

    // 添加到用户持仓
    const result = await db.run(
      `INSERT INTO user_funds (user_id, fund_code, shares, cost_price, purchase_date)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, fund_code, shares, cost_price, purchase_date]
    )

    // 返回新增的持仓信息
    const newHolding = await db.get(
      `SELECT uf.*, f.fund_name, f.fund_type, f.fund_company, f.nav, f.nav_date
       FROM user_funds uf
       JOIN funds f ON uf.fund_code = f.fund_code
       WHERE uf.id = ?`,
      [result.lastID]
    )

    res.status(201).json({
      success: true,
      message: '基金添加成功',
      data: {
        holding: newHolding
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 更新基金持仓
 * PUT /api/v1/funds/:holdingId
 */
router.put('/:holdingId', authenticateToken, async (req, res, next) => {
  try {
    const { holdingId } = req.params
    const { shares, cost_price } = req.body
    const db = getDB()

    // 检查持仓是否属于当前用户
    const holding = await db.get(
      'SELECT id FROM user_funds WHERE id = ? AND user_id = ? AND is_active = 1',
      [holdingId, req.user.id]
    )

    if (!holding) {
      const error = new Error('持仓不存在')
      error.statusCode = 404
      error.code = 'HOLDING_NOT_FOUND'
      throw error
    }

    // 更新持仓
    await db.run(
      'UPDATE user_funds SET shares = ?, cost_price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [shares, cost_price, holdingId]
    )

    res.json({
      success: true,
      message: '持仓更新成功'
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 删除基金持仓
 * DELETE /api/v1/funds/:holdingId
 */
router.delete('/:holdingId', authenticateToken, async (req, res, next) => {
  try {
    const { holdingId } = req.params
    const db = getDB()

    // 检查持仓是否属于当前用户
    const holding = await db.get(
      'SELECT id FROM user_funds WHERE id = ? AND user_id = ? AND is_active = 1',
      [holdingId, req.user.id]
    )

    if (!holding) {
      const error = new Error('持仓不存在')
      error.statusCode = 404
      error.code = 'HOLDING_NOT_FOUND'
      throw error
    }

    // 软删除持仓
    await db.run(
      'UPDATE user_funds SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [holdingId]
    )

    res.json({
      success: true,
      message: '持仓删除成功'
    })
  } catch (error) {
    next(error)
  }
})

/**
 * OCR识别基金截图
 * POST /api/v1/funds/ocr
 */
router.post('/ocr', authenticateToken, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error('请上传图片文件')
      error.statusCode = 400
      error.code = 'NO_FILE_UPLOADED'
      throw error
    }

    const { fund_code_hint } = req.body

    // 执行OCR识别
    const ocrResult = await ocrService.recognizeFundScreenshot(
      req.user.id,
      req.file.path,
      fund_code_hint
    )

    res.json({
      success: true,
      message: 'OCR识别完成',
      data: ocrResult
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 获取OCR识别历史
 * GET /api/v1/funds/ocr/history
 */
router.get('/ocr/history', authenticateToken, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const history = await ocrService.getUserOcrHistory(req.user.id, parseInt(page), parseInt(limit))

    res.json({
      success: true,
      data: history
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 批量更新基金数据
 * POST /api/v1/funds/batch-update
 */
router.post('/batch-update', authenticateToken, async (req, res, next) => {
  try {
    const { fund_codes } = req.body

    if (!fund_codes || !Array.isArray(fund_codes)) {
      const error = new Error('请提供基金代码数组')
      error.statusCode = 400
      error.code = 'INVALID_FUND_CODES'
      throw error
    }

    const results = await fundService.batchUpdateFunds(fund_codes)

    res.json({
      success: true,
      message: '批量更新完成',
      data: results
    })
  } catch (error) {
    next(error)
  }
})

export default router