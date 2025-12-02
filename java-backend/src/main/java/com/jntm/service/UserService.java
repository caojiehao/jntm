package com.jntm.service;

import com.jntm.dto.UserDTO;
import com.jntm.entity.User;
import com.jntm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 用户业务服务类
 * 提供用户相关的业务逻辑处理
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 根据ID查找用户
     */
    @Cacheable(value = "user", key = "#id")
    public UserDTO findById(Long id) {
        log.debug("查找用户: ID={}", id);

        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            log.warn("用户不存在: ID={}", id);
            return null;
        }

        return UserDTO.fromEntity(userOpt.get());
    }

    /**
     * 根据用户名查找用户
     */
    @Cacheable(value = "user", key = "#username")
    public UserDTO findByUsername(String username) {
        log.debug("根据用户名查找用户: username={}", username);

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            log.warn("用户不存在: username={}", username);
            return null;
        }

        return UserDTO.fromEntity(userOpt.get());
    }

    /**
     * 根据邮箱查找用户
     */
    public UserDTO findByEmail(String email) {
        log.debug("根据邮箱查找用户: email={}", email);

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            log.warn("用户不存在: email={}", email);
            return null;
        }

        return UserDTO.fromEntity(userOpt.get());
    }

    /**
     * 创建新用户
     */
    @Transactional
    @CacheEvict(value = {"user", "userList"}, allEntries = true)
    public UserDTO createUser(UserDTO userDTO) {
        log.info("创建新用户: username={}, email={}", userDTO.getUsername(), userDTO.getEmail());

        // 检查用户名是否已存在
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new RuntimeException("用户名已存在: " + userDTO.getUsername());
        }

        // 检查邮箱是否已存在
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new RuntimeException("邮箱已存在: " + userDTO.getEmail());
        }

        // 创建用户实体
        User user = User.builder()
                .username(userDTO.getUsername())
                .email(userDTO.getEmail())
                .passwordHash(passwordEncoder.encode("defaultPassword123")) // 实际应用中应该使用用户提供的密码
                .nickname(userDTO.getNickname() != null ? userDTO.getNickname() : userDTO.getUsername())
                .avatarUrl(userDTO.getAvatarUrl())
                .currentTheme(userDTO.getCurrentTheme() != null ? userDTO.getCurrentTheme() : User.ThemeType.FIRE)
                .investmentGoal(userDTO.getInvestmentGoal())
                .riskTolerance(userDTO.getRiskTolerance() != null ? userDTO.getRiskTolerance() : User.RiskTolerance.MODERATE)
                .expectedReturnRate(userDTO.getExpectedReturnRate())
                .investmentHorizon(userDTO.getInvestmentHorizon())
                .status(User.UserStatus.ACTIVE)
                .emailNotificationEnabled(userDTO.getEmailNotificationEnabled() != null ? userDTO.getEmailNotificationEnabled() : true)
                .build();

        // 保存用户
        User savedUser = userRepository.save(user);
        log.info("用户创建成功: ID={}, username={}", savedUser.getId(), savedUser.getUsername());

        return UserDTO.fromEntity(savedUser);
    }

    /**
     * 更新用户信息
     */
    @Transactional
    @CacheEvict(value = {"user", "userList"}, allEntries = true)
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        log.info("更新用户信息: ID={}", id);

        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("用户不存在: " + id);
        }

        User user = userOpt.get();

        // 更新用户信息
        user.setNickname(userDTO.getNickname());
        user.setAvatarUrl(userDTO.getAvatarUrl());
        user.setCurrentTheme(userDTO.getCurrentTheme());
        user.setInvestmentGoal(userDTO.getInvestmentGoal());
        user.setRiskTolerance(userDTO.getRiskTolerance());
        user.setExpectedReturnRate(userDTO.getExpectedReturnRate());
        user.setInvestmentHorizon(userDTO.getInvestmentHorizon());
        user.setEmailNotificationEnabled(userDTO.getEmailNotificationEnabled());

        // 保存更新
        User updatedUser = userRepository.save(user);
        log.info("用户信息更新成功: ID={}", id);

        return UserDTO.fromEntity(updatedUser);
    }

    /**
     * 删除用户（软删除）
     */
    @Transactional
    @CacheEvict(value = {"user", "userList"}, allEntries = true)
    public boolean deleteUser(Long id) {
        log.info("删除用户: ID={}", id);

        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            log.warn("用户不存在，无法删除: ID={}", id);
            return false;
        }

        User user = userOpt.get();
        user.setStatus(User.UserStatus.DELETED);
        userRepository.save(user);

        log.info("用户删除成功: ID={}", id);
        return true;
    }

    /**
     * 更新用户最后登录信息
     */
    @Transactional
    public void updateLastLogin(Long userId, String loginIp) {
        log.debug("更新用户最后登录信息: userId={}, loginIp={}", userId, loginIp);

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setLastLoginAt(LocalDateTime.now());
            user.setLastLoginIp(loginIp);
            userRepository.save(user);
        }
    }

    /**
     * 切换用户主题
     */
    @Transactional
    @CacheEvict(value = "user", key = "#userId")
    public boolean switchTheme(Long userId, User.ThemeType newTheme) {
        log.info("切换用户主题: userId={}, newTheme={}", userId, newTheme);

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            log.warn("用户不存在，无法切换主题: userId={}", userId);
            return false;
        }

        User user = userOpt.get();
        User.ThemeType oldTheme = user.getCurrentTheme();
        user.setCurrentTheme(newTheme);
        userRepository.save(user);

        log.info("用户主题切换成功: userId={}, oldTheme={}, newTheme={}", userId, oldTheme, newTheme);

        // TODO: 记录主题切换历史
        return true;
    }

    /**
     * 分页查询用户
     */
    @Cacheable(value = "userList")
    public Page<UserDTO> findUsers(String username, String email, User.ThemeType theme,
                                   User.UserStatus status, Pageable pageable) {
        log.debug("分页查询用户: username={}, email={}, theme={}, status={}",
                 username, email, theme, status);

        Page<User> userPage = userRepository.findUsersWithFilters(username, email, theme, status, pageable);

        List<UserDTO> userDTOs = userPage.getContent().stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());

        return new PageImpl<>(userDTOs, pageable, userPage.getTotalElements());
    }

    /**
     * 获取用户统计信息
     */
    public UserStatisticsDTO getUserStatistics() {
        log.debug("获取用户统计信息");

        long totalUsers = userRepository.count();
        long activeUsers = userRepository.findByStatus(User.UserStatus.ACTIVE).size();

        List<Object[]> themeStats = userRepository.countUsersByTheme();
        List<Object[]> riskStats = userRepository.countUsersByRiskTolerance();

        // 构建统计数据
        UserStatisticsDTO statistics = UserStatisticsDTO.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .inactiveUsers(totalUsers - activeUsers)
                .build();

        // TODO: 处理主题和风险统计数据的转换

        return statistics;
    }

    /**
     * 验证用户密码
     */
    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    /**
     * 更新用户密码
     */
    @Transactional
    @CacheEvict(value = "user", key = "#userId")
    public boolean updatePassword(Long userId, String newPassword) {
        log.info("更新用户密码: userId={}", userId);

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            log.warn("用户不存在，无法更新密码: userId={}", userId);
            return false;
        }

        User user = userOpt.get();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("用户密码更新成功: userId={}", userId);
        return true;
    }

    /**
     * 用户统计信息DTO
     */
    @lombok.Data
    @lombok.Builder
    public static class UserStatisticsDTO {
        private Long totalUsers;
        private Long activeUsers;
        private Long inactiveUsers;
        // 可以添加更多统计字段
    }

}