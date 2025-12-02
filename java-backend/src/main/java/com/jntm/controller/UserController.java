package com.jntm.controller;

import com.jntm.dto.ApiResponse;
import com.jntm.dto.UserDTO;
import com.jntm.entity.User;
import com.jntm.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 用户管理控制器
 * 提供用户相关的API接口
 *
 * @author JNTM Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "用户管理", description = "用户相关的API接口")
public class UserController {

    private final UserService userService;

    /**
     * 获取当前登录用户信息
     */
    @GetMapping("/profile")
    @Operation(summary = "获取当前用户信息", description = "获取当前登录用户的详细信息")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser() {
        // TODO: 从SecurityContext获取当前用户ID
        // 这里先返回一个模拟的用户信息
        UserDTO currentUser = userService.findByUsername("testuser");

        return ResponseEntity.ok(ApiResponse.success("获取用户信息成功", currentUser));
    }

    /**
     * 根据ID获取用户信息
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    @Operation(summary = "根据ID获取用户信息", description = "根据用户ID获取用户详细信息")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(
            @Parameter(description = "用户ID", required = true) @PathVariable Long id) {

        UserDTO userDTO = userService.findById(id);
        if (userDTO == null) {
            return ResponseEntity.ok(ApiResponse.notFound("用户不存在"));
        }

        return ResponseEntity.ok(ApiResponse.success("获取用户信息成功", userDTO));
    }

    /**
     * 创建新用户
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "创建新用户", description = "创建新的用户账户")
    public ResponseEntity<ApiResponse<UserDTO>> createUser(
            @Valid @RequestBody UserDTO userDTO) {

        try {
            UserDTO createdUser = userService.createUser(userDTO);
            return ResponseEntity.ok(ApiResponse.success("用户创建成功", createdUser));
        } catch (RuntimeException e) {
            log.error("创建用户失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    /**
     * 更新用户信息
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    @Operation(summary = "更新用户信息", description = "更新指定用户的信息")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(
            @Parameter(description = "用户ID", required = true) @PathVariable Long id,
            @Valid @RequestBody UserDTO userDTO) {

        try {
            UserDTO updatedUser = userService.updateUser(id, userDTO);
            return ResponseEntity.ok(ApiResponse.success("用户信息更新成功", updatedUser));
        } catch (RuntimeException e) {
            log.error("更新用户信息失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "删除用户", description = "删除指定用户（软删除）")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @Parameter(description = "用户ID", required = true) @PathVariable Long id) {

        boolean deleted = userService.deleteUser(id);
        if (deleted) {
            return ResponseEntity.ok(ApiResponse.success("用户删除成功"));
        } else {
            return ResponseEntity.ok(ApiResponse.notFound("用户不存在"));
        }
    }

    /**
     * 切换用户主题
     */
    @PostMapping("/{id}/theme")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    @Operation(summary = "切换用户主题", description = "切换用户的投资主题")
    public ResponseEntity<ApiResponse<Void>> switchTheme(
            @Parameter(description = "用户ID", required = true) @PathVariable Long id,
            @Parameter(description = "新主题", required = true) @RequestParam User.ThemeType theme) {

        boolean switched = userService.switchTheme(id, theme);
        if (switched) {
            return ResponseEntity.ok(ApiResponse.success("主题切换成功"));
        } else {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest("主题切换失败"));
        }
    }

    /**
     * 分页查询用户
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "分页查询用户", description = "分页查询用户列表，支持筛选")
    public ResponseEntity<ApiResponse<Page<UserDTO>>> findUsers(
            @Parameter(description = "用户名筛选") @RequestParam(required = false) String username,
            @Parameter(description = "邮箱筛选") @RequestParam(required = false) String email,
            @Parameter(description = "主题筛选") @RequestParam(required = false) User.ThemeType theme,
            @Parameter(description = "状态筛选") @RequestParam(required = false) User.UserStatus status,
            @Parameter(description = "页码", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "每页大小", example = "10") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "排序字段", example = "createdAt") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "排序方向", example = "desc") @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ?
                Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<UserDTO> userPage = userService.findUsers(username, email, theme, status, pageable);

        return ResponseEntity.ok(ApiResponse.success("查询用户列表成功", userPage));
    }

    /**
     * 获取用户统计信息
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "获取用户统计信息", description = "获取用户的统计数据")
    public ResponseEntity<ApiResponse<UserService.UserStatisticsDTO>> getUserStatistics() {

        UserService.UserStatisticsDTO statistics = userService.getUserStatistics();
        return ResponseEntity.ok(ApiResponse.success("获取用户统计信息成功", statistics));
    }

    /**
     * 更新用户密码
     */
    @PutMapping("/{id}/password")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    @Operation(summary = "更新用户密码", description = "更新指定用户的密码")
    public ResponseEntity<ApiResponse<Void>> updatePassword(
            @Parameter(description = "用户ID", required = true) @PathVariable Long id,
            @Parameter(description = "新密码", required = true) @RequestParam String newPassword) {

        boolean updated = userService.updatePassword(id, newPassword);
        if (updated) {
            return ResponseEntity.ok(ApiResponse.success("密码更新成功"));
        } else {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest("密码更新失败"));
        }
    }

    /**
     * 根据用户名查找用户
     */
    @GetMapping("/username/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "根据用户名查找用户", description = "根据用户名获取用户信息")
    public ResponseEntity<ApiResponse<UserDTO>> getUserByUsername(
            @Parameter(description = "用户名", required = true) @PathVariable String username) {

        UserDTO userDTO = userService.findByUsername(username);
        if (userDTO == null) {
            return ResponseEntity.ok(ApiResponse.notFound("用户不存在"));
        }

        return ResponseEntity.ok(ApiResponse.success("获取用户信息成功", userDTO));
    }

    /**
     * 根据邮箱查找用户
     */
    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "根据邮箱查找用户", description = "根据邮箱获取用户信息")
    public ResponseEntity<ApiResponse<UserDTO>> getUserByEmail(
            @Parameter(description = "邮箱", required = true) @PathVariable String email) {

        UserDTO userDTO = userService.findByEmail(email);
        if (userDTO == null) {
            return ResponseEntity.ok(ApiResponse.notFound("用户不存在"));
        }

        return ResponseEntity.ok(ApiResponse.success("获取用户信息成功", userDTO));
    }

    /**
     * 批量操作用户状态
     */
    @PutMapping("/batch/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "批量更新用户状态", description = "批量更新多个用户的状态")
    public ResponseEntity<ApiResponse<List<Integer>>> batchUpdateUserStatus(
            @Parameter(description = "用户ID列表", required = true) @RequestParam List<Long> userIds,
            @Parameter(description = "新状态", required = true) @RequestParam User.UserStatus status) {

        // TODO: 实现批量更新用户状态的逻辑
        log.info("批量更新用户状态: userIds={}, status={}", userIds, status);

        return ResponseEntity.ok(ApiResponse.success("批量更新状态成功", userIds));
    }

}