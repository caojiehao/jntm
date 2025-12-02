"""
基你太美 - Python AI和数据处理服务
FastAPI应用主入口

提供服务：
- AI分析和投资建议
- OCR图像识别
- 数据分析和计算
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import asyncio
from contextlib import asynccontextmanager

from app.api import ai_router, ocr_router, analytics_router
from app.config import settings
from app.utils.logger import setup_logger

# 设置日志
logger = setup_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时执行
    logger.info("🚀 JNTM Python AI服务启动中...")

    # 初始化AI服务
    try:
        # 这里可以添加AI模型的初始化逻辑
        logger.info("✅ AI服务初始化完成")
    except Exception as e:
        logger.error(f"❌ AI服务初始化失败: {e}")
        raise

    yield

    # 关闭时执行
    logger.info("🛑 JNTM Python AI服务正在关闭...")


# 创建FastAPI应用
app = FastAPI(
    title="JNTM Python AI Service",
    description="基你太美 - 智能基金管家AI和数据处理服务",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该配置具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 健康检查端点
@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "service": "JNTM Python AI Service",
        "version": "1.0.0",
        "timestamp": "2024-01-01T00:00:00Z"
    }


# 注册路由
app.include_router(ai_router, prefix="/api/v1/ai", tags=["AI分析"])
app.include_router(ocr_router, prefix="/api/v1/ocr", tags=["OCR识别"])
app.include_router(analytics_router, prefix="/api/v1/analytics", tags=["数据分析"])


# 全局异常处理
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "status_code": exc.status_code
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"未处理的异常: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": "内部服务器错误",
            "status_code": 500
        }
    )


# 启动事件
@app.on_event("startup")
async def startup_event():
    logger.info("🎵 基你太美 - Python AI服务启动成功！")
    logger.info(f"📍 服务地址: http://localhost:{settings.PORT}")
    logger.info(f"📚 API文档: http://localhost:{settings.PORT}/docs")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )