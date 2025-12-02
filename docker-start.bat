@echo off
REM JNTM 基你太美 - Docker 快速启动脚本 (Windows版本)

setlocal enabledelayedexpansion

REM 项目信息
set PROJECT_NAME=JNTM 基你太美
set VERSION=1.0.0

REM 检查Docker是否安装
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker 未安装，请先安装Docker
    pause
    exit /b 1
)

where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker Compose 未安装，请先安装Docker Compose
    pause
    exit /b 1
)

echo ✅ Docker 环境检查通过

REM 检查环境变量文件
if not exist ".env" (
    if exist ".env.example" (
        echo ⚠️  未找到 .env 文件，正在从 .env.example 创建...
        copy ".env.example" ".env" >nul
        echo 📝 请编辑 .env 文件并填入正确的配置值
    ) else (
        echo ❌ 未找到环境变量配置文件
        pause
        exit /b 1
    )
) else (
    echo ✅ 环境变量文件检查通过
)

REM 创建必要的目录
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "mysql-data" mkdir mysql-data
echo ✅ 目录创建完成

REM 处理命令行参数
set MODE=%1
if "%MODE%"=="" set MODE=dev

echo.
echo 🎯 %PROJECT_NAME% Docker 启动脚本
echo 版本: %VERSION%
echo.

REM 根据模式执行相应操作
if "%MODE%"=="dev" (
    echo 🚀 启动开发模式...
    docker-compose -f docker-compose.dev.yml up -d
    echo ✅ 开发模式启动完成
    goto :show_info
) else if "%MODE%"=="full" (
    echo 🚀 启动完整模式...
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    echo ✅ 完整模式启动完成
    goto :show_info
) else if "%MODE%"=="backend" (
    echo 🚀 启动后端服务...
    docker-compose -f docker-compose.dev.yml up java-backend python-service -d
    echo ✅ 后端服务启动完成
    goto :show_backend_info
) else if "%MODE%"=="stop" (
    echo 🛑 停止所有服务...
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
    echo ✅ 服务已停止
    goto :end
) else if "%MODE%"=="clean" (
    echo 🧹 清理所有容器和数据...
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v --remove-orphans
    docker system prune -f
    echo ✅ 清理完成
    goto :end
) else if "%MODE%"=="status" (
    echo 📊 服务状态:
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps
    goto :end
) else if "%MODE%"=="logs" (
    echo 📋 服务日志:
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f
    goto :end
) else if "%MODE%"=="help" (
    goto :show_help
) else (
    echo ❌ 未知模式: %MODE%
    goto :show_help
)

:show_info
echo.
echo 🎉 服务启动成功！
echo.
echo 📍 服务访问地址:
echo   🌐 前端应用:     http://localhost:5173
echo   ☕ Java后端:    http://localhost:5080
echo   🐍 Python AI:   http://localhost:5081
echo   📊 API文档:     http://localhost:5080/swagger-ui.html
echo   🔍 健康检查:    http://localhost:5080/api/v1/actuator/health
echo.
echo 🔑 默认登录信息:
echo   用户名: admin
echo   密码:   123456
echo.
echo 💡 提示:
echo   - 使用 'docker-start.bat status' 查看服务状态
echo   - 使用 'docker-start.bat logs' 查看实时日志
echo   - 使用 'docker-start.bat stop' 停止所有服务
echo.
goto :end

:show_backend_info
echo.
echo 🎉 后端服务启动成功！
echo.
echo 📍 服务地址:
echo   ☕ Java后端:    http://localhost:5080
echo   🐍 Python AI:   http://localhost:5081
echo   📊 API文档:     http://localhost:5080/swagger-ui.html
echo.
goto :end

:show_help
echo 🚀 %PROJECT_NAME% Docker 启动脚本
echo 版本: %VERSION%
echo.
echo 使用方法:
echo   %0 [模式]
echo.
echo 可选模式:
echo   dev     - 开发模式 (使用现有数据库，默认)
echo   full    - 完整模式 (包含数据库)
echo   backend - 仅后端服务
echo   stop    - 停止所有服务
echo   clean   - 清理所有容器和数据
echo   status  - 查看服务状态
echo   logs    - 查看服务日志
echo   help    - 显示此帮助信息
echo.
echo 示例:
echo   %0          # 启动开发模式
echo   %0 dev      # 启动开发模式
echo   %0 full     # 启动完整模式
echo   %0 stop     # 停止服务
echo.

:end
pause