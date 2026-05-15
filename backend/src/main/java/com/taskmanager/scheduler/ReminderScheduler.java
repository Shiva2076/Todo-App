package com.taskmanager.scheduler;

import com.taskmanager.document.Task;
import com.taskmanager.document.Task.TaskStatus;
import com.taskmanager.document.User;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReminderScheduler {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 * * * *")
    public void sendDueReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime in24h = now.plusHours(24);

        List<Task> dueTasks = taskRepository.findByDueDateBetweenAndReminderSentFalseAndStatusNotIn(
                now, in24h, List.of(TaskStatus.DONE, TaskStatus.CANCELLED)
        );

        log.info("Reminder scheduler: found {} tasks due in next 24h", dueTasks.size());

        for (Task task : dueTasks) {
            if (task.getAssignedToId() == null) continue;

            userRepository.findById(task.getAssignedToId()).ifPresent(user -> {
                emailService.sendTaskReminder(user.getEmail(), user.getFullName(), task);
                task.setReminderSent(true);
                taskRepository.save(task);
                log.debug("Reminder sent for task {} to {}", task.getId(), user.getEmail());
            });
        }
    }
}
