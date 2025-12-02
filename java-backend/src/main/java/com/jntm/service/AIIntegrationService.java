package com.jntm.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.Map;

/**
 * AI集成服务
 * 负责与Python AI服务进行HTTP通信
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIIntegrationService {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${jntm.ai-service.base-url:http://localhost:5081}")
    private String aiServiceBaseUrl;

    @Value("${jntm.ai-service.timeout:30000}")
    private int aiServiceTimeout;

    /**
     * 调用Python AI服务进行投资组合分析
     */
    public Mono<Map<String, Object>> analyzePortfolio(
            Long userId,
            String theme,
            Map<String, Object> portfolioData,
            String analysisType,
            Map<String, Object> customPreferences) {

        log.debug("调用AI服务进行投资组合分析: userId={}, theme={}", userId, theme);

        // 构建请求体
        Map<String, Object> requestBody = Map.of(
                "user_id", userId,
                "theme", theme,
                "portfolio_data", portfolioData,
                "analysis_type", analysisType,
                "custom_preferences", customPreferences != null ? customPreferences : Map.of()
        );

        return getWebClient()
                .post()
                .uri("/api/v1/ai/analyze")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(2))
                        .maxBackoff(Duration.ofSeconds(10))
                        .doBeforeRetry(retrySignal -> log.warn("AI服务调用失败，正在重试: {}", retrySignal.failure().getMessage()))
                        .onRetryExhaustedThrow((retryBackoffSpec, retrySignal) -> {
                            log.error("AI服务调用重试次数已用尽: {}", retrySignal.failure().getMessage());
                            return new RuntimeException("AI服务调用失败: " + retrySignal.failure().getMessage());
                        }))
                .doOnSuccess(response -> log.debug("AI分析成功: userId={}", userId))
                .doOnError(error -> log.error("AI分析失败: userId={}, error={}", userId, error.getMessage()))
                .onErrorMap(WebClientResponseException.class, ex -> {
                    log.error("AI服务HTTP错误: status={}, body={}", ex.getStatusCode(), ex.getResponseBodyAsString());
                    return new RuntimeException("AI服务调用失败: " + ex.getMessage());
                })
                .onErrorMap(Exception.class, ex -> {
                    log.error("AI服务调用异常: {}", ex.getMessage());
                    return new RuntimeException("AI服务调用失败: " + ex.getMessage());
                });
    }

    /**
     * 调用Python AI服务进行对话
     */
    public Mono<Map<String, Object>> chatWithAI(
            Long userId,
            String message,
            String theme) {

        log.debug("调用AI服务进行对话: userId={}, theme={}", userId, theme);

        Map<String, Object> requestBody = Map.of(
                "message", message,
                "user_id", userId,
                "theme", theme != null ? theme : "general"
        );

        return getWebClient()
                .post()
                .uri("/api/v1/ai/chat")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofMillis(aiServiceTimeout))
                .retryWhen(Retry.backoff(2, Duration.ofSeconds(1))
                        .maxBackoff(Duration.ofSeconds(5)))
                .doOnSuccess(response -> log.debug("AI对话成功: userId={}", userId))
                .doOnError(error -> log.error("AI对话失败: userId={}, error={}", userId, error.getMessage()))
                .onErrorMap(Exception.class, ex -> new RuntimeException("AI对话失败: " + ex.getMessage()));
    }

    /**
     * 调用Python OCR服务进行基金截图识别
     */
    public Mono<Map<String, Object>> recognizeFundImage(
            Long userId,
            String imagePath,
            String imageType) {

        log.debug("调用OCR服务进行基金识别: userId={}, imageType={}", userId, imageType);

        // 注意：实际实现中需要处理文件上传
        Map<String, Object> requestBody = Map.of(
                "image_type", imageType,
                "image_name", imagePath.substring(imagePath.lastIndexOf('/') + 1),
                "user_id", userId
        );

        return getWebClient()
                .post()
                .uri("/api/v1/ocr/recognize")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofMillis(aiServiceTimeout))
                .retryWhen(Retry.backoff(2, Duration.ofSeconds(1))
                        .maxBackoff(Duration.ofSeconds(5)))
                .doOnSuccess(response -> log.debug("OCR识别成功: userId={}", userId))
                .doOnError(error -> log.error("OCR识别失败: userId={}, error={}", userId, error.getMessage()))
                .onErrorMap(Exception.class, ex -> new RuntimeException("OCR识别失败: " + ex.getMessage()));
    }

    /**
     * 调用Python数据分析服务
     */
    public Mono<Map<String, Object>> analyzeData(
            Long userId,
            String analysisType,
            Map<String, Object> data,
            Map<String, Object> parameters) {

        log.debug("调用数据分析服务: userId={}, analysisType={}", userId, analysisType);

        Map<String, Object> requestBody = Map.of(
                "user_id", userId,
                "analysis_type", analysisType,
                "data", data,
                "parameters", parameters != null ? parameters : Map.of()
        );

        return getWebClient()
                .post()
                .uri("/api/v1/analytics/analyze")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofMillis(aiServiceTimeout))
                .retryWhen(Retry.backoff(2, Duration.ofSeconds(1))
                        .maxBackoff(Duration.ofSeconds(5)))
                .doOnSuccess(response -> log.debug("数据分析成功: userId={}", userId))
                .doOnError(error -> log.error("数据分析失败: userId={}, error={}", userId, error.getMessage()))
                .onErrorMap(Exception.class, ex -> new RuntimeException("数据分析失败: " + ex.getMessage()));
    }

    /**
     * 调用Python服务进行风险评估
     */
    public Mono<Map<String, Object>> assessPortfolioRisk(
            Long userId,
            Map<String, Object> portfolioData,
            Integer timeHorizon) {

        log.debug("调用风险评估服务: userId={}, timeHorizon={}", userId, timeHorizon);

        return getWebClient()
                .post()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/v1/analytics/risk-assessment")
                        .queryParam("user_id", userId)
                        .queryParam("time_horizon", timeHorizon != null ? timeHorizon : 1)
                        .build())
                .bodyValue(portfolioData)
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofMillis(aiServiceTimeout))
                .retryWhen(Retry.backoff(2, Duration.ofSeconds(1)))
                .doOnSuccess(response -> log.debug("风险评估成功: userId={}", userId))
                .doOnError(error -> log.error("风险评估失败: userId={}, error={}", userId, error.getMessage()))
                .onErrorMap(Exception.class, ex -> new RuntimeException("风险评估失败: " + ex.getMessage()));
    }

    /**
     * 检查Python AI服务健康状态
     */
    public Mono<Boolean> checkAIHealth() {
        log.debug("检查AI服务健康状态");

        return getWebClient()
                .get()
                .uri("/api/v1/ai/health")
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    Object status = response.get("status");
                    return "healthy".equals(status);
                })
                .timeout(Duration.ofSeconds(5))
                .onErrorReturn(false)
                .doOnSuccess(healthy -> log.debug("AI服务健康状态: {}", healthy ? "健康" : "不健康"));
    }

    /**
     * 检查Python OCR服务健康状态
     */
    public Mono<Boolean> checkOCRHealth() {
        log.debug("检查OCR服务健康状态");

        return getWebClient()
                .get()
                .uri("/api/v1/ocr/health")
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    Object status = response.get("status");
                    return "healthy".equals(status);
                })
                .timeout(Duration.ofSeconds(5))
                .onErrorReturn(false)
                .doOnSuccess(healthy -> log.debug("OCR服务健康状态: {}", healthy ? "健康" : "不健康"));
    }

    /**
     * 检查Python数据分析服务健康状态
     */
    public Mono<Boolean> checkAnalyticsHealth() {
        log.debug("检查数据分析服务健康状态");

        return getWebClient()
                .get()
                .uri("/api/v1/analytics/health")
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    Object status = response.get("status");
                    return "healthy".equals(status);
                })
                .timeout(Duration.ofSeconds(5))
                .onErrorReturn(false)
                .doOnSuccess(healthy -> log.debug("数据分析服务健康状态: {}", healthy ? "健康" : "不健康"));
    }

    /**
     * 获取WebClient实例
     */
    private WebClient getWebClient() {
        return webClientBuilder
                .baseUrl(aiServiceBaseUrl)
                .build();
    }

}