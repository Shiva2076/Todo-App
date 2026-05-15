package com.taskmanager.mapper;

import com.taskmanager.document.Task;
import com.taskmanager.dto.response.TaskResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TaskMapper {
    TaskResponse toResponse(Task task);
}
