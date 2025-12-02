# 代码规范和最佳实践

## 通用规范

### 命名规范

#### 文件和目录命名
- 使用 kebab-case（小写字母+连字符）
- 组件文件使用 PascalCase
- 工具函数文件使用 camelCase

```
frontend/
├── components/
│   ├── FundChart.vue          # 组件：PascalCase
│   └── UserProfile.vue
├── utils/
│   ├── fundCalculator.js      # 工具函数：camelCase
│   └── dateHelper.js
└── views/
    ├── dashboard/             # 目录：kebab-case
    └── portfolio-management/
```

#### 变量和函数命名
```javascript
// 变量：camelCase
const userName = 'john';
const fundData = {};
const isUserActive = true;

// 常量：UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.jntm.com';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// 函数：camelCase，动词开头
function getUserInfo() {}
function calculateFundReturn() {}
function validateInput() {}

// 类：PascalCase
class FundManager {}
class PortfolioAnalyzer {}
```

#### 数据库命名
```sql
-- 表名：snake_case
CREATE TABLE user_portfolios (...);
CREATE TABLE fund_analyses (...);

-- 字段名：snake_case
user_id
fund_code
created_at
updated_at
```

### 注释规范

#### JavaScript/TypeScript 注释
```javascript
/**
 * 计算基金收益率
 * @param {number} cost - 成本金额
 * @param {number} current - 当前价值
 * @param {number} days - 持有天数
 * @returns {Object} 收益率信息
 * @example
 * const result = calculateReturn(1000, 1200, 365);
 * // returns { returnRate: 0.2, annualizedRate: 0.2 }
 */
function calculateReturn(cost, current, days) {
  // 单行注释：解释复杂逻辑
  const profit = current - cost;
  const returnRate = profit / cost;

  // 计算年化收益率
  const annualizedRate = Math.pow(1 + returnRate, 365 / days) - 1;

  return {
    returnRate,
    annualizedRate
  };
}
```

#### Vue 组件注释
```vue
<template>
  <!-- 基金列表容器 -->
  <div class="fund-list">
    <!-- 搜索表单 -->
    <el-form @submit="handleSearch">
      <!-- ... -->
    </el-form>

    <!-- 数据表格 -->
    <el-table :data="funds">
      <!-- ... -->
    </el-table>
  </div>
</template>

<script>
/**
 * 基金列表组件
 * @component FundList
 * @description 展示用户基金持仓列表，支持搜索和筛选
 */
export default {
  name: 'FundList',

  props: {
    /**
     * 基金数据列表
     * @type {Array}
     * @required
     */
    funds: {
      type: Array,
      required: true
    }
  }
}
</script>
```

### 代码格式化

#### 使用 ESLint + Prettier
```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "endOfLine": "lf"
}
```

## 前端开发规范

### Vue.js 最佳实践

#### 组件设计原则
```vue
<!-- ✅ 好的实践：单一职责 -->
<template>
  <div class="fund-card">
    <FundHeader :fund="fund" />
    <FundMetrics :metrics="fund.metrics" />
    <FundActions @edit="handleEdit" @delete="handleDelete" />
  </div>
</template>

<!-- ❌ 避免：组件过于复杂 -->
<template>
  <!-- 包含太多不相关的功能 -->
</template>
```

#### Props 和 Emit 规范
```javascript
export default {
  props: {
    // 基础类型
    title: String,
    count: Number,
    isActive: Boolean,

    // 复杂类型
    user: {
      type: Object,
      required: true,
      validator: (user) => user.id && user.name
    },

    // 默认值
    theme: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'dark', 'light'].includes(value)
    }
  },

  emits: {
    // 无验证
    'update:value': null,

    // 带验证
    'submit-form': (payload) => {
      return payload && typeof payload.email === 'string';
    }
  }
}
```

#### 状态管理 (Pinia)
```javascript
// stores/fundStore.js
export const useFundStore = defineStore('fund', {
  state: () => ({
    funds: [],
    loading: false,
    error: null
  }),

  getters: {
    // 使用箭头函数，自动推断类型
    activeFunds: (state) => state.funds.filter(fund => fund.isActive),

    // 带参数的 getter
    getFundById: (state) => {
      return (fundId) => state.funds.find(fund => fund.id === fundId);
    }
  },

  actions: {
    // 异步 action
    async fetchFunds() {
      this.loading = true;
      try {
        const response = await fundApi.getFunds();
        this.funds = response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 同步 action
    addFund(fund) {
      this.funds.push(fund);
    }
  }
});
```

### CSS/SCSS 规范

#### BEM 命名规范
```scss
.fund-card {
  // Block

  &__header {
    // Element
    display: flex;
    align-items: center;
  }

  &__title {
    font-size: 16px;
    font-weight: bold;
  }

  &--active {
    // Modifier
    border-color: #409eff;
  }

  &--disabled {
    opacity: 0.6;
    pointer-events: none;
  }
}
```

#### 响应式设计
```scss
// 使用 SCSS 变量
$breakpoints: (
  mobile: 768px,
  tablet: 1024px,
  desktop: 1200px
);

@mixin mobile {
  @media (max-width: map-get($breakpoints, mobile)) {
    @content;
  }
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @include mobile {
    grid-template-columns: 1fr;
  }
}
```

## 后端开发规范

### Node.js/Express 最佳实践

#### 项目结构规范
```
src/
├── controllers/     # 控制器层
├── services/        # 业务逻辑层
├── models/          # 数据模型层
├── routes/          # 路由定义
├── middleware/      # 中间件
├── utils/           # 工具函数
├── config/          # 配置文件
└── validators/      # 数据验证
```

#### 错误处理规范
```javascript
// 自定义错误类
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 全局错误处理中间件
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误日志
  logger.error(err);

  // 数据库错误
  if (err.name === 'CastError') {
    const message = '资源未找到';
    error = new AppError(message, 404);
  }

  // 验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new AppError(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || '服务器内部错误'
  });
};
```

#### API 响应格式
```javascript
// 成功响应
const sendSuccess = (res, data, message = '操作成功', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    code: statusCode,
    message,
    data,
    timestamp: Date.now()
  });
};

// 错误响应
const sendError = (res, error, statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    code: statusCode,
    message: error.message || '操作失败',
    error: {
      type: error.name || 'UnknownError',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    },
    timestamp: Date.now()
  });
};
```

### 数据库操作规范

#### SQL 查询规范
```sql
-- 使用参数化查询防止 SQL 注入
SELECT * FROM user_portfolios
WHERE user_id = ? AND fund_code = ?;

-- 添加适当的索引
CREATE INDEX idx_user_portfolio ON user_portfolios(user_id, fund_code);

-- 使用事务保证数据一致性
BEGIN TRANSACTION;
UPDATE user_portfolios SET shares = shares - ? WHERE id = ?;
UPDATE user_portfolios SET shares = shares + ? WHERE id = ?;
COMMIT;
```

## 测试规范

### 单元测试
```javascript
// 使用 Jest 进行单元测试
describe('FundCalculator', () => {
  describe('calculateReturn', () => {
    test('应该正确计算正收益', () => {
      const result = calculateReturn(1000, 1200, 365);
      expect(result.returnRate).toBe(0.2);
      expect(result.annualizedRate).toBeCloseTo(0.2, 2);
    });

    test('应该处理无效输入', () => {
      expect(() => calculateReturn(0, 1000, 365)).toThrow();
    });
  });
});
```

### 集成测试
```javascript
// API 集成测试
describe('Fund API', () => {
  test('GET /api/funds 应该返回基金列表', async () => {
    const response = await request(app)
      .get('/api/funds')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

## 性能优化规范

### 前端性能
- 使用 `v-memo` 缓存组件
- 合理使用 `computed` 和 `watch`
- 图片懒加载和压缩
- 代码分割和异步组件

### 后端性能
- 数据库查询优化和索引
- API 响应缓存
- 分页查询大数据集
- 连接池管理

## 安全规范

### 输入验证
```javascript
// 使用 Joi 进行数据验证
const fundSchema = Joi.object({
  fundCode: Joi.string().pattern(/^\d{6}$/).required(),
  shares: Joi.number().positive().required(),
  purchaseDate: Joi.date().iso().required()
});
```

### 安全最佳实践
- 使用 HTTPS
- 敏感信息环境变量存储
- SQL 注入防护
- XSS 攻击防护
- CSRF 令牌验证