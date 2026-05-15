package com.taskmanager.controller;

import com.taskmanager.document.User;
import com.taskmanager.dto.request.LoginRequest;
import com.taskmanager.dto.request.RegisterRequest;
import com.taskmanager.dto.response.AuthResponse;
import com.taskmanager.dto.response.UserResponse;
import com.taskmanager.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a new user")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    @Operation(summary = "Login and get tokens")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<Map<String, String>> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        return ResponseEntity.ok(authService.refresh(refreshToken));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and blacklist token", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, String>> logout(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        authService.logout(token);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", security = @SecurityRequirement(name = "bearerAuth"))
    public UserResponse me(@AuthenticationPrincipal User user) {
        return authService.getMe(user.getEmail());
    }
}
