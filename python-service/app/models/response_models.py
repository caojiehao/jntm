"""
响应数据模型
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class BaseResponse(BaseModel):
    """基础响应模型"""
    success: bool = Field(True, description="请求是否成功")
    message: str = Field("", description="响应消息")
    timestamp: datetime = Field(default_factory=datetime.now, description="响应时间戳")


class AIAnalysisResponse(BaseResponse):
    """AI分析响应模型"""
    analysis_result: Dict[str, Any] = Field(..., description="分析结果")
    confidence_score: float = Field(..., description="置信度分数")
    model_used: str = Field(..., description="使用的AI模型")
    processing_time: float = Field(..., description="处理时间（秒）")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "AI分析完成",
                "analysis_result": {
                    "risk_score": 0.65,
                    "recommendations": [
                        "建议增加债券配置",
                        "当前股票比例偏高"
                    ],
                    "optimization_suggestions": {
                        "stock_ratio": 0.6,
                        "bond_ratio": 0.4
                    }
                },
                "confidence_score": 0.85,
                "model_used": "deepseek-chat",
                "processing_time": 2.3
            }
        }


class OCRResponse(BaseResponse):
    """OCR识别响应模型"""
    extracted_text: str = Field(..., description="提取的文本")
    fund_code: Optional[str] = Field(None, description="识别到的基金代码")
    fund_name: Optional[str] = Field(None, description="识别到的基金名称")
    nav_value: Optional[float] = Field(None, description="识别到的净值")
    confidence: float = Field(..., description="识别置信度")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "OCR识别完成",
                "extracted_text": "易方达消费行业股票基金 110022 净值：2.456元",
                "fund_code": "110022",
                "fund_name": "易方达消费行业股票基金",
                "nav_value": 2.456,
                "confidence": 0.95
            }
        }


class AnalyticsResponse(BaseResponse):
    """数据分析响应模型"""
    analysis_data: Dict[str, Any] = Field(..., description="分析结果数据")
    metrics: Dict[str, float] = Field(..., description="关键指标")
    insights: List[str] = Field(..., description="洞察结论")
    processing_time: float = Field(..., description="处理时间（秒）")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "数据分析完成",
                "analysis_data": {
                    "returns_analysis": {
                        "total_return": 0.125,
                        "annualized_return": 0.089,
                        "volatility": 0.156
                    }
                },
                "metrics": {
                    "sharpe_ratio": 0.57,
                    "max_drawdown": -0.089,
                    "beta": 1.12
                },
                "insights": [
                    "组合年化收益率略高于市场平均水平",
                    "波动率适中，风险可控",
                    "建议适当降低beta暴露"
                ],
                "processing_time": 1.2
            }
        }