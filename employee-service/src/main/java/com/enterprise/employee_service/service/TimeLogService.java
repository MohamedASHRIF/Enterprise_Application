package com.enterprise.employee_service.service;

import com.enterprise.employee_service.domain.Assignment;
import com.enterprise.employee_service.domain.DailyWorkHours;
import com.enterprise.employee_service.domain.TimeLog;
import com.enterprise.employee_service.repository.AssignmentRepository;
import com.enterprise.employee_service.repository.DailyWorkHoursRepository;
import com.enterprise.employee_service.repository.TimeLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TimeLogService {
    private final TimeLogRepository timeLogRepository;
    private final AssignmentRepository assignmentRepository;
    private final DailyWorkHoursRepository dailyWorkHoursRepository;

    public TimeLogService(TimeLogRepository timeLogRepository, 
                         AssignmentRepository assignmentRepository,
                         DailyWorkHoursRepository dailyWorkHoursRepository) {
        this.timeLogRepository = timeLogRepository;
        this.assignmentRepository = assignmentRepository;
        this.dailyWorkHoursRepository = dailyWorkHoursRepository;
    }

    public TimeLog start(Long assignmentId, String note) {
        Assignment a = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
    // Prevent overlapping active time logs for the same assignment
    List<TimeLog> active = timeLogRepository.findByAssignmentIdAndEndTimeIsNull(assignmentId);
    if (active != null && !active.isEmpty()) {
        throw new IllegalStateException("Active TimeLog already exists for assignment " + assignmentId);
    }

    TimeLog log = TimeLog.builder()
        .assignment(a)
        .startTime(LocalDateTime.now())
        .note(note)
        .build();
    return timeLogRepository.save(log);
    }

    @Transactional
    public TimeLog stop(Long logId) {
        TimeLog log = timeLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("TimeLog not found"));
        log.setEndTime(LocalDateTime.now());
        TimeLog savedLog = timeLogRepository.save(log);
        
        // Update daily work hours for the employee
        updateDailyWorkHours(log.getAssignment().getEmployeeId(), log.getStartTime().toLocalDate());
        
        return savedLog;
    }

    public List<TimeLog> forAssignment(Long assignmentId) {
        return timeLogRepository.findByAssignmentId(assignmentId);
    }
    
    /**
     * Update daily work hours aggregate for an employee on a specific date
     * This calculates total seconds worked from all TimeLogs for that day
     */
    private void updateDailyWorkHours(Long employeeId, LocalDate workDate) {
        // Get all time logs for this employee on this date
        List<TimeLog> logs = timeLogRepository.findByEmployeeIdAndDate(employeeId, workDate);
        
        // Calculate total seconds worked on this date
        long totalSeconds = 0;
        int logCount = 0;
        
        for (TimeLog log : logs) {
            if (log.getStartTime() != null && log.getStartTime().toLocalDate().equals(workDate)) {
                if (log.getEndTime() != null) {
                    // Completed log - use actual end time
                    long seconds = java.time.Duration.between(log.getStartTime(), log.getEndTime()).getSeconds();
                    totalSeconds += seconds;
                } else {
                    // Active log - calculate up to now
                    long seconds = java.time.Duration.between(log.getStartTime(), LocalDateTime.now()).getSeconds();
                    totalSeconds += seconds;
                }
                logCount++;
            }
        }
        
        // Find or create daily work hours record
        Optional<DailyWorkHours> existing = dailyWorkHoursRepository.findByEmployeeIdAndWorkDate(employeeId, workDate);
        if (existing.isPresent()) {
            DailyWorkHours dailyHours = existing.get();
            dailyHours.setTotalSeconds(totalSeconds);
            dailyHours.setLogCount(logCount);
            dailyWorkHoursRepository.save(dailyHours);
        } else {
            DailyWorkHours dailyHours = DailyWorkHours.builder()
                    .employeeId(employeeId)
                    .workDate(workDate)
                    .totalSeconds(totalSeconds)
                    .logCount(logCount)
                    .build();
            dailyWorkHoursRepository.save(dailyHours);
        }
    }
    
    /**
     * Get work hours for an employee for a date range (for admin/reporting)
     */
    public List<DailyWorkHours> getWorkHours(Long employeeId, LocalDate startDate, LocalDate endDate) {
        return dailyWorkHoursRepository.findByEmployeeIdAndWorkDateBetween(employeeId, startDate, endDate);
    }
    
    /**
     * Get all work hours for an employee
     */
    public List<DailyWorkHours> getAllWorkHours(Long employeeId) {
        return dailyWorkHoursRepository.findByEmployeeId(employeeId);
    }
    
    /**
     * Recalculate daily work hours for an employee on a specific date
     * Useful for fixing data or recalculating after manual changes
     */
    public DailyWorkHours recalculateDailyHours(Long employeeId, LocalDate workDate) {
        updateDailyWorkHours(employeeId, workDate);
        return dailyWorkHoursRepository.findByEmployeeIdAndWorkDate(employeeId, workDate)
                .orElse(null);
    }
    
    /**
     * Recalculate daily work hours for a date range
     * Useful for bulk updates or fixing historical data
     */
    public void recalculateDailyHoursRange(Long employeeId, LocalDate startDate, LocalDate endDate) {
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            updateDailyWorkHours(employeeId, currentDate);
            currentDate = currentDate.plusDays(1);
        }
    }
}
