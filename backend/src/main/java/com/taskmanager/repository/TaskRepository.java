package com.taskmanager.repository;

import com.taskmanager.document.Task;
import com.taskmanager.document.Task.TaskStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {

    long countByStatus(TaskStatus status);

    long countByStatusNotIn(List<TaskStatus> statuses);

    long countByDueDateBeforeAndStatusNotIn(LocalDateTime date, List<TaskStatus> statuses);

    List<Task> findByDueDateBetweenAndReminderSentFalseAndStatusNotIn(
            LocalDateTime start,
            LocalDateTime end,
            List<TaskStatus> statuses
    );
}
