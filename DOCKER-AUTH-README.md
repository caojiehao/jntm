# JNTM 智能基金管家 - Docker认证系统部署指南

## 🎵 概述

本项目包含完整的用户认证系统，支持Docker容器化部署。系统实现了三大投资主题（FIRE、全球配置、跑赢通胀）的用户注册、登录、主题切换和投资管理功能。

## 🏗️ 架构组件

### 认证系统
- **JWT Token认证**：安全的无状态身份验证
- **Spring Security**：企业级安全框架
- **用户角色管理**：支持管理员和普通用户
- **主题化配置**：用户可选择不同的投资主题

### 服务组件
- **MySQL 8.0**：主数据库，存储用户和业务数据
- **Redis 7**：缓存服务和会话存储
- **Java Spring Boot**：主后端服务（5080端口）
- **Python FastAPI**：AI分析服务（5081端口）
- **Node.js Mock API**：开发环境Mock服务（8888端口）
- **Vue.js 前端**：用户界面（5173端口）
- **Nginx**：反向代理和负载均衡

## 🚀 快速启动

### 前置要求
- Docker 20.10+
- Docker Compose 2.0+
- OpenSSH（用于生成SSL证书）

### 一键启动
```bash
# 克隆项目
git clone <repository-url>
cd jntm

# 启动所有服务
./start-auth-services.sh
```

### 启动命令详解
```bash
# 完整启动（推荐）
./start-auth-services.sh

# 仅停止服务
./start-auth-services.sh stop

# 完全清理（删除容器和镜像）
./start-auth-services.sh clean
```

## 📍 访问地址

### 开发环境
- **前端开发服务**: http://localhost:5173
- **Mock API服务**: http://localhost:8888
- **Java后端API**: http://localhost:5080
- **Python AI服务**: http://localhost:5081
- **Nginx开发代理**: http://localhost:8080

### 生产环境
- **主站点**: https://localhost

## 👤 测试账号

| 用户名 | 密码 | 角色 | 默认主题 |
|--------|------|------|----------|
| admin | password123 | 管理员 | FIRE |
| testuser | password123 | 普通用户 | FIRE |
| fire_investor | password123 | 普通用户 | FIRE |
| global_investor | password123 | 普通用户 | 全球配置 |
| inflation_investor | password123 | 普通用户 | 跑赢通胀 |

## 🔧 功能特性

### 用户认证
- ✅ 用户注册和登录
- ✅ JWT Token认证
- ✅ 密码加密存储
- ✅ 用户会话管理
- ✅ 权限控制

### 主题管理
- ✅ 三大投资主题选择
- ✅ 主题切换历史记录
- ✅ 个性化偏好设置
- ✅ 主题化工具使用

### 数据管理
- ✅ 用户信息管理
- ✅ 基金数据管理
- ✅ 投资组合跟踪
- ✅ 工具使用记录

## 📊 数据库结构

### 核心表结构
- **users**: 用户基础信息
- **theme_configs**: 主题配置
- **user_theme_preferences**: 用户主题偏好
- **theme_switch_history**: 主题切换历史
- **funds**: 基金信息
- **user_funds**: 用户基金持仓
- **theme_tool_usage**: 工具使用记录

### 视图和索引
- **user_complete_info**: 用户完整信息视图
- **user_portfolio_summary**: 投资组合汇总视图
- 针对查询优化的索引策略

## 🔐 安全配置

### JWT配置
- 访问Token有效期：7天
- 刷新Token有效期：30天
- 密钥长度：256位
- 支持Token黑名单

### SSL/TLS
- 自签名开发证书
- HTTPS生产支持
- HSTS安全头部
- CORS跨域配置

### 数据安全
- BCrypt密码加密
- SQL注入防护
- XSS攻击防护
- CSRF保护

## 📋 Docker配置详解

### docker-compose-with-auth.yml
包含完整的服务定义：
```yaml
services:
  mysql:          # 数据库服务
  redis:          # 缓存服务
  java-backend:   # Java主服务
  python-service: # AI服务
  mock-api:       # Mock API（开发）
  frontend:       # 前端开发服务
  nginx:          # 反向代理
```

### 环境变量
```bash
# 数据库配置
MYSQL_ROOT_PASSWORD=root123456
MYSQL_DATABASE=jntm
MYSQL_USER=jntm_user
MYSQL_PASSWORD=123456

# JWT配置
JWT_SECRET=your-super-secret-key
JWT_EXPIRATION=604800000
JWT_REFRESH_EXPIRATION=2592000000

# AI服务密钥（可选）
DEEPSEEK_API_KEY=your-deepseek-key
QWEN_API_KEY=your-qwen-key
```

## 🔧 开发和调试

### 查看日志
```bash
# 查看所有服务日志
./start-auth-services.sh

# 查看特定服务日志
docker-compose -f docker-compose-with-auth.yml logs -f java-backend
docker-compose -f docker-compose-with-auth.yml logs -f python-service
docker-compose -f docker-compose-with-auth.yml logs -f frontend
```

### 进入容器
```bash
# 进入Java后端容器
docker-compose -f docker-compose-with-auth.yml exec java-backend bash

# 进入MySQL容器
docker-compose -f docker-compose-with-auth.yml exec mysql mysql -uroot -p

# 进入Redis容器
docker-compose -f docker-compose-with-auth.yml exec redis redis-cli
```

### 数据库操作
```bash
# 连接数据库
docker-compose -f docker-compose-with-auth.yml exec mysql mysql -uroot -proot123456 jntm

# 备份数据库
docker-compose -f docker-compose-with-auth.yml exec mysql mysqldump -uroot -proot123456 jntm > backup.sql

# 恢复数据库
docker-compose -f docker-compose-with-auth.yml exec -T mysql mysql -uroot -proot123456 jntm < backup.sql
```

## 🔄 API接口

### 认证接口
```http
POST /api/v1/auth/login      # 用户登录
POST /api/v1/auth/register   # 用户注册
POST /api/v1/auth/refresh    # 刷新Token
GET  /api/v1/auth/verify     # 验证Token
POST /api/v1/auth/logout     # 用户登出
GET  /api/v1/auth/me         # 获取当前用户
```

### 主题接口
```http
GET  /api/v1/themes          # 获取主题列表
POST /api/v1/themes/switch   # 切换主题
GET  /api/v1/themes/metrics  # 主题指标
```

### 用户接口
```http
GET  /api/v1/users/profile    # 用户资料
PUT  /api/v1/users/profile    # 更新资料
GET  /api/v1/users/portfolio  # 投资组合
```

## 📈 性能优化

### 数据库优化
- 索引策略优化
- 查询性能调优
- 连接池配置
- 读写分离支持

### 缓存策略
- Redis缓存热点数据
- 用户会话缓存
- API响应缓存
- 静态资源CDN

### 容器优化
- 镜像大小优化
- 多阶段构建
- 健康检查配置
- 资源限制设置

## 🛠️ 故障排除

### 常见问题

1. **端口冲突**
   ```bash
   # 检查端口占用
   lsof -i :5173
   # 修改docker-compose.yml中的端口映射
   ```

2. **数据库连接失败**
   ```bash
   # 检查MySQL容器状态
   docker-compose -f docker-compose-with-auth.yml ps mysql
   # 查看MySQL日志
   docker-compose -f docker-compose-with-auth.yml logs mysql
   ```

3. **JWT Token错误**
   ```bash
   # 检查JWT密钥配置
   docker-compose -f docker-compose-with-auth.yml exec java-backend env | grep JWT
   ```

4. **前端无法访问后端**
   ```bash
   # 检查网络连接
   docker network ls
   docker network inspect jntm_jntm-network
   ```

### 性能监控
```bash
# 查看容器资源使用
docker stats

# 查看服务健康状态
curl http://localhost:5080/api/v1/actuator/health
```

## 🚀 生产部署

### 安全加固
- 使用真实SSL证书
- 配置防火墙规则
- 定期更新依赖包
- 监控安全漏洞

### 备份策略
- 定期数据库备份
- 配置文件备份
- 日志轮转设置
- 灾难恢复计划

### 扩展性
- 水平扩展支持
- 负载均衡配置
- 微服务架构
- 云原生部署

## 📞 技术支持

### 获取帮助
- 查看项目文档：`docs/` 目录
- 提交Issue：GitHub Issues
- 技术讨论：项目Discussions

### 贡献指南
- Fork项目仓库
- 创建功能分支
- 提交Pull Request
- 参与代码审查

---

**🎵 基你太美 - 选择你的投资主题，让投资更有方向感！**