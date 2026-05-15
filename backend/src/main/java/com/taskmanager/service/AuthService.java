package com.taskmanager.service;

import com.taskmanager.document.User;
import com.taskmanager.dto.request.LoginRequest;
import com.taskmanager.dto.request.RegisterRequest;
import com.taskmanager.dto.response.AuthResponse;
import com.taskmanager.dto.response.UserResponse;
import com.taskmanager.exception.BadRequestException;
import com.taskmanager.exception.UnauthorizedException;
import com.taskmanager.mapper.UserMapper;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final UserMapper userMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(User.Role.USER)
                .enabled(true)
                .build();

        User saved = userRepository.save(user);
        emailService.sendWelcomeEmail(saved.getEmail(), saved.getFullName());

        String accessToken = jwtService.generateToken(saved);
        String refreshToken = jwtService.generateRefreshToken(saved);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userMapper.toResponse(saved))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new UnauthorizedException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!user.isEnabled()) {
            throw new UnauthorizedException("Account is disabled");
        }

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userMapper.toResponse(user))
                .build();
    }

    public Map<String, String> refresh(String refreshToken) {
        try {
            String email = jwtService.extractUsername(refreshToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UnauthorizedException("User not found"));

            if (!jwtService.isTokenValid(refreshToken, user)) {
                throw new UnauthorizedException("Invalid or expired refresh token");
            }

            String newAccessToken = jwtService.generateToken(user);
            return Map.of("accessToken", newAccessToken);
        } catch (UnauthorizedException e) {
            throw e;
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid refresh token");
        }
    }

    public void logout(String token) {
        long ttl = jwtService.getRemainingSeconds(token);
        if (ttl > 0) {
            redisTemplate.opsForValue().set("blacklist:" + token, "true", ttl, TimeUnit.SECONDS);
        }
    }

    public UserResponse getMe(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        return userMapper.toResponse(user);
    }
}
