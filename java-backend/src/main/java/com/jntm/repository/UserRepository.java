package com.jntm.repository;

import com.jntm.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 用户数据访问层
 * 提供用户相关的数据库操作
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 根据用户名查找用户
     */
    Optional<User> findByUsername(String username);

    /**
     * 根据邮箱查找用户
     */
    Optional<User> findByEmail(String email);

    /**
     * 根据用户名或邮箱查找用户
     */
    Optional<User> findByUsernameOrEmail(String username, String email);

    /**
     * 检查用户名是否存在
     */
    boolean existsByUsername(String username);

    /**
     * 检查邮箱是否存在
     */
    boolean existsByEmail(String email);

    /**
     * 根据主题查找用户
     */
    List<User> findByCurrentTheme(User.ThemeType theme);

    /**
     * 根据状态查找用户
     */
    List<User> findByStatus(User.UserStatus status);

    /**
     * 根据主题和状态查找用户
     */
    List<User> findByCurrentThemeAndStatus(User.ThemeType theme, User.UserStatus status);

    /**
     * 查找最近登录的用户
     */
    @Query("SELECT u FROM User u WHERE u.lastLoginAt >= :since")
    List<User> findRecentActiveUsers(@Param("since") LocalDateTime since);

    /**
     * 根据投资目标范围查找用户
     */
    @Query("SELECT u FROM User u WHERE u.investmentGoal >= :minGoal AND u.investmentGoal <= :maxGoal")
    List<User> findByInvestmentGoalRange(@Param("minGoal") Double minGoal, @Param("maxGoal") Double maxGoal);

    /**
     * 根据风险承受能力查找用户
     */
    List<User> findByRiskTolerance(User.RiskTolerance riskTolerance);

    /**
     * 查找投资期限大于指定年数的用户
     */
    @Query("SELECT u FROM User u WHERE u.investmentHorizon >= :years")
    List<User> findByInvestmentHorizonGreaterThanEqual(@Param("years") Integer years);

    /**
     * 统计各主题的用户数量
     */
    @Query("SELECT u.currentTheme, COUNT(u) FROM User u WHERE u.status = 'ACTIVE' GROUP BY u.currentTheme")
    List<Object[]> countUsersByTheme();

    /**
     * 统计各风险等级的用户数量
     */
    @Query("SELECT u.riskTolerance, COUNT(u) FROM User u WHERE u.status = 'ACTIVE' GROUP BY u.riskTolerance")
    List<Object[]> countUsersByRiskTolerance();

    /**
     * 分页查询用户，支持按多个条件筛选
     */
    @Query("SELECT u FROM User u WHERE " +
           "(:username IS NULL OR u.username LIKE %:username%) AND " +
           "(:email IS NULL OR u.email LIKE %:email%) AND " +
           "(:theme IS NULL OR u.currentTheme = :theme) AND " +
           "(:status IS NULL OR u.status = :status)")
    Page<User> findUsersWithFilters(
            @Param("username") String username,
            @Param("email") String email,
            @Param("theme") User.ThemeType theme,
            @Param("status") User.UserStatus status,
            Pageable pageable
    );

    /**
     * 查找需要邮件通知的用户
     */
    @Query("SELECT u FROM User u WHERE u.emailNotificationEnabled = true AND u.status = 'ACTIVE'")
    List<User> findUsersWithEmailNotificationEnabled();

}