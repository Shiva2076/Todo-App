package com.taskmanager.service;

import com.taskmanager.document.User;
import com.taskmanager.dto.response.PageResponse;
import com.taskmanager.dto.response.UserResponse;
import com.taskmanager.exception.BadRequestException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.mapper.UserMapper;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final CloudinaryService cloudinaryService;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        return userMapper.toResponse(user);
    }

    public UserResponse updateProfile(String fullName, User currentUser) {
        if (fullName == null || fullName.isBlank()) {
            throw new BadRequestException("Full name cannot be blank");
        }
        currentUser.setFullName(fullName);
        return userMapper.toResponse(userRepository.save(currentUser));
    }

    public UserResponse uploadAvatar(MultipartFile file, User currentUser) {
        Map<String, Object> result = cloudinaryService.uploadFile(file);
        String secureUrl = (String) result.get("secure_url");

        // Delete old avatar from Cloudinary if it exists and has a publicId we track
        // (simplified: just replace the URL)
        currentUser.setAvatarUrl(secureUrl);
        return userMapper.toResponse(userRepository.save(currentUser));
    }

    public UserResponse changeRole(String id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        try {
            user.setRole(User.Role.valueOf(role));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + role);
        }
        return userMapper.toResponse(userRepository.save(user));
    }

    public UserResponse disableUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setEnabled(false);
        return userMapper.toResponse(userRepository.save(user));
    }
}
