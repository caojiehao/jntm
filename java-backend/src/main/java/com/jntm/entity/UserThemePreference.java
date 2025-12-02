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
 * 用户主题偏好实体类
 * 存储用户对特定主题的个性化设置
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Entity
@Table(name = "user_theme_preferences",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "theme_key"}),
       indexes = {
           @Index(name = "idx_user_id", columnList = "user_id"),
           @Index(name = "idx_theme_key", columnList = "theme_key")
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class UserThemePreference {

    /**
     * 偏好ID - 主键
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
     * 主题键值
     */
    @Column(name = "theme_key", nullable = false, length = 50)
    private String themeKey;

    /**
     * 偏好设置（JSON格式）
     */
    @Column(name = "preferences_json", columnDefinition = "TEXT")
    private String preferencesJson;

    /**
     * 是否启用该主题
     */
    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled;

    /**
     * 自定义显示名称
     */
    @Column(name = "custom_display_name", length = 100)
    private String customDisplayName;

    /**
     * 自定义备注
     */
    @Column(name = "custom_notes", length = 500)
    private String customNotes;

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