package com.enterprise.employee_service.repository;

import com.enterprise.employee_service.domain.TimeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface TimeLogRepository extends JpaRepository<TimeLog, Long> {
    List<TimeLog> findByAssignmentId(Long assignmentId);
    List<TimeLog> findByAssignmentIdAndEndTimeIsNull(Long assignmentId);
    
    // Find all time logs for an employee on a specific date (via assignments)
    @Query("SELECT tl FROM TimeLog tl JOIN tl.assignment a WHERE a.employeeId = :employeeId " +
           "AND CAST(tl.startTime AS date) = :workDate")
    List<TimeLog> findByEmployeeIdAndDate(@Param("employeeId") Long employeeId, 
                                           @Param("workDate") LocalDate workDate);
}
