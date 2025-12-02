package com.jntm.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 统一API响应对象
 * 用于封装所有API接口的响应格式
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    /**
     * 响应码
     */
    private Integer code;

    /**
     * 响应消息
     */
    private String message;

    /**
     * 响应数据
     */
    private T data;

    /**
     * 是否成功
     */
    private Boolean success;

    /**
     * 时间戳
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;

    /**
     * 请求追踪ID
     */
    private String traceId;

    /**
     * 创建成功响应
     */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .code(200)
                .message("操作成功")
                .data(data)
                .success(true)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * 创建成功响应（无数据）
     */
    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .code(200)
                .message(message)
                .success(true)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * 创建成功响应（带消息和数据）
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .code(200)
                .message(message)
                .data(data)
                .success(true)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * 创建失败响应
     */
    public static <T> ApiResponse<T> error(Integer code, String message) {
        return ApiResponse.<T>builder()
                .code(code)
                .message(message)
                .success(false)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * 创建失败响应（默认500错误码）
     */
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .code(500)
                .message(message)
                .success(false)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * 创建参数错误响应
     */
    public static <T> ApiResponse<T> badRequest(String message) {
        return ApiResponse.<T>builder()
                .code(400)
                .message(message)
                .success(false)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * 创建未授权响应
     */
    public static <T> ApiResponse<T> unauthorized(String message) {
        return ApiResponse.<T>builder()
                .code(401)
                .message(message)
                .success(false)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * 创建禁止访问响应
     */
    public static <T> ApiResponse<T> forbidden(String message) {
        return ApiResponse.<T>builder()
                .code(403)
                .message(message)
                .success(false)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * 创建资源未找到响应
     */
    public static <T> ApiResponse<T> notFound(String message) {
        return ApiResponse.<T>builder()
                .code(404)
                .message(message)
                .success(false)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * 创建服务器内部错误响应
     */
    public static <T> ApiResponse<T> internalServerError(String message) {
        return ApiResponse.<T>builder()
                .code(500)
                .message(message)
                .success(false)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * 设置追踪ID
     */
    public ApiResponse<T> withTraceId(String traceId) {
        this.traceId = traceId;
        return this;
    }

}