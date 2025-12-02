"""
数据分析API路由
"""

from fastapi import APIRouter, HTTPException
import time

from app.models.request_models import AnalyticsRequest
from app.models.response_models import AnalyticsResponse
from app.services.analytics_service import AnalyticsService
from app.utils.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)


@router.post("/analyze", response_model=AnalyticsResponse)
async def analyze_data(request: AnalyticsRequest):
    """
    数据分析

    - **user_id**: 用户ID
    - **analysis_type**: 分析类型
    - **data**: 分析数据
    - **parameters**: 分析参数
    """
    start_time = time.time()

    try:
        logger.info(f"收到数据分析请求: 用户ID={request.user_id}, 分析类型={request.analysis_type}")

        # 创建分析服务实例
        analytics_service = AnalyticsService()

        # 执行数据分析
        result = await analytics_service.analyze_data(
            user_id=request.user_id,
            analysis_type=request.analysis_type,
            data=request.data,
            parameters=request.parameters
        )

        processing_time = time.time() - start_time

        logger.info(f"数据分析完成: 耗时{processing_time:.2f}秒")

        return AnalyticsResponse(
            success=True,
            message="数据分析完成",
            analysis_data=result["analysis_data"],
            metrics=result["metrics"],
            insights=result["insights"],
            processing_time=processing_time
        )

    except Exception as e:
        logger.error(f"数据分析失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"数据分析失败: {str(e)}")


@router.post("/risk-assessment")
async def assess_portfolio_risk(
    user_id: int,
    portfolio_data: dict,
    time_horizon: int = 1
):
    """
    投资组合风险评估

    - **user_id**: 用户ID
    - **portfolio_data**: 投资组合数据
    - **time_horizon**: 评估时间范围（年）
    """
    try:
        logger.info(f"收到风险评估请求: 用户ID={user_id}")

        analytics_service = AnalyticsService()
        result = await analytics_service.assess_portfolio_risk(
            user_id=user_id,
            portfolio_data=portfolio_data,
            time_horizon=time_horizon
        )

        return {
            "success": True,
            "risk_assessment": result
        }

    except Exception as e:
        logger.error(f"风险评估失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"风险评估失败: {str(e)}")


@router.post("/performance-analysis")
async def analyze_portfolio_performance(
    user_id: int,
    historical_data: list,
    benchmark_data: list = None
):
    """
    投资组合绩效分析

    - **user_id**: 用户ID
    - **historical_data**: 历史收益数据
    - **benchmark_data**: 基准收益数据
    """
    try:
        logger.info(f"收到绩效分析请求: 用户ID={user_id}")

        analytics_service = AnalyticsService()
        result = await analytics_service.analyze_performance(
            user_id=user_id,
            historical_data=historical_data,
            benchmark_data=benchmark_data
        )

        return {
            "success": True,
            "performance_analysis": result
        }

    except Exception as e:
        logger.error(f"绩效分析失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"绩效分析失败: {str(e)}")


@router.post("/correlation-analysis")
async def analyze_correlation(
    user_id: int,
    assets_data: dict
):
    """
    资产相关性分析

    - **user_id**: 用户ID
    - **assets_data**: 资产数据
    """
    try:
        logger.info(f"收到相关性分析请求: 用户ID={user_id}")

        analytics_service = AnalyticsService()
        result = await analytics_service.analyze_correlation(
            user_id=user_id,
            assets_data=assets_data
        )

        return {
            "success": True,
            "correlation_analysis": result
        }

    except Exception as e:
        logger.error(f"相关性分析失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"相关性分析失败: {str(e)}")


@router.get("/health")
async def analytics_service_health():
    """数据分析服务健康检查"""
    try:
        analytics_service = AnalyticsService()
        health_status = await analytics_service.health_check()

        return {
            "service": "Analytics Service",
            "status": "healthy" if health_status else "unhealthy",
            "timestamp": time.time()
        }

    except Exception as e:
        logger.error(f"数据分析服务健康检查失败: {str(e)}")
        return {
            "service": "Analytics Service",
            "status": "unhealthy",
            "error": str(e)
        }