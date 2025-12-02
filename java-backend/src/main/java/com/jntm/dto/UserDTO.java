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

    /**
     * 从User实体转换为DTO
     */
    public static UserDTO fromEntity(User user) {
        if (user == null) {
            return null;
        }

        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .avatarUrl(user.getAvatarUrl())
                .currentTheme(user.getCurrentTheme())
                .investmentGoal(user.getInvestmentGoal())
                .riskTolerance(user.getRiskTolerance())
                .expectedReturnRate(user.getExpectedReturnRate())
                .investmentHorizon(user.getInvestmentHorizon())
                .status(user.getStatus())
                .emailNotificationEnabled(user.getEmailNotificationEnabled())
                .lastLoginAt(user.getLastLoginAt())
                .lastLoginIp(user.getLastLoginIp())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

}