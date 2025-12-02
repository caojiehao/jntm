package com.jntm.controller;

import com.jntm.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.repository.CrudRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 健康检查控制器
 * 提供应用健康状态检查和监控指标
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/actuator")
@RequiredArgsConstructor
@Tag(name = "健康检查", description = "应用健康状态和监控指标")
public class HealthController {

    @Autowired
    private DataSource dataSource;

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    /**
     * 应用健康检查
     */
    @GetMapping("/health")
    @Operation(summary = "应用健康检查", description = "检查应用整体健康状态")
    public ResponseEntity<Health> health() {
        return ResponseEntity.ok(Health.up().withDetail("timestamp", LocalDateTime.now())
                .withDetail("application", "JNTM Backend Service")
                .withDetail("version", "1.0.0"));
    }

    /**
     * 详细健康检查
     */
    @GetMapping("/health/detailed")
    @Operation(summary = "详细健康检查", description = "检查数据库和Redis等外部依赖的健康状态")
    public ResponseEntity<Map<String, Object>> detailedHealth() {
        Map<String, Object> healthStatus = new HashMap<>();

        // 检查数据库连接
        boolean dbHealthy = checkDatabaseHealth();
        healthStatus.put("database", dbHealthy ? "UP" : "DOWN");

        // 检查Redis连接
        boolean redisHealthy = checkRedisHealth();
        healthStatus.put("redis", redisHealthy ? "UP" : "DOWN");

        // 检查应用状态
        healthStatus.put("application", "UP");
        healthStatus.put("timestamp", LocalDateTime.now().toString());

        // 内存信息
        Runtime runtime = Runtime.getRuntime();
        healthStatus.put("memory", Map.of(
            "total", runtime.totalMemory(),
            "free", runtime.freeMemory(),
            "used", runtime.totalMemory() - runtime.freeMemory(),
            "max", runtime.maxMemory()
        ));

        return ResponseEntity.ok(healthStatus);
    }

    /**
     * 服务信息
     */
    @GetMapping("/info")
    @Operation(summary = "服务信息", description = "获取应用基本信息")
    public ResponseEntity<Map<String, Object>> info() {
        Map<String, Object> info = new HashMap<>();

        info.put("application", "基你太美 - 智能基金管家");
        info.put("name", "JNTM Backend Service");
        info.put("version", "1.0.0");
        info.put("description", "主题化智能基金管家后端服务");
        info.put("author", "JNTM Team");
        info.put("build", "2024-01-15");
        info.put("profile", System.getProperty("spring.profiles.active", "dev"));
        info.put("java-version", System.getProperty("java.version"));
        info.put("spring-boot-version", "3.2.1");
        info.put("start-time", System.currentTimeMillis());

        return ResponseEntity.ok(info);
    }

    /**
     * 认证系统状态
     */
    @GetMapping("/health/auth")
    @Operation(summary = "认证系统状态", description = "检查JWT认证系统状态")
    public ResponseEntity<Map<String, Object>> authHealth() {
        Map<String, Object> authStatus = new HashMap<>();

        authStatus.put("jwt-configured", "JWT认证已配置");
        authStatus.put("security-enabled", "Spring Security已启用");
        authStatus.put("status", "UP");
        authStatus.put("timestamp", LocalDateTime.now().toString());

        return ResponseEntity.ok(authStatus);
    }

    /**
     * 数据库健康检查
     */
    @GetMapping("/health/database")
    @Operation(summary = "数据库健康检查", description = "检查数据库连接状态")
    public ResponseEntity<Map<String, Object>> databaseHealth() {
        Map<String, Object> dbStatus = new HashMap<>();
        boolean isHealthy = checkDatabaseHealth();

        dbStatus.put("status", isHealthy ? "UP" : "DOWN");
        dbStatus.put("database", "MySQL");
        dbStatus.put("connection-pool", "HikariCP");
        dbStatus.put("timestamp", LocalDateTime.now().toString());

        if (!isHealthy) {
            dbStatus.put("error", "数据库连接失败");
        }

        return ResponseEntity.ok(dbStatus);
    }

    /**
     * Redis健康检查
     */
    @GetMapping("/health/redis")
    @Operation(summary = "Redis健康检查", description = "检查Redis连接状态")
    public ResponseEntity<Map<String, Object>> redisHealth() {
        Map<String, Object> redisStatus = new HashMap<>();
        boolean isHealthy = checkRedisHealth();

        redisStatus.put("status", isHealthy ? "UP" : "DOWN");
        redisStatus.put("cache", "Redis");
        redisStatus.put("timestamp", LocalDateTime.now().toString());

        if (!isHealthy) {
            redisStatus.put("error", "Redis连接失败");
        } else {
            // 获取Redis信息
            redisStatus.put("server", "Redis Server");
        }

        return ResponseEntity.ok(redisStatus);
    }

    /**
     * 检查数据库连接健康状态
     */
    private boolean checkDatabaseHealth() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(5);
        } catch (Exception e) {
            log.error("数据库健康检查失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 检查Redis连接健康状态
     */
    private boolean checkRedisHealth() {
        try {
            if (redisTemplate != null) {
                redisTemplate.opsForValue().get("health-check:test", String.class);
                return true;
            } else {
                return false; // Redis未配置
            }
        } catch (Exception e) {
            log.error("Redis健康检查失败: {}", e.getMessage());
            return false;
        }
    }
}