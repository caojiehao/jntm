package com.jntm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 基金实体类
 * 存储基金基本信息和净值数据
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Entity
@Table(name = "funds", indexes = {
    @Index(name = "idx_fund_code", columnList = "fundCode"),
    @Index(name = "idx_fund_name", columnList = "fundName"),
    @Index(name = "idx_fund_type", columnList = "fundType"),
    @Index(name = "idx_fund_company", columnList = "fundCompany")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Fund {

    /**
     * 基金ID - 主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 基金代码
     */
    @Column(name = "fund_code", unique = true, nullable = false, length = 10)
    private String fundCode;

    /**
     * 基金名称
     */
    @Column(name = "fund_name", nullable = false, length = 200)
    private String fundName;

    /**
     * 基金类型
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "fund_type", nullable = false)
    private FundType fundType;

    /**
     * 基金公司
     */
    @Column(name = "fund_company", nullable = false, length = 100)
    private String fundCompany;

    /**
     * 基金经理
     */
    @Column(name = "fund_manager", length = 50)
    private String fundManager;

    /**
     * 成立日期
     */
    @Column(name = "establishment_date")
    private LocalDate establishmentDate;

    /**
     * 基金规模（亿元）
     */
    @Column(name = "fund_size", precision = 15, scale = 2)
    private BigDecimal fundSize;

    /**
     * 当前单位净值
     */
    @Column(name = "nav", precision = 10, scale = 4)
    private BigDecimal nav;

    /**
     * 累计净值
     */
    @Column(name = "cumulative_nav", precision = 10, scale = 4)
    private BigDecimal cumulativeNav;

    /**
     * 净值日期
     */
    @Column(name = "nav_date")
    private LocalDate navDate;

    /**
     * 日增长率（%）
     */
    @Column(name = "daily_growth_rate", precision = 8, scale = 4)
    private BigDecimal dailyGrowthRate;

    /**
     * 近1月收益率（%）
     */
    @Column(name = "one_month_return", precision = 8, scale = 4)
    private BigDecimal oneMonthReturn;

    /**
     * 近3月收益率（%）
     */
    @Column(name = "three_month_return", precision = 8, scale = 4)
    private BigDecimal threeMonthReturn;

    /**
     * 近6月收益率（%）
     */
    @Column(name = "six_month_return", precision = 8, scale = 4)
    private BigDecimal sixMonthReturn;

    /**
     * 近1年收益率（%）
     */
    @Column(name = "one_year_return", precision = 8, scale = 4)
    private BigDecimal oneYearReturn;

    /**
     * 成立以来收益率（%）
     */
    @Column(name = "since_inception_return", precision = 8, scale = 4)
    private BigDecimal sinceInceptionReturn;

    /**
     * 年化收益率（%）
     */
    @Column(name = "annualized_return", precision = 8, scale = 4)
    private BigDecimal annualizedReturn;

    /**
     * 最大回撤（%）
     */
    @Column(name = "max_drawdown", precision = 8, scale = 4)
    private BigDecimal maxDrawdown;

    /**
     * 夏普比率
     */
    @Column(name = "sharpe_ratio", precision = 6, scale = 4)
    private BigDecimal sharpeRatio;

    /**
     * 风险等级
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level")
    private RiskLevel riskLevel;

    /**
     * 手续费率（%）
     */
    @Column(name = "management_fee", precision = 5, scale = 4)
    private BigDecimal managementFee;

    /**
     * 托管费率（%）
     */
    @Column(name = "custody_fee", precision = 5, scale = 4)
    private BigDecimal custodyFee;

    /**
     * 最低投资金额
     */
    @Column(name = "minimum_investment", precision = 15, scale = 2)
    private BigDecimal minimumInvestment;

    /**
     * 基金状态
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private FundStatus status;

    /**
     * 数据来源
     */
    @Column(name = "data_source", length = 50)
    private String dataSource;

    /**
     * 最后更新时间
     */
    @Column(name = "last_updated_at")
    private LocalDateTime lastUpdatedAt;

    /**
     * 创建时间
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 基金类型枚举
     */
    public enum FundType {
        STOCK("stock", "股票型"),
        BOND("bond", "债券型"),
        HYBRID("hybrid", "混合型"),
        INDEX("index", "指数型"),
        MONEY_MARKET("money_market", "货币市场型"),
        ETF("etf", "ETF"),
        QDII("qdii", "QDII"),
        FOF("fof", "FOF");

        private final String code;
        private final String description;

        FundType(String code, String description) {
            this.code = code;
            this.description = description;
        }

        public String getCode() {
            return code;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 风险等级枚举
     */
    public enum RiskLevel {
        LOW("low", "低风险"),
        MEDIUM_LOW("medium_low", "中低风险"),
        MEDIUM("medium", "中风险"),
        MEDIUM_HIGH("medium_high", "中高风险"),
        HIGH("high", "高风险");

        private final String code;
        private final String description;

        RiskLevel(String code, String description) {
            this.code = code;
            this.description = description;
        }

        public String getCode() {
            return code;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 基金状态枚举
     */
    public enum FundStatus {
        ACTIVE("active", "正常"),
        SUSPENDED("suspended", "暂停"),
        LIQUIDATING("liquidating", "清算中"),
        LIQUIDATED("liquidated", "已清算");

        private final String code;
        private final String description;

        FundStatus(String code, String description) {
            this.code = code;
            this.description = description;
        }

        public String getCode() {
            return code;
        }

        public String getDescription() {
            return description;
        }
    }

}