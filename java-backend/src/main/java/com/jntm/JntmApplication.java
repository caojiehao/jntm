package com.jntm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * 基你太美 - 智能基金管家主应用启动类
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableTransactionManagement
public class JntmApplication {

    public static void main(String[] args) {
        SpringApplication.run(JntmApplication.class, args);
        System.out.println("🎵 基你太美 - 智能基金管家服务启动成功！");
        System.out.println("📍 服务地址: http://localhost:5080");
        System.out.println("📚 API文档: http://localhost:5080/swagger-ui.html");
    }

}