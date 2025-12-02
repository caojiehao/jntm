# 多阶段构建
# 阶段1：构建前端
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# 复制前端依赖文件
COPY frontend/package*.json ./

# 安装前端依赖
RUN npm ci --only=production

# 复制前端源码
COPY frontend/ .

# 构建前端
RUN npm run build

# 阶段2：构建后端
FROM node:18-alpine AS backend-build

WORKDIR /app/backend

# 复制后端依赖文件
COPY backend/package*.json ./

# 安装后端依赖
RUN npm ci --only=production

# 复制后端源码
COPY backend/ .

# 复制构建好的前端
COPY --from=frontend-build /app/frontend/dist ./public

# 创建必要的目录
RUN mkdir -p ./database ./uploads ./logs

# 初始化数据库
RUN node src/scripts/init-database.js

# 添加种子数据
RUN node src/scripts/seed-data.js

# 阶段3：生产环境
FROM node:18-alpine AS production

# 设置工作目录
WORKDIR /app

# 安装dumb-init用于信号处理
RUN apk add --no-cache dumb-init

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 复制后端构建产物
COPY --from=backend-build --chown=nodejs:nodejs /app/backend ./

# 切换到非root用户
USER nodejs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => { process.exit(1) })"

# 启动应用
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/app.js"]