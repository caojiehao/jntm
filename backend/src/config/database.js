import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let db = null

/**
 * 初始化数据库连接
 */
export const connectDB = async () => {
  if (db) return db

  const dbPath = process.env.DB_PATH || join(__dirname, '../../database/jntm.db')

  try {
    // 确保数据库目录存在
    const dbDir = dirname(dbPath)
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

    // 创建数据库连接
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ 数据库连接失败:', err.message)
        throw err
      } else {
        console.log(`✅ SQLite数据库连接成功: ${dbPath}`)
      }
    })

    return db
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error)
    throw error
  }
}

/**
 * 获取数据库实例
 */
export const getDB = () => {
  if (!db) {
    throw new Error('数据库未初始化，请先调用 connectDB()')
  }
  return db
}

/**
 * 执行SQL的Promise封装
 */
const runSQL = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err)
      } else {
        resolve(this)
      }
    })
  })
}

/**
 * 执行查询的Promise封装
 */
const getSQL = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

/**
 * 执行查询所有结果的Promise封装
 */
const allSQL = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

/**
 * 创建用户表
 */
const createUsersTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      avatar VARCHAR(255),
      current_theme VARCHAR(20) DEFAULT 'fire',
      investment_goal TEXT,
      risk_tolerance INTEGER DEFAULT 3,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login_at DATETIME,
      is_active BOOLEAN DEFAULT 1
    )
  `
  await runSQL(sql)
}

/**
 * 创建基金表
 */
const createFundsTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS funds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fund_code VARCHAR(10) UNIQUE NOT NULL,
      fund_name VARCHAR(100) NOT NULL,
      fund_type VARCHAR(50),
      fund_company VARCHAR(100),
      nav REAL,
      nav_date DATE,
      total_assets REAL,
      established_date DATE,
      manager VARCHAR(100),
      benchmark VARCHAR(200),
      fee_rate REAL,
      min_investment REAL,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `
  await runSQL(sql)
}

/**
 * 创建用户基金持仓表
 */
const createUserFundsTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS user_funds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      fund_code VARCHAR(10) NOT NULL,
      shares REAL NOT NULL,
      cost_price REAL NOT NULL,
      purchase_date DATE NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (fund_code) REFERENCES funds (fund_code) ON DELETE CASCADE
    )
  `
  await runSQL(sql)
}

/**
 * 创建主题配置表
 */
const createThemeConfigsTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS theme_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      theme_key VARCHAR(20) UNIQUE NOT NULL,
      theme_name VARCHAR(50) NOT NULL,
      theme_description TEXT,
      config_json TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `
  await runSQL(sql)
}

/**
 * 创建用户主题偏好表
 */
const createUserThemePreferencesTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS user_theme_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      theme_key VARCHAR(20) NOT NULL,
      preferences_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `
  await runSQL(sql)
}

/**
 * 创建主题切换历史表
 */
const createThemeSwitchHistoryTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS theme_switch_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      from_theme VARCHAR(20),
      to_theme VARCHAR(20) NOT NULL,
      switch_reason VARCHAR(100),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `
  await runSQL(sql)
}

/**
 * 创建主题工具使用记录表
 */
const createThemeToolUsageTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS theme_tool_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      theme_key VARCHAR(20) NOT NULL,
      tool_name VARCHAR(50) NOT NULL,
      usage_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `
  await runSQL(sql)
}

/**
 * 创建AI分析记录表
 */
const createAiAnalysisTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS ai_analysis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      analysis_type VARCHAR(50) NOT NULL,
      request_text TEXT,
      response_text TEXT,
      model_used VARCHAR(50),
      tokens_used INTEGER,
      processing_time INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `
  await runSQL(sql)
}

/**
 * 创建OCR识别记录表
 */
const createOcrRecordsTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS ocr_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      original_image_path VARCHAR(255),
      ocr_result TEXT,
      extracted_fund_code VARCHAR(10),
      confidence_score REAL,
      processing_time INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `
  await runSQL(sql)
}

/**
 * 插入默认主题配置
 */
const insertDefaultThemes = async () => {
  const themes = [
    {
      theme_key: 'fire',
      theme_name: '提前退休',
      theme_description: 'FIRE (Financial Independence, Retire Early) 主题，专注于退休规划和被动收入分析',
      config_json: JSON.stringify({
        primaryColor: '#52c41a',
        icon: '🏖️',
        features: ['retirement_planning', 'passive_income', 'fire_calculator'],
        defaultMetrics: ['fire_number', 'withdrawal_rate', 'retirement_date']
      })
    },
    {
      theme_key: 'global',
      theme_name: '全球配置',
      theme_description: '全球投资配置主题，专注于国际市场和QDII基金分析',
      config_json: JSON.stringify({
        primaryColor: '#1890ff',
        icon: '🌍',
        features: ['global_allocation', 'currency_analysis', 'qdii_screening'],
        defaultMetrics: ['global_diversification', 'currency_risk', 'international_exposure']
      })
    },
    {
      theme_key: 'inflation',
      theme_name: '跑赢通胀',
      theme_description: '通胀保值主题，专注于实际收益率和购买力保护',
      config_json: JSON.stringify({
        primaryColor: '#fa8c16',
        icon: '💰',
        features: ['inflation_tracking', 'real_return', 'purchasing_power'],
        defaultMetrics: ['real_return_rate', 'inflation_beat_rate', 'purchasing_power_index']
      })
    }
  ]

  for (const theme of themes) {
    try {
      const existingTheme = await getSQL(
        'SELECT id FROM theme_configs WHERE theme_key = ?',
        [theme.theme_key]
      )

      if (!existingTheme) {
        await runSQL(
          `INSERT INTO theme_configs (theme_key, theme_name, theme_description, config_json)
           VALUES (?, ?, ?, ?)`,
          [theme.theme_key, theme.theme_name, theme.theme_description, theme.config_json]
        )
        console.log(`✅ 主题 ${theme.theme_name} 创建成功`)
      }
    } catch (error) {
      console.error(`❌ 主题 ${theme.theme_key} 创建失败:`, error)
    }
  }
}

/**
 * 初始化数据库
 */
export const initDatabase = async () => {
  try {
    await connectDB()

    console.log('📊 开始创建数据库表...')

    // 创建所有表
    await createUsersTable()
    console.log('✅ 用户表创建成功')

    await createFundsTable()
    console.log('✅ 基金表创建成功')

    await createUserFundsTable()
    console.log('✅ 用户基金持仓表创建成功')

    await createThemeConfigsTable()
    console.log('✅ 主题配置表创建成功')

    await createUserThemePreferencesTable()
    console.log('✅ 用户主题偏好表创建成功')

    await createThemeSwitchHistoryTable()
    console.log('✅ 主题切换历史表创建成功')

    await createThemeToolUsageTable()
    console.log('✅ 主题工具使用记录表创建成功')

    await createAiAnalysisTable()
    console.log('✅ AI分析记录表创建成功')

    await createOcrRecordsTable()
    console.log('✅ OCR识别记录表创建成功')

    // 插入默认数据
    await insertDefaultThemes()
    console.log('✅ 默认主题数据插入成功')

    console.log('✅ 数据库表创建和初始化完成')
    return db
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error)
    throw error
  }
}

/**
 * 关闭数据库连接
 */
export const closeDB = async () => {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('❌ 关闭数据库连接失败:', err.message)
      } else {
        console.log('✅ 数据库连接已关闭')
      }
    })
    db = null
  }
}

// 导出SQL执行函数供其他模块使用
export { runSQL, getSQL, allSQL }