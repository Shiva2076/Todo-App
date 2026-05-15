package com.taskmanager.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("activity_logs")
public class ActivityLog {

    @Id
    private String id;

    private String taskId;
    private String taskTitle;
    private String userId;
    private String userFullName;
    private String action;
    private String oldValue;
    private String newValue;

    @CreatedDate
    private LocalDateTime createdAt;
}
