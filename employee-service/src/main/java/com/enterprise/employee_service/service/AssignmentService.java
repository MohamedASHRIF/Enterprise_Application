package com.enterprise.employee_service.service;

import com.enterprise.employee_service.domain.*;
import com.enterprise.employee_service.repository.AssignmentRepository;
import com.enterprise.employee_service.web.dto.UserDto;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssignmentService {
    private final AssignmentRepository assignmentRepository;
    private final EmployeeService employeeService; // to fetch employee info from Auth

    public AssignmentService(AssignmentRepository assignmentRepository, EmployeeService employeeService) {
        this.assignmentRepository = assignmentRepository;
        this.employeeService = employeeService;
    }

    public Assignment assign(Long employeeId, Long appointmentId) {
        // Directly assign without local Employee entity
        Assignment a = Assignment.builder()
                .appointmentId(appointmentId)
                .status(AssignmentStatus.ASSIGNED)
                .build();
        return assignmentRepository.save(a);
    }

    public List<Assignment> forEmployee(Long employeeId) {
        return assignmentRepository.findByEmployeeId(employeeId);
    }

    public Assignment updateStatus(Long assignmentId, AssignmentStatus status) {
        Assignment a = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        a.setStatus(status);
        return assignmentRepository.save(a);
    }
}
