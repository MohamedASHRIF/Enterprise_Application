package com.enterprise.employee_service.service;

import com.enterprise.employee_service.domain.*;
import com.enterprise.employee_service.repository.AssignmentRepository;
import com.enterprise.employee_service.repository.ScheduleRepository;
import com.enterprise.employee_service.web.dto.AppointmentRequestDto;
import com.enterprise.employee_service.web.dto.UserDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class AssignmentService {

    private static final Logger log = LoggerFactory.getLogger(AssignmentService.class);

    private final AssignmentRepository assignmentRepository;
    private final EmployeeService employeeService;
    private final ScheduleRepository scheduleRepository;
    private final NotificationClient notificationClient;

    public AssignmentService(AssignmentRepository assignmentRepository,
                             EmployeeService employeeService,
                             ScheduleRepository scheduleRepository,
                             NotificationClient notificationClient) {
        this.assignmentRepository = assignmentRepository;
        this.employeeService = employeeService;
        this.scheduleRepository = scheduleRepository;
        this.notificationClient = notificationClient;
    }

    // ✅ Manual assignment
    public Assignment assign(Long employeeId, Long appointmentId) {
        Assignment assignment = Assignment.builder()
                .employeeId(employeeId)
                .appointmentId(appointmentId)
                .status(AssignmentStatus.ASSIGNED)
                .build();

        assignmentRepository.save(assignment);

        // Send notification (email + SMS)
        notificationClient.sendEmail(
                "employee" + employeeId + "@example.com",
                "New Assignment",
                "You have been assigned to appointment ID: " + appointmentId
        );

        notificationClient.sendSMS(
                "+94712345678",
                "New assignment: Appointment ID " + appointmentId
        );

        log.info("📩 Notification sent for manual assignment to employee {}", employeeId);

        return assignment;
    }

    // ✅ Auto-assign based on availability and job title (with fallback)
    public Assignment assignToAvailableEmployee(Long appointmentId, String requiredJobTitle, LocalDate appointmentDate) {
        List<UserDto> employees = employeeService.getEmployeesByJobTitle(requiredJobTitle);

        // Fallback: assign any employee if no specialization match
        if (employees.isEmpty()) {
            log.warn("⚠️ No employees with job title {} found. Falling back to general employees.", requiredJobTitle);
            employees = employeeService.getAllEmployees();
            if (employees.isEmpty()) {
                throw new RuntimeException("❌ No employees available at all.");
            }
        }

        // Choose least busy & available employee
        Optional<UserDto> selectedEmployee = employees.stream()
                .filter(emp -> {
                    var schedules = scheduleRepository.findByEmployeeIdAndDate(emp.getId(), appointmentDate);
                    return schedules == null || schedules.isEmpty(); // available if no schedule found
                })
                .min(Comparator.comparingInt(emp ->
                        assignmentRepository.findByEmployeeIdAndStatus(emp.getId(), AssignmentStatus.ASSIGNED).size()));

        // If all are busy, still assign the least busy one
        if (selectedEmployee.isEmpty()) {
            selectedEmployee = employees.stream()
                    .min(Comparator.comparingInt(emp ->
                            assignmentRepository.findByEmployeeIdAndStatus(emp.getId(), AssignmentStatus.ASSIGNED).size()));
        }

        if (selectedEmployee.isEmpty()) {
            throw new RuntimeException("❌ No employees available for assignment.");
        }

        Long employeeId = selectedEmployee.get().getId();
        Assignment assignment = Assignment.builder()
                .employeeId(employeeId)
                .appointmentId(appointmentId)
                .status(AssignmentStatus.ASSIGNED)
                .build();

        assignmentRepository.save(assignment);
        log.info("✅ Assigned appointment {} to employee {} (Job: {})", appointmentId, employeeId, requiredJobTitle);

        // Send notification
        notificationClient.sendEmail(
                selectedEmployee.get().getEmail(),
                "Appointment Assigned",
                "You have been assigned an appointment for " + appointmentDate + " (" + requiredJobTitle + ")"
        );

        notificationClient.sendSMS(
                "+94712345678",
                "Appointment assigned on " + appointmentDate + " (" + requiredJobTitle + ")"
        );

        return assignment;
    }

    // ✅ Auto-assign using AppointmentRequestDto
    public Assignment autoAssignEmployee(AppointmentRequestDto request) {
        String requiredJobTitle = mapServiceTypeToJobTitle(request.getServiceType());
        return assignToAvailableEmployee(request.getAppointmentId(), requiredJobTitle, request.getAppointmentDate());
    }

    // ✅ Map service type → job title
    private String mapServiceTypeToJobTitle(String serviceType) {
        return switch (serviceType) {
            case "MECHANICAL" -> "MECHANIC";
            case "ELECTRICAL" -> "TECHNICIAN";
            default -> "GENERAL EMPLOYEE";
        };
    }

    public List<Assignment> forEmployee(Long employeeId) {
        return assignmentRepository.findByEmployeeId(employeeId);
    }

    public Assignment updateStatus(Long assignmentId, AssignmentStatus status) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        assignment.setStatus(status);
        return assignmentRepository.save(assignment);
    }
}
