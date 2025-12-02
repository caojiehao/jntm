#!/usr/bin/env node

/**
 * 数据库初始化脚本
 */
import { initDatabase } from '../config/database.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function main() {
  console.log('🚀 开始初始化数据库...')

  try {
    await initDatabase()
    console.log('✅ 数据库初始化完成！')
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { main as initDatabaseScript }