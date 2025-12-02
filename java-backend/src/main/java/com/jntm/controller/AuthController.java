package com.jntm.controller;

import com.jntm.dto.ApiResponse;
import com.jntm.dto.AuthDTO;
import com.jntm.dto.UserDTO;
import com.jntm.entity.User;
import com.jntm.service.UserService;
import com.jntm.utils.JwtTokenUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 认证控制器
 * 处理用户登录、注册、token刷新等认证相关操作
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "用户认证", description = "用户认证相关的API接口")
public class AuthController {

    private final UserService userService;
    private final JwtTokenUtil jwtTokenUtil;
    private final AuthenticationManager authenticationManager;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "通过用户名和密码进行登录认证")
    public ResponseEntity<ApiResponse<AuthDTO.LoginResponse>> login(
            @Valid @RequestBody AuthDTO.LoginRequest loginRequest,
            HttpServletRequest request) {

        try {
            log.info("用户登录请求: {}", loginRequest.getUsername());

            // 1. 使用Spring Security进行身份认证
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );

            // 2. 获取认证成功后的用户信息
            User user = userService.findByUsernameEntity(loginRequest.getUsername());
            if (user == null || !user.getIsActive()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest("用户名或密码错误"));
            }

            // 3. 生成JWT Token
            String accessToken = jwtTokenUtil.generateAccessToken(user.getId(), user.getUsername());
            String refreshToken = jwtTokenUtil.generateRefreshToken(user.getId(), user.getUsername());
            Long expiresIn = jwtTokenUtil.getExpirationDateFromToken(accessToken).getTime() - System.currentTimeMillis();

            // 4. 更新用户最后登录时间
            userService.updateLastLoginTime(user.getId());

            // 5. 转换为DTO
            UserDTO userDTO = userService.convertToDTO(user);

            // 6. 构建响应
            AuthDTO.LoginResponse loginResponse = new AuthDTO.LoginResponse(
                userDTO, accessToken, refreshToken, expiresIn
            );

            log.info("用户登录成功: {}", user.getUsername());

            return ResponseEntity.ok(ApiResponse.success("登录成功", loginResponse));

        } catch (AuthenticationException e) {
            log.warn("用户登录失败: {} - {}", loginRequest.getUsername(), e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.badRequest("用户名或密码错误"));
        } catch (Exception e) {
            log.error("登录过程中发生异常: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("登录失败，请稍后重试"));
        }
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    @Operation(summary = "用户注册", description = "创建新的用户账户")
    public ResponseEntity<ApiResponse<AuthDTO.LoginResponse>> register(
            @Valid @RequestBody AuthDTO.RegisterRequest registerRequest) {

        try {
            log.info("用户注册请求: {}", registerRequest.getUsername());

            // 1. 检查用户名是否已存在
            if (userService.existsByUsername(registerRequest.getUsername())) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest("用户名已存在"));
            }

            // 2. 检查邮箱是否已存在
            if (userService.existsByEmail(registerRequest.getEmail())) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest("邮箱已被使用"));
            }

            // 3. 创建新用户
            UserDTO newUserDTO = new UserDTO();
            newUserDTO.setUsername(registerRequest.getUsername());
            newUserDTO.setEmail(registerRequest.getEmail());
            newUserDTO.setPassword(registerRequest.getPassword()); // 将在Service层进行加密
            newUserDTO.setNickname(registerRequest.getNickname());
            newUserDTO.setPhone(registerRequest.getPhone());
            newUserDTO.setRole("USER");
            newUserDTO.setIsActive(true);
            newUserDTO.setCurrentTheme("fire");
            newUserDTO.setRiskTolerance(3);

            UserDTO createdUser = userService.createUser(newUserDTO);

            // 4. 生成JWT Token
            String accessToken = jwtTokenUtil.generateAccessToken(createdUser.getId(), createdUser.getUsername());
            String refreshToken = jwtTokenUtil.generateRefreshToken(createdUser.getId(), createdUser.getUsername());
            Long expiresIn = jwtTokenUtil.getExpirationDateFromToken(accessToken).getTime() - System.currentTimeMillis();

            // 5. 构建响应
            AuthDTO.LoginResponse loginResponse = new AuthDTO.LoginResponse(
                createdUser, accessToken, refreshToken, expiresIn
            );

            log.info("用户注册成功: {}", createdUser.getUsername());

            return ResponseEntity.ok(ApiResponse.success("注册成功", loginResponse));

        } catch (Exception e) {
            log.error("注册过程中发生异常: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("注册失败，请稍后重试"));
        }
    }

    /**
     * 刷新Token
     */
    @PostMapping("/refresh")
    @Operation(summary = "刷新Token", description = "使用刷新Token获取新的访问Token")
    public ResponseEntity<ApiResponse<AuthDTO.RefreshTokenResponse>> refreshToken(
            @Valid @RequestBody AuthDTO.RefreshTokenRequest refreshTokenRequest) {

        try {
            String refreshToken = refreshTokenRequest.getRefreshToken();

            log.debug("Token刷新请求");

            // 1. 验证刷新Token
            if (!jwtTokenUtil.validateRefreshToken(refreshToken)) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest("无效的刷新Token"));
            }

            // 2. 生成新的访问Token
            String newAccessToken = jwtTokenUtil.refreshAccessToken(refreshToken);
            String newRefreshToken = jwtTokenUtil.generateRefreshToken(
                jwtTokenUtil.getUserIdFromToken(refreshToken),
                jwtTokenUtil.getUsernameFromToken(refreshToken)
            );
            Long expiresIn = jwtTokenUtil.getExpirationDateFromToken(newAccessToken).getTime() - System.currentTimeMillis();

            // 3. 构建响应
            AuthDTO.RefreshTokenResponse response = new AuthDTO.RefreshTokenResponse(
                newAccessToken, newRefreshToken, expiresIn
            );

            log.debug("Token刷新成功");

            return ResponseEntity.ok(ApiResponse.success("Token刷新成功", response));

        } catch (Exception e) {
            log.error("Token刷新失败: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.badRequest("Token刷新失败"));
        }
    }

    /**
     * 验证Token
     */
    @GetMapping("/verify")
    @Operation(summary = "验证Token", description = "验证当前用户的Token是否有效")
    public ResponseEntity<ApiResponse<AuthDTO.VerifyResponse>> verifyToken() {
        try {
            // 获取当前认证的用户信息
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest("未认证的用户"));
            }

            // 获取用户名
            String username = authentication.getName();
            UserDTO userDTO = userService.findByUsername(username);

            if (userDTO == null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest("用户不存在"));
            }

            // 构建验证响应
            AuthDTO.VerifyResponse response = new AuthDTO.VerifyResponse(userDTO, true);

            return ResponseEntity.ok(ApiResponse.success("Token验证成功", response));

        } catch (Exception e) {
            log.error("Token验证失败: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.badRequest("Token验证失败"));
        }
    }

    /**
     * 用户登出
     */
    @PostMapping("/logout")
    @Operation(summary = "用户登出", description = "用户登出（客户端清除Token）")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        try {
            // 获取当前用户信息
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication != null && authentication.isAuthenticated()) {
                String username = authentication.getName();
                log.info("用户登出: {}", username);

                // 清除安全上下文
                SecurityContextHolder.clearContext();
            }

            return ResponseEntity.ok(ApiResponse.success("登出成功", null));

        } catch (Exception e) {
            log.error("登出过程中发生异常: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("登出失败"));
        }
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/me")
    @Operation(summary = "获取当前用户信息", description = "获取当前登录用户的详细信息")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser() {
        try {
            // 获取当前认证的用户信息
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest("未认证的用户"));
            }

            // 获取用户名
            String username = authentication.getName();
            UserDTO userDTO = userService.findByUsername(username);

            if (userDTO == null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest("用户不存在"));
            }

            return ResponseEntity.ok(ApiResponse.success("获取用户信息成功", userDTO));

        } catch (Exception e) {
            log.error("获取用户信息失败: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("获取用户信息失败"));
        }
    }
}