"""
数据分析服务
"""

import asyncio
import time
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from scipy import stats
from sklearn.metrics import mean_squared_error, mean_absolute_error

from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


class AnalyticsService:
    """数据分析服务类"""

    def __init__(self):
        pass

    async def analyze_data(
        self,
        user_id: int,
        analysis_type: str,
        data: Dict[str, Any],
        parameters: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        数据分析

        Args:
            user_id: 用户ID
            analysis_type: 分析类型
            data: 分析数据
            parameters: 分析参数

        Returns:
            分析结果
        """
        try:
            logger.info(f"开始数据分析: 用户ID={user_id}, 类型={analysis_type}")

            if analysis_type == "risk_assessment":
                result = await self._risk_assessment(data, parameters)
            elif analysis_type == "performance_analysis":
                result = await self._performance_analysis(data, parameters)
            elif analysis_type == "correlation_analysis":
                result = await self._correlation_analysis(data, parameters)
            elif analysis_type == "portfolio_optimization":
                result = await self._portfolio_optimization(data, parameters)
            else:
                result = await self._general_analysis(data, parameters)

            # 生成洞察结论
            insights = self._generate_insights(result, analysis_type)

            logger.info(f"数据分析完成: 用户ID={user_id}")
            return {
                "analysis_data": result,
                "metrics": result.get("metrics", {}),
                "insights": insights
            }

        except Exception as e:
            logger.error(f"数据分析失败: {str(e)}")
            raise

    async def assess_portfolio_risk(
        self,
        user_id: int,
        portfolio_data: Dict[str, Any],
        time_horizon: int = 1
    ) -> Dict[str, Any]:
        """
        投资组合风险评估

        Args:
            user_id: 用户ID
            portfolio_data: 投资组合数据
            time_horizon: 时间范围（年）

        Returns:
            风险评估结果
        """
        try:
            logger.info(f"开始风险评估: 用户ID={user_id}")

            # 模拟历史收益率数据
            returns = self._generate_mock_returns(portfolio_data)

            # 计算风险指标
            risk_metrics = self._calculate_risk_metrics(returns, time_horizon)

            # 风险等级评估
            risk_level = self._assess_risk_level(risk_metrics)

            result = {
                "risk_metrics": risk_metrics,
                "risk_level": risk_level,
                "risk_score": risk_metrics.get("risk_score", 0.5),
                "var_95": risk_metrics.get("var_95", 0),
                "max_drawdown": risk_metrics.get("max_drawdown", 0),
                "volatility": risk_metrics.get("volatility", 0)
            }

            logger.info(f"风险评估完成: 用户ID={user_id}, 风险等级={risk_level}")
            return result

        except Exception as e:
            logger.error(f"风险评估失败: {str(e)}")
            raise

    async def analyze_performance(
        self,
        user_id: int,
        historical_data: List[float],
        benchmark_data: List[float] = None
    ) -> Dict[str, Any]:
        """
        投资组合绩效分析

        Args:
            user_id: 用户ID
            historical_data: 历史收益数据
            benchmark_data: 基准收益数据

        Returns:
            绩效分析结果
        """
        try:
            logger.info(f"开始绩效分析: 用户ID={user_id}")

            returns = np.array(historical_data)
            benchmark_returns = np.array(benchmark_data) if benchmark_data else None

            # 计算绩效指标
            metrics = self._calculate_performance_metrics(returns, benchmark_returns)

            # 相对绩效分析
            relative_performance = None
            if benchmark_returns is not None:
                relative_performance = self._calculate_relative_performance(returns, benchmark_returns)

            result = {
                "metrics": metrics,
                "relative_performance": relative_performance,
                "performance_summary": self._generate_performance_summary(metrics)
            }

            logger.info(f"绩效分析完成: 用户ID={user_id}")
            return result

        except Exception as e:
            logger.error(f"绩效分析失败: {str(e)}")
            raise

    async def analyze_correlation(
        self,
        user_id: int,
        assets_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        资产相关性分析

        Args:
            user_id: 用户ID
            assets_data: 资产数据

        Returns:
            相关性分析结果
        """
        try:
            logger.info(f"开始相关性分析: 用户ID={user_id}")

            # 构建收益率矩阵
            returns_matrix = self._build_returns_matrix(assets_data)

            # 计算相关系数矩阵
            correlation_matrix = np.corrcoef(returns_matrix.T)

            # 分析相关性特征
            correlation_analysis = self._analyze_correlation_features(correlation_matrix, assets_data.keys())

            result = {
                "correlation_matrix": correlation_matrix.tolist(),
                "analysis": correlation_analysis,
                "diversification_score": correlation_analysis.get("diversification_score", 0.5)
            }

            logger.info(f"相关性分析完成: 用户ID={user_id}")
            return result

        except Exception as e:
            logger.error(f"相关性分析失败: {str(e)}")
            raise

    async def health_check(self) -> bool:
        """数据分析服务健康检查"""
        try:
            # 检查必要的依赖库
            import numpy as np
            import pandas as pd
            from scipy import stats
            return True
        except ImportError as e:
            logger.error(f"数据分析服务依赖检查失败: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"数据分析服务健康检查失败: {str(e)}")
            return False

    async def _risk_assessment(self, data: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """风险评估分析"""
        returns = np.array(data.get("returns", []))
        time_horizon = parameters.get("time_horizon", 1) if parameters else 1

        risk_metrics = self._calculate_risk_metrics(returns, time_horizon)
        return {"risk_analysis": risk_metrics}

    async def _performance_analysis(self, data: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """绩效分析"""
        returns = np.array(data.get("returns", []))
        benchmark = np.array(data.get("benchmark", []))

        metrics = self._calculate_performance_metrics(returns, benchmark if len(benchmark) > 0 else None)
        return {"performance_metrics": metrics}

    async def _correlation_analysis(self, data: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """相关性分析"""
        assets = list(data.keys())
        returns_data = [np.array(data[asset]) for asset in assets]

        correlation_matrix = np.corrcoef(returns_data)
        return {"correlation_matrix": correlation_matrix.tolist(), "assets": assets}

    async def _portfolio_optimization(self, data: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """投资组合优化"""
        # 简单的等权重优化示例
        assets = list(data.keys())
        num_assets = len(assets)
        optimal_weights = np.ones(num_assets) / num_assets

        return {
            "optimal_weights": optimal_weights.tolist(),
            "assets": assets,
            "expected_return": 0.08,  # 模拟预期收益率
            "expected_volatility": 0.15  # 模拟预期波动率
        }

    async def _general_analysis(self, data: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """通用分析"""
        return {
            "data_summary": {
                "total_records": len(data),
                "data_types": {k: type(v).__name__ for k, v in data.items()}
            }
        }

    def _generate_mock_returns(self, portfolio_data: Dict[str, Any]) -> np.ndarray:
        """生成模拟收益率数据"""
        np.random.seed(42)  # 确保可重复性
        n_days = 252  # 一年交易日
        return np.random.normal(0.001, 0.02, n_days)  # 日收益率

    def _calculate_risk_metrics(self, returns: np.ndarray, time_horizon: int) -> Dict[str, float]:
        """计算风险指标"""
        if len(returns) == 0:
            return {"volatility": 0, "var_95": 0, "max_drawdown": 0, "risk_score": 0}

        volatility = np.std(returns) * np.sqrt(252)  # 年化波动率
        var_95 = np.percentile(returns, 5) * np.sqrt(time_horizon * 252)  # 95% VaR

        # 最大回撤
        cumulative_returns = np.cumprod(1 + returns)
        running_max = np.maximum.accumulate(cumulative_returns)
        drawdown = (cumulative_returns - running_max) / running_max
        max_drawdown = np.min(drawdown)

        # 风险评分 (0-1)
        risk_score = min(volatility / 0.3, 1.0)  # 假设30%年化波动率为满分

        return {
            "volatility": float(volatility),
            "var_95": float(var_95),
            "max_drawdown": float(max_drawdown),
            "risk_score": float(risk_score)
        }

    def _assess_risk_level(self, risk_metrics: Dict[str, float]) -> str:
        """评估风险等级"""
        risk_score = risk_metrics.get("risk_score", 0)

        if risk_score < 0.3:
            return "低风险"
        elif risk_score < 0.6:
            return "中等风险"
        else:
            return "高风险"

    def _calculate_performance_metrics(self, returns: np.ndarray, benchmark_returns: np.ndarray = None) -> Dict[str, float]:
        """计算绩效指标"""
        if len(returns) == 0:
            return {}

        total_return = np.prod(1 + returns) - 1
        annualized_return = (1 + total_return) ** (252 / len(returns)) - 1
        volatility = np.std(returns) * np.sqrt(252)
        sharpe_ratio = annualized_return / volatility if volatility > 0 else 0

        metrics = {
            "total_return": float(total_return),
            "annualized_return": float(annualized_return),
            "volatility": float(volatility),
            "sharpe_ratio": float(sharpe_ratio)
        }

        if benchmark_returns is not None and len(benchmark_returns) == len(returns):
            # 相对基准的指标
            excess_returns = returns - benchmark_returns
            tracking_error = np.std(excess_returns) * np.sqrt(252)
            information_ratio = np.mean(excess_returns) * 252 / tracking_error if tracking_error > 0 else 0

            metrics.update({
                "tracking_error": float(tracking_error),
                "information_ratio": float(information_ratio),
                "alpha": float(np.mean(excess_returns) * 252)
            })

        return metrics

    def _calculate_relative_performance(self, returns: np.ndarray, benchmark_returns: np.ndarray) -> Dict[str, float]:
        """计算相对绩效"""
        excess_returns = returns - benchmark_returns
        return {
            "excess_return": float(np.mean(excess_returns)),
            "excess_volatility": float(np.std(excess_returns)),
            "tracking_error": float(np.std(excess_returns) * np.sqrt(252))
        }

    def _build_returns_matrix(self, assets_data: Dict[str, Any]) -> np.ndarray:
        """构建收益率矩阵"""
        returns_list = []
        for asset, data in assets_data.items():
            if isinstance(data, list):
                returns_list.append(np.array(data))
            else:
                # 如果数据不是收益率列表，生成模拟数据
                returns_list.append(np.random.normal(0.001, 0.02, 252))

        return np.column_stack(returns_list)

    def _analyze_correlation_features(self, correlation_matrix: np.ndarray, asset_names) -> Dict[str, Any]:
        """分析相关性特征"""
        # 计算平均相关系数
        avg_correlation = np.mean(np.abs(correlation_matrix[np.triu_indices_from(correlation_matrix, k=1)]))

        # 计算多元化得分（相关性越低，得分越高）
        diversification_score = max(0, 1 - avg_correlation)

        # 找出高相关性资产对
        high_correlation_pairs = []
        n = len(asset_names)
        asset_list = list(asset_names)

        for i in range(n):
            for j in range(i + 1, n):
                if abs(correlation_matrix[i, j]) > 0.7:
                    high_correlation_pairs.append({
                        "asset1": asset_list[i],
                        "asset2": asset_list[j],
                        "correlation": float(correlation_matrix[i, j])
                    })

        return {
            "average_correlation": float(avg_correlation),
            "diversification_score": float(diversification_score),
            "high_correlation_pairs": high_correlation_pairs,
            "correlation_level": "高" if avg_correlation > 0.5 else "中" if avg_correlation > 0.3 else "低"
        }

    def _generate_performance_summary(self, metrics: Dict[str, float]) -> str:
        """生成绩效摘要"""
        sharpe_ratio = metrics.get("sharpe_ratio", 0)
        annualized_return = metrics.get("annualized_return", 0)
        volatility = metrics.get("volatility", 0)

        if sharpe_ratio > 1:
            risk_adj_performance = "优秀"
        elif sharpe_ratio > 0.5:
            risk_adj_performance = "良好"
        else:
            risk_adj_performance = "一般"

        return f"年化收益率{annualized_return:.2%}，波动率{volatility:.2%}，风险调整后绩效{risk_adj_performance}"

    def _generate_insights(self, result: Dict[str, Any], analysis_type: str) -> List[str]:
        """生成洞察结论"""
        insights = []

        if analysis_type == "risk_assessment":
            risk_score = result.get("risk_metrics", {}).get("risk_score", 0)
            if risk_score > 0.7:
                insights.append("投资组合风险较高，建议适当降低高风险资产配置")
            elif risk_score < 0.3:
                insights.append("投资组合风险较低，可考虑适当增加成长性资产")
            else:
                insights.append("投资组合风险适中，符合一般投资偏好")

        elif analysis_type == "performance_analysis":
            sharpe_ratio = result.get("metrics", {}).get("sharpe_ratio", 0)
            if sharpe_ratio > 1:
                insights.append("风险调整后收益表现优秀")
            elif sharpe_ratio > 0.5:
                insights.append("风险调整后收益表现良好")
            else:
                insights.append("风险调整后收益有待改善")

        elif analysis_type == "correlation_analysis":
            diversification_score = result.get("diversification_score", 0)
            if diversification_score > 0.7:
                insights.append("资产配置多元化程度高，有利于分散风险")
            else:
                insights.append("资产间相关性较高，建议增加不同类别的资产以提高多元化程度")

        return insights