package com.jntm.security;

import com.jntm.service.CustomUserDetailsService;
import com.jntm.utils.JwtTokenUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT认证过滤器
 * 处理每个请求的JWT Token验证
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenUtil jwtTokenUtil;
    private final CustomUserDetailsService customUserDetailsService;

    /**
     * 过滤器核心方法
     *
     * @param request     HTTP请求
     * @param response    HTTP响应
     * @param filterChain 过滤器链
     * @throws ServletException Servlet异常
     * @throws IOException      IO异常
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            // 从请求头中获取JWT Token
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && jwtTokenUtil.validateAccessToken(jwt)) {
                // 从Token中提取用户ID
                Long userId = jwtTokenUtil.getUserIdFromToken(jwt);

                // 加载用户详情
                UserDetails userDetails = customUserDetailsService.loadUserById(userId);

                // 创建认证对象
                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                    );

                // 设置认证详情
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 设置安全上下文
                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.debug("用户认证成功: {}", userDetails.getUsername());
            }
        } catch (Exception ex) {
            log.error("无法设置用户认证: {}", ex.getMessage());
            // 清除安全上下文
            SecurityContextHolder.clearContext();
        }

        // 继续过滤器链
        filterChain.doFilter(request, response);
    }

    /**
     * 从请求中提取JWT Token
     *
     * @param request HTTP请求
     * @return JWT Token，如果不存在则返回null
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        // 首先从Authorization header中获取
        String bearerToken = request.getHeader("Authorization");

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        // 也可以从cookie或其他地方获取（根据需要）
        // String token = getCookieValue(request, "jwt_token");

        return null;
    }

    /**
     * 检查是否应该跳过此过滤器
     * 对于公开的端点，不需要JWT验证
     *
     * @param request HTTP请求
     * @return 是否跳过
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        // 跳过公开的端点
        return path.startsWith("/api/v1/auth/") ||
               path.startsWith("/api/v1/actuator/health") ||
               path.startsWith("/error") ||
               path.startsWith("/swagger-ui/") ||
               path.startsWith("/v3/api-docs/") ||
               path.startsWith("/swagger-resources/") ||
               path.startsWith("/webjars/");
    }
}