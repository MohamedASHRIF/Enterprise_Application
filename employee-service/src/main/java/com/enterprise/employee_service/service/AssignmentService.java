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
import java.util.Map;
import java.util.Optional;

@Service
public class AssignmentService {

    private static final Logger log = LoggerFactory.getLogger(AssignmentService.class);

    private final AssignmentRepository assignmentRepository;
    private final EmployeeService employeeService;
    private final ScheduleRepository scheduleRepository;
    private final NotificationClient notificationClient;
    private final CustomerServiceClient customerServiceClient;

    public AssignmentService(AssignmentRepository assignmentRepository,
                             EmployeeService employeeService,
                             ScheduleRepository scheduleRepository,
                             NotificationClient notificationClient,
                             CustomerServiceClient customerServiceClient) {
        this.assignmentRepository = assignmentRepository;
        this.employeeService = employeeService;
        this.scheduleRepository = scheduleRepository;
        this.notificationClient = notificationClient;
        this.customerServiceClient = customerServiceClient;
    }

    // ✅ Manual assignment
    public Assignment assign(Long employeeId, Long appointmentId) {
        Assignment assignment = Assignment.builder()
                .employeeId(employeeId)
                .appointmentId(appointmentId)
                .status(AssignmentStatus.ASSIGNED)
                .build();

        assignmentRepository.save(assignment);

        // Send notification to employee (email + SMS)
        notificationClient.sendEmail(
                "employee" + employeeId + "@example.com",
                "New Assignment",
                "You have been assigned to appointment ID: " + appointmentId
        );

        notificationClient.sendSMS(
                "+94712345678",
                "New assignment: Appointment ID " + appointmentId
        );

        // Send notification to customer
        sendCustomerNotification(appointmentId, null);

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

        // Send notification to employee
        notificationClient.sendEmail(
                selectedEmployee.get().getEmail(),
                "Appointment Assigned",
                "You have been assigned an appointment for " + appointmentDate + " (" + requiredJobTitle + ")"
        );

        notificationClient.sendSMS(
                "+94712345678",
                "Appointment assigned on " + appointmentDate + " (" + requiredJobTitle + ")"
        );

        // Send notification to customer
        sendCustomerNotification(appointmentId, appointmentDate);

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

    // ✅ Get enriched assignments with appointment details for an employee
    public List<com.enterprise.employee_service.web.dto.AssignmentResponseDto> getEnrichedAssignmentsForEmployee(Long employeeId) {
        List<Assignment> assignments = forEmployee(employeeId);
        return assignments.stream().map(assignment -> {
            com.enterprise.employee_service.web.dto.AssignmentResponseDto dto = 
                com.enterprise.employee_service.web.mapper.DtoMapper.toDto(assignment);
            
            // Try to fetch appointment details from customer service
            var appointmentDetails = customerServiceClient.getAppointmentDetails(assignment.getAppointmentId());
            if (appointmentDetails != null) {
                // You can add appointment details to the DTO if you extend it
                // For now, just log that we got the details
                log.debug("✅ Fetched appointment details for appointment {}", assignment.getAppointmentId());
            } else {
                log.debug("⚠️ Could not fetch appointment details for appointment {}", assignment.getAppointmentId());
            }
            
            return dto;
        }).toList();
    }

    // ✅ Send notifications to customer when appointment is assigned
    private void sendCustomerNotification(Long appointmentId, LocalDate appointmentDate) {
        try {
            // Fetch appointment details from customer service to get customer info
            Map<String, Object> appointmentDetails = customerServiceClient.getAppointmentDetails(appointmentId);
            
            if (appointmentDetails == null) {
                log.warn("⚠️ Could not fetch appointment details for appointment {}, skipping customer notification", appointmentId);
                return;
            }

            // Extract customer information
            @SuppressWarnings("unchecked")
            Map<String, Object> customer = (Map<String, Object>) appointmentDetails.get("customer");
            
            if (customer == null) {
                log.warn("⚠️ No customer information found in appointment details for appointment {}", appointmentId);
                return;
            }

            String customerEmail = (String) customer.get("email");
            String customerPhone = (String) customer.get("phoneNumber");
            String customerFirstName = (String) customer.get("firstName");
            String customerLastName = (String) customer.get("lastName");
            String customerName = (customerFirstName != null ? customerFirstName : "") + 
                                 (customerLastName != null ? " " + customerLastName : "").trim();

            // Extract appointment details
            String aptDate = appointmentDate != null 
                ? appointmentDate.toString() 
                : (String) appointmentDetails.get("appointmentDate");
            String aptTime = (String) appointmentDetails.get("appointmentTime");
            
            @SuppressWarnings("unchecked")
            Map<String, Object> service = (Map<String, Object>) appointmentDetails.get("service");
            String serviceName = service != null ? (String) service.get("name") : "service";

            // Build email message
            String emailSubject = "Appointment Confirmation";
            String emailBody = String.format(
                "Dear %s,\n\n" +
                "Your appointment has been confirmed!\n\n" +
                "Appointment Details:\n" +
                "- Service: %s\n" +
                "- Date: %s\n" +
                "- Time: %s\n\n" +
                "We look forward to serving you.\n\n" +
                "Best regards,\n" +
                "Service Team",
                customerName.isEmpty() ? "Customer" : customerName,
                serviceName,
                aptDate != null ? aptDate : "TBD",
                aptTime != null ? aptTime : "TBD"
            );

            // Build SMS message
            String smsMessage = String.format(
                "Your appointment is confirmed for %s at %s. Service: %s. Thank you!",
                aptDate != null ? aptDate : "TBD",
                aptTime != null ? aptTime : "TBD",
                serviceName
            );

            // Send email to customer
            if (customerEmail != null && !customerEmail.isEmpty()) {
                notificationClient.sendEmail(customerEmail, emailSubject, emailBody);
                log.info("📧 Confirmation email sent to customer: {}", customerEmail);
            } else {
                log.warn("⚠️ Customer email not found for appointment {}", appointmentId);
            }

            // Send SMS to customer
            if (customerPhone != null && !customerPhone.isEmpty()) {
                notificationClient.sendSMS(customerPhone, smsMessage);
                log.info("📱 Confirmation SMS sent to customer: {}", customerPhone);
            } else {
                log.warn("⚠️ Customer phone number not found for appointment {}", appointmentId);
            }

        } catch (Exception e) {
            log.error("❌ Failed to send customer notification for appointment {}: {}", appointmentId, e.getMessage());
            // Don't throw - assignment was successful, notification failure shouldn't break the flow
        }
    }
}
