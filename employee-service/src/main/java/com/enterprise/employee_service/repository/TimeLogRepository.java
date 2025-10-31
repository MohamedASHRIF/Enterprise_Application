package com.enterprise.employee_service.repository;

import com.enterprise.employee_service.domain.TimeLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimeLogRepository extends JpaRepository<TimeLog, Long> {
    List<TimeLog> findByAssignmentId(Long assignmentId);
}
