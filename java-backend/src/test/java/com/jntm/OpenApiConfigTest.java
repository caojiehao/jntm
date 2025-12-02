package com.jntm;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * OpenAPI配置测试类
 * 验证Swagger UI和API文档是否正常工作
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@SpringBootTest
@ActiveProfiles("test")
class OpenApiConfigTest {

    @Test
    void contextLoads() {
        // 测试Spring上下文是否正常加载
    }

    @Test
    void springDocPropertiesConfigured() {
        // 这里可以测试SpringDoc配置是否正确
        // 实际测试中可以通过MockMvc测试Swagger UI访问
    }
}