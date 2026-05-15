package com.taskmanager.controller;

import com.taskmanager.dto.response.ActivityLogResponse;
import com.taskmanager.dto.response.PageResponse;
import com.taskmanager.service.ActivityLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/activity")
@RequiredArgsConstructor
@Tag(name = "Activity Logs")
@SecurityRequirement(name = "bearerAuth")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    @Operation(summary = "Get all activity logs, paginated")
    public PageResponse<ActivityLogResponse> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return activityLogService.getAllLogs(page, size);
    }

    @GetMapping("/task/{taskId}")
    @Operation(summary = "Get activity logs for a specific task")
    public PageResponse<ActivityLogResponse> getLogsByTask(
            @PathVariable String taskId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return activityLogService.getLogsByTask(taskId, page, size);
    }
}
