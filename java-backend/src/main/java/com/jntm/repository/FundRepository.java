package com.jntm.repository;

import com.jntm.entity.Fund;
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
 * 基金数据访问层
 * 提供基金相关的数据库操作
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Repository
public interface FundRepository extends JpaRepository<Fund, Long> {

    /**
     * 根据基金代码查找基金
     */
    Optional<Fund> findByFundCode(String fundCode);

    /**
     * 根据基金名称查找基金（模糊查询）
     */
    List<Fund> findByFundNameContaining(String fundName);

    /**
     * 检查基金代码是否存在
     */
    boolean existsByFundCode(String fundCode);

    /**
     * 根据基金类型查找基金
     */
    List<Fund> findByFundType(Fund.FundType fundType);

    /**
     * 根据基金公司查找基金
     */
    List<Fund> findByFundCompany(String fundCompany);

    /**
     * 根据基金状态查找基金
     */
    List<Fund> findByStatus(Fund.FundStatus status);

    /**
     * 根据风险等级查找基金
     */
    List<Fund> findByRiskLevel(Fund.RiskLevel riskLevel);

    /**
     * 根据基金类型和状态查找基金
     */
    List<Fund> findByFundTypeAndStatus(Fund.FundType fundType, Fund.FundStatus status);

    /**
     * 查找指定日期后更新的基金
     */
    @Query("SELECT f FROM Fund f WHERE f.lastUpdatedAt >= :since")
    List<Fund> findFundsUpdatedSince(@Param("since") LocalDate since);

    /**
     * 查找净值日期为指定日期的基金
     */
    @Query("SELECT f FROM Fund f WHERE f.navDate = :navDate")
    List<Fund> findFundsByNavDate(@Param("navDate") LocalDate navDate);

    /**
     * 查找净值日期小于指定日期的基金（需要更新的基金）
     */
    @Query("SELECT f FROM Fund f WHERE f.navDate < :cutoffDate OR f.navDate IS NULL")
    List<Fund> findFundsWithOutdatedNav(@Param("cutoffDate") LocalDate cutoffDate);

    /**
     * 根据收益率范围查找基金
     */
    @Query("SELECT f FROM Fund f WHERE f.oneYearReturn >= :minReturn AND f.oneYearReturn <= :maxReturn")
    List<Fund> findByOneYearReturnRange(@Param("minReturn") BigDecimal minReturn, @Param("maxReturn") BigDecimal maxReturn);

    /**
     * 根据规模范围查找基金
     */
    @Query("SELECT f FROM Fund f WHERE f.fundSize >= :minSize AND f.fundSize <= :maxSize")
    List<Fund> findByFundSizeRange(@Param("minSize") BigDecimal minSize, @Param("maxSize") BigDecimal maxSize);

    /**
     * 查找夏普比率大于指定值的基金
     */
    @Query("SELECT f FROM Fund f WHERE f.sharpeRatio >= :minSharpeRatio")
    List<Fund> findBySharpeRatioGreaterThanEqual(@Param("minSharpeRatio") BigDecimal minSharpeRatio);

    /**
     * 查找最大回撤小于指定值的基金
     */
    @Query("SELECT f FROM Fund f WHERE f.maxDrawdown <= :maxDrawdown")
    List<Fund> findByMaxDrawdownLessThanEqual(@Param("maxDrawdown") BigDecimal maxDrawdown);

    /**
     * 分页查询基金，支持按多个条件筛选
     */
    @Query("SELECT f FROM Fund f WHERE " +
           "(:fundCode IS NULL OR f.fundCode LIKE %:fundCode%) AND " +
           "(:fundName IS NULL OR f.fundName LIKE %:fundName%) AND " +
           "(:fundType IS NULL OR f.fundType = :fundType) AND " +
           "(:fundCompany IS NULL OR f.fundCompany = :fundCompany) AND " +
           "(:riskLevel IS NULL OR f.riskLevel = :riskLevel) AND " +
           "(:status IS NULL OR f.status = :status)")
    Page<Fund> findFundsWithFilters(
            @Param("fundCode") String fundCode,
            @Param("fundName") String fundName,
            @Param("fundType") Fund.FundType fundType,
            @Param("fundCompany") String fundCompany,
            @Param("riskLevel") Fund.RiskLevel riskLevel,
            @Param("status") Fund.FundStatus status,
            Pageable pageable
    );

    /**
     * 按一年收益率排序获取Top N基金
     */
    @Query("SELECT f FROM Fund f WHERE f.status = 'ACTIVE' AND f.oneYearReturn IS NOT NULL ORDER BY f.oneYearReturn DESC")
    List<Fund> findTopPerformingFunds(Pageable pageable);

    /**
     * 按夏普比率排序获取Top N基金
     */
    @Query("SELECT f FROM Fund f WHERE f.status = 'ACTIVE' AND f.sharpeRatio IS NOT NULL ORDER BY f.sharpeRatio DESC")
    List<Fund> findTopSharpeRatioFunds(Pageable pageable);

    /**
     * 统计各基金类型的数量
     */
    @Query("SELECT f.fundType, COUNT(f) FROM Fund f WHERE f.status = 'ACTIVE' GROUP BY f.fundType")
    List<Object[]> countFundsByType();

    /**
     * 统计各风险等级的数量
     */
    @Query("SELECT f.riskLevel, COUNT(f) FROM Fund f WHERE f.status = 'ACTIVE' GROUP BY f.riskLevel")
    List<Object[]> countFundsByRiskLevel();

    /**
     * 统计各基金公司的数量
     */
    @Query("SELECT f.fundCompany, COUNT(f) FROM Fund f WHERE f.status = 'ACTIVE' GROUP BY f.fundCompany ORDER BY COUNT(f) DESC")
    List<Object[]> countFundsByCompany();

}