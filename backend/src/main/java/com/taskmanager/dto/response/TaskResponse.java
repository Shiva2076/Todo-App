package com.taskmanager.dto.response;

import com.taskmanager.document.Task.Attachment;
import com.taskmanager.document.Task.Priority;
import com.taskmanager.document.Task.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private String id;
    private String title;
    private String description;
    private Priority priority;
    private TaskStatus status;
    private LocalDateTime dueDate;
    private boolean reminderSent;
    private String assignedToId;
    private String assignedToName;
    private String createdById;
    private String createdByName;
    private List<Attachment> attachments;
    private List<String> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
