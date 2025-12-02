package com.jntm.service;

import com.jntm.entity.User;
import com.jntm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

/**
 * 自定义用户详情服务
 * 用于Spring Security认证
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * 根据用户名加载用户详情
     *
     * @param username 用户名
     * @return 用户详情
     * @throws UsernameNotFoundException 用户不存在异常
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("正在加载用户: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("用户不存在: {}", username);
                    return new UsernameNotFoundException("用户不存在: " + username);
                });

        log.debug("成功加载用户: {}", username);
        return createUserDetails(user);
    }

    /**
     * 根据用户ID加载用户详情
     *
     * @param userId 用户ID
     * @return 用户详情
     * @throws UsernameNotFoundException 用户不存在异常
     */
    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long userId) throws UsernameNotFoundException {
        log.debug("正在根据ID加载用户: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("用户不存在: {}", userId);
                    return new UsernameNotFoundException("用户不存在: " + userId);
                });

        log.debug("成功根据ID加载用户: {}", userId);
        return createUserDetails(user);
    }

    /**
     * 创建UserDetails对象
     *
     * @param user 用户实体
     * @return UserDetails
     */
    private UserDetails createUserDetails(User user) {
        // 检查用户是否激活
        if (!user.getIsActive()) {
            log.warn("用户已被禁用: {}", user.getUsername());
            throw new UsernameNotFoundException("用户已被禁用: " + user.getUsername());
        }

        // 构建权限列表
        String role = user.getRole() != null ? user.getRole() : "USER";
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(Collections.singletonList(authority))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }
}