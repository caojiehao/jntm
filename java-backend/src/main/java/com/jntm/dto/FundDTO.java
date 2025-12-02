package com.jntm.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.jntm.entity.Fund;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 基金数据传输对象
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
public class FundDTO {

    /**
     * 基金ID
     */
    private Long id;

    /**
     * 基金代码
     */
    private String fundCode;

    /**
     * 基金名称
     */
    private String fundName;

    /**
     * 基金类型
     */
    private Fund.FundType fundType;

    /**
     * 基金公司
     */
    private String fundCompany;

    /**
     * 基金经理
     */
    private String fundManager;

    /**
     * 成立日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate establishmentDate;

    /**
     * 基金规模（亿元）
     */
    private BigDecimal fundSize;

    /**
     * 当前单位净值
     */
    private BigDecimal nav;

    /**
     * 累计净值
     */
    private BigDecimal cumulativeNav;

    /**
     * 净值日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate navDate;

    /**
     * 日增长率（%）
     */
    private BigDecimal dailyGrowthRate;

    /**
     * 近1月收益率（%）
     */
    private BigDecimal oneMonthReturn;

    /**
     * 近3月收益率（%）
     */
    private BigDecimal threeMonthReturn;

    /**
     * 近6月收益率（%）
     */
    private BigDecimal sixMonthReturn;

    /**
     * 近1年收益率（%）
     */
    private BigDecimal oneYearReturn;

    /**
     * 成立以来收益率（%）
     */
    private BigDecimal sinceInceptionReturn;

    /**
     * 年化收益率（%）
     */
    private BigDecimal annualizedReturn;

    /**
     * 最大回撤（%）
     */
    private BigDecimal maxDrawdown;

    /**
     * 夏普比率
     */
    private BigDecimal sharpeRatio;

    /**
     * 风险等级
     */
    private Fund.RiskLevel riskLevel;

    /**
     * 手续费率（%）
     */
    private BigDecimal managementFee;

    /**
     * 托管费率（%）
     */
    private BigDecimal custodyFee;

    /**
     * 最低投资金额
     */
    private BigDecimal minimumInvestment;

    /**
     * 基金状态
     */
    private Fund.FundStatus status;

    /**
     * 数据来源
     */
    private String dataSource;

    /**
     * 最后更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastUpdatedAt;

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
     * 从Fund实体转换为DTO
     */
    public static FundDTO fromEntity(Fund fund) {
        if (fund == null) {
            return null;
        }

        return FundDTO.builder()
                .id(fund.getId())
                .fundCode(fund.getFundCode())
                .fundName(fund.getFundName())
                .fundType(fund.getFundType())
                .fundCompany(fund.getFundCompany())
                .fundManager(fund.getFundManager())
                .establishmentDate(fund.getEstablishmentDate())
                .fundSize(fund.getFundSize())
                .nav(fund.getNav())
                .cumulativeNav(fund.getCumulativeNav())
                .navDate(fund.getNavDate())
                .dailyGrowthRate(fund.getDailyGrowthRate())
                .oneMonthReturn(fund.getOneMonthReturn())
                .threeMonthReturn(fund.getThreeMonthReturn())
                .sixMonthReturn(fund.getSixMonthReturn())
                .oneYearReturn(fund.getOneYearReturn())
                .sinceInceptionReturn(fund.getSinceInceptionReturn())
                .annualizedReturn(fund.getAnnualizedReturn())
                .maxDrawdown(fund.getMaxDrawdown())
                .sharpeRatio(fund.getSharpeRatio())
                .riskLevel(fund.getRiskLevel())
                .managementFee(fund.getManagementFee())
                .custodyFee(fund.getCustodyFee())
                .minimumInvestment(fund.getMinimumInvestment())
                .status(fund.getStatus())
                .dataSource(fund.getDataSource())
                .lastUpdatedAt(fund.getLastUpdatedAt())
                .createdAt(fund.getCreatedAt())
                .updatedAt(fund.getUpdatedAt())
                .build();
    }

}