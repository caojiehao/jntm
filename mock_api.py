#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
JNTM 简单API模拟服务
用于快速演示项目功能
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import json
import os
from datetime import datetime

app = FastAPI(
    title="JNTM API 模拟服务",
    description="基你太美 - 智能基金管家 API 模拟服务",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 基金数据模型
class Fund(BaseModel):
    id: str
    code: str
    name: str
    type: str
    nav: float
    daily_change_rate: float
    annualized_return: float
    risk_level: str
    management_fee: float

# 主题响应模型
class ThemeAnalysis(BaseModel):
    theme: str
    analysis_result: dict
    recommendations: List[dict]
    metrics: dict

# 模拟数据
MOCK_FUNDS = [
    {
        "id": "1",
        "code": "110022",
        "name": "易方达消费行业",
        "type": "股票型",
        "nav": 2.456,
        "daily_change_rate": 1.25,
        "annualized_return": 15.8,
        "risk_level": "中高风险",
        "management_fee": 1.5
    },
    {
        "id": "2",
        "code": "161725",
        "name": "招商中证白酒",
        "type": "指数型",
        "nav": 1.345,
        "daily_change_rate": -0.85,
        "annualized_return": 12.3,
        "risk_level": "高风险",
        "management_fee": 0.5
    },
    {
        "id": "3",
        "code": "005827",
        "name": "易方达蓝筹精选",
        "type": "混合型",
        "nav": 1.789,
        "daily_change_rate": 0.65,
        "annualized_return": 18.2,
        "risk_level": "中风险",
        "management_fee": 1.2
    }
]

# 主题配置
THEMES = {
    "fire": {
        "name": "FIRE - 财务独立提前退休",
        "description": "专注于退休规划和被动收入分析",
        "color": "#FF6B6B"
    },
    "global": {
        "name": "全球配置",
        "description": "国际市场对比和QDII筛选",
        "color": "#4ECDC4"
    },
    "inflation": {
        "name": "跑赢通胀",
        "description": "保值增值和购买力保护",
        "color": "#45B7D1"
    }
}

@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "欢迎使用JNTM智能基金管家API",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v1/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "api": "running",
            "database": "mock",
            "ai": "simulated"
        }
    }

@app.get("/api/v1/themes")
async def get_themes():
    """获取所有主题"""
    return {
        "success": True,
        "data": THEMES,
        "total": len(THEMES)
    }

@app.get("/api/v1/funds")
async def get_funds():
    """获取基金列表"""
    return {
        "success": True,
        "data": MOCK_FUNDS,
        "total": len(MOCK_FUNDS)
    }

@app.get("/api/v1/funds/{fund_id}")
async def get_fund(fund_id: str):
    """获取单个基金详情"""
    fund = next((f for f in MOCK_FUNDS if f["id"] == fund_id), None)
    if not fund:
        raise HTTPException(status_code=404, detail="基金不存在")

    return {
        "success": True,
        "data": fund
    }

@app.post("/api/v1/themes/analyze")
async def analyze_theme(theme: str, funds: List[str]):
    """主题分析"""
    if theme not in THEMES:
        raise HTTPException(status_code=400, detail="不支持的主题")

    # 模拟主题分析结果
    analysis_result = {
        "fire": {
            "retirement_score": 85,
            "passive_income_ratio": 0.65,
            "fire_years": 12,
            "monthly_expenses": 15000,
            "required_corpus": 4500000
        },
        "global": {
            "allocation_score": 78,
            "currency_diversification": 0.45,
            "overseas_ratio": 0.30,
            "risk_spread": 0.25
        },
        "inflation": {
            "inflation_hedge": 82,
            "real_return": 6.5,
            "purchasing_power_protection": 0.78,
            "inflation_beating_rate": 0.65
        }
    }

    return {
        "success": True,
        "data": {
            "theme": theme,
            "analysis": analysis_result.get(theme, {}),
            "recommendations": [
                {"fund_code": f["code"], "fund_name": f["name"], "score": 85 + idx * 2}
                for idx, f in enumerate(MOCK_FUNDS[:3])
            ]
        }
    }

@app.post("/api/v1/ai/chat")
async def ai_chat(message: str, theme: str = "fire"):
    """AI聊天接口"""
    # 模拟AI回复
    responses = {
        "fire": f"根据FIRE理念，关于'{message}'的建议是：建议您关注被动收入来源，计算您的4%安全提取率，确保投资组合能够覆盖日常生活开支。",
        "global": f"从全球配置角度看'{message}'：建议分散投资于不同市场，考虑QDII基金配置，关注汇率变化对投资收益的影响。",
        "inflation": f"针对通胀问题'{message}'：建议配置一些实物资产相关的基金，关注实际收益率而非名义收益率。"
    }

    return {
        "success": True,
        "data": {
            "message": responses.get(theme, f"关于'{message}'的分析正在处理中..."),
            "theme": theme,
            "timestamp": datetime.now().isoformat()
        }
    }

@app.get("/api/v1/portfolio/summary")
async def get_portfolio_summary():
    """获取投资组合概览"""
    return {
        "success": True,
        "data": {
            "total_value": 150000,
            "total_return": 12500,
            "return_rate": 8.33,
            "fund_count": 3,
            "top_holdings": [
                {"fund_name": "易方达消费行业", "value": 60000, "percentage": 40.0},
                {"fund_name": "招商中证白酒", "value": 45000, "percentage": 30.0},
                {"fund_name": "易方达蓝筹精选", "value": 45000, "percentage": 30.0}
            ]
        }
    }

if __name__ == "__main__":
    print("🚀 JNTM API 模拟服务启动中...")
    print("📍 服务地址: http://localhost:8080")
    print("📖 API文档: http://localhost:8080/docs")
    print("🔗 前端连接: http://localhost:5173")

    uvicorn.run(
        "mock_api:app",
        host="0.0.0.0",
        port=8080,
        reload=True,
        log_level="info"
    )