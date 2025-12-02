# 用户认证 API

## 概述
用户认证模块提供用户注册、登录、令牌管理等身份验证相关功能。

## 接口列表

### 1. 用户注册
注册新用户账号，使用手机号作为主要登录方式。

**接口地址**: `POST /auth/register`

**请求参数**:
```json
{
  "phone": "string",              // 手机号，11位数字，必填
  "smsCode": "string",            // 短信验证码，6位数字，必填
  "password": "string",           // 密码，8-50字符，必填
  "confirmPassword": "string",    // 确认密码，必填
  "username": "string",           // 用户昵称，3-20字符，可选
  "email": "string"               // 邮箱地址，可选
}
```

**响应示例**:
```json
{
  "success": true,
  "code": 201,
  "message": "注册成功",
  "data": {
    "user": {
      "id": "user_123",
      "phone": "13800138000",
      "username": "testuser",
      "email": "test@example.com",
      "avatar": null,
      "phoneVerified": true,
      "emailVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**错误代码**:
- `AUTH_004`: 手机号已存在
- `AUTH_005`: 用户昵称已存在
- `AUTH_006`: 邮箱已存在
- `AUTH_007`: 密码格式不正确
- `AUTH_008`: 两次密码不一致
- `AUTH_009`: 短信验证码错误
- `AUTH_010`: 短信验证码已过期
- `AUTH_011`: 手机号格式不正确

### 2. 用户登录
用户身份验证，获取访问令牌。

**接口地址**: `POST /auth/login`

**请求参数**:
```json
{
  "phone": "string",      // 手机号，11位数字，必填
  "password": "string",   // 密码，必填
  "rememberMe": false     // 记住登录状态，可选
}
```

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "user_123",
      "phone": "13800138000",
      "username": "testuser",
      "email": "test@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "preferences": {
        "theme": "light",
        "language": "zh-CN",
        "riskLevel": "moderate"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

**错误代码**:
- `AUTH_001`: 手机号或密码错误
- `AUTH_008`: 账号已被禁用
- `AUTH_009`: 登录尝试次数过多
- `AUTH_012`: 手机号未注册

### 3. 发送短信验证码
为注册或找回密码发送短信验证码。

**接口地址**: `POST /auth/send-sms`

**请求参数**:
```json
{
  "phone": "string",           // 手机号，11位数字，必填
  "type": "register"           // 验证码类型：register（注册）| reset（找回密码），必填
}
```

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "message": "短信验证码已发送",
  "data": {
    "phone": "13800138000",
    "type": "register",
    "expireTime": 300,         // 验证码有效期（秒）
    "resendInterval": 60       // 重发间隔（秒）
  }
}
```

**错误代码**:
- `AUTH_013`: 手机号格式不正确
- `AUTH_014`: 手机号已注册（注册时）
- `AUTH_015`: 手机号未注册（找回密码时）
- `AUTH_016`: 请求过于频繁
- `AUTH_017`: 短信服务异常

### 4. 刷新令牌
刷新访问令牌，延长登录状态。

**接口地址**: `POST /auth/refresh`

**请求头**:
```
Authorization: Bearer <current-token>
```

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "message": "令牌刷新成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

**错误代码**:
- `AUTH_002`: Token 已过期
- `AUTH_003`: Token 无效

### 5. 用户登出
用户主动登出，使当前令牌失效。

**接口地址**: `POST /auth/logout`

**请求头**:
```
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "message": "登出成功"
}
```

### 6. 获取当前用户信息
获取当前登录用户的详细信息。

**接口地址**: `GET /auth/profile`

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
    "id": "user_123",
    "phone": "13800138000",
    "username": "testuser",
    "email": "test@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "phoneVerified": true,
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLoginAt": "2024-01-15T08:30:00.000Z",
    "preferences": {
      "theme": "light",
      "language": "zh-CN",
      "riskLevel": "moderate",
      "notifications": {
        "email": true,
        "push": true,
        "marketAlerts": true
      },
      "aiSettings": {
        "primaryModel": "deepseek",
        "fallbackModel": "qwen",
        "analysisDepth": "detailed"
      }
    },
    "statistics": {
      "portfolioCount": 5,
      "totalValue": 50000.00,
      "totalReturn": 2500.00,
      "joinDays": 45
    }
  }
}
```

### 7. 更新用户信息
更新当前用户的基本信息。

**接口地址**: `PUT /auth/profile`

**请求头**:
```
Authorization: Bearer <token>
```

**请求参数**:
```json
{
  "username": "string",        // 用户昵称，可选
  "email": "string",           // 邮箱地址，可选
  "avatar": "string",          // 头像URL，可选
  "preferences": {             // 用户偏好设置，可选
    "theme": "light|dark",     // 主题
    "language": "zh-CN|en-US", // 语言
    "riskLevel": "conservative|moderate|aggressive", // 风险偏好
    "notifications": {
      "email": true,
      "push": true,
      "marketAlerts": true
    },
    "aiSettings": {
      "primaryModel": "deepseek|qwen",
      "fallbackModel": "deepseek|qwen",
      "analysisDepth": "simple|standard|detailed"
    }
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": "user_123",
    "phone": "13800138000",
    "username": "newnickname",
    "email": "newemail@example.com",
    "avatar": "https://example.com/new-avatar.jpg",
    "preferences": {
      // 更新后的偏好设置
    }
  }
}
```

**错误代码**:
- `AUTH_018`: 用户昵称格式不正确
- `AUTH_019`: 用户昵称已被使用
- `AUTH_010`: 邮箱格式不正确
- `AUTH_011`: 邮箱已被使用
- `AUTH_020`: 参数值无效

### 8. 修改密码
修改用户登录密码。

**接口地址**: `PUT /auth/password`

**请求头**:
```
Authorization: Bearer <token>
```

**请求参数**:
```json
{
  "currentPassword": "string",  // 当前密码，必填
  "newPassword": "string",      // 新密码，必填
  "confirmPassword": "string"   // 确认新密码，必填
}
```

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "message": "密码修改成功"
}
```

**错误代码**:
- `AUTH_021`: 当前密码错误
- `AUTH_014`: 新密码格式不正确
- `AUTH_022`: 新密码不能与当前密码相同

### 9. 忘记密码
发送密码重置短信验证码。

**接口地址**: `POST /auth/forgot-password`

**请求参数**:
```json
{
  "phone": "string"  // 手机号，11位数字，必填
}
```

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "message": "密码重置短信验证码已发送",
  "data": {
    "phone": "13800138000",
    "expireTime": 300,         // 验证码有效期（秒）
    "resendInterval": 60       // 重发间隔（秒）
  }
}
```

**错误代码**:
- `AUTH_015`: 手机号未注册
- `AUTH_016`: 请求过于频繁
- `AUTH_017`: 短信服务异常

### 10. 通过短信重置密码
使用短信验证码重置密码。

**接口地址**: `POST /auth/reset-password-sms`

**请求参数**:
```json
{
  "phone": "string",         // 手机号，11位数字，必填
  "smsCode": "string",       // 短信验证码，6位数字，必填
  "newPassword": "string",   // 新密码，必填
  "confirmPassword": "string" // 确认新密码，必填
}
```

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "message": "密码重置成功"
}
```

**错误代码**:
- `AUTH_009`: 短信验证码错误
- `AUTH_010`: 短信验证码已过期
- `AUTH_014`: 新密码格式不正确
- `AUTH_015`: 手机号未注册

### 11. 重置密码
使用重置令牌设置新密码。

**接口地址**: `POST /auth/reset-password`

**请求参数**:
```json
{
  "token": "string",         // 重置令牌，必填
  "newPassword": "string",   // 新密码，必填
  "confirmPassword": "string" // 确认密码，必填
}
```

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "message": "密码重置成功"
}
```

**错误代码**:
- `AUTH_023`: 重置令牌无效
- `AUTH_024`: 重置令牌已过期
- `AUTH_014`: 新密码格式不正确

### 12. 删除账户
永久删除用户账户和所有相关数据。

**接口地址**: `DELETE /auth/account`

**请求头**:
```
Authorization: Bearer <token>
```

**请求参数**:
```json
{
  "password": "string",        // 当前密码，必填
  "confirmation": "DELETE"     // 确认删除，必填
}
```

**响应示例**:
```json
{
  "success": true,
  "code": 200,
  "message": "账户删除成功"
}
```

**错误代码**:
- `AUTH_025`: 密码错误
- `AUTH_026`: 确认字符串不正确
- `AUTH_027`: 账户有未处理的持仓

## 使用示例

### JavaScript/TypeScript
```typescript
// 发送短信验证码
const smsResponse = await fetch('/api/v1/auth/send-sms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '13800138000',
    type: 'register'
  })
});

// 注册
const registerResponse = await fetch('/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '13800138000',
    smsCode: '123456',
    password: 'password123',
    confirmPassword: 'password123',
    username: 'newuser'
  })
})

const { data } = await registerResponse.json()
const token = data.token

// 登录
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '13800138000',
    password: 'password123'
  })
})

// 获取用户信息
const profileResponse = await fetch('/api/v1/auth/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
})

const userProfile = await profileResponse.json()
```

### cURL
```bash
# 发送短信验证码
curl -X POST "http://localhost:3000/api/v1/auth/send-sms" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "type": "register"
  }'

# 注册
curl -X POST "http://localhost:3000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "smsCode": "123456",
    "password": "password123",
    "confirmPassword": "password123",
    "username": "testuser"
  }'

# 登录
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "password": "password123"
  }'

# 获取用户信息
curl -X GET "http://localhost:3000/api/v1/auth/profile" \
  -H "Authorization: Bearer your-jwt-token"
```

## 数据验证规则

### 手机号
- 长度：11 位数字
- 格式：1开头，第二位为3-9
- 仅支持中国大陆手机号

### 用户昵称
- 长度：3-20 字符
- 格式：字母、数字、下划线、中文
- 可选字段，用于社交功能

### 密码
- 长度：8-50 字符
- 必须包含：字母、数字
- 建议包含：特殊字符

### 短信验证码
- 长度：6 位数字
- 有效期：5 分钟
- 重发间隔：60 秒

### 邮箱
- 标准邮箱格式验证
- 常见邮箱域名白名单
- 可选字段，用于邮件通知

### 风险等级
- `conservative`: 保守型
- `moderate`: 稳健型
- `aggressive`: 激进型

### AI 分析深度
- `simple`: 简要分析
- `standard`: 标准分析
- `detailed`: 详细分析

## 安全考虑

### 密码安全
- 使用 bcrypt 加密存储
- 密码强度验证
- 防止密码泄露

### Token 安全
- JWT 令牌签名验证
- 令牌过期机制
- 刷新令牌轮换

### 防攻击措施
- 登录次数限制
- 验证码防护
- IP 白名单（可选）

### 数据保护
- 敏感信息加密
- 日志脱敏处理
- 数据访问权限控制