package com.jntm.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.jntm.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 用户数据传输对象
 * 用于API响应和数据传输，排除敏感信息
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDTO {

    /**
     * 用户ID
     */
    private Long id;

    /**
     * 用户名
     */
    private String username;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 密码（仅用于注册和更新）
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String password;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 头像URL
     */
    private String avatarUrl;

    /**
     * 当前主题
     */
    private User.ThemeType currentTheme;

    /**
     * 投资目标金额
     */
    private BigDecimal investmentGoal;

    /**
     * 风险承受能力
     */
    private User.RiskTolerance riskTolerance;

    /**
     * 期望年化收益率
     */
    private BigDecimal expectedReturnRate;

    /**
     * 投资期限（年）
     */
    private Integer investmentHorizon;

    /**
     * 用户角色
     */
    private String role;

    /**
     * 账户状态
     */
    private User.UserStatus status;

    /**
     * 是否启用邮件通知
     */
    private Boolean emailNotificationEnabled;

    /**
     * 最后登录时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastLoginAt;

    /**
     * 最后登录IP
     */
    private String lastLoginIp;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    // 构造函数
    public UserDTO() {}

    // Getter和Setter方法
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public User.ThemeType getCurrentTheme() { return currentTheme; }
    public void setCurrentTheme(User.ThemeType currentTheme) { this.currentTheme = currentTheme; }

    public BigDecimal getInvestmentGoal() { return investmentGoal; }
    public void setInvestmentGoal(BigDecimal investmentGoal) { this.investmentGoal = investmentGoal; }

    public User.RiskTolerance getRiskTolerance() { return riskTolerance; }
    public void setRiskTolerance(User.RiskTolerance riskTolerance) { this.riskTolerance = riskTolerance; }

    public BigDecimal getExpectedReturnRate() { return expectedReturnRate; }
    public void setExpectedReturnRate(BigDecimal expectedReturnRate) { this.expectedReturnRate = expectedReturnRate; }

    public Integer getInvestmentHorizon() { return investmentHorizon; }
    public void setInvestmentHorizon(Integer investmentHorizon) { this.investmentHorizon = investmentHorizon; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public User.UserStatus getStatus() { return status; }
    public void setStatus(User.UserStatus status) { this.status = status; }

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

    /**
     * 从User实体转换为DTO
     */
    public static UserDTO fromEntity(User user) {
        if (user == null) {
            return null;
        }

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setNickname(user.getNickname());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setCurrentTheme(user.getCurrentTheme());
        dto.setInvestmentGoal(user.getInvestmentGoal());
        dto.setRiskTolerance(user.getRiskTolerance());
        dto.setExpectedReturnRate(user.getExpectedReturnRate());
        dto.setInvestmentHorizon(user.getInvestmentHorizon());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        dto.setEmailNotificationEnabled(user.getEmailNotificationEnabled());
        dto.setLastLoginAt(user.getLastLoginAt());
        dto.setLastLoginIp(user.getLastLoginIp());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }

}