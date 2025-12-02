"""
请求数据模型
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class ThemeType(str, Enum):
    """主题类型枚举"""
    FIRE = "fire"
    GLOBAL = "global"
    INFLATION = "inflation"


class AIAnalysisRequest(BaseModel):
    """AI分析请求模型"""
    user_id: int = Field(..., description="用户ID")
    theme: ThemeType = Field(..., description="分析主题")
    portfolio_data: List[Dict[str, Any]] = Field(..., description="投资组合数据")
    analysis_type: str = Field(..., description="分析类型")
    custom_preferences: Optional[Dict[str, Any]] = Field(None, description="自定义偏好设置")

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "theme": "fire",
                "portfolio_data": [
                    {
                        "fund_code": "110022",
                        "fund_name": "易方达消费行业",
                        "shares": 1000.0,
                        "cost_price": 2.456,
                        "current_value": 2580.50
                    }
                ],
                "analysis_type": "portfolio_optimization",
                "custom_preferences": {
                    "risk_tolerance": "moderate",
                    "investment_horizon": 10
                }
            }
        }


class OCRRequest(BaseModel):
    """OCR识别请求模型"""
    image_type: str = Field(..., description="图片类型")
    image_name: str = Field(..., description="图片名称")
    # 注意：实际图片数据通过multipart/form-data上传


class AnalyticsRequest(BaseModel):
    """数据分析请求模型"""
    user_id: int = Field(..., description="用户ID")
    analysis_type: str = Field(..., description="分析类型")
    data: Dict[str, Any] = Field(..., description="分析数据")
    parameters: Optional[Dict[str, Any]] = Field(None, description="分析参数")

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "analysis_type": "risk_assessment",
                "data": {
                    "portfolio_returns": [0.05, 0.03, -0.02, 0.08, 0.06],
                    "benchmark_returns": [0.04, 0.02, 0.01, 0.07, 0.05]
                },
                "parameters": {
                    "confidence_level": 0.95,
                    "time_period": "1y"
                }
            }
        }