package com.taskmanager.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("tasks")
public class Task {

    @Id
    private String id;

    private String title;
    private String description;

    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    @Builder.Default
    private TaskStatus status = TaskStatus.TODO;

    private LocalDateTime dueDate;

    @Builder.Default
    private boolean reminderSent = false;

    private String assignedToId;
    private String assignedToName;
    private String createdById;
    private String createdByName;

    @Builder.Default
    private List<Attachment> attachments = new ArrayList<>();

    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Attachment {
        private String id;
        private String fileName;
        private String fileUrl;
        private String publicId;
        private String contentType;
        private Long fileSize;
        private LocalDateTime uploadedAt;
    }

    public enum Priority {
        LOW, MEDIUM, HIGH, URGENT
    }

    public enum TaskStatus {
        TODO, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED
    }
}
