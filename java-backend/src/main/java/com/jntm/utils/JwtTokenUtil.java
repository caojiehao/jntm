package com.jntm.utils;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * JWT工具类
 * 提供JWT Token的生成、解析和验证功能
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Slf4j
@Component
public class JwtTokenUtil {

    /**
     * JWT密钥
     */
    @Value("${jwt.secret:jntm-super-secret-key-for-jwt-token-generation}")
    private String jwtSecret;

    /**
     * Token有效期（毫秒）- 默认7天
     */
    @Value("${jwt.expiration:604800000}")
    private Long jwtExpiration;

    /**
     * 刷新Token有效期（毫秒）- 默认30天
     */
    @Value("${jwt.refresh-expiration:2592000000}")
    private Long refreshExpiration;

    /**
     * 获取签名密钥
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * 生成访问Token
     *
     * @param userId 用户ID
     * @param username 用户名
     * @return JWT Token
     */
    public String generateAccessToken(Long userId, String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("username", username)
                .claim("type", "access")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * 生成刷新Token
     *
     * @param userId 用户ID
     * @param username 用户名
     * @return 刷新Token
     */
    public String generateRefreshToken(Long userId, String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshExpiration);

        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("username", username)
                .claim("type", "refresh")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * 从Token中获取用户ID
     *
     * @param token JWT Token
     * @return 用户ID
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return Long.parseLong(claims.getSubject());
    }

    /**
     * 从Token中获取用户名
     *
     * @param token JWT Token
     * @return 用户名
     */
    public String getUsernameFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("username", String.class);
    }

    /**
     * 获取Token类型
     *
     * @param token JWT Token
     * @return Token类型（access/refresh）
     */
    public String getTokenType(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("type", String.class);
    }

    /**
     * 获取Token过期时间
     *
     * @param token JWT Token
     * @return 过期时间
     */
    public Date getExpirationDateFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.getExpiration();
    }

    /**
     * 从Token中获取Claims
     *
     * @param token JWT Token
     * @return Claims
     */
    private Claims getClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * 验证Token是否有效
     *
     * @param token JWT Token
     * @return 是否有效
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (SecurityException ex) {
            log.error("无效的JWT签名: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            log.error("无效的JWT Token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            log.error("JWT Token已过期: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            log.error("不支持的JWT Token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.error("JWT Token参数异常: {}", ex.getMessage());
        }
        return false;
    }

    /**
     * 检查Token是否过期
     *
     * @param token JWT Token
     * @return 是否过期
     */
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = getExpirationDateFromToken(token);
            return expiration.before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    /**
     * 验证刷新Token
     *
     * @param token 刷新Token
     * @return 是否有效
     */
    public boolean validateRefreshToken(String token) {
        return validateToken(token) && "refresh".equals(getTokenType(token));
    }

    /**
     * 验证访问Token
     *
     * @param token 访问Token
     * @return 是否有效
     */
    public boolean validateAccessToken(String token) {
        return validateToken(token) && "access".equals(getTokenType(token));
    }

    /**
     * 刷新Token
     *
     * @param refreshToken 刷新Token
     * @return 新的访问Token
     */
    public String refreshAccessToken(String refreshToken) {
        if (!validateRefreshToken(refreshToken)) {
            throw new IllegalArgumentException("无效的刷新Token");
        }

        Long userId = getUserIdFromToken(refreshToken);
        String username = getUsernameFromToken(refreshToken);

        return generateAccessToken(userId, username);
    }

    /**
     * 从请求头中提取Token
     *
     * @param authHeader Authorization header
     * @return JWT Token（去掉Bearer前缀）
     */
    public String extractTokenFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}