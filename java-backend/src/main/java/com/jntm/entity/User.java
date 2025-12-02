package com.jntm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 用户实体类
 * 存储用户基本信息和投资偏好
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class User {

    /**
     * 用户ID - 主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 用户名
     */
    @Column(name = "username", unique = true, nullable = false, length = 50)
    private String username;

    /**
     * 邮箱
     */
    @Column(name = "email", unique = true, nullable = false, length = 100)
    private String email;

    /**
     * 密码哈希
     */
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    /**
     * 昵称
     */
    @Column(name = "nickname", length = 50)
    private String nickname;

    /**
     * 头像URL
     */
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    /**
     * 当前选择的主题
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "current_theme", nullable = false)
    private ThemeType currentTheme;

    /**
     * 投资目标金额
     */
    @Column(name = "investment_goal", precision = 15, scale = 2)
    private BigDecimal investmentGoal;

    /**
     * 风险承受能力
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "risk_tolerance")
    private RiskTolerance riskTolerance;

    /**
     * 期望年化收益率
     */
    @Column(name = "expected_return_rate", precision = 5, scale = 4)
    private BigDecimal expectedReturnRate;

    /**
     * 投资期限（年）
     */
    @Column(name = "investment_horizon")
    private Integer investmentHorizon;

    /**
     * 账户状态
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private UserStatus status;

    /**
     * 是否启用邮件通知
     */
    @Column(name = "email_notification_enabled", nullable = false)
    private Boolean emailNotificationEnabled;

    /**
     * 最后登录时间
     */
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    /**
     * 最后登录IP
     */
    @Column(name = "last_login_ip", length = 45)
    private String lastLoginIp;

    /**
     * 创建时间
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 主题类型枚举
     */
    public enum ThemeType {
        FIRE("fire", "提前退休"),
        GLOBAL("global", "全球配置"),
        INFLATION("inflation", "跑赢通胀");

        private final String code;
        private final String description;

        ThemeType(String code, String description) {
            this.code = code;
            this.description = description;
        }

        public String getCode() {
            return code;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 风险承受能力枚举
     */
    public enum RiskTolerance {
        CONSERVATIVE("conservative", "保守型"),
        MODERATE("moderate", "稳健型"),
        AGGRESSIVE("aggressive", "激进型");

        private final String code;
        private final String description;

        RiskTolerance(String code, String description) {
            this.code = code;
            this.description = description;
        }

        public String getCode() {
            return code;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 用户状态枚举
     */
    public enum UserStatus {
        ACTIVE("active", "活跃"),
        INACTIVE("inactive", "非活跃"),
        SUSPENDED("suspended", "暂停"),
        DELETED("deleted", "已删除");

        private final String code;
        private final String description;

        UserStatus(String code, String description) {
            this.code = code;
            this.description = description;
        }

        public String getCode() {
            return code;
        }

        public String getDescription() {
            return description;
        }
    }

}