package com.enterprise.employee_service.web;

import com.enterprise.employee_service.domain.Assignment;
import com.enterprise.employee_service.domain.AssignmentStatus;
import com.enterprise.employee_service.service.AssignmentService;
import com.enterprise.employee_service.web.dto.AppointmentRequestDto;
import com.enterprise.employee_service.web.dto.AssignmentResponseDto;
import com.enterprise.employee_service.web.dto.ResponseDto;
import com.enterprise.employee_service.web.dto.UserDto;
import com.enterprise.employee_service.web.mapper.DtoMapper;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    /**
     * Auto-assign employee based on service type and availability.
     * Triggered by the AppointmentService through REST API.
     */
    @PostMapping("/auto-assign-by-request")
    public ResponseEntity<ResponseDto<AssignmentResponseDto>> autoAssignByRequest(@RequestBody AppointmentRequestDto request) {
        Assignment a = assignmentService.autoAssignEmployee(request);
        return ResponseEntity.ok(new ResponseDto<>(true, DtoMapper.toDto(a),
                "Appointment auto-assigned successfully"));
    }

    /**
     * Manual assignment - assign specific employee to appointment.
     */
    @PostMapping("/assign")
    public ResponseEntity<ResponseDto<AssignmentResponseDto>> assign(
            @RequestParam Long employeeId,
            @RequestParam Long appointmentId) {

        Assignment a = assignmentService.assign(employeeId, appointmentId);
        return ResponseEntity.ok(new ResponseDto<>(true, DtoMapper.toDto(a),
                "Assignment created successfully"));
    }

    /**
     * Auto-assign using parameters (job title and date).
     */
    @PostMapping("/auto-assign")
    public ResponseEntity<ResponseDto<AssignmentResponseDto>> autoAssign(
            @RequestParam Long appointmentId,
            @RequestParam String requiredJobTitle,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate appointmentDate) {

        Assignment a = assignmentService.assignToAvailableEmployee(appointmentId, requiredJobTitle, appointmentDate);
        return ResponseEntity.ok(new ResponseDto<>(true, DtoMapper.toDto(a),
                "Appointment auto-assigned successfully"));
    }

    /**
     * Get all assignments for a specific employee.
     */
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ResponseDto<List<AssignmentResponseDto>>> forEmployee(@PathVariable Long employeeId) {
    List<com.enterprise.employee_service.web.dto.AssignmentResponseDto> enriched = assignmentService.getEnrichedAssignmentsForEmployee(employeeId);
    return ResponseEntity.ok(new ResponseDto<>(true, enriched,
        "Assignments retrieved successfully"));
    }

    /**
     * Return employee details for a given appointment (if an assignment exists).
     */
    @GetMapping("/by-appointment/{appointmentId}/employee")
    public ResponseEntity<ResponseDto<UserDto>> employeeForAppointment(@PathVariable Long appointmentId) {
        com.enterprise.employee_service.web.dto.UserDto user = assignmentService.getEmployeeForAppointment(appointmentId);
        if (user == null) return ResponseEntity.ok(new ResponseDto<>(true, null, "No employee assigned"));
        return ResponseEntity.ok(new ResponseDto<>(true, user, "Employee retrieved"));
    }


    /**
     * Update the status of an existing assignment (e.g., ASSIGNED → COMPLETED).
     */
    @PutMapping("/{assignmentId}/status")
    public ResponseEntity<ResponseDto<AssignmentResponseDto>> updateStatus(
            @PathVariable Long assignmentId,
            @RequestParam AssignmentStatus status) {

        Assignment a = assignmentService.updateStatus(assignmentId, status);
        return ResponseEntity.ok(new ResponseDto<>(true, DtoMapper.toDto(a),
                "Assignment status updated successfully"));
    }
}
