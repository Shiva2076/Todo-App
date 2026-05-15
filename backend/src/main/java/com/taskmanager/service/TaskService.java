package com.taskmanager.service;

import com.taskmanager.document.Task;
import com.taskmanager.document.Task.Priority;
import com.taskmanager.document.Task.TaskStatus;
import com.taskmanager.document.User;
import com.taskmanager.dto.request.TaskCreateRequest;
import com.taskmanager.dto.request.TaskUpdateRequest;
import com.taskmanager.dto.response.PageResponse;
import com.taskmanager.dto.response.TaskResponse;
import com.taskmanager.exception.BadRequestException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.mapper.TaskMapper;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TaskMapper taskMapper;
    private final ActivityLogService activityLogService;
    private final CloudinaryService cloudinaryService;
    private final MongoTemplate mongoTemplate;

    @CacheEvict(value = "tasks", allEntries = true)
    public TaskResponse createTask(TaskCreateRequest request, User currentUser) {
        String assignedToName = null;
        String assignedToId = request.getAssignedToId();

        if (assignedToId != null && !assignedToId.isBlank()) {
            User assignee = userRepository.findById(assignedToId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", assignedToId));
            assignedToName = assignee.getFullName();
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .dueDate(request.getDueDate())
                .assignedToId(assignedToId)
                .assignedToName(assignedToName)
                .createdById(currentUser.getId())
                .createdByName(currentUser.getFullName())
                .tags(request.getTags() != null ? request.getTags() : new ArrayList<>())
                .build();

        Task saved = taskRepository.save(task);

        activityLogService.log(saved.getId(), saved.getTitle(),
                currentUser.getId(), currentUser.getFullName(), "CREATED", null, null);

        return taskMapper.toResponse(saved);
    }

    public PageResponse<TaskResponse> getTasks(String status, String priority, String assignedToId,
                                                String search, int page, int size, String sort) {
        List<Criteria> criteriaList = new ArrayList<>();

        if (status != null && !status.isBlank()) {
            try {
                criteriaList.add(Criteria.where("status").is(TaskStatus.valueOf(status)));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status: " + status);
            }
        }
        if (priority != null && !priority.isBlank()) {
            try {
                criteriaList.add(Criteria.where("priority").is(Priority.valueOf(priority)));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid priority: " + priority);
            }
        }
        if (assignedToId != null && !assignedToId.isBlank()) {
            criteriaList.add(Criteria.where("assignedToId").is(assignedToId));
        }
        if (search != null && !search.isBlank()) {
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("title").regex(search, "i"),
                    Criteria.where("description").regex(search, "i")
            ));
        }

        Criteria combined = criteriaList.isEmpty()
                ? new Criteria()
                : new Criteria().andOperator(criteriaList.toArray(new Criteria[0]));

        Query countQuery = new Query(combined);
        long total = mongoTemplate.count(countQuery, Task.class);

        Query dataQuery = new Query(combined);
        org.springframework.data.domain.Sort sorting = "createdAt".equals(sort)
                ? org.springframework.data.domain.Sort.by(sort).ascending()
                : org.springframework.data.domain.Sort.by(sort != null ? sort : "createdAt").descending();
        dataQuery.with(org.springframework.data.domain.PageRequest.of(page, size, sorting));

        List<Task> tasks = mongoTemplate.find(dataQuery, Task.class);

        List<TaskResponse> content = tasks.stream()
                .map(taskMapper::toResponse)
                .collect(Collectors.toList());

        int totalPages = (int) Math.ceil((double) total / size);

        return PageResponse.<TaskResponse>builder()
                .content(content)
                .totalElements(total)
                .totalPages(totalPages)
                .currentPage(page)
                .pageSize(size)
                .hasNext(page < totalPages - 1)
                .hasPrevious(page > 0)
                .build();
    }

    @Cacheable(value = "tasks", key = "#id")
    public TaskResponse getTaskById(String id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        return taskMapper.toResponse(task);
    }

    @CacheEvict(value = "tasks", key = "#id")
    public TaskResponse updateTask(String id, TaskUpdateRequest request, User currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));

        String assignedToName = task.getAssignedToName();
        if (request.getAssignedToId() != null && !request.getAssignedToId().isBlank()) {
            User assignee = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getAssignedToId()));
            assignedToName = assignee.getFullName();
        }

        if (task.getStatus() != request.getStatus()) {
            activityLogService.log(task.getId(), task.getTitle(),
                    currentUser.getId(), currentUser.getFullName(),
                    "STATUS_CHANGED", task.getStatus().name(), request.getStatus().name());
        }
        if (task.getPriority() != request.getPriority()) {
            activityLogService.log(task.getId(), task.getTitle(),
                    currentUser.getId(), currentUser.getFullName(),
                    "PRIORITY_UPDATED", task.getPriority().name(), request.getPriority().name());
        }
        if (!java.util.Objects.equals(task.getAssignedToId(), request.getAssignedToId())) {
            activityLogService.log(task.getId(), task.getTitle(),
                    currentUser.getId(), currentUser.getFullName(),
                    "ASSIGNED", task.getAssignedToName(), assignedToName);
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus());
        task.setDueDate(request.getDueDate());
        task.setAssignedToId(request.getAssignedToId());
        task.setAssignedToName(assignedToName);
        task.setTags(request.getTags() != null ? request.getTags() : new ArrayList<>());

        Task saved = taskRepository.save(task);
        activityLogService.log(saved.getId(), saved.getTitle(),
                currentUser.getId(), currentUser.getFullName(), "UPDATED", null, null);

        return taskMapper.toResponse(saved);
    }

    @CacheEvict(value = "tasks", key = "#id")
    public TaskResponse patchStatus(String id, String status, User currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));

        TaskStatus newStatus;
        try {
            newStatus = TaskStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status);
        }

        String oldStatus = task.getStatus().name();
        task.setStatus(newStatus);
        Task saved = taskRepository.save(task);

        activityLogService.log(saved.getId(), saved.getTitle(),
                currentUser.getId(), currentUser.getFullName(),
                "STATUS_CHANGED", oldStatus, newStatus.name());

        return taskMapper.toResponse(saved);
    }

    @CacheEvict(value = "tasks", key = "#id")
    public void deleteTask(String id, User currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));

        task.setStatus(TaskStatus.CANCELLED);
        taskRepository.save(task);

        activityLogService.log(task.getId(), task.getTitle(),
                currentUser.getId(), currentUser.getFullName(), "CANCELLED", null, null);
    }

    @CacheEvict(value = "tasks", key = "#taskId")
    public TaskResponse uploadAttachment(String taskId, MultipartFile file, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));

        Map<String, Object> uploadResult = cloudinaryService.uploadFile(file);
        String secureUrl = (String) uploadResult.get("secure_url");
        String publicId = (String) uploadResult.get("public_id");

        Task.Attachment attachment = Task.Attachment.builder()
                .id(UUID.randomUUID().toString())
                .fileName(file.getOriginalFilename())
                .fileUrl(secureUrl)
                .publicId(publicId)
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .uploadedAt(LocalDateTime.now())
                .build();

        task.getAttachments().add(attachment);
        Task saved = taskRepository.save(task);

        activityLogService.log(saved.getId(), saved.getTitle(),
                currentUser.getId(), currentUser.getFullName(),
                "ATTACHMENT_ADDED", null, file.getOriginalFilename());

        return taskMapper.toResponse(saved);
    }

    @CacheEvict(value = "tasks", key = "#taskId")
    public TaskResponse deleteAttachment(String taskId, String attachmentId, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));

        Task.Attachment attachment = task.getAttachments().stream()
                .filter(a -> a.getId().equals(attachmentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Attachment", attachmentId));

        cloudinaryService.deleteFile(attachment.getPublicId());
        task.getAttachments().removeIf(a -> a.getId().equals(attachmentId));
        Task saved = taskRepository.save(task);

        activityLogService.log(saved.getId(), saved.getTitle(),
                currentUser.getId(), currentUser.getFullName(),
                "ATTACHMENT_REMOVED", attachment.getFileName(), null);

        return taskMapper.toResponse(saved);
    }

    public Map<String, Long> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", taskRepository.count());
        stats.put("todo", taskRepository.countByStatus(TaskStatus.TODO));
        stats.put("inProgress", taskRepository.countByStatus(TaskStatus.IN_PROGRESS));
        stats.put("inReview", taskRepository.countByStatus(TaskStatus.IN_REVIEW));
        stats.put("done", taskRepository.countByStatus(TaskStatus.DONE));
        stats.put("overdue", taskRepository.countByDueDateBeforeAndStatusNotIn(
                LocalDateTime.now(), List.of(TaskStatus.DONE, TaskStatus.CANCELLED)));
        return stats;
    }
}
