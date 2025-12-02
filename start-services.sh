#!/bin/bash

# 基你太美 - 服务启动脚本
# 启动Java和Python微服务

echo "🎵 基你太美 - 智能基金管家服务启动脚本"
echo "=================================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker未安装，请先安装Docker${NC}"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose未安装，请先安装Docker Compose${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Docker环境检查通过${NC}"
}

# 检查环境变量文件
check_env_file() {
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠️  .env文件不存在，正在从.env.example复制...${NC}"
        cp .env.example .env
        echo -e "${YELLOW}📝 请编辑.env文件并填入正确的配置信息${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ 环境变量文件检查通过${NC}"
}

# 创建必要的目录
create_directories() {
    echo -e "${BLUE}📁 创建必要的目录...${NC}"
    mkdir -p uploads logs
    echo -e "${GREEN}✅ 目录创建完成${NC}"
}

# 构建Java应用
build_java_app() {
    echo -e "${BLUE}🔨 构建Java应用...${NC}"
    cd java-backend

    # 检查是否有Maven Wrapper
    if [ -f "./mvnw" ]; then
        ./mvnw clean package -DskipTests
    else
        mvn clean package -DskipTests
    fi

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Java应用构建成功${NC}"
    else
        echo -e "${RED}❌ Java应用构建失败${NC}"
        exit 1
    fi

    cd ..
}

# 启动服务
start_services() {
    echo -e "${BLUE}🚀 启动Docker服务...${NC}"

    # 停止可能正在运行的容器
    docker-compose down

    # 启动服务
    docker-compose up -d

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 服务启动成功${NC}"
    else
        echo -e "${RED}❌ 服务启动失败${NC}"
        exit 1
    fi
}

# 等待服务就绪
wait_for_services() {
    echo -e "${BLUE}⏳ 等待服务启动...${NC}"

    # 等待MySQL启动
    echo "等待MySQL服务启动..."
    until docker-compose exec mysql mysqladmin ping -h"localhost" --silent; do
        sleep 2
    done
    echo -e "${GREEN}✅ MySQL服务已就绪${NC}"

    # 等待Redis启动
    echo "等待Redis服务启动..."
    until docker-compose exec redis redis-cli ping; do
        sleep 2
    done
    echo -e "${GREEN}✅ Redis服务已就绪${NC}"

    # 等待Java服务启动
    echo "等待Java服务启动..."
    sleep 10
    until curl -f http://localhost:5080/api/v1/actuator/health &>/dev/null; do
        sleep 5
    done
    echo -e "${GREEN}✅ Java服务已就绪${NC}"

    # 等待Python服务启动
    echo "等待Python服务启动..."
    sleep 5
    until curl -f http://localhost:5081/health &>/dev/null; do
        sleep 5
    done
    echo -e "${GREEN}✅ Python服务已就绪${NC}"
}

# 显示服务信息
show_service_info() {
    echo ""
    echo "🎉 基你太美服务启动完成！"
    echo "=================================================="
    echo -e "${GREEN}📍 服务地址：${NC}"
    echo "  • Java后端服务: http://localhost:5080"
    echo "  • Python AI服务: http://localhost:5081"
    echo "  • MySQL数据库: localhost:3306"
    echo "  • Redis缓存: localhost:6379"
    echo ""
    echo -e "${GREEN}📚 API文档：${NC}"
    echo "  • Java API文档: http://localhost:5080/swagger-ui.html"
    echo "  • Python API文档: http://localhost:5081/docs"
    echo ""
    echo -e "${GREEN}🛠️  管理命令：${NC}"
    echo "  • 查看服务状态: docker-compose ps"
    echo "  • 查看服务日志: docker-compose logs -f [service-name]"
    echo "  • 停止服务: docker-compose down"
    echo "  • 重启服务: docker-compose restart [service-name]"
    echo ""
    echo -e "${BLUE}📝 前端开发：${NC}"
    echo "  • 前端开发服务器: npm run dev (端口5173)"
    echo "  • 前端生产构建: npm run build"
    echo ""
}

# 主函数
main() {
    echo -e "${BLUE}开始启动基你太美服务...${NC}"

    check_docker
    check_env_file
    create_directories
    build_java_app
    start_services
    wait_for_services
    show_service_info

    echo -e "${GREEN}🎵 基你太美 - 服务启动完成！${NC}"
}

# 处理中断信号
trap 'echo -e "\n${YELLOW}⚠️  启动过程被中断${NC}"; exit 1' INT

# 执行主函数
main "$@"