# 开发环境搭建指南

## 环境要求

### 基础环境
- **Node.js**: >= 18.0.0 (推荐使用 LTS 版本)
- **npm**: >= 8.0.0 或 **pnpm**: >= 7.0.0
- **Git**: >= 2.30.0

### 开发工具（推荐）
- **IDE**: VS Code + Vue Language Features (Volar)
- **API测试**: Postman 或 Insomnia
- **数据库管理**: DB Browser for SQLite
- **版本控制**: Git + GitHub Desktop (可选)

## 项目初始化

### 1. 克隆项目
```bash
git clone https://github.com/your-username/jntm.git
cd jntm
```

### 2. 安装依赖
```bash
# 安装根目录依赖
npm install

# 安装所有子项目依赖（推荐）
npm run setup

# 或手动安装
cd backend && npm install
cd ../frontend && npm install
```

### 3. 环境配置

#### 后端环境配置
```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件：
```env
# 应用配置
NODE_ENV=development
PORT=3000
APP_NAME=基你太美
APP_VERSION=1.0.0

# 数据库配置
DB_PATH=./database/jntm.db
DB_TYPE=sqlite

# Redis配置（开发环境可选）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# AI API配置
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
QWEN_API_KEY=your_qwen_api_key
QWEN_BASE_URL=https://dashscope.aliyuncs.com/api/v1

# OCR服务配置
TENCENT_SECRET_ID=your_tencent_secret_id
TENCENT_SECRET_KEY=your_tencent_secret_key
TENCENT_REGION=ap-beijing

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB

# 外部API配置
FUND_DATA_API=https://fund.eastmoney.com
API_TIMEOUT=30000

# 日志配置
LOG_LEVEL=debug
LOG_DIR=./logs
```

#### 前端环境配置
```bash
cd frontend
cp .env.example .env.local
```

编辑 `.env.local` 文件：
```env
# API配置
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_TITLE=基你太美 - 智能基金管家

# 功能开关
VITE_ENABLE_AI=true
VITE_ENABLE_OCR=true
VITE_ENABLE_ANALYTICS=false

# 上传配置
VITE_UPLOAD_MAX_SIZE=10485760
VITE_UPLOAD_ACCEPT=image/*