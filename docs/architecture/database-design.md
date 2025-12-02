# 数据库设计文档

## 数据库架构概述

### 设计原则
- **规范化设计**: 遵循数据库范式，减少数据冗余
- **性能优化**: 合理设置索引，优化查询性能
- **扩展性**: 预留扩展字段，支持功能迭代
- **数据一致性**: 使用外键约束，保证数据完整性
- **安全性**: 敏感数据加密存储，权限控制

### 数据库选择策略

#### 开发阶段
- **数据库**: SQLite
- **优势**: 零配置、轻量级、适合快速开发
- **适用场景**: 本地开发、功能验证、小规模测试

#### 测试阶段
- **数据库**: MySQL 8.0
- **优势**: 功能完整、性能稳定、社区支持好
- **适用场景**: 集成测试、性能测试、功能验证

#### 生产阶段
- **主数据库**: MySQL 8.0 或 PostgreSQL 14
- **缓存**: Redis 7.0
- **优势**: 高性能、高可用、支持集群
- **适用场景**: 生产环境、大规模用户、高并发访问

## 核心表设计

### 1. 用户表 (users)

```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE,                    -- 改为可选，用于用户昵称
    email VARCHAR(100) UNIQUE,                      -- 改为可选
    phone VARCHAR(20) UNIQUE NOT NULL,              -- 改为必填，作为主要登录方式
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(32) NOT NULL,

    -- 用户基本信息
    avatar_url VARCHAR(255),
    real_name VARCHAR(50),
    id_card VARCHAR(18) ENCRYPTED,

    -- 用户状态
    status ENUM('active', 'inactive', 'suspended', 'deleted') DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT TRUE,               -- 手机号注册时默认已验证

    -- 用户偏好设置
    preferences JSON DEFAULT '{}',

    -- 主题化设置
    current_theme ENUM('fire', 'global', 'inflation') DEFAULT 'fire',
    theme_switch_count INT DEFAULT 0,
    last_theme_switch_at TIMESTAMP NULL,
    theme_preferences JSON DEFAULT '{}',

    -- 投资目标和设置
    investment_goals JSON DEFAULT '[]',
    risk_profile ENUM('conservative', 'moderate', 'aggressive') DEFAULT 'moderate',
    expected_retirement_age INT DEFAULT 65,
    retirement_target_amount DECIMAL(15,2),

    -- 安全设置
    login_attempts INT DEFAULT 0,
    last_login_at TIMESTAMP NULL,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(32) ENCRYPTED,

    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    -- 索引
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_phone (phone),                            -- 新增手机号索引
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_current_theme (current_theme),
    INDEX idx_theme_switch_count (theme_switch_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**字段说明**:
- `id`: 用户唯一标识，使用UUID
- `phone`: 手机号，作为主要登录方式，必填且唯一
- `username`: 用户昵称，可选，用于社交功能
- `email`: 邮箱地址，可选，用于邮件通知
- `preferences`: JSON格式存储用户偏好设置
- `id_card`, `two_factor_secret`: 敏感字段加密存储
- `login_attempts`: 登录失败次数，用于账户锁定
- `status`: 用户状态，支持软删除
- `phone_verified`: 手机号验证状态，注册时默认已验证

### 2. 基金信息表 (funds)

```sql
CREATE TABLE funds (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(50),

    -- 基金基本信息
    fund_type ENUM('股票型', '债券型', '混合型', '货币型', '指数型', 'QDII', 'FOF') NOT NULL,
    company VARCHAR(50) NOT NULL,
    manager VARCHAR(50),
    establish_date DATE,

    -- 基金规模信息
    fund_size DECIMAL(15,2),
    management_fee DECIMAL(5,4),
    custodian_fee DECIMAL(5,4),
    performance_fee DECIMAL(5,4),

    -- 风险等级
    risk_level ENUM('低风险', '中低风险', '中等风险', '中高风险', '高风险'),

    -- 投资范围
    investment_scope TEXT,

    -- 最新净值信息
    nav_unit DECIMAL(10,4),
    nav_accumulated DECIMAL(10,4),
    nav_date DATE,
    daily_change DECIMAL(10,6),
    daily_change_percent DECIMAL(8,4),

    -- 状态
    status ENUM('active', 'suspended', 'terminated') DEFAULT 'active',

    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_sync_at TIMESTAMP NULL,

    -- 索引
    INDEX idx_name (name),
    INDEX idx_company (company),
    INDEX idx_fund_type (fund_type),
    INDEX idx_risk_level (risk_level),
    INDEX idx_nav_date (nav_date),
    INDEX idx_status (status),
    INDEX idx_fund_size (fund_size)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. 用户持仓表 (user_portfolios)

```sql
CREATE TABLE user_portfolios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    fund_code VARCHAR(10) NOT NULL,

    -- 持仓信息
    shares DECIMAL(15,4) NOT NULL,
    cost_price DECIMAL(10,4) NOT NULL,
    cost_amount DECIMAL(15,2) GENERATED ALWAYS AS (shares * cost_price) STORED,

    -- 当前价值
    current_nav DECIMAL(10,4),
    current_value DECIMAL(15,2) GENERATED ALWAYS AS (shares * current_nav) STORED,
    profit_loss DECIMAL(15,2) GENERATED ALWAYS AS (current_value - cost_amount) STORED,
    profit_loss_percent DECIMAL(8,4) GENERATED ALWAYS AS ((current_value - cost_amount) / cost_amount * 100) STORED,

    -- 交易信息
    purchase_date DATE NOT NULL,
    first_purchase_date DATE,
    last_purchase_date DATE,

    -- 状态
    status ENUM('active', 'inactive', 'sold') DEFAULT 'active',

    -- 备注
    notes TEXT,
    tags JSON DEFAULT '[]',

    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    sold_at TIMESTAMP NULL,

    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (fund_code) REFERENCES funds(code) ON DELETE RESTRICT,

    -- 唯一约束
    UNIQUE KEY uk_user_fund (user_id, fund_code, status),

    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_fund_code (fund_code),
    INDEX idx_purchase_date (purchase_date),
    INDEX idx_current_value (current_value),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4. 基金净值历史表 (fund_nav_history)

```sql
CREATE TABLE fund_nav_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fund_code VARCHAR(10) NOT NULL,

    -- 净值信息
    nav_unit DECIMAL(10,4) NOT NULL,
    nav_accumulated DECIMAL(10,4),

    -- 变动信息
    daily_change DECIMAL(10,6),
    daily_change_percent DECIMAL(8,4),

    -- 日期信息
    nav_date DATE NOT NULL,

    -- 统计信息
    total_asset DECIMAL(15,2),
    subscribers INT,

    -- 数据来源
    data_source VARCHAR(50) DEFAULT 'eastmoney',

    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- 外键约束
    FOREIGN KEY (fund_code) REFERENCES funds(code) ON DELETE CASCADE,

    -- 唯一约束
    UNIQUE KEY uk_fund_date (fund_code, nav_date),

    -- 索引
    INDEX idx_nav_date (nav_date),
    INDEX idx_fund_code (fund_code),

    -- 分区表（按年份分区）
    PARTITION BY RANGE (YEAR(nav_date)) (
        PARTITION p2020 VALUES LESS THAN (2021),
        PARTITION p2021 VALUES LESS THAN (2022),
        PARTITION p2022 VALUES LESS THAN (2023),
        PARTITION p2023 VALUES LESS THAN (2024),
        PARTITION p2024 VALUES LESS THAN (2025),
        PARTITION p2025 VALUES LESS THAN (2026),
        PARTITION p_future VALUES LESS THAN MAXVALUE
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5. AI分析记录表 (ai_analyses)

```sql
CREATE TABLE ai_analyses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,

    -- 分析信息
    analysis_type ENUM('risk_assessment', 'portfolio_optimization', 'market_insight', 'custom_query') NOT NULL,
    analysis_purpose VARCHAR(100),

    -- 输入数据
    input_data JSON NOT NULL,
    input_hash VARCHAR(64) NOT NULL,

    -- 分析结果
    result JSON NOT NULL,
    result_summary TEXT,
    confidence_score DECIMAL(3,2),

    -- AI模型信息
    model_used ENUM('deepseek', 'qwen', 'claude') NOT NULL,
    model_version VARCHAR(20),
    tokens_used INT,
    cost DECIMAL(10,6),

    -- 执行信息
    execution_time INT, -- 毫秒
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    error_message TEXT,

    -- 用户反馈
    user_rating INT CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,

    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,

    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_analysis_type (analysis_type),
    INDEX idx_model_used (model_used),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_input_hash (input_hash),

    -- 唯一约束（避免重复分析）
    UNIQUE KEY uk_user_input_hash (user_id, analysis_type, input_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6. OCR识别记录表 (ocr_recognitions)

```sql
CREATE TABLE ocr_recognitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,

    -- 图片信息
    original_filename VARCHAR(255),
    file_path VARCHAR(255) NOT NULL,
    file_size INT,
    file_hash VARCHAR(64) NOT NULL,
    image_width INT,
    image_height INT,

    -- 识别结果
    raw_text TEXT,
    structured_data JSON,
    confidence_score DECIMAL(3,2),

    -- 处理状态
    status ENUM('uploaded', 'processing', 'completed', 'failed', 'confirmed', 'rejected') DEFAULT 'uploaded',

    -- 确认信息
    user_confirmed BOOLEAN DEFAULT FALSE,
    corrected_data JSON,
    confirmation_notes TEXT,

    -- 识别参数
    ocr_provider VARCHAR(20) DEFAULT 'tencent',
    ocr_version VARCHAR(20),

    -- 执行信息
    processing_time INT, -- 毫秒
    error_message TEXT,

    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    confirmed_at TIMESTAMP NULL,

    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_file_hash (file_hash),
    INDEX idx_created_at (created_at),

    -- 唯一约束
    UNIQUE KEY uk_file_hash (file_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 7. 系统配置表 (system_config)

```sql
CREATE TABLE system_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    config_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',

    -- 配置描述
    description TEXT,
    category VARCHAR(50),

    -- 配置属性
    is_encrypted BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    is_readonly BOOLEAN DEFAULT FALSE,

    -- 版本控制
    version INT DEFAULT 1,

    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- 索引
    INDEX idx_category (category),
    INDEX idx_is_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 8. 主题配置表 (theme_configs)

```sql
CREATE TABLE theme_configs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    theme ENUM('fire', 'global', 'inflation') NOT NULL,
    config_name VARCHAR(100) NOT NULL,
    config_value TEXT NOT NULL,
    config_type ENUM('string', 'number', 'boolean', 'json', 'array') DEFAULT 'string',

    -- 配置描述
    description TEXT,
    category VARCHAR(50),

    -- 配置属性
    is_required BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    default_value TEXT,

    -- 版本控制
    version INT DEFAULT 1,

    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- 唯一约束
    UNIQUE KEY uk_theme_config (theme, config_name),

    -- 索引
    INDEX idx_theme (theme),
    INDEX idx_category (category),
    INDEX idx_is_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 9. 用户主题偏好表 (user_theme_preferences)

```sql
CREATE TABLE user_theme_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    theme ENUM('fire', 'global', 'inflation') NOT NULL,

    -- 主题特定偏好设置
    preference_key VARCHAR(100) NOT NULL,
    preference_value TEXT NOT NULL,
    preference_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',

    -- 使用统计
    usage_count INT DEFAULT 1,
    total_usage_minutes INT DEFAULT 0,
    last_used_at TIMESTAMP NULL,

    -- 评分和反馈
    rating INT CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,

    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- 唯一约束
    UNIQUE KEY uk_user_theme_preference (user_id, theme, preference_key),

    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_theme (theme),
    INDEX idx_preference_key (preference_key),
    INDEX idx_last_used_at (last_used_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 10. 投资目标表 (investment_goals)

```sql
CREATE TABLE investment_goals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,

    -- 目标基本信息
    goal_name VARCHAR(100) NOT NULL,
    goal_type ENUM('retirement', 'education', 'house', 'travel', 'emergency', 'other') NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0,

    -- 时间规划
    target_date DATE,
    monthly_contribution DECIMAL(10,2),

    -- 目标状态
    status ENUM('active', 'completed', 'paused', 'cancelled') DEFAULT 'active',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',

    -- 关联主题
    associated_theme ENUM('fire', 'global', 'inflation'),

    -- 进度计算
    progress_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE
            WHEN target_amount > 0 THEN (current_amount / target_amount * 100)
            ELSE 0
        END
    ) STORED,

    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,

    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_goal_type (goal_type),
    INDEX idx_status (status),
    INDEX idx_target_date (target_date),
    INDEX idx_associated_theme (associated_theme)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 11. 主题工具使用记录表 (theme_tool_usage)

```sql
CREATE TABLE theme_tool_usage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    theme ENUM('fire', 'global', 'inflation') NOT NULL,

    -- 工具信息
    tool_name VARCHAR(100) NOT NULL,
    tool_type ENUM('calculator', 'analyzer', 'simulator', 'comparison') NOT NULL,

    -- 使用参数
    input_data JSON NOT NULL,
    output_data JSON,

    -- 使用统计
    usage_duration INT, -- 使用时长（秒）
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,

    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_theme (theme),
    INDEX idx_tool_name (tool_name),
    INDEX idx_created_at (created_at),
    INDEX idx_success (success)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 12. 主题切换记录表 (theme_switch_history)

```sql
CREATE TABLE theme_switch_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,

    -- 切换信息
    from_theme ENUM('fire', 'global', 'inflation') NOT NULL,
    to_theme ENUM('fire', 'global', 'inflation') NOT NULL,

    -- 切换原因
    switch_reason VARCHAR(255),
    user_feedback TEXT,

    -- 上下文信息
    user_agent TEXT,
    ip_address VARCHAR(45),
    device_type ENUM('desktop', 'mobile', 'tablet') DEFAULT 'desktop',

    -- 时间戳
    switched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_from_theme (from_theme),
    INDEX idx_to_theme (to_theme),
    INDEX idx_switched_at (switched_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 13. 操作日志表 (operation_logs)

```sql
CREATE TABLE operation_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36),

    -- 操作信息
    operation_type VARCHAR(50) NOT NULL,
    operation_module VARCHAR(50) NOT NULL,
    operation_action VARCHAR(50) NOT NULL,
    operation_description TEXT,

    -- 请求信息
    request_method VARCHAR(10),
    request_path VARCHAR(255),
    request_params JSON,
    request_ip VARCHAR(45),
    user_agent TEXT,

    -- 响应信息
    response_status INT,
    response_time INT, -- 毫秒
    error_message TEXT,

    -- 影响资源
    affected_resource_type VARCHAR(50),
    affected_resource_id VARCHAR(100),

    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,

    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_operation_type (operation_type),
    INDEX idx_operation_module (operation_module),
    INDEX idx_created_at (created_at),
    INDEX idx_request_ip (request_ip),

    -- 分区表（按月份分区）
    PARTITION BY RANGE (YEAR(created_at) * 100 + MONTH(created_at)) (
        PARTITION p202401 VALUES LESS THAN (202402),
        PARTITION p202402 VALUES LESS THAN (202403),
        PARTITION p202403 VALUES LESS THAN (202404),
        -- ... 更多分区
        PARTITION p_future VALUES LESS THAN MAXVALUE
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 数据关系图

```mermaid
erDiagram
    users ||--o{ user_portfolios : has
    users ||--o{ ai_analyses : requests
    users ||--o{ ocr_recognitions : uploads
    users ||--o{ operation_logs : generates
    users ||--o{ user_theme_preferences : configures
    users ||--o{ investment_goals : sets
    users ||--o{ theme_tool_usage : uses
    users ||--o{ theme_switch_history : switches

    funds ||--o{ user_portfolios : referenced
    funds ||--o{ fund_nav_history : has

    theme_configs }|--||{

    user_portfolios }o--|| funds : contains
    user_portfolios }o--|| users : belongs_to

    ai_analyses }o--|| users : requested_by
    ocr_recognitions }o--|| users : uploaded_by

    user_theme_preferences }o--|| users : belongs_to
    investment_goals }o--|| users : belongs_to
    theme_tool_usage }o--|| users : belongs_to
    theme_switch_history }o--|| users : belongs_to

    system_config }|--||{
    operation_logs }|--||{
```

## 索引优化策略

### 主要索引设计

```sql
-- 用户相关索引
CREATE INDEX idx_users_status_email ON users(status, email);
CREATE INDEX idx_users_login_time ON users(last_login_at DESC);

-- 基金相关索引
CREATE INDEX idx_funds_type_company ON funds(fund_type, company);
CREATE INDEX idx_funds_nav_desc ON funds(nav_date DESC, nav_unit DESC);

-- 持仓相关索引
CREATE INDEX idx_portfolios_user_value ON user_portfolios(user_id, current_value DESC);
CREATE INDEX idx_portfolios_fund_value ON user_portfolios(fund_code, current_value DESC);
CREATE INDEX idx_portfolios_purchase ON user_portfolios(purchase_date DESC);

-- 净值历史索引
CREATE INDEX idx_nav_history_fund_date ON fund_nav_history(fund_code, nav_date DESC);
CREATE INDEX idx_nav_history_date_range ON fund_nav_history(nav_date DESC, nav_unit DESC);

-- AI分析索引
CREATE INDEX idx_analyses_user_type ON ai_analyses(user_id, analysis_type, created_at DESC);
CREATE INDEX idx_analyses_hash ON ai_analyses(input_hash);

-- OCR识别索引
CREATE INDEX idx_ocr_user_status ON ocr_recognitions(user_id, status, created_at DESC);

-- 主题相关索引
CREATE INDEX idx_users_current_theme ON users(current_theme, theme_switch_count);
CREATE INDEX idx_theme_configs_theme_category ON theme_configs(theme, category);
CREATE INDEX idx_user_theme_preferences_usage ON user_theme_preferences(user_id, theme, last_used_at DESC);
CREATE INDEX idx_investment_goals_user_theme ON investment_goals(user_id, associated_theme, status);
CREATE INDEX idx_theme_tool_usage_theme_tool ON theme_tool_usage(theme, tool_name, created_at DESC);
CREATE INDEX idx_theme_switch_history_user_time ON theme_switch_history(user_id, switched_at DESC);

-- 日志索引
CREATE INDEX idx_logs_user_time ON operation_logs(user_id, created_at DESC);
CREATE INDEX idx_logs_module_time ON operation_logs(operation_module, created_at DESC);
```

### 复合索引使用场景

1. **用户持仓查询优化**
```sql
-- 查询用户持仓按价值排序
SELECT * FROM user_portfolios
WHERE user_id = ? AND status = 'active'
ORDER BY current_value DESC;

-- 对应索引
CREATE INDEX idx_user_portfolio_active_value ON user_portfolios(user_id, status, current_value DESC);
```

2. **基金净值历史查询优化**
```sql
-- 查询指定基金最近净值
SELECT * FROM fund_nav_history
WHERE fund_code = ?
ORDER BY nav_date DESC
LIMIT 30;

-- 对应索引
CREATE INDEX idx_fund_nav_date_desc ON fund_nav_history(fund_code, nav_date DESC);
```

## 数据迁移策略

### 版本控制

```javascript
// migrations/001_create_users_table.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // 创建索引
    await queryInterface.addIndex('users', ['username']);
    await queryInterface.addIndex('users', ['email']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
```

### 数据库初始化脚本

```sql
-- database/init.sql

-- 创建数据库
CREATE DATABASE IF NOT EXISTS jntm
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE jntm;

-- 创建基础表（按依赖顺序）
SOURCE tables/01_users.sql;
SOURCE tables/02_funds.sql;
SOURCE tables/03_fund_nav_history.sql;
SOURCE tables/04_user_portfolios.sql;
SOURCE tables/05_ai_analyses.sql;
SOURCE tables/06_ocr_recognitions.sql;
SOURCE tables/07_system_config.sql;
SOURCE tables/08_operation_logs.sql;

-- 创建索引
SOURCE indexes/01_main_indexes.sql;

-- 初始化基础数据
SOURCE data/01_system_config.sql;
SOURCE data/02_sample_funds.sql;

-- 创建视图
SOURCE views/01_user_portfolio_summary.sql;
SOURCE views/02_fund_performance.sql;
```

## 视图设计

### 1. 用户持仓汇总视图

```sql
CREATE VIEW user_portfolio_summary AS
SELECT
    u.id as user_id,
    u.username,
    COUNT(up.id) as fund_count,
    SUM(up.shares) as total_shares,
    SUM(up.cost_amount) as total_cost,
    SUM(up.current_value) as current_value,
    SUM(up.profit_loss) as total_profit_loss,
    ROUND(AVG(up.profit_loss_percent), 2) as avg_return_rate,
    MAX(up.updated_at) as last_updated
FROM users u
LEFT JOIN user_portfolios up ON u.id = up.user_id AND up.status = 'active'
GROUP BY u.id, u.username;
```

### 2. 基金表现统计视图

```sql
CREATE VIEW fund_performance_stats AS
SELECT
    f.code,
    f.name,
    f.fund_type,
    f.company,

    -- 最新净值信息
    latest.nav_unit as latest_nav,
    latest.nav_date as latest_date,
    latest.daily_change_percent,

    -- 近一年表现
    annual.return_rate as annual_return,
    annual.max_drawdown,
    annual.volatility,

    -- 持仓用户数
    COALESCE(portfolio.user_count, 0) as holder_count,

    -- 数据更新时间
    GREATEST(latest.nav_date, COALESCE(portfolio.last_update, '1970-01-01')) as last_update
FROM funds f

-- 最新净值
LEFT JOIN (
    SELECT
        fund_code, nav_unit, nav_date, daily_change_percent,
        ROW_NUMBER() OVER (PARTITION BY fund_code ORDER BY nav_date DESC) as rn
    FROM fund_nav_history
) latest ON f.code = latest.fund_code AND latest.rn = 1

-- 年度表现
LEFT JOIN (
    SELECT
        fund_code,
        (MAX(nav_unit) / MIN(nav_unit) - 1) * 100 as return_rate,
        /* 计算最大回撤和波动率的复杂逻辑 */
        MAX_DRAWDOWN /* 占位符 */,
        VOLATILITY /* 占位符 */
    FROM fund_nav_history
    WHERE nav_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
    GROUP BY fund_code
) annual ON f.code = annual.fund_code

-- 持仓统计
LEFT JOIN (
    SELECT
        fund_code,
        COUNT(*) as user_count,
        MAX(updated_at) as last_update
    FROM user_portfolios
    WHERE status = 'active'
    GROUP BY fund_code
) portfolio ON f.code = portfolio.fund_code

WHERE f.status = 'active';
```

## 数据备份策略

### 1. 定时备份脚本

```bash
#!/bin/bash
# scripts/backup-database.sh

# 配置信息
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="jntm"
DB_USER="backup_user"
DB_PASSWORD="backup_password"
BACKUP_DIR="/var/backups/mysql"
RETENTION_DAYS=30

# 创建备份目录
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/jntm_backup_$DATE.sql"

# 执行备份
mysqldump -h$DB_HOST -P$DB_PORT -u$DB_USER -p$DB_PASSWORD \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --hex-blob \
    --default-character-set=utf8mb4 \
    $DB_NAME > $BACKUP_FILE

# 压缩备份文件
gzip $BACKUP_FILE

# 清理过期备份
find $BACKUP_DIR -name "jntm_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# 记录备份日志
echo "$(date): Database backup completed: $BACKUP_FILE.gz" >> /var/log/backup.log

# 发送通知（可选）
if [ $? -eq 0 ]; then
    echo "Database backup successful: $BACKUP_FILE.gz" | mail -s "JNTM Backup Success" admin@jntm.com
else
    echo "Database backup failed!" | mail -s "JNTM Backup Failed" admin@jntm.com
fi
```

### 2. 增量备份策略

```sql
-- 启用二进制日志
SET GLOBAL log_bin = ON;
SET GLOBAL binlog_format = 'ROW';
SET GLOBAL expire_logs_days = 7;

-- 创建备份表
CREATE TABLE backup_metadata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    backup_type ENUM('full', 'incremental') NOT NULL,
    backup_file VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    file_size BIGINT,
    status ENUM('in_progress', 'completed', 'failed') DEFAULT 'in_progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

这个数据库设计文档提供了完整的数据架构方案，包含了表结构设计、索引优化、视图创建、备份策略等关键内容，为"基你太美"项目提供了坚实的数据基础。