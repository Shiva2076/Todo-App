package com.taskmanager.repository;

import com.taskmanager.document.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityLogRepository extends MongoRepository<ActivityLog, String> {
    Page<ActivityLog> findByTaskIdOrderByCreatedAtDesc(String taskId, Pageable pageable);
    Page<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
