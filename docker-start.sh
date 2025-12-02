#!/bin/bash

# JNTM 基你太美 - Docker 快速启动脚本
# 使用方法: ./docker-start.sh [模式]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目信息
PROJECT_NAME="JNTM 基你太美"
VERSION="1.0.0"

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_message $RED "❌ Docker 未安装，请先安装Docker"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_message $RED "❌ Docker Compose 未安装，请先安装Docker Compose"
        exit 1
    fi

    print_message $GREEN "✅ Docker 环境检查通过"
}

# 检查环境变量文件
check_env_file() {
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            print_message $YELLOW "⚠️  未找到 .env 文件，正在从 .env.example 创建..."
            cp .env.example .env
            print_message $YELLOW "📝 请编辑 .env 文件并填入正确的配置值"
        else
            print_message $RED "❌ 未找到环境变量配置文件"
            exit 1
        fi
    else
        print_message $GREEN "✅ 环境变量文件检查通过"
    fi
}

# 创建必要的目录
create_directories() {
    local dirs=("logs" "uploads" "mysql-data")

    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_message $BLUE "📁 创建目录: $dir"
        fi
    done

    # 设置权限
    chmod 755 logs uploads
    print_message $GREEN "✅ 目录创建完成"
}

# 显示帮助信息
show_help() {
    echo -e "${BLUE}🚀 ${PROJECT_NAME} Docker 启动脚本${NC}"
    echo -e "${BLUE}版本: ${VERSION}${NC}"
    echo ""
    echo "使用方法:"
    echo "  $0 [模式]"
    echo ""
    echo "可选模式:"
    echo "  dev     - 开发模式 (使用现有数据库，默认)"
    echo "  full    - 完整模式 (包含数据库)"
    echo "  backend - 仅后端服务"
    echo "  stop    - 停止所有服务"
    echo "  clean   - 清理所有容器和数据"
    echo "  status  - 查看服务状态"
    echo "  logs    - 查看服务日志"
    echo "  help    - 显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0          # 启动开发模式"
    echo "  $0 dev      # 启动开发模式"
    echo "  $0 full     # 启动完整模式"
    echo "  $0 stop     # 停止服务"
    echo ""
}

# 启动开发模式
start_dev() {
    print_message $BLUE "🚀 启动开发模式..."
    docker-compose -f docker-compose.dev.yml up -d
    print_message $GREEN "✅ 开发模式启动完成"
    show_service_info
}

# 启动完整模式
start_full() {
    print_message $BLUE "🚀 启动完整模式..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    print_message $GREEN "✅ 完整模式启动完成"
    show_service_info
}

# 仅启动后端
start_backend() {
    print_message $BLUE "🚀 启动后端服务..."
    docker-compose -f docker-compose.dev.yml up java-backend python-service -d
    print_message $GREEN "✅ 后端服务启动完成"
    show_backend_info
}

# 停止服务
stop_services() {
    print_message $YELLOW "🛑 停止所有服务..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
    print_message $GREEN "✅ 服务已停止"
}

# 清理服务
clean_services() {
    print_message $YELLOW "🧹 清理所有容器和数据..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v --remove-orphans
    docker system prune -f
    print_message $GREEN "✅ 清理完成"
}

# 显示服务状态
show_status() {
    print_message $BLUE "📊 服务状态:"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps
}

# 显示日志
show_logs() {
    print_message $BLUE "📋 服务日志:"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f
}

# 显示服务信息
show_service_info() {
    echo ""
    print_message $GREEN "🎉 服务启动成功！"
    echo ""
    print_message $BLUE "📍 服务访问地址:"
    echo "  🌐 前端应用:     http://localhost:5173"
    echo "  ☕ Java后端:    http://localhost:5080"
    echo "  🐍 Python AI:   http://localhost:5081"
    echo "  📊 API文档:     http://localhost:5080/swagger-ui.html"
    echo "  🔍 健康检查:    http://localhost:5080/api/v1/actuator/health"
    echo ""
    print_message $BLUE "🔑 默认登录信息:"
    echo "  用户名: admin"
    echo "  密码:   123456"
    echo ""
    print_message $YELLOW "💡 提示:"
    echo "  - 使用 '$0 status' 查看服务状态"
    echo "  - 使用 '$0 logs' 查看实时日志"
    echo "  - 使用 '$0 stop' 停止所有服务"
    echo ""
}

# 显示后端信息
show_backend_info() {
    echo ""
    print_message $GREEN "🎉 后端服务启动成功！"
    echo ""
    print_message $BLUE "📍 服务地址:"
    echo "  ☕ Java后端:    http://localhost:5080"
    echo "  🐍 Python AI:   http://localhost:5081"
    echo "  📊 API文档:     http://localhost:5080/swagger-ui.html"
    echo ""
}

# 主函数
main() {
    local mode=${1:-dev}

    print_message $BLUE "🎯 ${PROJECT_NAME} Docker 启动脚本"
    print_message $BLUE "版本: ${VERSION}"
    echo ""

    # 检查Docker环境
    check_docker

    # 处理不同模式
    case $mode in
        "dev")
            check_env_file
            create_directories
            start_dev
            ;;
        "full")
            check_env_file
            create_directories
            start_full
            ;;
        "backend")
            check_env_file
            create_directories
            start_backend
            ;;
        "stop")
            stop_services
            ;;
        "clean")
            clean_services
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_message $RED "❌ 未知模式: $mode"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"