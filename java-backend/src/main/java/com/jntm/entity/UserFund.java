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
 * 用户基金持仓实体类
 * 存储用户持有的基金信息
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Entity
@Table(name = "user_funds",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "fund_code"}),
       indexes = {
           @Index(name = "idx_user_id", columnList = "user_id"),
           @Index(name = "idx_fund_code", columnList = "fund_code"),
           @Index(name = "idx_purchase_date", columnList = "purchase_date")
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class UserFund {

    /**
     * 持仓ID - 主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 用户ID
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * 基金代码
     */
    @Column(name = "fund_code", nullable = false, length = 10)
    private String fundCode;

    /**
     * 持有份额
     */
    @Column(name = "shares", nullable = false, precision = 18, scale = 4)
    private BigDecimal shares;

    /**
     * 成本价（元）
     */
    @Column(name = "cost_price", nullable = false, precision = 10, scale = 4)
    private BigDecimal costPrice;

    /**
     * 成本金额（元）
     */
    @Column(name = "cost_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal costAmount;

    /**
     * 当前市值（元）
     */
    @Column(name = "current_value", precision = 15, scale = 2)
    private BigDecimal currentValue;

    /**
     * 当前盈亏（元）
     */
    @Column(name = "current_profit_loss", precision = 15, scale = 2)
    private BigDecimal currentProfitLoss;

    /**
     * 收益率（%）
     */
    @Column(name = "return_rate", precision = 8, scale = 4)
    private BigDecimal returnRate;

    /**
     * 购买日期
     */
    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    /**
     * 最后一次买入日期
     */
    @Column(name = "last_buy_date")
    private LocalDate lastBuyDate;

    /**
     * 最后一次卖出日期
     */
    @Column(name = "last_sell_date")
    private LocalDate lastSellDate;

    /**
     * 分红累计（元）
     */
    @Column(name = "dividend_amount", precision = 15, scale = 2)
    private BigDecimal dividendAmount;

    /**
     * 持仓状态
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private HoldingStatus status;

    /**
     * 备注信息
     */
    @Column(name = "notes", length = 500)
    private String notes;

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
     * 持仓状态枚举
     */
    public enum HoldingStatus {
        HOLDING("holding", "持有中"),
        SOLD("sold", "已卖出"),
        PARTIAL_SOLD("partial_sold", "部分卖出");

        private final String code;
        private final String description;

        HoldingStatus(String code, String description) {
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