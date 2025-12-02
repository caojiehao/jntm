#!/bin/bash

# JNTM智能基金管家 - 包含认证功能的Docker启动脚本
# 支持完整的用户认证、主题管理和投资功能

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# 显示欢迎信息
show_banner() {
    echo -e "${CYAN}"
    echo "🎵 基你太美 - 智能基金管家"
    echo "🔐 用户认证系统 Docker 启动脚本"
    echo "=========================================="
    echo -e "${NC}"
}

# 检查Docker是否安装
check_docker() {
    log_step "检查Docker环境..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi

    # 确定Docker Compose命令
    if command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE="docker-compose"
    else
        DOCKER_COMPOSE="docker compose"
    fi

    log_success "Docker环境检查完成"
}

# 检查端口是否被占用
check_ports() {
    log_step "检查端口占用情况..."

    local ports=("3306" "6379" "5080" "5081" "8888" "5173" "80" "443")
    local port_names=("MySQL" "Redis" "Java后端" "Python服务" "Mock API" "前端开发" "Nginx HTTP" "Nginx HTTPS")

    for i in "${!ports[@]}"; do
        local port=${ports[$i]}
        local name=${port_names[$i]}

        if lsof -i :$port &> /dev/null; then
            log_warning "$name (端口 $port) 已被占用"
        else
            log_success "$name (端口 $port) 可用"
        fi
    done
}

# 创建必要的目录
create_directories() {
    log_step "创建必要的目录..."

    local dirs=("logs" "uploads" "nginx/ssl" "redis")

    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            log_success "创建目录: $dir"
        fi
    done
}

# 生成自签名SSL证书（用于开发环境）
generate_ssl_cert() {
    log_step "生成SSL证书..."

    if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=CN/ST=Beijing/L=Beijing/O=JNTM/OU=IT/CN=localhost" \
            2>/dev/null || {
            log_warning "SSL证书生成失败，将使用HTTP模式"
            return
        }
        log_success "SSL证书生成完成"
    else
        log_success "SSL证书已存在"
    fi
}

# 创建Redis配置文件
create_redis_config() {
    log_step "创建Redis配置文件..."

    if [ ! -f "redis/redis.conf" ]; then
        cat > redis/redis.conf << 'EOF'
# Redis配置文件
bind 0.0.0.0
port 6379
timeout 300
keepalive 60
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /data
logfile ""
loglevel warning
EOF
        log_success "Redis配置文件创建完成"
    else
        log_success "Redis配置文件已存在"
    fi
}

# 设置环境变量
setup_env() {
    log_step "设置环境变量..."

    if [ ! -f ".env" ]; then
        cat > .env << 'EOF'
# JNTM Docker环境变量

# 数据库配置
MYSQL_ROOT_PASSWORD=root123456
MYSQL_DATABASE=jntm
MYSQL_USER=jntm_user
MYSQL_PASSWORD=123456

# Redis配置
REDIS_PASSWORD=

# JWT配置
JWT_SECRET=JNTM-Super-Secret-Key-For-JWT-Token-Generation-In-Production
JWT_EXPIRATION=604800000
JWT_REFRESH_EXPIRATION=2592000000

# AI服务API密钥（可选）
DEEPSEEK_API_KEY=your-deepseek-api-key
QWEN_API_KEY=your-qwen-api-key

# 腾讯云OCR服务（可选）
TENCENT_SECRET_ID=your-tencent-secret-id
TENCENT_SECRET_KEY=your-tencent-secret-key

# 应用配置
SPRING_PROFILES_ACTIVE=docker
DEBUG=false
EOF
        log_success "环境变量文件创建完成"
        log_warning "请根据需要编辑 .env 文件中的API密钥"
    else
        log_success "环境变量文件已存在"
    fi
}

# 构建Docker镜像
build_images() {
    log_step "构建Docker镜像..."

    echo "构建Java后端镜像..."
    $DOCKER_COMPOSE -f docker-compose-with-auth.yml build java-backend

    echo "构建Python AI服务镜像..."
    $DOCKER_COMPOSE -f docker-compose-with-auth.yml build python-service

    log_success "Docker镜像构建完成"
}

# 启动数据库服务
start_database() {
    log_step "启动数据库服务..."

    $DOCKER_COMPOSE -f docker-compose-with-auth.yml up -d mysql redis

    log_info "等待数据库启动..."
    sleep 10

    # 检查数据库是否就绪
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if $DOCKER_COMPOSE -f docker-compose-with-auth.yml exec mysql mysqladmin ping -h"localhost" --silent; then
            log_success "数据库启动完成"
            return 0
        fi

        echo "等待MySQL启动... ($attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done

    log_error "数据库启动超时"
    exit 1
}

# 初始化数据库
init_database() {
    log_step "初始化数据库..."

    # 复制SQL文件到容器
    docker cp database/init-database.sql jntm-mysql:/tmp/init-database.sql

    # 执行数据库初始化
    $DOCKER_COMPOSE -f docker-compose-with-auth.yml exec mysql mysql -uroot -p"$MYSQL_ROOT_PASSWORD" jntm < /tmp/init-database.sql

    log_success "数据库初始化完成"
}

# 启动应用服务
start_services() {
    log_step "启动应用服务..."

    # 启动Java后端和Python服务
    $DOCKER_COMPOSE -f docker-compose-with-auth.yml up -d java-backend python-service

    log_info "等待服务启动..."
    sleep 15

    log_success "应用服务启动完成"
}

# 启动开发服务
start_dev_services() {
    log_step "启动开发服务..."

    # 启动Mock API和前端开发服务
    $DOCKER_COMPOSE -f docker-compose-with-auth.yml up -d mock-api frontend

    log_info "等待开发服务启动..."
    sleep 10

    log_success "开发服务启动完成"
}

# 健康检查
health_check() {
    log_step "执行健康检查..."

    local services=("mysql" "redis" "java-backend" "python-service" "mock-api" "frontend")
    local health_urls=(
        "mysql" # 需要特殊检查
        "redis" # 需要特殊检查
        "http://localhost:5080/api/v1/actuator/health"
        "http://localhost:5081/health"
        "http://localhost:8888/api/v1/health"
        "http://localhost:5173"
    )

    echo "服务健康状态:"
    echo "================"

    for i in "${!services[@]}"; do
        local service=${services[$i]}
        local url=${health_urls[$i]}

        case $service in
            "mysql")
                if $DOCKER_COMPOSE -f docker-compose-with-auth.yml exec mysql mysqladmin ping -h"localhost" --silent; then
                    echo "✅ MySQL: 健康"
                else
                    echo "❌ MySQL: 不健康"
                fi
                ;;
            "redis")
                if $DOCKER_COMPOSE -f docker-compose-with-auth.yml exec redis redis-cli ping > /dev/null 2>&1; then
                    echo "✅ Redis: 健康"
                else
                    echo "❌ Redis: 不健康"
                fi
                ;;
            *)
                if curl -f -s "$url" > /dev/null; then
                    echo "✅ $service: 健康"
                else
                    echo "❌ $service: 不健康"
                fi
                ;;
        esac
    done
}

# 显示访问信息
show_access_info() {
    log_success "🎉 所有服务启动完成！"
    echo
    echo -e "${CYAN}📍 访问地址:${NC}"
    echo "前端开发服务:     http://localhost:5173"
    echo "Mock API服务:     http://localhost:8888"
    echo "Java后端API:     http://localhost:5080"
    echo "Python AI服务:    http://localhost:5081"
    echo "Nginx代理(开发):  http://localhost:8080"
    echo "Nginx代理(生产):  https://localhost"
    echo
    echo -e "${CYAN}👤 测试账号:${NC}"
    echo "管理员:           admin / password123"
    echo "FIRE主题用户:     fire_investor / password123"
    echo "全球主题用户:     global_investor / password123"
    echo "保值主题用户:     inflation_investor / password123"
    echo "测试用户:         testuser / password123"
    echo
    echo -e "${CYAN}🔧 管理命令:${NC}"
    echo "查看日志:         $DOCKER_COMPOSE -f docker-compose-with-auth.yml logs -f [service-name]"
    echo "停止服务:         $DOCKER_COMPOSE -f docker-compose-with-auth.yml down"
    echo "重启服务:         $DOCKER_COMPOSE -f docker-compose-with-auth.yml restart [service-name]"
    echo
    echo -e "${GREEN}✅ 用户认证系统已就绪！${NC}"
}

# 主函数
main() {
    show_banner

    # 检查参数
    if [ "$1" = "stop" ]; then
        log_step "停止所有服务..."
        $DOCKER_COMPOSE -f docker-compose-with-auth.yml down
        log_success "所有服务已停止"
        exit 0
    fi

    if [ "$1" = "clean" ]; then
        log_step "清理所有容器和镜像..."
        $DOCKER_COMPOSE -f docker-compose-with-auth.yml down -v --rmi all
        docker system prune -f
        log_success "清理完成"
        exit 0
    fi

    # 执行启动流程
    check_docker
    check_ports
    create_directories
    generate_ssl_cert
    create_redis_config
    setup_env
    build_images
    start_database
    init_database
    start_services
    start_dev_services
    health_check
    show_access_info
}

# 脚本入口
main "$@"