# 主题管理 API

## 概述
主题管理模块提供用户主题选择、配置管理、偏好设置等核心功能，支持三大投资主题的切换和个性化体验。

## 接口列表

### 1. 获取主题列表
获取系统支持的所有主题信息。

**接口地址**: `GET /themes`

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "message": "获取成功",
  "data": {
    "themes": [
      {
        "code": "fire",
        "name": "提前退休",
        "description": "通过理性投资实现财务独立，提前享受人生",
        "icon": "🏖️",
        "features": [
          "退休目标计算器",
          "FIRE进度追踪器",
          "被动收入分析器",
          "4%法则验证器"
        ],
        "tools": [
          "retirement-calculator",
          "fire-progress",
          "passive-income",
          "four-percent-rule"
        ],
        "isDefault": true
      },
      {
        "code": "global",
        "name": "这还是国内吗",
        "description": "全球化配置分散投资风险，获取更稳健收益",
        "icon": "🌍",
        "features": [
          "全球市场对比工具",
          "QDII产品筛选器",
          "汇率影响分析器",
          "全球ETF推荐系统"
        ],
        "tools": [
          "global-comparison",
          "qdii-screen",
          "currency-analysis",
          "etf-recommendation"
        ],
        "isDefault": false
      },
      {
        "code": "inflation",
        "name": "跑赢通胀",
        "description": "守住财富购买力，投资收益率必须跑赢CPI",
        "icon": "💰",
        "features": [
          "通胀实时追踪器",
          "实际收益计算器",
          "抗通胀资产分析",
          "购买力保护工具"
        ],
        "tools": [
          "inflation-tracker",
          "real-return",
          "inflation-hedging",
          "purchasing-power"
        ],
        "isDefault": false
      }
    ]
  }
}
```

### 2. 获取用户当前主题
获取当前用户的主题设置和偏好。

**接口地址**: `GET /themes/current`

**请求头**:
```
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "message": "获取成功",
  "data": {
    "currentTheme": {
      "code": "fire",
      "name": "提前退休",
      "icon": "🏖️"
    },
    "preferences": {
      "retirementAge": 45,
      "targetAmount": 5000000,
      "riskTolerance": "moderate",
      "showAdvancedMetrics": true,
      "preferredTimeRange": "1year"
    },
    "usageStats": {
      "switchCount": 3,
      "currentUsageDays": 45,
      "totalUsageMinutes": 2850
    },
    "lastSwitchAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**错误代码**:
- `THEME_001`: 用户主题不存在
- `AUTH_001`: 用户未认证

### 3. 切换用户主题
切换用户的投资主题，同时记录切换行为。

**接口地址**: `POST /themes/switch`

**请求头**:
```
Authorization: Bearer <token>
```

**请求参数**:
```json
{
  "theme": "global",
  "reason": "想要了解海外投资机会",
  "savePreferences": true
}
```

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "message": "主题切换成功",
  "data": {
    "fromTheme": {
      "code": "fire",
      "name": "提前退休"
    },
    "toTheme": {
      "code": "global",
      "name": "这还是国内吗"
    },
    "switchId": "switch_1234567890",
    "switchedAt": "2024-01-20T14:25:00.000Z",
    "recommendations": [
      "建议查看全球市场对比工具",
      "了解QDII投资额度使用情况"
    ]
  }
}
```

**错误代码**:
- `THEME_001`: 主题不存在
- `THEME_002`: 主题切换过于频繁
- `AUTH_001`: 用户未认证

### 4. 获取主题配置
获取指定主题的详细配置信息。

**接口地址**: `GET /themes/{theme}/config`

**路径参数**:
- `theme`: 主题代码 (fire, global, inflation)

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "message": "获取成功",
  "data": {
    "theme": "fire",
    "config": {
      "display": {
        "primaryColor": "#FF6B6B",
        "secondaryColor": "#4ECDC4",
        "backgroundColor": "#F8F9FA",
        "chartColors": ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"]
      },
      "metrics": {
        "primaryMetrics": [
          "retirementProgress",
          "passiveIncomeRate",
          "fourPercentRuleStatus"
        ],
        "secondaryMetrics": [
          "currentValue",
          "monthlyContribution",
          "timeToRetirement"
        ]
      },
      "tools": [
        {
          "id": "retirement-calculator",
          "name": "退休计算器",
          "description": "计算退休目标和可行性",
          "enabled": true
        },
        {
          "id": "fire-progress",
          "name": "FIRE进度",
          "description": "追踪财务自由进度",
          "enabled": true
        }
      ],
      "content": {
        "welcomeMessage": "开始你的FIRE之旅",
        "tutorialSteps": [
          "设置退休目标",
          "分析当前投资",
          "制定实施计划",
          "追踪执行进度"
        ]
      }
    },
    "version": "1.2.0",
    "lastUpdated": "2024-01-15T00:00:00.000Z"
  }
}
```

### 5. 更新用户主题偏好
更新用户在当前主题下的个性化偏好设置。

**接口地址**: `PUT /themes/preferences`

**请求头**:
```
Authorization: Bearer <token>
```

**请求参数**:
```json
{
  "theme": "fire",
  "preferences": {
    "retirementAge": 50,
    "targetAmount": 8000000,
    "riskTolerance": "conservative",
    "showAdvancedMetrics": true,
    "preferredTimeRange": "5year",
    "autoSave": true
  },
  "notifications": {
    "progressAlerts": true,
    "goalReminders": true,
    "marketAlerts": false
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "message": "偏好更新成功",
  "data": {
    "updatedFields": [
      "retirementAge",
      "targetAmount",
      "riskTolerance"
    ],
    "preferences": {
      "retirementAge": 50,
      "targetAmount": 8000000,
      "riskTolerance": "conservative",
      "showAdvancedMetrics": true,
      "preferredTimeRange": "5year",
      "autoSave": true
    },
    "updatedAt": "2024-01-20T15:30:00.000Z"
  }
}
```

**错误代码**:
- `THEME_003`: 主题配置无效
- `AUTH_001`: 用户未认证

### 6. 获取主题化指标
基于用户当前主题，计算和返回个性化的投资指标。

**接口地址**: `GET /themes/metrics`

**请求头**:
```
Authorization: Bearer <token>
```

**查询参数**:
- `portfolios`: 是否包含持仓数据 (可选，默认: true)
- `timeRange`: 时间范围 (可选，默认: 1year)

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "message": "获取成功",
  "data": {
    "theme": "fire",
    "basicMetrics": {
      "totalValue": 1250000,
      "totalCost": 1000000,
      "totalProfit": 250000,
      "returnRate": 25.0
    },
    "themeSpecific": {
      "retirementProgress": {
        "targetAmount": 5000000,
        "currentAmount": 1250000,
        "progress": 25.0,
        "estimatedTime": "8年6个月"
      },
      "passiveIncomeCoverage": {
        "annualIncome": 37500,
        "monthlyIncome": 3125,
        "coverageRate": 0.63,
        "targetCoverageRate": 1.0
      },
      "fourPercentRule": {
        "annualWithdrawal": 50000,
        "monthlyWithdrawal": 4167,
        "sustainability": "96%",
        "recommendation": "建议提取比例在3.5-4%之间"
      }
    },
    "tools": [
      {
        "id": "retirement-calculator",
        "status": "available",
        "lastUsed": "2024-01-18T10:15:00.000Z"
      },
      {
        "id": "fire-progress",
        "status": "available",
        "lastUsed": "2024-01-20T09:30:00.000Z"
      }
    ],
    "recommendations": [
      {
        "type": "suggestion",
        "title": "增加储蓄额度",
        "description": "当前每月储蓄5000元，建议增加到8000元可提前2年退休",
        "priority": "high"
      },
      {
        "type": "tool",
        "title": "使用退休计算器",
        "description": "模拟不同投资策略对退休时间的影响",
        "priority": "medium"
      }
    ]
  }
}
```

### 7. 获取主题切换历史
获取用户的主题切换历史记录。

**接口地址**: `GET /themes/history`

**请求头**:
```
Authorization: Bearer <token>
```

**查询参数**:
- `page`: 页码 (可选，默认: 1)
- `limit`: 每页数量 (可选，默认: 20)
- `startDate`: 开始日期 (可选)
- `endDate`: 结束日期 (可选)

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "message": "获取成功",
  "data": {
    "items": [
      {
        "id": "switch_1234567890",
        "fromTheme": {
          "code": "inflation",
          "name": "跑赢通胀"
        },
        "toTheme": {
          "code": "fire",
          "name": "提前退休"
        },
        "reason": "想要规划退休生活",
        "switchedAt": "2024-01-20T14:25:00.000Z",
        "deviceType": "desktop",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "ipAddress": "192.168.1.100"
      },
      {
        "id": "switch_1234567889",
        "fromTheme": {
          "code": "fire",
          "name": "提前退休"
        },
        "toTheme": {
          "code": "inflation",
          "name": "跑赢通胀"
        },
        "reason": "担心通胀影响",
        "switchedAt": "2024-01-15T09:15:00.000Z",
        "deviceType": "mobile",
        "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
        "ipAddress": "192.168.1.101"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    },
    "statistics": {
      "totalSwitches": 5,
      "mostUsedTheme": "fire",
      "averageUsageDays": 32,
      "switchFrequency": "moderate"
    }
  }
}
```

### 8. 记录工具使用
记录用户使用主题工具的行为。

**接口地址**: `POST /themes/tools/usage`

**请求头**:
```
Authorization: Bearer <token>
```

**请求参数**:
```json
{
  "theme": "fire",
  "tool": "retirement-calculator",
  "inputData": {
    "currentAge": 35,
    "retirementAge": 45,
    "currentAssets": 1250000,
    "monthlySavings": 8000,
    "expectedReturn": 8
  },
  "duration": 120,
  "success": true,
  "userFeedback": "工具很有用，帮我明确了退休目标"
}
```

**响应示例**:
```json
{
  "success": true,
  "code": 201,
  "message": "使用记录保存成功",
  "data": {
    "usageId": "usage_1234567890",
    "tool": "retirement-calculator",
    "recordedAt": "2024-01-20T16:45:00.000Z"
  }
}
```

### 9. 获取工具推荐
基于用户当前主题和使用历史，推荐相关工具。

**接口地址**: `GET /themes/tools/recommendations`

**请求头**:
```
Authorization: Bearer <token>
```

**查询参数**:
- `limit`: 推荐数量 (可选，默认: 5)
- `excludeUsed`: 是否排除已使用工具 (可选，默认: false)

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "message": "获取成功",
  "data": {
    "recommendations": [
      {
        "tool": {
          "id": "four-percent-rule",
          "name": "4%法则验证器",
          "description": "验证退休资金的可持续性",
          "theme": "fire"
        },
        "reason": "您已经设置了退休目标，建议验证资金的可持续性",
        "priority": "high",
        "confidence": 0.85
      },
      {
        "tool": {
          "id": "passive-income",
          "name": "被动收入分析器",
          "description": "计算投资组合的被动收入能力",
          "theme": "fire"
        },
        "reason": "基于您的资产配置，可以分析被动收入潜力",
        "priority": "medium",
        "confidence": 0.72
      }
    ],
    "basedOn": [
      "user_current_theme",
      "investment_goals",
      "portfolio_composition",
      "usage_history"
    ]
  }
}
```

## 工具特定API

### FIRE主题工具API

#### 退休计算器
```
POST /tools/fire/retirement-calculator
```

**请求参数**:
```json
{
  "currentAge": 35,
  "retirementAge": 45,
  "lifeExpectancy": 85,
  "currentAssets": 1250000,
  "monthlySavings": 8000,
  "expectedReturn": 8,
  "inflationRate": 2.5,
  "retirementExpense": 30000
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "feasibility": "high",
    "retirementAmount": 5234567,
    "shortfall": 0,
    "monthlySavingsNeeded": 7500,
    "yearsToRetirement": 10,
    "successProbability": 87,
    "recommendations": [
      "当前储蓄计划可行，建议保持",
      "考虑增加风险资产比例以提高收益率"
    ]
  }
}
```

### 全球化主题工具API

#### QDII筛选器
```
GET /tools/global/qdii-screen
```

**查询参数**:
- `region`: 投资区域 (us, europe, asia, global)
- `assetType`: 资产类型 (stock, bond, mixed, commodity)
- `minReturn`: 最低收益率
- `maxFee`: 最高费率
- `sortBy`: 排序方式 (return, fee, risk)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "total": 25,
    "products": [
      {
        "code": "000001",
        "name": "易方达美国精选股票",
        "region": "us",
        "assetType": "stock",
        "annualReturn": 15.2,
        "fee": 1.2,
        "riskLevel": "high",
        "quotaUsage": "45%"
      }
    ],
    "quotaStatus": {
      "totalQuota": "300亿美元",
      "usedQuota": "135亿美元",
      "availableQuota": "165亿美元"
    }
  }
}
```

### 通胀主题工具API

#### 实际收益计算器
```
POST /tools/inflation/real-return-calculator
```

**请求参数**:
```json
{
  "initialAmount": 1000000,
  "currentValue": 1250000,
  "investYears": 5,
  "inflationRate": 2.8,
  "nominalReturn": 4.5
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "nominalReturn": 25.0,
    "realReturn": 18.7,
    "annualRealReturn": 3.5,
    "purchasingPower": 1187000,
    "inflationImpact": 63000,
    "beatsInflation": true,
    "equivalentReturn": 5.3,
    "recommendations": [
      "当前投资组合跑赢通胀，建议保持策略",
      "可适当增加抗通胀资产配置"
    ]
  }
}
```

## 使用示例

### JavaScript/TypeScript
```typescript
// 获取用户当前主题
const getCurrentTheme = async () => {
  const response = await fetch('/api/v1/themes/current', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  const data = await response.json()
  return data.data
}

// 切换主题
const switchTheme = async (themeCode: string, reason: string) => {
  const response = await fetch('/api/v1/themes/switch', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      theme: themeCode,
      reason: reason
    })
  })

  return await response.json()
}

// 使用退休计算器
const calculateRetirement = async (params: RetirementParams) => {
  const response = await fetch('/api/v1/tools/fire/retirement-calculator', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  })

  const data = await response.json()
  return data.data
}
```

### cURL
```bash
# 获取主题列表
curl -X GET "https://api.jntm.com/v1/themes" \
  -H "Authorization: Bearer your-jwt-token"

# 切换到全球化主题
curl -X POST "https://api.jntm.com/v1/themes/switch" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "global",
    "reason": "想要了解海外投资机会"
  }'

# 使用退休计算器
curl -X POST "https://api.jntm.com/v1/tools/fire/retirement-calculator" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "currentAge": 35,
    "retirementAge": 45,
    "currentAssets": 1250000,
    "monthlySavings": 8000,
    "expectedReturn": 8
  }'
```

## 版本更新记录

### v1.0.0 (2024-01-15)
- 初始版本发布
- 支持三大主题的基础功能
- 提供主题切换和偏好管理

### v1.1.0 (2024-01-20)
- 增加工具使用记录
- 添加智能推荐功能
- 优化主题配置管理

### v1.2.0 (2024-01-25)
- 支持主题化指标计算
- 增加主题切换历史
- 完善工具推荐算法