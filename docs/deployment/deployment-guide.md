# 部署指南

## 部署架构概览

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   用户访问      │────│   CDN/负载均衡   │────│   Web 服务器     │
│  (Browser/App)  │    │   (Nginx/CLB)   │    │ (Static Files)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   监控告警      │────│   日志收集      │    │   API 服务器    │
│ (Grafana/Alert) │    │ (ELK Stack)    │    │ (Node.js/Express)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   备份存储      │────│   缓存服务      │    │   数据库        │
│   (OSS/S3)      │    │   (Redis)       │    │ (MySQL/SQLite)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 部署环境

### 开发环境 (Development)
- **用途**: 本地开发和测试
- **部署方式**: 本地运行
- **数据库**: SQLite 本地文件
- **缓存**: 内存缓存 (可选 Redis)

### 测试环境 (Testing/Staging)
- **用途**: 功能测试和集成测试
- **部署方式**: 云服务器或容器
- **数据库**: MySQL 或 PostgreSQL
- **缓存**: Redis

### 生产环境 (Production)
- **用途**: 正式运行服务
- **部署方式**: 云函数 + 云数据库
- **数据库**: MySQL 或 PostgreSQL
- **缓存**: Redis 集群

## 云函数部署方案 (推荐)

### 1. 腾讯云函数部署

#### 前端部署 (静态网站)
```bash
# 1. 构建前端项目
cd frontend
npm run build

# 2. 上传到腾讯云 COS
npm install -g cos-cli
cos-cli upload ./dist/ cos://your-bucket/ --recursive

# 3. 配置静态网站托管
# 在 COS 控制台开启静态网站功能
# 配置默认文档：index.html
# 配置错误文档：404.html
```

#### 后端部署 (云函数)
```javascript
// serverless.yml
service: jntm-api

frameworkVersion: '3'

provider:
  name: tencent
  runtime: Nodejs18.15
  region: ap-beijing
  memorySize: 256
  timeout: 30
  environment:
    NODE_ENV: production
    DB_HOST: ${file(./config.json):DB_HOST}
    REDIS_HOST: ${file(./config.json):REDIS_HOST

functions:
  api:
    handler: index.main
    events:
      - apigw:
          path: /
          method: ANY
      - apigw:
          path: /{proxy+}
          method: ANY
```

```javascript
// index.js (云函数入口)
const { createProxyServer } = require('http-proxy-middleware')
const express = require('express')
const app = express()

// 导入后端应用
require('./src/app')

// 云函数处理函数
exports.main = async (event, context) => {
  // 处理 API 网关事件
  if (event.httpMethod) {
    return await handleAPIGateway(event)
  }

  // 处理其他事件
  return { statusCode: 200, body: 'Hello World' }
}

async function handleAPIGateway(event) {
  const app = require('./src/app')

  return new Promise((resolve) => {
    app(event, {
      setHeader: (name, value) => {
        // 设置响应头
      },
      send: (body) => {
        resolve({
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: typeof body === 'string' ? body : JSON.stringify(body)
        })
      }
    })
  })
}
```

#### 部署脚本 (`scripts/deploy.js`)
```javascript
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

async function deploy() {
  try {
    console.log('🚀 开始部署基你太美应用...')

    // 1. 构建前端
    console.log('📦 构建前端应用...')
    execSync('cd frontend && npm run build', { stdio: 'inherit' })

    // 2. 上传静态文件到 COS
    console.log('☁️ 上传静态文件...')
    execSync('cos-cli upload ./frontend/dist/ cos://jntm-frontend/ --recursive', { stdio: 'inherit' })

    // 3. 部署云函数
    console.log('🔧 部署云函数...')
    execSync('npm run deploy:functions', { stdio: 'inherit' })

    // 4. 更新环境配置
    console.log('⚙️ 更新配置...')
    await updateEnvironmentConfig()

    // 5. 健康检查
    console.log('🏥 执行健康检查...')
    await healthCheck()

    console.log('✅ 部署完成！')
    console.log('🌐 前端地址: https://jntm.yourdomain.com')
    console.log('🔗 API 地址: https://service-xxxx.bj.apigw.tencentcs.com')

  } catch (error) {
    console.error('❌ 部署失败:', error.message)
    process.exit(1)
  }
}

async function updateEnvironmentConfig() {
  const config = {
    API_BASE_URL: process.env.API_BASE_URL,
    DB_HOST: process.env.DB_HOST,
    REDIS_HOST: process.env.REDIS_HOST,
    // 其他环境变量
  }

  fs.writeFileSync(
    path.join(__dirname, '../.env.production'),
    Object.entries(config)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')
  )
}

async function healthCheck() {
  // 实现健康检查逻辑
  const response = await fetch(process.env.API_BASE_URL + '/health')
  if (!response.ok) {
    throw new Error('健康检查失败')
  }
}

deploy()
```

### 2. 阿里云函数计算部署

```yaml
# template.yml
ROSTemplateFormatVersion: '2015-09-01'
Transform: Aliyun::Serverless-2018-04-03
Resources:
  jntm-api:
    Type: Aliyun::Serverless::Service
    Properties:
      Description: 基你太美 API 服务
    Functions:
      api:
        Type: Aliyun::Serverless::Function
        Properties:
          Handler: index.handler
          Runtime: nodejs18
          MemorySize: 256
          Timeout: 30
          CodeUri: ./
          Events:
            http:
              Type: HTTP
              Properties:
                AuthType: ANONYMOUS
                Methods: ['GET', 'POST', 'PUT', 'DELETE']
```

## Docker 容器部署

### 1. Dockerfile
```dockerfile
# 多阶段构建
FROM node:18-alpine AS builder

# 构建阶段
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# 运行阶段
FROM node:18-alpine AS runtime

# 安装 dumb-init
RUN apk add --no-cache dumb-init

# 创建应用用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# 复制构建产物
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 启动应用
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
```

### 2. Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - REDIS_HOST=redis
    depends_on:
      - mysql
      - redis
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=jntm
      - MYSQL_USER=jntm_user
      - MYSQL_PASSWORD=jntm_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "3306:3306"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./frontend/dist:/usr/share/nginx/html
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mysql_data:
  redis_data:
```

### 3. Nginx 配置
```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    # 限制请求频率
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=upload:10m rate=1r/s;

    server {
        listen 80;
        server_name jntm.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name jntm.yourdomain.com;

        # SSL 配置
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # 前端静态文件
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;

            # 缓存配置
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # API 接口
        location /api/ {
            limit_req zone=api burst=20 nodelay;

            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # 超时配置
            proxy_connect_timeout 5s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # 文件上传
        location /api/ocr/upload {
            limit_req zone=upload burst=5 nodelay;

            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            client_max_body_size 10M;
        }

        # 健康检查
        location /health {
            proxy_pass http://app;
            access_log off;
        }
    }
}
```

## CI/CD 自动部署

### GitHub Actions 工作流
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Run tests
      run: npm run test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build application
      run: npm run build
      env:
        NODE_ENV: production

    - name: Build Docker image
      run: |
        docker build -t jntm:${{ github.sha }} .
        docker tag jntm:${{ github.sha }} jntm:latest

    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push jntm:${{ github.sha }}
        docker push jntm:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Deploy to production
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/jntm
          docker-compose pull
          docker-compose up -d
          docker system prune -f

    - name: Health check
      run: |
        sleep 30
        curl -f ${{ secrets.API_URL }}/health
```

## 环境配置管理

### 1. 生产环境配置
```bash
# .env.production
NODE_ENV=production
PORT=3000

# 数据库配置
DB_TYPE=mysql
DB_HOST=your-mysql-host
DB_PORT=3306
DB_NAME=jntm
DB_USER=jntm_user
DB_PASSWORD=your-secure-password

# Redis 配置
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT 配置
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=7d

# AI API 配置
DEEPSEEK_API_KEY=your-deepseek-api-key
QWEN_API_KEY=your-qwen-api-key

# OCR 服务配置
TENCENT_SECRET_ID=your-tencent-secret-id
TENCENT_SECRET_KEY=your-tencent-secret-key

# 文件上传配置
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=10485760

# 外部服务配置
FUND_DATA_API=https://fund.eastmoney.com

# 监控配置
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### 2. 配置加密
```javascript
// scripts/encrypt-config.js
const crypto = require('crypto')
const fs = require('fs')

class ConfigEncryptor {
  constructor(secretKey) {
    this.algorithm = 'aes-256-gcm'
    this.secretKey = crypto.scryptSync(secretKey, 'salt', 32)
  }

  encrypt(text) {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(this.algorithm, this.secretKey)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    }
  }

  decrypt(encryptedData) {
    const decipher = crypto.createDecipher(this.algorithm, this.secretKey)
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'))

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  encryptConfig(configPath, outputPath) {
    const config = fs.readFileSync(configPath, 'utf8')
    const encrypted = this.encrypt(config)

    fs.writeFileSync(outputPath, JSON.stringify(encrypted))
  }

  decryptConfig(encryptedPath, outputPath) {
    const encrypted = JSON.parse(fs.readFileSync(encryptedPath, 'utf8'))
    const decrypted = this.decrypt(encrypted)

    fs.writeFileSync(outputPath, decrypted)
  }
}

// 使用示例
const encryptor = new ConfigEncryptor(process.env.CONFIG_SECRET)
encryptor.encryptConfig('.env.production', '.env.production.encrypted')
```

## 监控和日志

### 1. 应用监控
```javascript
// src/monitoring/health.js
class HealthChecker {
  constructor() {
    this.checks = []
  }

  addCheck(name, checkFn) {
    this.checks.push({ name, checkFn })
  }

  async runChecks() {
    const results = await Promise.allSettled(
      this.checks.map(async ({ name, checkFn }) => {
        const startTime = Date.now()
        const result = await checkFn()
        const duration = Date.now() - startTime

        return {
          name,
          status: 'healthy',
          duration,
          ...result
        }
      })
    )

    return {
      status: results.every(r => r.status === 'fulfilled') ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: results.map(r => r.value || r.reason)
    }
  }
}

// 健康检查端点
app.get('/health', async (req, res) => {
  const healthChecker = new HealthChecker()

  // 添加各种检查
  healthChecker.addCheck('database', async () => {
    const db = require('./database')
    await db.query('SELECT 1')
    return { message: 'Database connection OK' }
  })

  healthChecker.addCheck('redis', async () => {
    const redis = require('./redis')
    await redis.ping()
    return { message: 'Redis connection OK' }
  })

  healthChecker.addCheck('external-apis', async () => {
    // 检查外部 API 可用性
    const response = await fetch('https://api.deepseek.com/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` }
    })
    return {
      status: response.ok ? 'OK' : 'FAIL',
      message: response.ok ? 'External APIs OK' : 'External API error'
    }
  })

  const health = await healthChecker.runChecks()
  const statusCode = health.status === 'healthy' ? 200 : 503

  res.status(statusCode).json(health)
})
```

### 2. 性能监控
```javascript
// src/monitoring/performance.js
const prometheus = require('prom-client')

// 创建指标
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
})

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
})

const aiApiCalls = new prometheus.Counter({
  name: 'ai_api_calls_total',
  help: 'Total number of AI API calls',
  labelNames: ['model', 'status']
})

// 中间件
function metricsMiddleware(req, res, next) {
  const start = Date.now()

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000
    const route = req.route ? req.route.path : req.path

    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration)

    httpRequestTotal
      .labels(req.method, route, res.statusCode)
      .inc()
  })

  next()
}

// 指标端点
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType)
  res.end(await prometheus.register.metrics())
})
```

## 备份和恢复

### 1. 数据库备份
```bash
#!/bin/bash
# scripts/backup-database.sh

BACKUP_DIR="/opt/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="jntm"
DB_USER="jntm_user"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/db_backup_$TIMESTAMP.sql

# 压缩备份文件
gzip $BACKUP_DIR/db_backup_$TIMESTAMP.sql

# 删除 7 天前的备份
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "数据库备份完成: $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"
```

### 2. 文件备份
```bash
#!/bin/bash
# scripts/backup-files.sh

BACKUP_DIR="/opt/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
UPLOAD_DIR="/opt/jntm/uploads"

# 备份上传文件
tar -czf $BACKUP_DIR/files_backup_$TIMESTAMP.tar.gz -C $UPLOAD_DIR .

# 同步到云存储
aws s3 sync $UPLOAD_DIR s3://jntm-backups/files/ --delete

echo "文件备份完成: $BACKUP_DIR/files_backup_$TIMESTAMP.tar.gz"
```

### 3. 自动备份 (Cron Job)
```bash
# 添加到 crontab
# 每天凌晨 2 点备份数据库
0 2 * * * /opt/jntm/scripts/backup-database.sh

# 每天凌晨 3 点备份文件
0 3 * * * /opt/jntm/scripts/backup-files.sh

# 每周日凌晨 4 点完整备份
0 4 * * 0 /opt/jntm/scripts/full-backup.sh
```

## 故障排除

### 常见问题及解决方案

1. **云函数冷启动延迟**
   - 增加内存配置
   - 使用预留并发
   - 优化启动代码

2. **数据库连接超时**
   - 增加连接池大小
   - 调整超时配置
   - 使用连接预热

3. **Redis 连接失败**
   - 检查网络连通性
   - 验证认证配置
   - 使用重连机制

4. **文件上传失败**
   - 检查存储空间
   - 验证文件权限
   - 增加超时时间

5. **API 调用限制**
   - 实现降级机制
   - 增加缓存策略
   - 使用队列处理

这个部署指南提供了完整的生产环境部署方案，包括云函数、容器化、CI/CD、监控等关键环节。