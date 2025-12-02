# Git 工作流规范

## 分支策略

### 主要分支

#### `main` 分支
- **用途**：生产环境代码
- **保护规则**：
  - 禁止直接推送
  - 必须通过 Pull Request 合并
  - 必须通过所有 CI 检查
  - 必须有代码审查

#### `develop` 分支
- **用途**：开发环境代码，功能集成分支
- **保护规则**：
  - 禁止直接推送
  - 必须通过 Pull Request 合并
  - 必须通过测试

### 辅助分支

#### 功能分支 (`feature/*`)
```bash
# 命名规范
feature/user-authentication
feature/ocr-recognition
feature/ai-analysis
feature/dashboard-charts

# 创建功能分支
git checkout -b feature/ocr-recognition develop

# 完成开发后合并到 develop
git checkout develop
git merge feature/ocr-recognition
git branch -d feature/ocr-recognition
```

#### 修复分支 (`bugfix/*`)
```bash
# 命名规范
bugfix/login-validation-error
bugfix/chart-rendering-issue
bugfix/api-response-format

# 创建修复分支
git checkout -b bugfix/login-validation-error develop

# 修复完成后合并到 develop 和 main
git checkout develop
git merge bugfix/login-validation-error

git checkout main
git merge bugfix/login-validation-error
git branch -d bugfix/login-validation-error
```

#### 热修复分支 (`hotfix/*`)
```bash
# 命名规范
hotfix/security-patch
hotfix/critical-bug-fix

# 从 main 创建
git checkout -b hotfix/security-patch main

# 修复完成后合并到 main 和 develop
git checkout main
git merge hotfix/security-patch
git tag -a v1.0.1 -m "修复安全漏洞"

git checkout develop
git merge hotfix/security-patch
git branch -d hotfix/security-patch
```

#### 发布分支 (`release/*`)
```bash
# 命名规范
release/v1.1.0
release/v2.0.0-beta

# 从 develop 创建
git checkout -b release/v1.1.0 develop

# 完成后合并到 main 和 develop
git checkout main
git merge release/v1.1.0
git tag -a v1.1.0 -m "发布版本 1.1.0"

git checkout develop
git merge release/v1.1.0
git branch -d release/v1.1.0
```

## 提交规范

### 提交消息格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type 类型
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 重构代码
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `ci`: CI/CD 配置文件变更

#### Scope 范围
- `frontend`: 前端代码
- `backend`: 后端代码
- `api`: API 接口
- `database`: 数据库相关
- `ui`: UI 组件
- `auth`: 认证模块
- `portfolio`: 投资组合模块
- `ai`: AI 分析模块
- `ocr`: OCR 识别模块

### 提交示例

#### 新功能
```bash
feat(ai): 添加基金风险分析功能

- 实现 DeepSeek API 集成
- 添加风险指标计算逻辑
- 创建分析结果展示组件

Closes #123
```

#### Bug 修复
```bash
fix(ocr): 修复截图识别率低的问题

- 优化图像预处理算法
- 调整 OCR 参数配置
- 增加手动校验步骤

Fixes #456
```

#### 重构
```bash
refactor(backend): 重构用户认证模块

- 提取通用认证逻辑到服务层
- 统一错误处理机制
- 优化 JWT 令牌管理
```

## Pull Request 规范

### PR 标题格式
```
<type>(<scope>): <subject>
```

### PR 描述模板
```markdown
## 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 重构
- [ ] 文档更新
- [ ] 性能优化
- [ ] 其他

## 变更描述
简要描述本次变更的内容和目的。

## 测试计划
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动测试完成
- [ ] 跨浏览器测试（前端）

## 相关 Issue
Closes #issue_number

## 检查清单
- [ ] 代码符合项目规范
- [ ] 已添加必要的测试
- [ ] 文档已更新
- [ ] 无 console.log 或 debugger
- [ ] 无破坏性变更

## 截图（如适用）
如果是 UI 相关变更，请提供截图。
```

### PR 审查流程

#### 审查者检查项
1. **代码质量**
   - 代码逻辑清晰
   - 命名规范
   - 注释完整
   - 无重复代码

2. **功能实现**
   - 功能符合需求
   - 边界条件处理
   - 错误处理完善

3. **测试覆盖**
   - 单元测试完整
   - 边界情况测试
   - 性能影响评估

4. **安全性**
   - 无安全漏洞
   - 输入验证
   - 权限检查

#### 合并要求
- 至少一个审查者 approve
- 所有 CI 检查通过
- 解决所有审查意见
- 无冲突

## 工作流程示例

### 新功能开发流程

1. **开始开发**
```bash
# 更新 develop 分支
git checkout develop
git pull origin develop

# 创建功能分支
git checkout -b feature/fund-analysis develop

# 开始开发...
# 提交代码
git add .
git commit -m "feat(analysis): 添加基金分析功能基础架构"
```

2. **开发过程中**
```bash
# 定期同步 develop 分支
git fetch origin
git rebase origin/develop

# 解决冲突后继续开发
git add .
git commit -m "fix(analysis): 解决合并冲突"
```

3. **完成开发**
```bash
# 推送到远程分支
git push origin feature/fund-analysis

# 创建 Pull Request
# 等待代码审查
# 根据反馈修改代码
```

4. **合并代码**
```bash
# 审查通过后合并
git checkout develop
git pull origin develop
git merge feature/fund-analysis
git push origin develop

# 删除功能分支
git branch -d feature/fund-analysis
git push origin --delete feature/fund-analysis
```

### 紧急修复流程

```bash
# 从 main 创建热修复分支
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix main

# 快速修复
git add .
git commit -m "hotfix: 修复严重安全漏洞"

# 推送并创建 PR
git push origin hotfix/critical-security-fix

# 快速审查和合并
git checkout main
git merge hotfix/critical-security-fix
git tag -a v1.0.1 -m "紧急安全修复版本"

# 同步到 develop
git checkout develop
git merge hotfix/critical-security-fix
git push origin develop

# 清理
git branch -d hotfix/critical-security-fix
```

## 版本发布流程

### 语义化版本控制
- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

### 发布步骤

1. **准备发布**
```bash
# 从 develop 创建发布分支
git checkout -b release/v1.2.0 develop

# 更新版本号
# 修复发现的 bug
# 更新 CHANGELOG.md
```

2. **发布测试**
```bash
# 部署到测试环境
# 进行完整测试
# 修复问题
```

3. **正式发布**
```bash
# 合并到 main
git checkout main
git merge release/v1.2.0
git tag -a v1.2.0 -m "发布版本 1.2.0"

# 合并回 develop
git checkout develop
git merge release/v1.2.0

# 推送所有变更
git push origin main --tags
git push origin develop

# 删除发布分支
git branch -d release/v1.2.0
```

## 常见问题

### 分支冲突解决
```bash
# 在功能分支上合并 develop
git checkout feature/your-feature
git merge develop

# 解决冲突后
git add .
git commit -m "conflict: 解决与 develop 分支的冲突"
```

### 提交历史清理
```bash
# 交互式 rebase 清理提交历史
git rebase -i HEAD~3

# squash 多个提交为一个
# fixup 修复前一个提交
# reword 修改提交消息
```

### 回滚操作
```bash
# 回滚单个提交（保留历史）
git revert <commit-hash>

# 回滚到指定提交（删除历史）
git reset --hard <commit-hash>

# 撤销工作区修改
git checkout -- <file>
```

## Git Hooks 配置

### 安装 Husky
```bash
npm install --save-dev husky
npx husky install
npm pkg set scripts.prepare="husky install"
```

### 配置 Pre-commit Hook
```bash
npx husky add .husky/pre-commit "npm run lint && npm run test"
```

### 配置 Commit-msg Hook
```bash
npx husky add .husky/commit-msg "npx commitlint --edit $1"
```