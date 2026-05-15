package com.taskmanager.mapper;

import com.taskmanager.document.User;
import com.taskmanager.dto.response.UserResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);
}
