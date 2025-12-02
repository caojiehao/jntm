package com.jntm.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import javax.sql.DataSource;

/**
 * 数据库配置类
 * 配置数据库连接池和JPA相关设置
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Configuration
@EnableJpaRepositories(basePackages = "com.jntm.repository")
@EnableTransactionManagement
public class DatabaseConfig {

    /**
     * 配置数据源连接池
     * 使用HikariCP作为连接池，性能优异
     */
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.hikari")
    public HikariConfig hikariConfig() {
        return new HikariConfig();
    }

    /**
     * 创建数据源Bean
     */
    @Bean
    public DataSource dataSource(HikariConfig hikariConfig) {
        HikariDataSource dataSource = new HikariDataSource(hikariConfig);
        // 设置连接池名称，便于监控
        dataSource.setPoolName("JNTM-DataSource");
        return dataSource;
    }

}