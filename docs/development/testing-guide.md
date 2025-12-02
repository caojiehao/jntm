# 测试指南

## 测试策略

### 测试金字塔
```
    /\
   /  \
  / E2E \     <- 少量端到端测试
 /______\
/        \
/Integration\ <- 适量集成测试
/__________\
/          \
/   Unit    \  <- 大量单元测试
/__________\
```

### 测试分类

#### 1. 单元测试 (Unit Tests)
- **范围**：测试独立的函数、组件、模块
- **目标**：验证代码逻辑正确性
- **覆盖率**：目标 > 80%

#### 2. 集成测试 (Integration Tests)
- **范围**：测试多个模块的协作
- **目标**：验证模块间接口正确性
- **重点**：数据库、API、外部服务集成

#### 3. 端到端测试 (E2E Tests)
- **范围**：模拟用户完整操作流程
- **目标**：验证系统整体功能
- **场景**：关键业务流程

## 前端测试

### 测试工具栈
```json
{
  "jest": "测试框架",
  "@vue/test-utils": "Vue 组件测试工具",
  "vue-jest": "Vue 单文件组件处理器",
  "babel-jest": "ES6+ 转译",
  "@testing-library/vue": "用户行为测试",
  "cypress": "E2E 测试框架"
}
```

### 配置文件

#### Jest 配置 (`jest.config.js`)
```javascript
module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json', 'vue'],
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\js$': 'babel-jest'
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/main.js',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
```

#### 测试环境设置 (`tests/setup.js`)
```javascript
import { config } from '@vue/test-utils'
import ElementPlus from 'element-plus'

// 全局配置 Element Plus
config.global.plugins = [ElementPlus]

// Mock 全局对象
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
global.localStorage = localStorageMock
```

### 单元测试示例

#### 工具函数测试 (`tests/unit/utils/fundCalculator.test.js`)
```javascript
import { calculateReturn, calculateRiskMetrics } from '@/utils/fundCalculator'

describe('FundCalculator', () => {
  describe('calculateReturn', () => {
    test('应该正确计算正收益', () => {
      const result = calculateReturn(1000, 1200, 365)
      expect(result.returnRate).toBe(0.2)
      expect(result.annualizedRate).toBeCloseTo(0.2, 2)
    })

    test('应该正确计算负收益', () => {
      const result = calculateReturn(1000, 800, 365)
      expect(result.returnRate).toBe(-0.2)
      expect(result.annualizedRate).toBeCloseTo(-0.2, 2)
    })

    test('应该处理零成本输入', () => {
      expect(() => calculateReturn(0, 1000, 365)).toThrow('成本必须大于零')
    })

    test('应该处理负天数输入', () => {
      expect(() => calculateReturn(1000, 1200, -30)).toThrow('持有天数必须大于零')
    })
  })

  describe('calculateRiskMetrics', () => {
    test('应该计算正确的风险指标', () => {
      const returns = [0.1, -0.05, 0.15, -0.02, 0.08]
      const result = calculateRiskMetrics(returns)

      expect(result.volatility).toBeGreaterThan(0)
      expect(result.sharpeRatio).toBeDefined()
      expect(result.maxDrawdown).toBeLessThanOrEqual(0)
    })
  })
})
```

#### Vue 组件测试 (`tests/unit/components/FundCard.test.js`)
```javascript
import { mount } from '@vue/test-utils'
import FundCard from '@/components/FundCard.vue'

describe('FundCard', () => {
  const mockFund = {
    id: '001',
    code: '110022',
    name: '易方达消费行业股票',
    nav: 1.2345,
    change: 0.0234,
    changePercent: 1.93
  }

  test('应该正确渲染基金信息', () => {
    const wrapper = mount(FundCard, {
      props: { fund: mockFund }
    })

    expect(wrapper.find('.fund-code').text()).toBe('110022')
    expect(wrapper.find('.fund-name').text()).toBe('易方达消费行业股票')
    expect(wrapper.find('.fund-nav').text()).toContain('1.2345')
  })

  test('应该根据涨跌显示正确颜色', () => {
    const wrapper = mount(FundCard, {
      props: { fund: mockFund }
    })

    const changeElement = wrapper.find('.fund-change')
    expect(changeElement.classes()).toContain('positive')
  })

  test('应该触发点击事件', async () => {
    const wrapper = mount(FundCard, {
      props: { fund: mockFund }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('click')
    expect(wrapper.emitted().click[0]).toEqual([mockFund])
  })

  test('应该处理空数据', () => {
    const wrapper = mount(FundCard, {
      props: { fund: null }
    })

    expect(wrapper.find('.fund-info').exists()).toBe(false)
  })
})
```

#### Store 测试 (`tests/unit/stores/fundStore.test.js`)
```javascript
import { createPinia, setActivePinia } from 'pinia'
import { useFundStore } from '@/stores/fundStore'

// Mock API
jest.mock('@/api/fundApi', () => ({
  getFunds: jest.fn(() => Promise.resolve({
    data: [
      { id: '1', code: '110022', name: '基金1' },
      { id: '2', code: '161039', name: '基金2' }
    ]
  }))
}))

describe('FundStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  test('应该初始化为空状态', () => {
    const store = useFundStore()
    expect(store.funds).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
  })

  test('应该获取基金列表', async () => {
    const store = useFundStore()

    await store.fetchFunds()

    expect(store.loading).toBe(false)
    expect(store.funds).toHaveLength(2)
    expect(store.funds[0].code).toBe('110022')
  })

  test('应该处理获取基金列表错误', async () => {
    const { getFunds } = require('@/api/fundApi')
    getFunds.mockRejectedValue(new Error('网络错误'))

    const store = useFundStore()

    await expect(store.fetchFunds()).rejects.toThrow('网络错误')
    expect(store.error).toBe('网络错误')
  })

  test('应该按基金ID查找基金', () => {
    const store = useFundStore()
    store.funds = [
      { id: '1', code: '110022' },
      { id: '2', code: '161039' }
    ]

    const fund = store.getFundById('1')
    expect(fund.code).toBe('110022')
  })
})
```

### 集成测试示例

#### API 集成测试 (`tests/integration/fundApi.test.js`)
```javascript
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { getFunds, getFundDetail } from '@/api/fundApi'

describe('Fund API Integration', () => {
  let mockAxios

  beforeEach(() => {
    mockAxios = new MockAdapter(axios)
  })

  afterEach(() => {
    mockAxios.restore()
  })

  test('应该获取基金列表', async () => {
    const mockData = {
      success: true,
      data: [
        { id: '1', code: '110022', name: '基金1' }
      ]
    }

    mockAxios.onGet('/api/funds').reply(200, mockData)

    const result = await getFunds()

    expect(result.data).toEqual(mockData.data)
    expect(mockAxios.history.get[0].url).toBe('/api/funds')
  })

  test('应该处理API错误', async () => {
    mockAxios.onGet('/api/funds').reply(500, {
      success: false,
      message: '服务器错误'
    })

    await expect(getFunds()).rejects.toThrow()
  })
})
```

### E2E 测试示例

#### Cypress 测试 (`cypress/e2e/fund-management.cy.js`)
```javascript
describe('基金管理功能', () => {
  beforeEach(() => {
    // 登录
    cy.visit('/login')
    cy.get('[data-testid="username"]').type('testuser')
    cy.get('[data-testid="password"]').type('password123')
    cy.get('[data-testid="login-button"]').click()

    // 验证登录成功
    cy.url().should('include', '/dashboard')
  })

  it('应该能够添加基金持仓', () => {
    // 导航到持仓管理页面
    cy.get('[data-testid="portfolio-menu"]').click()
    cy.get('[data-testid="add-fund-button"]').click()

    // 填写基金信息
    cy.get('[data-testid="fund-code"]').type('110022')
    cy.get('[data-testid="fund-shares"]').type('1000')
    cy.get('[data-testid="purchase-date"]').type('2024-01-01')

    // 提交表单
    cy.get('[data-testid="submit-button"]').click()

    // 验证基金已添加
    cy.get('[data-testid="fund-list"]').should('contain', '110022')
    cy.get('[data-testid="success-message"]').should('be.visible')
  })

  it('应该能够上传截图识别基金', () => {
    cy.get('[data-testid="ocr-upload"]').selectFile('cypress/fixtures/fund-screenshot.png')
    cy.get('[data-testid="recognize-button"]').click()

    // 等待识别完成
    cy.get('[data-testid="recognition-result"]').should('be.visible')
    cy.get('[data-testid="confirm-button"]').click()

    // 验证识别结果已保存
    cy.get('[data-testid="fund-list"]').should('have.length.greaterThan', 0)
  })

  it('应该能够使用AI分析功能', () => {
    // 确保有基金数据
    cy.get('[data-testid="fund-item"]').first().click()
    cy.get('[data-testid="ai-analysis-tab"]').click()
    cy.get('[data-testid="analyze-button"]').click()

    // 等待分析完成
    cy.get('[data-testid="analysis-result"]').should('be.visible')
    cy.get('[data-testid="risk-assessment"]').should('exist')
    cy.get('[data-testid="suggestions"]').should('exist')
  })
})
```

## 后端测试

### 测试工具栈
```json
{
  "jest": "测试框架",
  "supertest": "HTTP 测试",
  "sqlite3": "内存数据库测试",
  "nock": "HTTP Mock"
}
```

### 配置文件

#### Jest 配置 (`jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
}
```

#### 测试环境设置 (`tests/setup.js`)
```javascript
const { initDatabase } = require('../src/database')

// 测试前初始化数据库
beforeAll(async () => {
  await initDatabase(':memory:')
})

// 每个测试后清理数据库
afterEach(async () => {
  const db = require('../src/database').getConnection()
  await db.exec('DELETE FROM user_portfolios')
  await db.exec('DELETE FROM users')
})

// 测试后关闭连接
afterAll(async () => {
  const db = require('../src/database').getConnection()
  await db.close()
})
```

### 单元测试示例

#### 服务层测试 (`tests/unit/services/fundService.test.js`)
```javascript
const FundService = require('../../../src/services/fundService')
const FundModel = require('../../../src/models/fundModel')

jest.mock('../../../src/models/fundModel')

describe('FundService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getFundByCode', () => {
    test('应该成功获取基金信息', async () => {
      const mockFund = {
        code: '110022',
        name: '易方达消费行业股票',
        type: '股票型'
      }

      FundModel.findByCode.mockResolvedValue(mockFund)

      const result = await FundService.getFundByCode('110022')

      expect(FundModel.findByCode).toHaveBeenCalledWith('110022')
      expect(result).toEqual(mockFund)
    })

    test('应该处理基金不存在的情况', async () => {
      FundModel.findByCode.mockResolvedValue(null)

      await expect(FundService.getFundByCode('999999'))
        .rejects.toThrow('基金不存在')
    })

    test('应该处理数据库错误', async () => {
      FundModel.findByCode.mockRejectedValue(new Error('数据库连接失败'))

      await expect(FundService.getFundByCode('110022'))
        .rejects.toThrow('数据库连接失败')
    })
  })

  describe('updateFundNav', () => {
    test('应该成功更新基金净值', async () => {
      const updateData = {
        code: '110022',
        nav: 1.2345,
        navDate: '2024-01-01'
      }

      FundModel.updateNav.mockResolvedValue(true)

      const result = await FundService.updateFundNav(updateData)

      expect(FundModel.updateNav).toHaveBeenCalledWith(updateData)
      expect(result).toBe(true)
    })
  })
})
```

#### 控制器测试 (`tests/unit/controllers/fundController.test.js`)
```javascript
const request = require('supertest')
const app = require('../../../src/app')
const FundService = require('../../../src/services/fundService')

jest.mock('../../../src/services/fundService')

describe('FundController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/funds', () => {
    test('应该返回基金列表', async () => {
      const mockFunds = [
        { code: '110022', name: '基金1' },
        { code: '161039', name: '基金2' }
      ]

      FundService.getAllFunds.mockResolvedValue(mockFunds)

      const response = await request(app)
        .get('/api/funds')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockFunds)
    })

    test('应该处理服务器错误', async () => {
      FundService.getAllFunds.mockRejectedValue(new Error('服务器错误'))

      const response = await request(app)
        .get('/api/funds')
        .expect(500)

      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/funds/:code', () => {
    test('应该返回指定基金信息', async () => {
      const mockFund = {
        code: '110022',
        name: '易方达消费行业股票'
      }

      FundService.getFundByCode.mockResolvedValue(mockFund)

      const response = await request(app)
        .get('/api/funds/110022')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockFund)
    })

    test('应该处理基金不存在的情况', async () => {
      FundService.getFundByCode.mockRejectedValue(new Error('基金不存在'))

      const response = await request(app)
        .get('/api/funds/999999')
        .expect(404)

      expect(response.body.success).toBe(false)
    })
  })
})
```

### 集成测试示例

#### API 集成测试 (`tests/integration/api.test.js`)
```javascript
const request = require('supertest')
const app = require('../../src/app')
const db = require('../../src/database')

describe('API Integration Tests', () => {
  let authToken

  beforeAll(async () => {
    // 创建测试用户并获取token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      })

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password123'
      })

    authToken = loginResponse.body.data.token
  })

  describe('用户持仓管理', () => {
    test('应该能够添加基金持仓', async () => {
      const portfolioData = {
        fundCode: '110022',
        shares: 1000,
        costPrice: 1.0
      }

      const response = await request(app)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${authToken}`)
        .send(portfolioData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.fundCode).toBe('110022')
    })

    test('应该能够获取持仓列表', async () => {
      const response = await request(app)
        .get('/api/portfolios')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    test('应该拒绝未授权的请求', async () => {
      const response = await request(app)
        .get('/api/portfolios')
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })
})
```

## 测试数据管理

### 测试数据工厂 (`tests/factories/fundFactory.js`)
```javascript
class FundFactory {
  static create(overrides = {}) {
    return {
      id: '1',
      code: '110022',
      name: '易方达消费行业股票',
      type: '股票型',
      company: '易方达基金',
      nav: 1.2345,
      navDate: '2024-01-01',
      ...overrides
    }
  }

  static createMany(count, overrides = {}) {
    return Array.from({ length: count }, (_, index) =>
      this.create({ id: String(index + 1), ...overrides })
    )
  }
}

module.exports = FundFactory
```

### 测试数据清理 (`tests/helpers/database.js`)
```javascript
const db = require('../../src/database')

class DatabaseHelper {
  static async clearAllTables() {
    await db.exec('DELETE FROM user_portfolios')
    await db.exec('DELETE FROM ai_analyses')
    await db.exec('DELETE FROM users')
    await db.exec('DELETE FROM funds')
  }

  static async insertFund(fundData) {
    const stmt = db.prepare(`
      INSERT INTO funds (code, name, type, company, nav, nav_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    return stmt.run(
      fundData.code,
      fundData.name,
      fundData.type,
      fundData.company,
      fundData.nav,
      fundData.navDate
    )
  }

  static async insertUser(userData) {
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password_hash)
      VALUES (?, ?, ?)
    `)
    return stmt.run(
      userData.username,
      userData.email,
      userData.passwordHash
    )
  }
}

module.exports = DatabaseHelper
```

## 测试脚本

### Package.json 脚本
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

### CI/CD 配置示例 (`.github/workflows/test.yml`)
```yaml
name: Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Run unit tests
      run: npm run test:unit

    - name: Run integration tests
      run: npm run test:integration

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v1
```

## 性能测试

### 简单性能测试 (`tests/performance/api-performance.test.js`)
```javascript
const request = require('supertest')
const app = require('../../src/app')

describe('API Performance Tests', () => {
  test('基金列表API响应时间应小于200ms', async () => {
    const startTime = Date.now()

    await request(app)
      .get('/api/funds')
      .expect(200)

    const endTime = Date.now()
    const responseTime = endTime - startTime

    expect(responseTime).toBeLessThan(200)
  })

  test('AI分析API响应时间应小于5秒', async () => {
    const startTime = Date.now()

    await request(app)
      .post('/api/ai/analyze')
      .send({
        portfolioData: [/* 测试数据 */],
        analysisType: 'risk'
      })
      .expect(200)

    const endTime = Date.now()
    const responseTime = endTime - startTime

    expect(responseTime).toBeLessThan(5000)
  })
})
```

这个测试指南提供了完整的测试策略和示例，帮助你确保"基你太美"项目的代码质量和功能稳定性。