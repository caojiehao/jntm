# JNTM 基你太美 - 智能基金管家 Docker 快速启动指南

## 🚀 一键启动

### 1. 完整启动（推荐）
```bash
# 启动所有服务（包括数据库）
npm run docker:start
```

### 2. 开发模式启动
```bash
# 启动服务（使用现有的数据库）
npm run docker:dev
```

### 3. 仅启动后端服务
```bash
# 仅启动Java和Python服务
npm run docker:backend
```

## 📋 服务说明

| 服务 | 端口 | 说明 |
|-----|------|------|
| Frontend | 5173 | Vue.js 开发服务器 |
| Java Backend | 5080 | Spring Boot 主服务 |
| Python AI Service | 5081 | FastAPI AI分析服务 |
| MySQL | 3306 | 数据库服务 |
| Redis | 6379 | 缓存服务 |
| Nginx | 80 | 反向代理（可选） |

## 🛠️ 管理命令

### 停止服务
```bash
# 停止所有服务
npm run docker:stop

# 强制停止并删除容器
npm run docker:clean
```

### 查看状态
```bash
# 查看服务状态
npm run docker:status

# 查看日志
npm run docker:logs

# 重启服务
npm run docker:restart
```

### 构建镜像
```bash
# 重新构建并启动
npm run docker:build

# 构建特定服务
npm run docker:build:java
npm run docker:build:python
```

## 🔧 环境配置

### 环境变量文件
创建 `.env` 文件并配置以下变量：

```env
# AI API Keys
DEEPSEEK_API_KEY=your_deepseek_api_key
QWEN_API_KEY=your_qwen_api_key

# 腾讯云OCR服务
TENCENT_SECRET_ID=your_tencent_secret_id
TENCENT_SECRET_KEY=your_tencent_secret_key
```

### 数据库配置
- **开发环境**：使用现有的MySQL和Redis容器
- **生产环境**：自动创建新的数据库容器

## 🌐 访问地址

启动成功后，您可以通过以下地址访问：

- **前端应用**：http://localhost:5173
- **API文档**：http://localhost:5080/swagger-ui.html
- **健康检查**：http://localhost:5080/api/v1/actuator/health
- **Python AI服务**：http://localhost:5081/docs

## 🔍 故障排除

### 常见问题

1. **端口冲突**
   ```bash
   # 检查端口占用
   lsof -i :5080
   lsof -i :5081
   ```

2. **权限问题**
   ```bash
   # 修复目录权限
   sudo chown -R $USER:$USER ./logs ./uploads
   ```

3. **依赖安装失败**
   ```bash
   # 清理并重新安装
   npm run docker:clean
   npm run docker:start
   ```

### 日志查看
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f java-backend
docker-compose logs -f python-service
```

## 📝 开发说明

### 修改代码后重启
```bash
# 修改前端代码后自动刷新（开发模式）
# 修改后端代码后需要重启
npm run docker:restart
```

### 数据持久化
- 数据库数据：`./mysql-data` 目录
- 应用日志：`./logs` 目录
- 上传文件：`./uploads` 目录

## 🔐 默认账号

- **用户名**：admin
- **密码**：123456

> ⚠️ **安全提示**：请在生产环境中修改默认密码