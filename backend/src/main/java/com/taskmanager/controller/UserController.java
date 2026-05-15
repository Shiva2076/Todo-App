package com.taskmanager.controller;

import com.taskmanager.document.User;
import com.taskmanager.dto.response.UserResponse;
import com.taskmanager.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/")
    @Operation(summary = "List all users (ADMIN only)")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public UserResponse getUserById(@PathVariable String id) {
        return userService.getUserById(id);
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current user's full name")
    public UserResponse updateProfile(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        return userService.updateProfile(body.get("fullName"), user);
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload avatar image")
    public UserResponse uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        return userService.uploadAvatar(file, user);
    }

    @PatchMapping("/{id}/role")
    @Operation(summary = "Change user role (ADMIN only)")
    public UserResponse changeRole(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        return userService.changeRole(id, body.get("role"));
    }

    @PatchMapping("/{id}/disable")
    @Operation(summary = "Disable user (ADMIN only)")
    public UserResponse disableUser(@PathVariable String id) {
        return userService.disableUser(id);
    }
}
