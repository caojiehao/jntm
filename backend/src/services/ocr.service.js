import { getDB } from '../config/database.js'

/**
 * OCR识别服务
 */
class OcrService {
  constructor() {
    this.tencentSecretId = process.env.TENCENT_SECRET_ID
    this.tencentSecretKey = process.env.TENCENT_SECRET_KEY
    this.tencentRegion = process.env.TENCENT_OCR_REGION || 'ap-beijing'
  }

  /**
   * 识别基金截图中的基金代码
   */
  async recognizeFundScreenshot(userId, imagePath, fundCodeHint = null) {
    try {
      const startTime = Date.now()

      // 1. OCR文字识别
      const ocrResult = await this.performOCR(imagePath)

      // 2. 提取基金代码
      const fundCode = this.extractFundCode(ocrResult, fundCodeHint)

      // 3. 计算置信度
      const confidence = this.calculateConfidence(ocrResult, fundCode, fundCodeHint)

      // 4. 记录识别结果
      await this.saveOcrRecord(userId, imagePath, ocrResult, fundCode, confidence, Date.now() - startTime)

      return {
        fundCode,
        confidence,
        ocrResult,
        processingTime: Date.now() - startTime
      }
    } catch (error) {
      console.error('OCR识别失败:', error)
      throw new Error(`OCR识别失败: ${error.message}`)
    }
  }

  /**
   * 执行OCR文字识别
   */
  async performOCR(imagePath) {
    try {
      // 模拟OCR识别结果（实际应用中调用腾讯云OCR API）
      const mockOcrResult = {
        TextDetections: [
          { Text: '基金代码：110022', 'DetectedText': '110022' },
          { Text: '易方达消费行业', 'DetectedText': '易方达消费行业' },
          { Text: '单位净值：2.3421', 'DetectedText': '2.3421' },
          { Text: '日涨幅：+1.23%', 'DetectedText': '+1.23%' },
          { Text: '最新净值：2024-01-15', 'DetectedText': '2024-01-15' }
        ]
      }

      return mockOcrResult
    } catch (error) {
      console.error('OCR API调用失败:', error)
      throw new Error('OCR服务暂时不可用')
    }
  }

  /**
   * 从OCR结果中提取基金代码
   */
  extractFundCode(ocrResult, hint = null) {
    if (!ocrResult.TextDetections || ocrResult.TextDetections.length === 0) {
      return null
    }

    const allText = ocrResult.TextDetections
      .map(item => item.DetectedText || item.Text)
      .join(' ')

    // 1. 优先使用提示的基金代码
    if (hint && this.isValidFundCode(hint)) {
      // 检查提示的代码是否在OCR结果中
      if (allText.includes(hint)) {
        return hint
      }
    }

    // 2. 使用正则表达式查找6位数字
    const fundCodeRegex = /\b\d{6}\b/g
    const matches = allText.match(fundCodeRegex)

    if (matches && matches.length > 0) {
      // 过滤掉明显不是基金代码的数字（如日期、金额等）
      const validCodes = matches.filter(code => this.isValidFundCode(code))

      if (validCodes.length > 0) {
        // 返回第一个有效的基金代码
        return validCodes[0]
      }
    }

    // 3. 查找"基金代码"关键词后的数字
    const codeKeywordRegex = /(?:基金代码|基金编号|代码)[:：]?\s*(\d{6})/
    const keywordMatch = allText.match(codeKeywordRegex)

    if (keywordMatch && keywordMatch[1]) {
      return keywordMatch[1]
    }

    return null
  }

  /**
   * 验证基金代码是否有效
   */
  isValidFundCode(code) {
    // 基金代码规则：6位数字，且符合常见的基金代码前缀
    if (!/^\d{6}$/.test(code)) {
      return false
    }

    // 常见的基金代码前缀
    const validPrefixes = [
      '000', // 华南、广发等
      '001', // 华夏、工银瑞信等
      '002', // 易方达、汇添富等
      '003', // 南方、嘉实等
      '004', // 建信、华安等
      '005', // 博时、银华等
      '110', // 易方达
      '161', // 富国
      '163', // 长信
      '167', // 长城
      '169', // 东方
      '180', // 华宝兴业
      '206', // 泰达宏利
      '213', // 国投瑞银
      '217', // 招商
      '233', // 大成
      '240', // 华商
      '257', // 景顺长城
      '260', // 景顺长城
      '270', // 广发
      '288', // 华夏
      '290', // 泰信
      '310', // 申万菱信
      '320', // 诺安
      '340', // 兴全
      '360', // 光大保德信
      '377', // 上投摩根
      '398', // 中邮
      '410', // 华富
      '420', // 天弘
      '460', // 华泰柏瑞
      '481', // 工银瑞信
      '487', // 工银瑞信
      '510', // 易方达
      '511', // 银华
      '512', // 南方
      '513', // 广发
      '515', // 国泰
      '516', // 招商
      '518', // 华宝
      '519', // 长信
      '560', // 华泰柏瑞
      '562', // 华泰柏瑞
      '563', // 华泰柏瑞
      '588', // 南方
      '610', // 华宝
      '630', // 华安
      '688', // 华宝
    ]

    const prefix = code.substring(0, 3)
    return validPrefixes.includes(prefix)
  }

  /**
   * 计算识别置信度
   */
  calculateConfidence(ocrResult, fundCode, hint) {
    let confidence = 0

    if (!fundCode) {
      return 0
    }

    // 基础分数：成功提取到基金代码
    confidence += 40

    // 如果有提示且匹配成功，额外加分
    if (hint && hint === fundCode) {
      confidence += 30
    }

    // 如果OCR结果中明确包含"基金代码"关键词，加分
    const allText = ocrResult.TextDetections
      .map(item => item.DetectedText || item.Text)
      .join(' ')

    if (allText.includes('基金代码') || allText.includes('基金编号')) {
      confidence += 20
    }

    // 如果基金代码格式完全正确，加分
    if (this.isValidFundCode(fundCode)) {
      confidence += 10
    }

    return Math.min(confidence, 100)
  }

  /**
   * 保存OCR识别记录
   */
  async saveOcrRecord(userId, imagePath, ocrResult, fundCode, confidence, processingTime) {
    const db = getDB()

    await db.run(
      `INSERT INTO ocr_records
       (user_id, original_image_path, ocr_result, extracted_fund_code, confidence_score, processing_time)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        imagePath,
        JSON.stringify(ocrResult),
        fundCode,
        confidence,
        processingTime
      ]
    )
  }

  /**
   * 获取用户OCR识别历史
   */
  async getUserOcrHistory(userId, page = 1, limit = 20) {
    const db = getDB()
    const offset = (page - 1) * limit

    const records = await db.all(
      `SELECT id, extracted_fund_code, confidence_score, processing_time, created_at
       FROM ocr_records
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    )

    const total = await db.get(
      'SELECT COUNT(*) as count FROM ocr_records WHERE user_id = ?',
      [userId]
    )

    return {
      records,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        totalPages: Math.ceil(total.count / limit)
      }
    }
  }

  /**
   * 验证图片文件
   */
  validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('不支持的文件格式，请上传JPG或PNG图片')
    }

    if (file.size > maxSize) {
      throw new Error('文件大小不能超过10MB')
    }

    return true
  }

  /**
   * 图片预处理（提高OCR识别率）
   */
  async preprocessImage(imagePath) {
    // TODO: 实现图片预处理逻辑
    // 1. 图片压缩
    // 2. 图片旋转校正
    // 3. 对比度调整
    // 4. 噪点去除
    return imagePath
  }
}

export default OcrService