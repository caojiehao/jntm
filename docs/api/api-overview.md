# API 总览

## 基本信息

- **API 基础URL**: `https://api.jntm.com/v1`
- **开发环境**: `http://localhost:3000/api/v1`
- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证方式

### JWT Token 认证
```http
Authorization: Bearer <your-jwt-token>
```

### Token 获取
通过用户登录接口获取：
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "your-username",
  "password": "your-password"
}
```

### Token 有效期
- **默认有效期**: 7天
- **刷新机制**: 可通过 `/auth/refresh` 接口刷新

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": {
    // 具体业务数据
  },
  "timestamp": 1704067200000,
  "requestId": "req_1234567890"
}
```

### 错误响应
```json
{
  "success": false,
  "code": 400,
  "message": "请求参数错误",
  "error": {
    "type": "ValidationError",
    "details": "基金代码格式不正确",
    "field": "fundCode"
  },
  "timestamp": 1704067200000,
  "requestId": "req_1234567890"
}
```

### 分页响应
```json
{
  "success": true,
  "code": 200,
  "message": "获取成功",
  "data": {
    "items": [
      // 数据项
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## HTTP 状态码

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 删除成功 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未授权 |
| 403 | Forbidden | 禁止访问 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突 |
| 422 | Unprocessable Entity | 数据验证失败 |
| 429 | Too Many Requests | 请求频率限制 |
| 500 | Internal Server Error | 服务器内部错误 |
| 502 | Bad Gateway | 外部服务错误 |
| 503 | Service Unavailable | 服务不可用 |

## 通用请求头

| 请求头 | 说明 | 必填 |
|--------|------|------|
| `Content-Type` | 请求内容类型 | 可选 |
| `Authorization` | JWT Token | 需要认证的接口 |
| `X-Request-ID` | 请求唯一标识 | 可选 |
| `X-Client-Version` | 客户端版本 | 可选 |

## 通用响应头

| 响应头 | 说明 |
|--------|------|
| `X-RateLimit-Limit` | 请求频率限制 |
| `X-RateLimit-Remaining` | 剩余请求次数 |
| `X-RateLimit-Reset` | 限制重置时间 |
| `X-Response-Time` | 响应时间(毫秒) |

## 错误代码规范

### 业务错误代码格式
```
[MODULE]_[ERROR_TYPE]_[SPECIFIC_CODE]
```

### 错误代码示例
| 错误代码 | 说明 | HTTP状态码 |
|----------|------|------------|
| `AUTH_001` | 用户名或密码错误 | 401 |
| `AUTH_002` | Token 已过期 | 401 |
| `AUTH_003` | Token 无效 | 401 |
| `FUND_001` | 基金代码不存在 | 404 |
| `FUND_002` | 基金数据获取失败 | 502 |
| `PORTFOLIO_001` | 持仓已存在 | 409 |
| `PORTFOLIO_002` | 持仓数量无效 | 422 |
| `OCR_001` | 图片格式不支持 | 400 |
| `OCR_002` | OCR 识别失败 | 502 |
| `AI_001` | AI 分析请求超时 | 504 |
| `AI_002` | AI 调用次数超限 | 429 |
| `THEME_001` | 主题不存在 | 400 |
| `THEME_002` | 主题切换过于频繁 | 429 |
| `THEME_003` | 主题配置无效 | 422 |
| `GOAL_001` | 投资目标不存在 | 404 |
| `GOAL_002` | 目标参数无效 | 422 |

## API 分类

### 1. 用户认证 (`/auth`)
- 用户注册、登录、登出
- Token 刷新
- 用户信息管理

### 2. 主题管理 (`/themes`)
- 主题配置和切换
- 主题化数据分析
- 用户偏好管理

### 3. 投资目标 (`/goals`)
- 投资目标设置和管理
- 目标进度追踪
- 目标分析工具

### 4. 基金数据 (`/funds`)
- 基金搜索和信息获取
- 基金净值历史数据
- 基金排行榜

### 5. 投资组合 (`/portfolios`)
- 用户持仓管理
- 持仓添加、修改、删除
- 持仓汇总信息

### 6. OCR 识别 (`/ocr`)
- 截图上传和识别
- 识别结果确认
- 识别历史记录

### 7. AI 分析 (`/ai`)
- 投资组合分析
- 风险评估
- 智能问答

### 8. 数据分析 (`/analysis`)
- 收益表现分析
- 资产配置分析
- 风险指标计算

### 9. 投资工具 (`/tools`)
- 主题化计算工具
- 费用计算器
- 定投模拟器
- 收益预测

### 10. 系统管理 (`/system`)
- 系统配置
- 版本信息
- 健康检查

## 请求限制

### 频率限制
- **普通用户**: 100 次/分钟
- **认证用户**: 500 次/分钟
- **VIP 用户**: 1000 次/分钟

### 文件上传限制
- **图片大小**: 最大 10MB
- **支持格式**: JPG, PNG, WEBP
- **每日上传次数**: 50 次

### AI 调用限制
- **DeepSeek**: 100 次/天
- **Qwen**: 50 次/天
- **分析复杂度**: 限制输入长度

## SDK 示例

### JavaScript/TypeScript
```typescript
// 安装: npm install jntm-api-sdk
import { JNTMApi } from 'jntm-api-sdk'

const api = new JNTMApi({
  baseURL: 'https://api.jntm.com/v1',
  token: 'your-jwt-token'
})

// 获取基金列表
const funds = await api.funds.list({ page: 1, limit: 20 })

// 添加持仓
const portfolio = await api.portfolios.create({
  fundCode: '110022',
  shares: 1000
})
```

### Python
```python
# 安装: pip install jntm-api
from jntm_api import JNTMApi

api = JNTMApi(
    base_url='https://api.jntm.com/v1',
    token='your-jwt-token'
)

# 获取基金信息
fund = api.funds.get('110022')

# AI 分析
analysis = api.ai.analyze_portfolio({
    'portfolio_data': [...],
    'analysis_type': 'risk'
})
```

### cURL 示例
```bash
# 获取基金列表
curl -X GET "https://api.jntm.com/v1/funds" \
  -H "Authorization: Bearer your-jwt-token"

# 添加持仓
curl -X POST "https://api.jntm.com/v1/portfolios" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"fundCode":"110022","shares":1000}'

# OCR 识别
curl -X POST "https://api.jntm.com/v1/ocr/upload" \
  -H "Authorization: Bearer your-jwt-token" \
  -F "image=@fund-screenshot.png"
```

## 版本控制

### 版本策略
- **主版本**: 不兼容的 API 变更
- **次版本**: 向后兼容的功能新增
- **修订版本**: 向后兼容的问题修正

### 当前版本
- **v1.0.0**: 基础功能版本
- **v1.1.0**: 增加 AI 分析功能
- **v1.2.0**: 增加 OCR 识别功能

### 版本支持
- **v1.x**: 当前维护版本
- **v0.x**: 已废弃

## 测试环境

### 测试地址
- **API**: `http://test-api.jntm.com/v1`
- **文档**: `http://test-api.jntm.com/docs`

### 测试账号
```json
{
  "username": "testuser",
  "password": "testpass123",
  "token": "test-jwt-token"
}
```

### Mock 数据
测试环境提供完整的 Mock 数据，包括：
- 100+ 基金数据
- 模拟用户持仓
- AI 分析结果样例

## 监控和日志

### API 监控指标
- 请求响应时间
- 错误率统计
- 调用频率统计
- 用户活跃度

### 日志级别
- **ERROR**: 系统错误
- **WARN**: 警告信息
- **INFO**: 一般信息
- **DEBUG**: 调试信息

### 联系支持
- **技术支持**: api-support@jntm.com
- **问题反馈**: https://github.com/jntm/api/issues
- **文档更新**: docs@jntm.com