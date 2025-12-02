#!/usr/bin/env node

/**
 * 种子数据脚本
 */
import { runSQL, getSQL, connectDB } from '../config/database.js'

async function seedFunds() {
  await connectDB()

  const seedFunds = [
    {
      fund_code: '110022',
      fund_name: '易方达消费行业',
      fund_type: '股票型',
      fund_company: '易方达基金',
      nav: 2.3421,
      nav_date: '2024-01-15',
      manager: '萧楠',
      fee_rate: 0.015,
      min_investment: 1
    },
    {
      fund_code: '000001',
      fund_name: '华夏成长',
      fund_type: '混合型',
      fund_company: '华夏基金',
      nav: 1.8934,
      nav_date: '2024-01-15',
      manager: '张峰',
      fee_rate: 0.015,
      min_investment: 1
    },
    {
      fund_code: '161725',
      fund_name: '招商中证白酒指数',
      fund_type: '指数型',
      fund_company: '招商基金',
      nav: 0.8765,
      nav_date: '2024-01-15',
      manager: '侯昊',
      fee_rate: 0.005,
      min_investment: 1
    },
    {
      fund_code: '110011',
      fund_name: '易方达中小盘',
      fund_type: '混合型',
      fund_company: '易方达基金',
      nav: 3.2156,
      nav_date: '2024-01-15',
      manager: '张坤',
      fee_rate: 0.015,
      min_investment: 1
    },
    {
      fund_code: '005827',
      fund_name: '易方达蓝筹精选',
      fund_type: '混合型',
      fund_company: '易方达基金',
      nav: 1.5432,
      nav_date: '2024-01-15',
      manager: '张坤',
      fee_rate: 0.015,
      min_investment: 1
    },
    {
      fund_code: '000478',
      fund_name: '建信中证红利潜力指数',
      fund_type: '指数型',
      fund_company: '建信基金',
      nav: 1.2345,
      nav_date: '2024-01-15',
      manager: '叶乐天',
      fee_rate: 0.005,
      min_investment: 1
    },
    {
      fund_code: '510300',
      fund_name: '华泰柏瑞沪深300ETF',
      fund_type: 'ETF',
      fund_company: '华泰柏瑞基金',
      nav: 3.8765,
      nav_date: '2024-01-15',
      manager: '柳军',
      fee_rate: 0.005,
      min_investment: 1
    },
    {
      fund_code: '510500',
      fund_name: '南方中证500ETF',
      fund_type: 'ETF',
      fund_company: '南方基金',
      nav: 6.5432,
      nav_date: '2024-01-15',
      manager: '孙伟',
      fee_rate: 0.005,
      min_investment: 1
    }
  ]

  console.log('📊 开始添加基金种子数据...')

  for (const fund of seedFunds) {
    try {
      await runSQL(
        `INSERT OR REPLACE INTO funds
         (fund_code, fund_name, fund_type, fund_company, nav, nav_date,
          manager, fee_rate, min_investment, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fund.fund_code,
          fund.fund_name,
          fund.fund_type,
          fund.fund_company,
          fund.nav,
          fund.nav_date,
          fund.manager,
          fund.fee_rate,
          fund.min_investment,
          1
        ]
      )
      console.log(`✅ 基金 ${fund.fund_code} - ${fund.fund_name} 添加成功`)
    } catch (error) {
      console.error(`❌ 基金 ${fund.fund_code} 添加失败:`, error)
    }
  }
}

async function main() {
  try {
    console.log('🌱 开始添加种子数据...')

    await seedFunds()

    console.log('✅ 种子数据添加完成！')
  } catch (error) {
    console.error('❌ 种子数据添加失败:', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { main as seedDataScript }