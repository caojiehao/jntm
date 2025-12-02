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
     * 手机号
     */
    @Column(name = "phone", length = 20)
    private String phone;

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
     * 用户角色
     */
    @Column(name = "role", nullable = false, length = 20)
    private String role;

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

    // Getter和Setter方法
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public ThemeType getCurrentTheme() { return currentTheme; }
    public void setCurrentTheme(ThemeType currentTheme) { this.currentTheme = currentTheme; }

    public BigDecimal getInvestmentGoal() { return investmentGoal; }
    public void setInvestmentGoal(BigDecimal investmentGoal) { this.investmentGoal = investmentGoal; }

    public RiskTolerance getRiskTolerance() { return riskTolerance; }
    public void setRiskTolerance(RiskTolerance riskTolerance) { this.riskTolerance = riskTolerance; }

    public BigDecimal getExpectedReturnRate() { return expectedReturnRate; }
    public void setExpectedReturnRate(BigDecimal expectedReturnRate) { this.expectedReturnRate = expectedReturnRate; }

    public Integer getInvestmentHorizon() { return investmentHorizon; }
    public void setInvestmentHorizon(Integer investmentHorizon) { this.investmentHorizon = investmentHorizon; }

    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Boolean getEmailNotificationEnabled() { return emailNotificationEnabled; }
    public void setEmailNotificationEnabled(Boolean emailNotificationEnabled) { this.emailNotificationEnabled = emailNotificationEnabled; }

    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }

    public String getLastLoginIp() { return lastLoginIp; }
    public void setLastLoginIp(String lastLoginIp) { this.lastLoginIp = lastLoginIp; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

}