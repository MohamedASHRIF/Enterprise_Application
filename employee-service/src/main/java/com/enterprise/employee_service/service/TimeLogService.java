package com.enterprise.employee_service.service;

import com.enterprise.employee_service.domain.Assignment;
import com.enterprise.employee_service.domain.TimeLog;
import com.enterprise.employee_service.repository.AssignmentRepository;
import com.enterprise.employee_service.repository.TimeLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TimeLogService {
    private final TimeLogRepository timeLogRepository;
    private final AssignmentRepository assignmentRepository;

    public TimeLogService(TimeLogRepository timeLogRepository, AssignmentRepository assignmentRepository) {
        this.timeLogRepository = timeLogRepository;
        this.assignmentRepository = assignmentRepository;
    }

    public TimeLog start(Long assignmentId, String note) {
        Assignment a = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        TimeLog log = TimeLog.builder()
                .assignment(a)
                .startTime(LocalDateTime.now())
                .note(note)
                .build();
        return timeLogRepository.save(log);
    }

    public TimeLog stop(Long logId) {
        TimeLog log = timeLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("TimeLog not found"));
        log.setEndTime(LocalDateTime.now());
        return timeLogRepository.save(log);
    }

    public List<TimeLog> forAssignment(Long assignmentId) {
        return timeLogRepository.findByAssignmentId(assignmentId);
    }
}
