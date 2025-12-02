package com.jntm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 主题配置实体类
 * 存储系统主题配置信息
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Entity
@Table(name = "theme_configs", indexes = {
    @Index(name = "idx_theme_key", columnList = "themeKey")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ThemeConfig {

    /**
     * 配置ID - 主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 主题键值
     */
    @Column(name = "theme_key", unique = true, nullable = false, length = 50)
    private String themeKey;

    /**
     * 主题名称
     */
    @Column(name = "theme_name", nullable = false, length = 100)
    private String themeName;

    /**
     * 主题描述
     */
    @Column(name = "theme_description", length = 500)
    private String themeDescription;

    /**
     * 主题配置（JSON格式）
     */
    @Column(name = "config_json", columnDefinition = "TEXT")
    private String configJson;

    /**
     * 主题图标URL
     */
    @Column(name = "icon_url", length = 500)
    private String iconUrl;

    /**
     * 主题颜色配置
     */
    @Column(name = "theme_colors", length = 200)
    private String themeColors;

    /**
     * 排序顺序
     */
    @Column(name = "sort_order")
    private Integer sortOrder;

    /**
     * 是否启用
     */
    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled;

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

}