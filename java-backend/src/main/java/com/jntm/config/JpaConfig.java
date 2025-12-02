package com.jntm.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * JPA配置类
 * 配置JPA审计和仓库扫描
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Configuration
@EnableJpaRepositories(basePackages = "com.jntm.repository")
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class JpaConfig {

    /**
     * 审计信息提供者
     * 用于自动填充创建人和修改人信息
     */
    @Bean
    public AuditorAware<String> auditorProvider() {
        return new AuditorAwareImpl();
    }

    /**
     * 审计信息提供者实现类
     */
    public static class AuditorAwareImpl implements AuditorAware<String> {

        @Override
        public Optional<String> getCurrentAuditor() {
            // 从Spring Security上下文中获取当前用户
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
                return Optional.of("system");
            }

            // 返回当前用户名
            String username = authentication.getName();
            return Optional.ofNullable(username);
        }
    }

}