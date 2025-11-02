package com.enterprise.employee_service.repository;

import com.enterprise.employee_service.domain.Assignment;
import com.enterprise.employee_service.domain.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByEmployeeId(Long employeeId);
    List<Assignment> findByEmployeeIdAndStatus(Long employeeId, AssignmentStatus status);
}
