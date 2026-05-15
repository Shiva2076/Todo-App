package com.taskmanager.dto.response;

import com.taskmanager.document.User.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String email;
    private String fullName;
    private String avatarUrl;
    private Role role;
    private boolean enabled;
    private LocalDateTime createdAt;
}
