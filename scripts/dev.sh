#!/bin/bash

# 开发环境启动脚本
# 基你太美智能基金管家 - 开发环境脚本

set -e

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

# 检查Node.js版本
check_node() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js未安装，请先安装Node.js 18+"
        exit 1
    fi

    local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        log_error "Node.js版本过低，需要18+，当前版本: $(node -v)"
        exit 1
    fi

    log_success "Node.js版本检查通过: $(node -v)"
}

# 检查npm版本
check_npm() {
    if ! command -v npm &> /dev/null; then
        log_error "npm未安装"
        exit 1
    fi

    log_success "npm版本检查通过: $(npm -v)"
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."

    # 安装根目录依赖
    npm install

    # 安装后端依赖
    if [ -d "backend" ]; then
        log_info "安装后端依赖..."
        cd backend
        npm install
        cd ..
    fi

    # 安装前端依赖
    if [ -d "frontend" ]; then
        log_info "安装前端依赖..."
        cd frontend
        npm install
        cd ..
    fi

    log_success "依赖安装完成"
}

# 初始化数据库
init_database() {
    log_info "初始化数据库..."

    cd backend
    if [ ! -f "database/jntm.db" ]; then
        node src/scripts/init-database.js
        log_success "数据库初始化完成"
    else
        log_info "数据库已存在，跳过初始化"
    fi

    # 添加种子数据
    node src/scripts/seed-data.js
    log_success "种子数据添加完成"
    cd ..
}

# 启动开发服务器
start_dev_server() {
    log_info "启动开发服务器..."

    # 在后台启动后端服务
    log_info "启动后端服务 (端口: 3000)..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..

    # 等待后端服务启动
    sleep 3

    # 启动前端服务
    log_info "启动前端服务 (端口: 5173)..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..

    log_success "开发服务器启动完成"
    echo ""
    echo "=== 服务地址 ==="
    echo "前端应用: http://localhost:5173"
    echo "后端API: http://localhost:3000"
    echo "健康检查: http://localhost:3000/health"
    echo ""
    echo "=== 控制说明 ==="
    echo "按 Ctrl+C 停止所有服务"
    echo ""

    # 等待用户中断
    wait $BACKEND_PID $FRONTEND_PID
}

# 清理函数
cleanup() {
    log_info "正在停止开发服务器..."

    # 杀死所有相关进程
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi

    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi

    # 杀死可能遗留的node进程
    pkill -f "nodemon\|vite" 2>/dev/null || true

    log_success "开发服务器已停止"
    exit 0
}

# 显示帮助信息
show_help() {
    echo "基你太美智能基金管家 - 开发环境脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  start     启动开发服务器 (默认)"
    echo "  install   仅安装依赖"
    echo "  init      仅初始化数据库"
    echo "  clean     清理依赖和临时文件"
    echo "  help      显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                # 启动开发服务器"
    echo "  $0 start          # 启动开发服务器"
    echo "  $0 install        # 安装依赖"
    echo "  $0 init           # 初始化数据库"
    echo "  $0 clean          # 清理文件"
}

# 清理函数
clean() {
    log_info "清理项目..."

    # 清理node_modules
    rm -rf node_modules
    rm -rf backend/node_modules
    rm -rf frontend/node_modules

    # 清理构建文件
    rm -rf backend/dist
    rm -rf frontend/dist

    # 清理日志文件
    rm -f backend/logs/*.log
    rm -f frontend/logs/*.log

    log_success "清理完成"
}

# 主函数
main() {
    local command=${1:-start}

    case $command in
        "start")
            check_node
            check_npm
            install_dependencies
            init_database
            # 设置信号处理
            trap cleanup SIGINT SIGTERM
            start_dev_server
            ;;
        "install")
            check_node
            check_npm
            install_dependencies
            ;;
        "init")
            check_node
            check_npm
            init_database
            ;;
        "clean")
            clean
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"