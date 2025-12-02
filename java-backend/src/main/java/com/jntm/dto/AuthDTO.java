package com.jntm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 认证相关数据传输对象
 *
 * @author JNTM Team
 * @since 1.0.0
 */
public class AuthDTO {

    /**
     * 登录请求DTO
     */
    @Data
    public static class LoginRequest {
        @NotBlank(message = "用户名不能为空")
        @Size(min = 3, max = 50, message = "用户名长度必须在3-50个字符之间")
        private String username;

        @NotBlank(message = "密码不能为空")
        @Size(min = 6, max = 100, message = "密码长度必须在6-100个字符之间")
        private String password;
    }

    /**
     * 注册请求DTO
     */
    @Data
    public static class RegisterRequest {
        @NotBlank(message = "用户名不能为空")
        @Size(min = 3, max = 50, message = "用户名长度必须在3-50个字符之间")
        private String username;

        @NotBlank(message = "邮箱不能为空")
        @Email(message = "邮箱格式不正确")
        @Size(max = 100, message = "邮箱长度不能超过100个字符")
        private String email;

        @NotBlank(message = "密码不能为空")
        @Size(min = 6, max = 100, message = "密码长度必须在6-100个字符之间")
        private String password;

        @Size(max = 50, message = "昵称长度不能超过50个字符")
        private String nickname;

        @Size(max = 20, message = "手机号长度不能超过20个字符")
        private String phone;
    }

    /**
     * 登录响应DTO
     */
    @Data
    public static class LoginResponse {
        private Long id;
        private String username;
        private String email;
        private String nickname;
        private String phone;
        private String avatar;
        private String currentTheme;
        private String investmentGoal;
        private Integer riskTolerance;
        private Boolean isActive;
        private String accessToken;
        private String refreshToken;
        private String tokenType = "Bearer";
        private Long expiresIn;
        private String createdAt;
        private String lastLoginAt;

        /**
         * 构造函数
         */
        public LoginResponse(UserDTO userDTO, String accessToken, String refreshToken, Long expiresIn) {
            this.id = userDTO.getId();
            this.username = userDTO.getUsername();
            this.email = userDTO.getEmail();
            this.nickname = userDTO.getNickname();
            this.phone = userDTO.getPhone();
            this.avatar = userDTO.getAvatar();
            this.currentTheme = userDTO.getCurrentTheme();
            this.investmentGoal = userDTO.getInvestmentGoal();
            this.riskTolerance = userDTO.getRiskTolerance();
            this.isActive = userDTO.getIsActive();
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.expiresIn = expiresIn;
            this.createdAt = userDTO.getCreatedAt();
            this.lastLoginAt = userDTO.getLastLoginAt();
        }
    }

    /**
     * Token刷新请求DTO
     */
    @Data
    public static class RefreshTokenRequest {
        @NotBlank(message = "刷新Token不能为空")
        private String refreshToken;
    }

    /**
     * Token刷新响应DTO
     */
    @Data
    public static class RefreshTokenResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType = "Bearer";
        private Long expiresIn;

        public RefreshTokenResponse(String accessToken, String refreshToken, Long expiresIn) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.expiresIn = expiresIn;
        }
    }

    /**
     * 用户验证响应DTO
     */
    @Data
    public static class VerifyResponse {
        private Long id;
        private String username;
        private String email;
        private String nickname;
        private String currentTheme;
        private Boolean isValid;

        public VerifyResponse(UserDTO userDTO, Boolean isValid) {
            this.id = userDTO.getId();
            this.username = userDTO.getUsername();
            this.email = userDTO.getEmail();
            this.nickname = userDTO.getNickname();
            this.currentTheme = userDTO.getCurrentTheme();
            this.isValid = isValid;
        }
    }
}