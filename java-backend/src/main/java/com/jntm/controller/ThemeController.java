package com.jntm.controller;

import com.jntm.dto.ApiResponse;
import com.jntm.dto.UserDTO;
import com.jntm.entity.User;
import com.jntm.service.AIIntegrationService;
import com.jntm.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 主题管理控制器
 * 提供主题相关的API接口，包括与Python AI服务的集成
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/themes")
@RequiredArgsConstructor
@Tag(name = "主题管理", description = "主题相关的API接口")
public class ThemeController {

    private final UserService userService;
    private final AIIntegrationService aiIntegrationService;

    /**
     * 获取用户的主题化投资组合分析
     */
    @PostMapping("/{userId}/analyze")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    @Operation(summary = "主题化投资组合分析", description = "基于用户主题进行投资组合AI分析")
    public Mono<ResponseEntity<ApiResponse<Map<String, Object>>>> analyzeThemePortfolio(
            @Parameter(description = "用户ID", required = true) @PathVariable Long userId,
            @RequestBody ThemeAnalysisRequest request) {

        log.info("收到主题化分析请求: userId={}, theme={}", userId, request.getTheme());

        // 构建投资组合数据
        Map<String, Object> portfolioData = new HashMap<>();
        portfolioData.put("holdings", request.getHoldings());
        portfolioData.put("total_value", request.getTotalValue());
        portfolioData.put("risk_profile", request.getRiskProfile());

        // 调用Python AI服务
        return aiIntegrationService.analyzePortfolio(
                userId,
                request.getTheme(),
                portfolioData,
                request.getAnalysisType(),
                request.getCustomPreferences()
        ).map(response -> ResponseEntity.ok(ApiResponse.success("主题化分析完成", response)))
        .onErrorReturn(ResponseEntity.badRequest()
                .body(ApiResponse.error("主题化分析失败")));
    }

    /**
     * 与主题AI助手对话
     */
    @PostMapping("/{userId}/chat")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    @Operation(summary = "主题AI对话", description = "与特定主题的AI助手进行对话")
    public Mono<ResponseEntity<ApiResponse<Map<String, Object>>>> chatWithThemeAI(
            @Parameter(description = "用户ID", required = true) @PathVariable Long userId,
            @RequestBody ChatRequest request) {

        log.info("收到主题AI对话请求: userId={}, theme={}", userId, request.getTheme());

        return aiIntegrationService.chatWithAI(
                userId,
                request.getMessage(),
                request.getTheme()
        ).map(response -> ResponseEntity.ok(ApiResponse.success("AI对话成功", response)))
        .onErrorReturn(ResponseEntity.badRequest()
                .body(ApiResponse.error("AI对话失败")));
    }

    /**
     * 获取主题推荐配置
     */
    @GetMapping("/{userId}/recommendations")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    @Operation(summary = "获取主题推荐", description = "基于用户当前主题获取投资推荐")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getThemeRecommendations(
            @Parameter(description = "用户ID", required = true) @PathVariable Long userId) {

        log.info("获取主题推荐: userId={}", userId);

        // 获取用户当前主题
        UserDTO user = userService.findById(userId);
        if (user == null) {
            return ResponseEntity.ok(ApiResponse.notFound("用户不存在"));
        }

        // 构建主题推荐
        Map<String, Object> recommendations = generateThemeRecommendations(user.getCurrentTheme());

        return ResponseEntity.ok(ApiResponse.success("获取主题推荐成功", recommendations));
    }

    /**
     * 健康检查 - 检查Python AI服务状态
     */
    @GetMapping("/health/ai")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "AI服务健康检查", description = "检查Python AI服务的健康状态")
    public Mono<ResponseEntity<ApiResponse<Map<String, Object>>>> checkAIHealth() {
        return aiIntegrationService.checkAIHealth()
                .map(healthy -> {
                    Map<String, Object> healthInfo = Map.of(
                            "ai_service", healthy ? "healthy" : "unhealthy",
                            "timestamp", System.currentTimeMillis()
                    );
                    return ResponseEntity.ok(ApiResponse.success("AI服务健康检查完成", healthInfo));
                });
    }

    /**
     * 健康检查 - 检查所有Python服务状态
     */
    @GetMapping("/health/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "所有服务健康检查", description = "检查所有Python服务的健康状态")
    public Mono<ResponseEntity<ApiResponse<Map<String, Object>>>> checkAllServicesHealth() {
        Mono<Boolean> aiHealth = aiIntegrationService.checkAIHealth();
        Mono<Boolean> ocrHealth = aiIntegrationService.checkOCRHealth();
        Mono<Boolean> analyticsHealth = aiIntegrationService.checkAnalyticsHealth();

        return Mono.zip(aiHealth, ocrHealth, analyticsHealth)
                .map(tuple -> {
                    Map<String, Object> healthInfo = new HashMap<>();
                    healthInfo.put("ai_service", tuple.getT1() ? "healthy" : "unhealthy");
                    healthInfo.put("ocr_service", tuple.getT2() ? "healthy" : "unhealthy");
                    healthInfo.put("analytics_service", tuple.getT3() ? "healthy" : "unhealthy");
                    healthInfo.put("overall_health", (tuple.getT1() && tuple.getT2() && tuple.getT3()) ? "healthy" : "partial");
                    healthInfo.put("timestamp", System.currentTimeMillis());

                    return ResponseEntity.ok(ApiResponse.success("服务健康检查完成", healthInfo));
                });
    }

    /**
     * 生成主题推荐
     */
    private Map<String, Object> generateThemeRecommendations(User.ThemeType theme) {
        Map<String, Object> recommendations = new HashMap<>();

        switch (theme) {
            case FIRE:
                recommendations.put("theme_name", "提前退休");
                recommendations.put("description", "专注于实现财务独立和提前退休");
                recommendations.put("recommended_allocation", Map.of(
                        "stocks", 0.6,
                        "bonds", 0.3,
                        "cash", 0.1
                ));
                recommendations.put("key_metrics", List.of("4%法则", "被动收入", "退休金"));
                break;

            case GLOBAL:
                recommendations.put("theme_name", "全球配置");
                recommendations.put("description", "通过全球分散投资降低风险");
                recommendations.put("recommended_allocation", Map.of(
                        "domestic_stocks", 0.4,
                        "international_stocks", 0.3,
                        "emerging_markets", 0.2,
                        "bonds", 0.1
                ));
                recommendations.put("key_metrics", List.of("汇率风险", "地区配置", "QDII额度"));
                break;

            case INFLATION:
                recommendations.put("theme_name", "跑赢通胀");
                recommendations.put("description", "关注保值增值，对抗通胀风险");
                recommendations.put("recommended_allocation", Map.of(
                        "inflation_protected_bonds", 0.3,
                        "real_assets", 0.3,
                        "commodities", 0.2,
                        "stocks", 0.2
                ));
                recommendations.put("key_metrics", List.of("实际收益率", "通胀预期", "购买力保护"));
                break;
        }

        return recommendations;
    }

    // 请求DTO类
    public static class ThemeAnalysisRequest {
        private String theme;
        private String analysisType;
        private List<Map<String, Object>> holdings;
        private Double totalValue;
        private String riskProfile;
        private Map<String, Object> customPreferences;

        // Getters and Setters
        public String getTheme() { return theme; }
        public void setTheme(String theme) { this.theme = theme; }
        public String getAnalysisType() { return analysisType; }
        public void setAnalysisType(String analysisType) { this.analysisType = analysisType; }
        public List<Map<String, Object>> getHoldings() { return holdings; }
        public void setHoldings(List<Map<String, Object>> holdings) { this.holdings = holdings; }
        public Double getTotalValue() { return totalValue; }
        public void setTotalValue(Double totalValue) { this.totalValue = totalValue; }
        public String getRiskProfile() { return riskProfile; }
        public void setRiskProfile(String riskProfile) { this.riskProfile = riskProfile; }
        public Map<String, Object> getCustomPreferences() { return customPreferences; }
        public void setCustomPreferences(Map<String, Object> customPreferences) { this.customPreferences = customPreferences; }
    }

    public static class ChatRequest {
        private String message;
        private String theme;

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getTheme() { return theme; }
        public void setTheme(String theme) { this.theme = theme; }
    }

}