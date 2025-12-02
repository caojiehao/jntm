#!/usr/bin/env node

const http = require('http');
const url = require('url');

// 模拟数据
const MOCK_FUNDS = [
    {
        id: "1",
        code: "110022",
        name: "易方达消费行业",
        type: "股票型",
        nav: 2.456,
        daily_change_rate: 1.25,
        annualized_return: 15.8,
        risk_level: "中高风险",
        management_fee: 1.5
    },
    {
        id: "2",
        code: "161725",
        name: "招商中证白酒",
        type: "指数型",
        nav: 1.345,
        daily_change_rate: -0.85,
        annualized_return: 12.3,
        risk_level: "高风险",
        management_fee: 0.5
    },
    {
        id: "3",
        code: "005827",
        name: "易方达蓝筹精选",
        type: "混合型",
        nav: 1.789,
        daily_change_rate: 0.65,
        annualized_return: 18.2,
        risk_level: "中风险",
        management_fee: 1.2
    }
];

const THEMES = {
    fire: {
        name: "FIRE - 财务独立提前退休",
        description: "专注于退休规划和被动收入分析",
        color: "#FF6B6B"
    },
    global: {
        name: "全球配置",
        description: "国际市场对比和QDII筛选",
        color: "#4ECDC4"
    },
    inflation: {
        name: "跑赢通胀",
        description: "保值增值和购买力保护",
        color: "#45B7D1"
    }
};

// 设置CORS
const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
};

// 发送JSON响应
const sendJson = (res, data, statusCode = 200) => {
    setCorsHeaders(res);
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data, null, 2));
};

// 处理路由
const handleRoute = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    console.log(`${method} ${path}`);

    // 处理OPTIONS请求（CORS预检）
    if (method === 'OPTIONS') {
        setCorsHeaders(res);
        res.writeHead(200);
        res.end();
        return;
    }

    // 路由处理
    if (path === '/' && method === 'GET') {
        sendJson(res, {
            message: "欢迎使用JNTM智能基金管家API",
            version: "1.0.0",
            status: "running",
            timestamp: new Date().toISOString()
        });
        return;
    }

    if (path === '/api/v1/health' && method === 'GET') {
        sendJson(res, {
            status: "healthy",
            timestamp: new Date().toISOString(),
            services: {
                api: "running",
                database: "mock",
                ai: "simulated"
            }
        });
        return;
    }

    if (path === '/api/v1/themes' && method === 'GET') {
        sendJson(res, {
            success: true,
            data: THEMES,
            total: Object.keys(THEMES).length
        });
        return;
    }

    if (path === '/api/v1/funds' && method === 'GET') {
        sendJson(res, {
            success: true,
            data: MOCK_FUNDS,
            total: MOCK_FUNDS.length
        });
        return;
    }

    if (path.startsWith('/api/v1/funds/') && method === 'GET') {
        const fundId = path.split('/').pop();
        const fund = MOCK_FUNDS.find(f => f.id === fundId);

        if (fund) {
            sendJson(res, {
                success: true,
                data: fund
            });
        } else {
            sendJson(res, { success: false, error: "基金不存在" }, 404);
        }
        return;
    }

    if (path === '/api/v1/themes/analyze' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { theme, funds } = JSON.parse(body);

                if (!THEMES[theme]) {
                    sendJson(res, { success: false, error: "不支持的主题" }, 400);
                    return;
                }

                const analysisResult = {
                    fire: {
                        retirement_score: 85,
                        passive_income_ratio: 0.65,
                        fire_years: 12,
                        monthly_expenses: 15000,
                        required_corpus: 4500000
                    },
                    global: {
                        allocation_score: 78,
                        currency_diversification: 0.45,
                        overseas_ratio: 0.30,
                        risk_spread: 0.25
                    },
                    inflation: {
                        inflation_hedge: 82,
                        real_return: 6.5,
                        purchasing_power_protection: 0.78,
                        inflation_beating_rate: 0.65
                    }
                };

                sendJson(res, {
                    success: true,
                    data: {
                        theme: theme,
                        analysis: analysisResult[theme],
                        recommendations: MOCK_FUNDS.slice(0, 3).map((f, idx) => ({
                            fund_code: f.code,
                            fund_name: f.name,
                            score: 85 + idx * 2
                        }))
                    }
                });
            } catch (error) {
                sendJson(res, { success: false, error: "请求数据格式错误" }, 400);
            }
        });
        return;
    }

    if (path === '/api/v1/ai/chat' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { message, theme = "fire" } = JSON.parse(body);

                const responses = {
                    fire: `根据FIRE理念，关于'${message}'的建议是：建议您关注被动收入来源，计算您的4%安全提取率，确保投资组合能够覆盖日常生活开支。`,
                    global: `从全球配置角度看'${message}'：建议分散投资于不同市场，考虑QDII基金配置，关注汇率变化对投资收益的影响。`,
                    inflation: `针对通胀问题'${message}'：建议配置一些实物资产相关的基金，关注实际收益率而非名义收益率。`
                };

                sendJson(res, {
                    success: true,
                    data: {
                        message: responses[theme] || `关于'${message}'的分析正在处理中...`,
                        theme: theme,
                        timestamp: new Date().toISOString()
                    }
                });
            } catch (error) {
                sendJson(res, { success: false, error: "请求数据格式错误" }, 400);
            }
        });
        return;
    }

    if (path === '/api/v1/portfolio/summary' && method === 'GET') {
        sendJson(res, {
            success: true,
            data: {
                total_value: 150000,
                total_return: 12500,
                return_rate: 8.33,
                fund_count: 3,
                top_holdings: [
                    { fund_name: "易方达消费行业", value: 60000, percentage: 40.0 },
                    { fund_name: "招商中证白酒", value: 45000, percentage: 30.0 },
                    { fund_name: "易方达蓝筹精选", value: 45000, percentage: 30.0 }
                ]
            }
        });
        return;
    }

    // 404处理
    sendJson(res, {
        success: false,
        error: "接口不存在",
        path: path
    }, 404);
};

// 创建服务器
const server = http.createServer(handleRoute);

const PORT = 8080;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log('🚀 JNTM API 模拟服务启动成功！');
    console.log(`📍 服务地址: http://localhost:${PORT}`);
    console.log(`📖 API测试: http://localhost:${PORT}/api/v1/health`);
    console.log(`🔗 前端连接: http://localhost:5173`);
    console.log('✨ 服务正在运行中...');
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ 端口 ${PORT} 已被占用，请检查或更改端口`);
    } else {
        console.error('❌ 服务器启动失败:', error);
    }
});

process.on('SIGINT', () => {
    console.log('\n👋 正在关闭服务器...');
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
});