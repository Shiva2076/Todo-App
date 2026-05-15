package com.taskmanager.controller;

import com.taskmanager.document.User;
import com.taskmanager.dto.request.TaskCreateRequest;
import com.taskmanager.dto.request.TaskUpdateRequest;
import com.taskmanager.dto.response.PageResponse;
import com.taskmanager.dto.response.TaskResponse;
import com.taskmanager.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    @Operation(summary = "List tasks with filters and pagination")
    public PageResponse<TaskResponse> getTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String assignedToId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort
    ) {
        return taskService.getTasks(status, priority, assignedToId, search, page, size, sort);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a task")
    public TaskResponse createTask(
            @Valid @RequestBody TaskCreateRequest request,
            @AuthenticationPrincipal User user) {
        return taskService.createTask(request, user);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get task by ID")
    public TaskResponse getTask(@PathVariable String id) {
        return taskService.getTaskById(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update task")
    public TaskResponse updateTask(
            @PathVariable String id,
            @Valid @RequestBody TaskUpdateRequest request,
            @AuthenticationPrincipal User user) {
        return taskService.updateTask(id, request, user);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update task status only")
    public TaskResponse patchStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        return taskService.patchStatus(id, body.get("status"), user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft-delete task (ADMIN only)")
    public void deleteTask(@PathVariable String id, @AuthenticationPrincipal User user) {
        taskService.deleteTask(id, user);
    }

    @PostMapping(value = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload attachment to task")
    public TaskResponse uploadAttachment(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        return taskService.uploadAttachment(id, file, user);
    }

    @DeleteMapping("/{id}/attachments/{attachmentId}")
    @Operation(summary = "Delete attachment from task")
    public TaskResponse deleteAttachment(
            @PathVariable String id,
            @PathVariable String attachmentId,
            @AuthenticationPrincipal User user) {
        return taskService.deleteAttachment(id, attachmentId, user);
    }

    @GetMapping("/stats")
    @Operation(summary = "Get task statistics")
    public Map<String, Long> getStats() {
        return taskService.getStats();
    }
}
