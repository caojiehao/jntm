package com.jntm.repository;

import com.jntm.entity.UserFund;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 用户基金持仓数据访问层
 * 提供用户基金持仓相关的数据库操作
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Repository
public interface UserFundRepository extends JpaRepository<UserFund, Long> {

    /**
     * 根据用户ID和基金代码查找持仓
     */
    Optional<UserFund> findByUserIdAndFundCode(Long userId, String fundCode);

    /**
     * 根据用户ID查找所有持仓
     */
    List<UserFund> findByUserId(Long userId);

    /**
     * 根据用户ID和持仓状态查找持仓
     */
    List<UserFund> findByUserIdAndStatus(Long userId, UserFund.HoldingStatus status);

    /**
     * 根据基金代码查找所有用户持仓
     */
    List<UserFund> findByFundCode(String fundCode);

    /**
     * 根据用户ID和购买日期范围查找持仓
     */
    @Query("SELECT uf FROM UserFund uf WHERE uf.userId = :userId AND uf.purchaseDate BETWEEN :startDate AND :endDate")
    List<UserFund> findByUserIdAndPurchaseDateBetween(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * 查找用户在指定日期之后买入的持仓
     */
    @Query("SELECT uf FROM UserFund uf WHERE uf.userId = :userId AND uf.lastBuyDate >= :since")
    List<UserFund> findRecentPurchasesByUserId(@Param("userId") Long userId, @Param("since") LocalDate since);

    /**
     * 计算用户总持仓金额
     */
    @Query("SELECT COALESCE(SUM(uf.currentValue), 0) FROM UserFund uf WHERE uf.userId = :userId AND uf.status = 'HOLDING'")
    BigDecimal calculateTotalPortfolioValue(@Param("userId") Long userId);

    /**
     * 计算用户总成本金额
     */
    @Query("SELECT COALESCE(SUM(uf.costAmount), 0) FROM UserFund uf WHERE uf.userId = :userId AND uf.status = 'HOLDING'")
    BigDecimal calculateTotalCostAmount(@Param("userId") Long userId);

    /**
     * 计算用户总盈亏金额
     */
    @Query("SELECT COALESCE(SUM(uf.currentProfitLoss), 0) FROM UserFund uf WHERE uf.userId = :userId AND uf.status = 'HOLDING'")
    BigDecimal calculateTotalProfitLoss(@Param("userId") Long userId);

    /**
     * 计算用户持仓数量
     */
    @Query("SELECT COUNT(uf) FROM UserFund uf WHERE uf.userId = :userId AND uf.status = 'HOLDING'")
    Long countHoldingFundsByUserId(@Param("userId") Long userId);

    /**
     * 查找收益率大于指定值的用户持仓
     */
    @Query("SELECT uf FROM UserFund uf WHERE uf.userId = :userId AND uf.returnRate >= :minReturnRate AND uf.status = 'HOLDING'")
    List<UserFund> findProfitableHoldingsByUserId(@Param("userId") Long userId, @Param("minReturnRate") BigDecimal minReturnRate);

    /**
     * 查找亏损的用户持仓
     */
    @Query("SELECT uf FROM UserFund uf WHERE uf.userId = :userId AND uf.returnRate < 0 AND uf.status = 'HOLDING'")
    List<UserFund> findLosingHoldingsByUserId(@Param("userId") Long userId);

    /**
     * 根据市值范围查找用户持仓
     */
    @Query("SELECT uf FROM UserFund uf WHERE uf.userId = :userId AND uf.currentValue >= :minValue AND uf.currentValue <= :maxValue AND uf.status = 'HOLDING'")
    List<UserFund> findByUserIdAndCurrentValueRange(
            @Param("userId") Long userId,
            @Param("minValue") BigDecimal minValue,
            @Param("maxValue") BigDecimal maxValue
    );

    /**
     * 分页查询用户持仓
     */
    Page<UserFund> findByUserId(Long userId, Pageable pageable);

    /**
     * 获取用户持仓中市值最高的N只基金
     */
    @Query("SELECT uf FROM UserFund uf WHERE uf.userId = :userId AND uf.status = 'HOLDING' ORDER BY uf.currentValue DESC")
    List<UserFund> findTopHoldingsByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * 获取用户持仓中收益率最高的N只基金
     */
    @Query("SELECT uf FROM UserFund uf WHERE uf.userId = :userId AND uf.status = 'HOLDING' AND uf.returnRate IS NOT NULL ORDER BY uf.returnRate DESC")
    List<UserFund> findBestPerformingHoldingsByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * 获取用户持仓中收益率最低的N只基金
     */
    @Query("SELECT uf FROM UserFund uf WHERE uf.userId = :userId AND uf.status = 'HOLDING' AND uf.returnRate IS NOT NULL ORDER BY uf.returnRate ASC")
    List<UserFund> findWorstPerformingHoldingsByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * 统计用户各基金类型的持仓分布
     */
    @Query("SELECT f.fundType, SUM(uf.currentValue) FROM UserFund uf JOIN Fund f ON uf.fundCode = f.fundCode " +
           "WHERE uf.userId = :userId AND uf.status = 'HOLDING' GROUP BY f.fundType")
    List<Object[]> calculatePortfolioDistributionByType(@Param("userId") Long userId);

    /**
     * 统计用户各基金公司的持仓分布
     */
    @Query("SELECT f.fundCompany, SUM(uf.currentValue) FROM UserFund uf JOIN Fund f ON uf.fundCode = f.fundCode " +
           "WHERE uf.userId = :userId AND uf.status = 'HOLDING' GROUP BY f.fundCompany ORDER BY SUM(uf.currentValue) DESC")
    List<Object[]> calculatePortfolioDistributionByCompany(@Param("userId") Long userId);

}