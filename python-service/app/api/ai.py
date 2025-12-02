"""
AI分析API路由
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
import time

from app.models.request_models import AIAnalysisRequest
from app.models.response_models import AIAnalysisResponse
from app.services.ai_service import AIService
from app.utils.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)


@router.post("/analyze", response_model=AIAnalysisResponse)
async def analyze_portfolio(request: AIAnalysisRequest):
    """
    投资组合AI分析

    - **user_id**: 用户ID
    - **theme**: 分析主题 (fire/global/inflation)
    - **portfolio_data**: 投资组合数据
    - **analysis_type**: 分析类型
    """
    start_time = time.time()

    try:
        logger.info(f"收到AI分析请求: 用户ID={request.user_id}, 主题={request.theme}")

        # 创建AI服务实例
        ai_service = AIService()

        # 执行AI分析
        result = await ai_service.analyze_portfolio(
            user_id=request.user_id,
            theme=request.theme,
            portfolio_data=request.portfolio_data,
            analysis_type=request.analysis_type,
            custom_preferences=request.custom_preferences
        )

        processing_time = time.time() - start_time

        logger.info(f"AI分析完成: 耗时{processing_time:.2f}秒")

        return AIAnalysisResponse(
            success=True,
            message="AI分析完成",
            analysis_result=result["analysis_result"],
            confidence_score=result["confidence_score"],
            model_used=result["model_used"],
            processing_time=processing_time
        )

    except Exception as e:
        logger.error(f"AI分析失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI分析失败: {str(e)}")


@router.get("/models")
async def get_available_models():
    """获取可用的AI模型列表"""
    try:
        ai_service = AIService()
        models = await ai_service.get_available_models()

        return {
            "success": True,
            "models": models
        }

    except Exception as e:
        logger.error(f"获取AI模型列表失败: {str(e)}")
        raise HTTPException(status_code=500, detail="获取模型列表失败")


@router.post("/chat")
async def chat_with_ai(
    message: str,
    user_id: int,
    theme: str = "general"
):
    """
    与AI对话

    - **message**: 用户消息
    - **user_id**: 用户ID
    - **theme**: 对话主题
    """
    try:
        logger.info(f"收到AI对话请求: 用户ID={user_id}, 主题={theme}")

        ai_service = AIService()
        result = await ai_service.chat_with_ai(
            message=message,
            user_id=user_id,
            theme=theme
        )

        return {
            "success": True,
            "response": result["response"],
            "model_used": result["model_used"],
            "timestamp": result["timestamp"]
        }

    except Exception as e:
        logger.error(f"AI对话失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI对话失败: {str(e)}")


@router.get("/health")
async def ai_service_health():
    """AI服务健康检查"""
    try:
        ai_service = AIService()
        health_status = await ai_service.health_check()

        return {
            "service": "AI Analysis Service",
            "status": "healthy" if health_status else "unhealthy",
            "timestamp": time.time()
        }

    except Exception as e:
        logger.error(f"AI服务健康检查失败: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={
                "service": "AI Analysis Service",
                "status": "unhealthy",
                "error": str(e)
            }
        )