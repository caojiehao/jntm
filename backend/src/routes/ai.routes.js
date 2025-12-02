import express from 'express'
import { authenticateToken } from '../middleware/auth.middleware.js'
import { validateAiAnalysisRequest } from '../middleware/validation.middleware.js'
import AiService from '../services/ai.service.js'

const router = express.Router()
const aiService = new AiService()

/**
 * AI分析接口
 * POST /api/v1/ai/analysis
 */
router.post('/analysis', authenticateToken, validateAiAnalysisRequest, async (req, res, next) => {
  try {
    const { analysis_type, request_text, context_data } = req.body

    const result = await aiService.generateAnalysis(
      req.user.id,
      analysis_type,
      request_text,
      context_data
    )

    res.json({
      success: true,
      message: 'AI分析完成',
      data: result
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 获取AI分析历史
 * GET /api/v1/ai/history
 */
router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const history = await aiService.getAnalysisHistory(req.user.id, parseInt(page), parseInt(limit))

    res.json({
      success: true,
      data: history
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 获取AI使用统计
 * GET /api/v1/ai/stats
 */
router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    const stats = await aiService.getAiUsageStats(req.user.id)

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 获取AI分析类型列表
 * GET /api/v1/ai/types
 */
router.get('/types', authenticateToken, async (req, res, next) => {
  try {
    const analysisTypes = [
      {
        type: 'portfolio_review',
        name: '投资组合复盘',
        description: '对您的投资组合进行全面的复盘分析'
      },
      {
        type: 'risk_assessment',
        name: '风险评估',
        description: '评估投资组合的风险状况和承受能力'
      },
      {
        type: 'market_outlook',
        name: '市场展望',
        description: '分析当前市场环境和未来走势'
      },
      {
        type: 'recommendation',
        name: '投资建议',
        description: '为您提供具体的投资建议和操作指导'
      }
    ]

    res.json({
      success: true,
      data: {
        types: analysisTypes
      }
    })
  } catch (error) {
    next(error)
  }
})

export default router