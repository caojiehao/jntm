# CLAUDE.md

用中文回答
你是一个资深专业的软件系统设计师和系统架构师，熟悉前后端的技术栈

此文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

"基你太美" (JNTM) 是一款创新的**主题化智能基金管家工具**，通过不同的投资理念主题为用户提供个性化的投资体验。用户可以选择三大主题："提前退休"(FIRE)、"这还是国内吗"(全球配置) 和"跑赢通胀"(保值增值)，每个主题都配备专属的投资工具和分析视角。

## 核心架构

### 主题化系统设计

这是**核心架构概念** - 整个系统围绕主题化个性化构建：

1. **三大投资主题**：
   - 🏖️ **FIRE主题**：退休规划、被动收入分析、4%法则验证
   - 🌍 **全球配置主题**：国际市场对比、QDII筛选、汇率分析
   - 💰 **保值增值主题**：实际收益计算、通胀追踪、购买力保护

2. **主题服务架构**：
   - `ThemeService`：核心主题管理服务
   - 主题特定分析器（`FireThemeAnalyzer`、`GlobalThemeAnalyzer`、`InflationAnalyzer`）
   - 基于主题的动态组件加载
   - 用户主题偏好和设置持久化

### 技术栈

**前端技术栈**：Vue 3.4+ Composition API、Vite 5+、Element Plus、ECharts 5+、Pinia、TypeScript
**后端技术栈**：Java 17+、Spring Boot 3.x、MySQL 8.0、Redis、JWT
**AI服务**：Python 3.11+、FastAPI、DeepSeek AI API、Qwen AI API
**外部服务**：腾讯云OCR、基金数据API

## 项目结构

```
jntm/
├── frontend/          # Vue 3应用，基于主题的组件
├── java-backend/      # Spring Boot API服务，包含主题管理服务
├── python-service/    # FastAPI AI服务
├── docs/              # 完整的技术文档
└── scripts/           # 部署脚本
```

### 核心架构模式

1. **主题化状态管理**：
   - `useThemeStore` 管理当前主题和偏好设置
   - 基于用户选择主题的动态指标计算
   - 主题特定API响应

2. **模块化服务架构**：
   - 每个主题都有专门的服务模块，位于 `java-backend/src/main/java/com/jntm/service/`
   - 跨主题共享的通用服务
   - 主题特定计算的插件式工具系统

3. **数据库设计**：
   - 用户表扩展了主题偏好和投资目标
   - 主题特定表：`theme_configs`、`user_theme_preferences`、`theme_switch_history`
   - 按主题跟踪投资目标

## 常用开发命令

### 环境搭建
```bash
npm run setup                    # 安装前端依赖
cd java-backend && ./mvnw clean install  # 构建Java后端
cd ../python-service && pip install -r requirements.txt  # 安装Python依赖
```

### 开发调试
```bash
npm run dev:frontend              # 启动前端 (Vite开发服务器，端口：5173)
npm run docker:dev                # 启动后端服务 (Java + Python)
```

### 构建打包
```bash
npm run build:frontend            # 构建前端
npm run docker:build             # 构建后端Docker镜像
```

### 测试验证
```bash
npm run test:frontend             # 运行前端测试
```

### 代码质量
```bash
npm run lint:frontend             # 检查前端代码
```

## 开发环境配置

### Java后端环境 (java-backend/.env)
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=jntm
DB_USERNAME=root
DB_PASSWORD=root

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

# 身份认证
JWT_SECRET=your-super-secret-jwt-key
```

### Python AI服务环境 (python-service/.env)
```env
# AI API配置
DEEPSEEK_API_KEY=your_deepseek_api_key
QWEN_API_KEY=your_qwen_api_key

# OCR服务
TENCENT_SECRET_ID=your_tencent_secret_id
TENCENT_SECRET_KEY=your_tencent_secret_key
```

### 前端环境 (frontend/.env.local)
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_AI_SERVICE_URL=http://localhost:8000/api/v1
VITE_APP_TITLE=基你太美 - 智能基金管家
VITE_ENABLE_AI=true
VITE_ENABLE_OCR=true
```

## 主题化开发

### 添加新主题功能

1. **后端主题分析器**：扩展 `java-backend/src/main/java/com/jntm/service/`
   ```java
   @Service
   public class NewThemeAnalyzer extends BaseThemeAnalyzer {
     public ThemeAnalysisResult analyze(List<Portfolio> portfolios) {
       ThemeAnalysisResult basicMetrics = calculateBasicMetrics(portfolios);
       // 添加主题特定分析逻辑
       return basicMetrics.withThemeSpecific(customMetrics);
     }
   }
   ```

2. **前端主题组件**：添加到 `frontend/src/themes/`
   ```
   themes/
   ├── fire/           # 现有FIRE主题组件
   ├── global/         # 现有全球配置主题组件
   ├── inflation/      # 现有保值增值主题组件
   └── new-theme/      # 新主题组件
   ```

3. **主题配置**：更新数据库 `theme_configs` 表中的新主题设置

### 主题API端点

核心主题相关API：
- `GET /themes` - 获取所有可用主题列表
- `GET /themes/current` - 获取用户当前主题
- `POST /themes/switch` - 切换用户主题
- `GET /themes/metrics` - 获取基于主题的投资组合指标
- `POST /themes/tools/usage` - 记录工具使用情况用于分析

### 主题相关数据库表

核心主题相关表：
- `users.current_theme` - 用户当前选择的主题
- `theme_configs` - 主题配置和设置
- `user_theme_preferences` - 用户特定的主题偏好
- `theme_switch_history` - 跟踪用户主题切换行为
- `theme_tool_usage` - 跟踪主题特定工具的使用情况

## 关键集成点

### AI服务集成
- 双AI模型支持（DeepSeek + Qwen）及降级机制
- AI服务可靠性的熔断器模式
- 主题特定AI提示和分析策略

### OCR集成
- 腾讯云OCR用于基金截图识别
- 支持多种基金APP截图格式
- OCR结果的手工验证工作流

### 基金数据集成
- 多数据源（天天基金、东方财富）
- 实时基金数据更新和净值历史跟踪
- 全球配置主题的货币转换计算

## 性能优化考虑

1. **主题切换**：缓存主题配置以实现即时切换
2. **数据可视化**：主题特定图表组件的懒加载
3. **AI分析**：AI服务调用的速率限制和缓存
4. **数据库**：主题相关查询的索引优化

## 测试策略

- 主题分析器和计算器的单元测试
- 主题切换功能的集成测试
- 各主题内完整用户流程的端到端测试
- 基于主题的指标计算的性能测试

## 部署说明

项目采用**容器化部署**策略：
1. **开发阶段**：Docker Compose本地开发环境
2. **测试阶段**：云服务器Docker部署
3. **生产阶段**：Kubernetes集群部署

主题化架构支持**按主题的增量功能发布**，实现更安全的生产部署和新功能的A/B测试。

## 中文开发注意事项

### 代码注释
- 所有新增代码必须添加中文注释
- 复杂逻辑需要详细说明业务背景
- API接口需要中文错误信息

### 用户界面
- 所有前端界面文本使用中文
- 主题名称和描述需要本地化
- 错误提示和帮助信息为中文

### 文档维护
- 更新技术文档时使用中文描述
- 保持术语的一致性和准确性
- 技术概念中英文对照清晰

### 开发工具
- VSCode插件配置支持中文
- Git提交信息使用中文
- 代码审查用中文沟通

## 技术术语对照

| 英文术语 | 中文翻译 | 说明 |
|---------|---------|------|
| Theme | 主题 | 投资理念分类 |
| Analyzer | 分析器 | 主题特定分析逻辑 |
| Portfolio | 投资组合 | 用户持有的基金集合 |
| NAV | 净值 | 基金单位净值 |
| FIRE | 财务独立 | Financial Independence, Retire Early |
| OCR | 文字识别 | 光学字符识别 |
| JWT | 令牌 | JSON Web Token |
| API | 接口 | 应用程序接口 |
| Cache | 缓存 | 数据临时存储 |

这份文档将帮助Claude Code更有效地理解和开发"基你太美"项目，特别是在主题化架构和功能开发方面。