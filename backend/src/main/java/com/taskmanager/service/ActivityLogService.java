package com.taskmanager.service;

import com.taskmanager.document.ActivityLog;
import com.taskmanager.dto.response.ActivityLogResponse;
import com.taskmanager.dto.response.PageResponse;
import com.taskmanager.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public void log(String taskId, String taskTitle, String userId, String userFullName,
                    String action, String oldValue, String newValue) {
        ActivityLog entry = ActivityLog.builder()
                .taskId(taskId)
                .taskTitle(taskTitle)
                .userId(userId)
                .userFullName(userFullName)
                .action(action)
                .oldValue(oldValue)
                .newValue(newValue)
                .build();
        activityLogRepository.save(entry);
    }

    public PageResponse<ActivityLogResponse> getAllLogs(int page, int size) {
        Page<ActivityLog> pageResult = activityLogRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(page, size));
        return buildPageResponse(pageResult, page, size);
    }

    public PageResponse<ActivityLogResponse> getLogsByTask(String taskId, int page, int size) {
        Page<ActivityLog> pageResult = activityLogRepository.findByTaskIdOrderByCreatedAtDesc(
                taskId, PageRequest.of(page, size));
        return buildPageResponse(pageResult, page, size);
    }

    private PageResponse<ActivityLogResponse> buildPageResponse(Page<ActivityLog> pageResult, int page, int size) {
        List<ActivityLogResponse> content = pageResult.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<ActivityLogResponse>builder()
                .content(content)
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .currentPage(page)
                .pageSize(size)
                .hasNext(pageResult.hasNext())
                .hasPrevious(pageResult.hasPrevious())
                .build();
    }

    private ActivityLogResponse toResponse(ActivityLog log) {
        return ActivityLogResponse.builder()
                .id(log.getId())
                .taskId(log.getTaskId())
                .taskTitle(log.getTaskTitle())
                .userId(log.getUserId())
                .userFullName(log.getUserFullName())
                .action(log.getAction())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
