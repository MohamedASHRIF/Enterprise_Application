package com.enterprise.employee_service.service;

import com.enterprise.employee_service.domain.*;
import com.enterprise.employee_service.repository.AssignmentRepository;
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
    private final NotificationClient notificationClient;
    private final CustomerServiceClient customerServiceClient;

    public AssignmentService(AssignmentRepository assignmentRepository,
                             EmployeeService employeeService,
                             NotificationClient notificationClient,
                             CustomerServiceClient customerServiceClient) {
        this.assignmentRepository = assignmentRepository;
        this.employeeService = employeeService;
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

         // Choose least busy employee based on current workload
        // Use Assignment status to check availability (not Schedule which is redundant)
        // An employee is available if they have fewer ASSIGNED/IN_PROGRESS assignments
        Optional<UserDto> selectedEmployee = employees.stream()
                .min(Comparator.comparingInt(emp -> {
                    // Count active assignments (ASSIGNED or IN_PROGRESS)
                    int assignedCount = assignmentRepository.findByEmployeeIdAndStatus(emp.getId(), AssignmentStatus.ASSIGNED).size();
                    int inProgressCount = assignmentRepository.findByEmployeeIdAndStatus(emp.getId(), AssignmentStatus.IN_PROGRESS).size();
                    return assignedCount + inProgressCount; // Total workload
                }));

        // All employees considered, we'll assign to the least busy one even if all are busy
        // (The min comparator above already handles this)

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
                try {
                    // vehicle summary
                    @SuppressWarnings("unchecked")
                    java.util.Map<String, Object> vehicle = (java.util.Map<String, Object>) appointmentDetails.get("vehicle");
                    if (vehicle != null) {
                        String make = vehicle.get("make") != null ? vehicle.get("make").toString() : "";
                        String model = vehicle.get("model") != null ? vehicle.get("model").toString() : "";
                        String year = vehicle.get("year") != null ? vehicle.get("year").toString() : "";
                        String vehicleSummary = (make + " " + model + " " + year).trim();
                        dto.setVehicle(vehicleSummary.isEmpty() ? null : vehicleSummary);
                    }

                    // service name
                    @SuppressWarnings("unchecked")
                    java.util.Map<String, Object> service = (java.util.Map<String, Object>) appointmentDetails.get("service");
                    if (service != null && service.get("name") != null) {
                        dto.setService(service.get("name").toString());
                    }

                    // appointment date/time/estimatedDuration
                    if (appointmentDetails.get("appointmentDate") != null) {
                        dto.setAppointmentDate(appointmentDetails.get("appointmentDate").toString());
                    }
                    if (appointmentDetails.get("appointmentTime") != null) {
                        dto.setAppointmentTime(appointmentDetails.get("appointmentTime").toString());
                    }
                    if (appointmentDetails.get("estimatedDuration") != null) {
                        dto.setEstimatedDuration(appointmentDetails.get("estimatedDuration").toString());
                    }

                    // customer: appointment may contain customerId only
                    Object cidObj = appointmentDetails.get("customerId");
                    Long cid = null;
                    if (cidObj instanceof Number) cid = ((Number) cidObj).longValue();
                    else if (cidObj != null) {
                        try { cid = Long.parseLong(cidObj.toString()); } catch (Exception ignored) {}
                    }

                    if (cid != null) {
                        var customer = customerServiceClient.getCustomerById(cid);
                        if (customer != null) {
                            String name = customer.get("name") != null ? customer.get("name").toString() : null;
                            dto.setCustomerName(name);
                            if (name != null && name.contains(" ")) {
                                int idx = name.indexOf(' ');
                                dto.setCustomerFirstName(name.substring(0, idx).trim());
                                dto.setCustomerLastName(name.substring(idx + 1).trim());
                            } else {
                                dto.setCustomerFirstName(name);
                                dto.setCustomerLastName("");
                            }
                        }
                    }

                    log.debug("✅ Enriched assignment {} with appointment {} details", assignment.getId(), assignment.getAppointmentId());
                } catch (Exception e) {
                    log.warn("⚠️ Failed to enrich assignment {}: {}", assignment.getId(), e.getMessage());
                }
            } else {
                log.debug("⚠️ Could not fetch appointment details for appointment {}", assignment.getAppointmentId());
            }

            return dto;
        }).toList();
    }

    /**
     * Return the employee (UserDto) assigned to the given appointment, if any.
     */
    public com.enterprise.employee_service.web.dto.UserDto getEmployeeForAppointment(Long appointmentId) {
        var opt = assignmentRepository.findFirstByAppointmentId(appointmentId);
        if (opt.isEmpty()) return null;
        Assignment assignment = opt.get();
        Long empId = assignment.getEmployeeId();
        if (empId == null) return null;
        try {
            var employees = employeeService.getAllEmployees();
            return employees.stream().filter(e -> e.getId() != null && e.getId().equals(empId)).findFirst().orElse(null);
        } catch (Exception e) {
            log.debug("Could not fetch employee for appointment {}: {}", appointmentId, e.getMessage());
            return null;
        }
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
