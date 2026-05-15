package com.taskmanager.dto.request;

import com.taskmanager.document.Task.Priority;
import com.taskmanager.document.Task.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TaskUpdateRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Priority is required")
    private Priority priority;

    @NotNull(message = "Status is required")
    private TaskStatus status;

    private LocalDateTime dueDate;

    private String assignedToId;

    private List<String> tags;
}
