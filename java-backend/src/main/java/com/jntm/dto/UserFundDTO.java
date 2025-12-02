package com.jntm.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.jntm.entity.UserFund;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 用户基金持仓数据传输对象
 * 用于API响应和数据传输
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserFundDTO {

    /**
     * 持仓ID
     */
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 基金代码
     */
    private String fundCode;

    /**
     * 基金名称（关联查询）
     */
    private String fundName;

    /**
     * 持有份额
     */
    private BigDecimal shares;

    /**
     * 成本价（元）
     */
    private BigDecimal costPrice;

    /**
     * 成本金额（元）
     */
    private BigDecimal costAmount;

    /**
     * 当前市值（元）
     */
    private BigDecimal currentValue;

    /**
     * 当前盈亏（元）
     */
    private BigDecimal currentProfitLoss;

    /**
     * 收益率（%）
     */
    private BigDecimal returnRate;

    /**
     * 购买日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate purchaseDate;

    /**
     * 最后一次买入日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate lastBuyDate;

    /**
     * 最后一次卖出日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate lastSellDate;

    /**
     * 分红累计（元）
     */
    private BigDecimal dividendAmount;

    /**
     * 持仓状态
     */
    private UserFund.HoldingStatus status;

    /**
     * 备注信息
     */
    private String notes;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    /**
     * 从UserFund实体转换为DTO
     */
    public static UserFundDTO fromEntity(UserFund userFund) {
        if (userFund == null) {
            return null;
        }

        return UserFundDTO.builder()
                .id(userFund.getId())
                .userId(userFund.getUserId())
                .fundCode(userFund.getFundCode())
                .shares(userFund.getShares())
                .costPrice(userFund.getCostPrice())
                .costAmount(userFund.getCostAmount())
                .currentValue(userFund.getCurrentValue())
                .currentProfitLoss(userFund.getCurrentProfitLoss())
                .returnRate(userFund.getReturnRate())
                .purchaseDate(userFund.getPurchaseDate())
                .lastBuyDate(userFund.getLastBuyDate())
                .lastSellDate(userFund.getLastSellDate())
                .dividendAmount(userFund.getDividendAmount())
                .status(userFund.getStatus())
                .notes(userFund.getNotes())
                .createdAt(userFund.getCreatedAt())
                .updatedAt(userFund.getUpdatedAt())
                .build();
    }

    /**
     * 从UserFund实体和基金名称转换为DTO
     */
    public static UserFundDTO fromEntityWithFundName(UserFund userFund, String fundName) {
        UserFundDTO dto = fromEntity(userFund);
        if (dto != null) {
            dto.setFundName(fundName);
        }
        return dto;
    }

}