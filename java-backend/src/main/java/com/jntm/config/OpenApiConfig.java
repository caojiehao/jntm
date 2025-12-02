package com.jntm.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * SpringDoc OpenAPI 3 配置类
 * 用于生成API文档和Swagger UI界面
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Configuration
public class OpenApiConfig {

    /**
     * OpenAPI配置
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("基你太美 - 智能基金管家 API")
                        .description("一个创新的主题化智能基金管家工具，通过不同的投资理念主题为用户提供个性化的投资体验")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("JNTM Team")
                                .email("support@jntm.com")
                                .url("https://github.com/caojiehao/jntm"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://github.com/caojiehao/jntm/blob/main/LICENSE")))
                .servers(List.of(
                        new Server().url("http://localhost:5080/api/v1").description("开发环境"),
                        new Server().url("https://api.jntm.com/v1").description("生产环境")
                ))
                .tags(List.of(
                        new Tag().name("用户认证").description("用户登录、注册、Token管理相关接口"),
                        new Tag().name("用户管理").description("用户信息管理相关接口"),
                        new Tag().name("主题管理").description("投资主题相关接口"),
                        new Tag().name("基金管理").description("基金数据相关接口"),
                        new Tag().name("投资组合").description("用户投资组合相关接口"),
                        new Tag().name("AI分析").description("AI智能分析相关接口"),
                        new Tag().name("OCR识别").description("OCR基金识别相关接口"),
                        new Tag().name("数据分析").description("数据分析和统计相关接口")
                ));
    }

    /**
     * 公开API分组（无需认证）
     */
    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("公开API")
                .pathsToMatch("/auth/**", "/actuator/health", "/health")
                .build();
    }

    /**
     * 用户API分组（需要认证）
     */
    @Bean
    public GroupedOpenApi userApi() {
        return GroupedOpenApi.builder()
                .group("用户API")
                .pathsToMatch("/users/**", "/themes/**", "/funds/**", "/portfolio/**")
                .build();
    }

    /**
     * 内部API分组（需要认证和管理员权限）
     */
    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
                .group("管理员API")
                .pathsToMatch("/admin/**", "/ai/**", "/ocr/**", "/analysis/**")
                .build();
    }
}