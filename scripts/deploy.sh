#!/bin/bash

# 部署脚本
# 基你太美智能基金管家 - 生产部署脚本

set -e

echo "🚀 开始部署基你太美智能基金管家..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi

    log_success "Docker环境检查通过"
}

# 检查环境变量文件
check_env() {
    if [ ! -f .env ]; then
        log_warning ".env文件不存在，从.env.example复制"
        cp .env.example .env
        log_warning "请编辑.env文件并填入正确的配置值"
        log_info "编辑完成后请重新运行此脚本"
        exit 1
    fi

    log_success "环境变量文件检查通过"
}

# 创建必要的目录
create_directories() {
    log_info "创建必要的目录..."

    mkdir -p nginx/ssl
    mkdir -p logs
    mkdir -p backups

    log_success "目录创建完成"
}

# 构建和启动服务
deploy_services() {
    log_info "构建Docker镜像..."

    # 停止现有服务
    docker-compose down

    # 拉取最新代码
    git pull origin main

    # 构建镜像
    docker-compose build --no-cache

    # 启动服务
    docker-compose up -d

    log_success "服务部署完成"
}

# 等待服务启动
wait_for_services() {
    log_info "等待服务启动..."

    # 等待应用服务启动
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3000/health > /dev/null 2>&1; then
            log_success "应用服务启动成功"
            break
        fi

        if [ $attempt -eq $max_attempts ]; then
            log_error "应用服务启动失败"
            docker-compose logs jntm-app
            exit 1
        fi

        log_info "等待应用服务启动... ($attempt/$max_attempts)"
        sleep 10
        attempt=$((attempt + 1))
    done
}

# 数据库备份
backup_database() {
    log_info "备份数据库..."

    local backup_file="backups/jntm_backup_$(date +%Y%m%d_%H%M%S).db"

    if docker cp jntm-app:/app/database/jntm.db "$backup_file"; then
        log_success "数据库备份成功: $backup_file"
    else
        log_warning "数据库备份失败，但继续部署"
    fi
}

# 清理旧镜像
cleanup() {
    log_info "清理旧的Docker镜像..."

    docker image prune -f
    docker volume prune -f

    log_success "清理完成"
}

# 显示部署信息
show_deployment_info() {
    log_success "🎉 部署完成！"
    echo ""
    echo "=== 部署信息 ==="
    echo "应用地址: http://localhost"
    echo "健康检查: http://localhost/health"
    echo "API文档: http://localhost/api/v1"
    echo ""
    echo "=== 常用命令 ==="
    echo "查看日志: docker-compose logs -f"
    echo "重启服务: docker-compose restart"
    echo "停止服务: docker-compose down"
    echo "查看状态: docker-compose ps"
    echo ""
    echo "=== 监控命令 ==="
    echo "查看应用日志: docker-compose logs -f jntm-app"
    echo "查看Nginx日志: docker-compose logs -f nginx"
    echo "查看Redis日志: docker-compose logs -f redis"
}

# 主函数
main() {
    log_info "开始部署基你太美智能基金管家..."

    # 检查前置条件
    check_docker
    check_env

    # 创建目录
    create_directories

    # 备份数据库
    backup_database

    # 部署服务
    deploy_services

    # 等待服务启动
    wait_for_services

    # 清理
    cleanup

    # 显示部署信息
    show_deployment_info
}

# 错误处理
trap 'log_error "部署过程中发生错误，请检查日志"; exit 1' ERR

# 执行主函数
main "$@"