"""
AI分析服务
"""

import asyncio
import time
from typing import Dict, Any, List
import httpx
from openai import AsyncOpenAI

from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


class AIService:
    """AI分析服务类"""

    def __init__(self):
        self.deepseek_client = None
        self.qwen_client = None
        self._initialize_clients()

    def _initialize_clients(self):
        """初始化AI客户端"""
        try:
            # 初始化DeepSeek客户端
            if settings.DEEPSEEK_API_KEY:
                self.deepseek_client = AsyncOpenAI(
                    api_key=settings.DEEPSEEK_API_KEY,
                    base_url=settings.DEEPSEEK_BASE_URL
                )
                logger.info("DeepSeek客户端初始化成功")

            # 初始化Qwen客户端
            if settings.QWEN_API_KEY:
                self.qwen_client = AsyncOpenAI(
                    api_key=settings.QWEN_API_KEY,
                    base_url=settings.QWEN_BASE_URL
                )
                logger.info("Qwen客户端初始化成功")

        except Exception as e:
            logger.error(f"AI客户端初始化失败: {e}")

    async def analyze_portfolio(
        self,
        user_id: int,
        theme: str,
        portfolio_data: List[Dict[str, Any]],
        analysis_type: str,
        custom_preferences: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        投资组合AI分析

        Args:
            user_id: 用户ID
            theme: 分析主题
            portfolio_data: 投资组合数据
            analysis_type: 分析类型
            custom_preferences: 自定义偏好设置

        Returns:
            分析结果
        """
        try:
            logger.info(f"开始AI分析: 用户ID={user_id}, 主题={theme}, 类型={analysis_type}")

            # 构建分析提示
            prompt = self._build_analysis_prompt(
                theme, portfolio_data, analysis_type, custom_preferences
            )

            # 调用AI模型
            result = await self._call_ai_model(prompt)

            # 解析AI响应
            analysis_result = self._parse_ai_response(result)

            logger.info(f"AI分析完成: 用户ID={user_id}")
            return {
                "analysis_result": analysis_result,
                "confidence_score": 0.85,  # 模拟置信度
                "model_used": self._get_available_model()
            }

        except Exception as e:
            logger.error(f"AI分析失败: {str(e)}")
            raise

    async def chat_with_ai(
        self,
        message: str,
        user_id: int,
        theme: str = "general"
    ) -> Dict[str, Any]:
        """
        与AI对话

        Args:
            message: 用户消息
            user_id: 用户ID
            theme: 对话主题

        Returns:
            AI回复结果
        """
        try:
            logger.info(f"AI对话: 用户ID={user_id}, 主题={theme}")

            # 构建对话提示
            prompt = self._build_chat_prompt(message, theme)

            # 调用AI模型
            result = await self._call_ai_model(prompt)

            return {
                "response": result,
                "model_used": self._get_available_model(),
                "timestamp": time.time()
            }

        except Exception as e:
            logger.error(f"AI对话失败: {str(e)}")
            raise

    async def get_available_models(self) -> List[str]:
        """获取可用的AI模型列表"""
        models = []
        if self.deepseek_client:
            models.append("deepseek-chat")
        if self.qwen_client:
            models.append("qwen-turbo")
        return models

    async def health_check(self) -> bool:
        """AI服务健康检查"""
        try:
            available_models = await self.get_available_models()
            return len(available_models) > 0
        except Exception as e:
            logger.error(f"AI服务健康检查失败: {str(e)}")
            return False

    def _build_analysis_prompt(
        self,
        theme: str,
        portfolio_data: List[Dict[str, Any]],
        analysis_type: str,
        custom_preferences: Dict[str, Any] = None
    ) -> str:
        """构建分析提示"""
        theme_descriptions = {
            "fire": "提前退休FIRE主题，关注退休规划和被动收入",
            "global": "全球配置主题，关注国际投资和多元化",
            "inflation": "跑赢通胀主题，关注保值增值和购买力保护"
        }

        prompt = f"""
作为一个专业的投资分析师，请对以下投资组合进行分析：

主题：{theme_descriptions.get(theme, '通用投资分析')}
分析类型：{analysis_type}
投资组合数据：
{portfolio_data}

"""

        if custom_preferences:
            prompt += f"\n用户偏好设置：\n{custom_preferences}\n"

        prompt += """
请提供详细的分析结果，包括：
1. 当前投资组合的风险评估
2. 基于主题的投资建议
3. 优化配置建议
4. 风险提示

请以JSON格式返回结果。
"""
        return prompt

    def _build_chat_prompt(self, message: str, theme: str) -> str:
        """构建对话提示"""
        theme_context = {
            "fire": "提前退休和财务规划",
            "global": "全球投资配置",
            "inflation": "通胀保值投资",
            "general": "通用投资理财"
        }

        prompt = f"""
作为一个专业的投资顾问，专注于{theme_context.get(theme, theme_context['general'])}领域，
请回答用户的以下问题：

用户问题：{message}

请提供专业、准确、实用的投资建议。
"""
        return prompt

    async def _call_ai_model(self, prompt: str) -> str:
        """调用AI模型"""
        # 优先使用DeepSeek，如果不可用则使用Qwen
        if self.deepseek_client:
            try:
                response = await self.deepseek_client.chat.completions.create(
                    model="deepseek-chat",
                    messages=[
                        {"role": "system", "content": "你是一个专业的投资分析师"},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=settings.MAX_TOKENS,
                    temperature=settings.TEMPERATURE
                )
                return response.choices[0].message.content
            except Exception as e:
                logger.warning(f"DeepSeek调用失败，尝试使用备用模型: {e}")

        if self.qwen_client:
            try:
                response = await self.qwen_client.chat.completions.create(
                    model="qwen-turbo",
                    messages=[
                        {"role": "system", "content": "你是一个专业的投资分析师"},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=settings.MAX_TOKENS,
                    temperature=settings.TEMPERATURE
                )
                return response.choices[0].message.content
            except Exception as e:
                logger.error(f"Qwen调用失败: {e}")

        raise Exception("所有AI模型都不可用")

    def _parse_ai_response(self, response: str) -> Dict[str, Any]:
        """解析AI响应"""
        try:
            # 尝试解析JSON响应
            import json
            return json.loads(response)
        except json.JSONDecodeError:
            # 如果不是JSON格式，返回文本响应
            return {
                "analysis": response,
                "recommendations": [],
                "risk_assessment": "无法解析风险评估"
            }

    def _get_available_model(self) -> str:
        """获取当前可用的模型"""
        if self.deepseek_client:
            return "deepseek-chat"
        elif self.qwen_client:
            return "qwen-turbo"
        else:
            return "无可用模型"