package org.example.customer_service.controllers;

import lombok.RequiredArgsConstructor;
import org.example.customer_service.dto.AppointmentSummaryDto;
import org.example.customer_service.dto.EmployeeSummaryDto;
import org.example.customer_service.dto.ServiceSummaryDto;
import org.example.customer_service.dto.VehicleSummaryDto;
// import org.example.customer_service.entities.Appointment; // not used
import org.example.customer_service.services.AppointmentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/public/appointments")
@RequiredArgsConstructor
public class AppointmentPublicController {

    private final AppointmentService appointmentService;
    private final RestTemplate restTemplate;
    private final org.example.customer_service.services.CustomerService customerService;

    @Value("${employee.service.url:http://localhost:8070}")
    private String employeeServiceUrl;

    /**
     * Public endpoint returning a shallow appointment DTO enriched with
     * employee details fetched from the employee-service (if assigned).
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointmentPublic(@PathVariable Long id) {
        return appointmentService.getAppointmentById(id)
                .map(app -> {
                    AppointmentSummaryDto dto = new AppointmentSummaryDto();
                    dto.setId(app.getId());
                    dto.setCustomerId(app.getCustomerId());
                    // Populate customer name fields from local CustomerService to avoid extra client-side calls
                    try {
                        if (app.getCustomerId() > 0) {
                            customerService.getCustomerById(Long.valueOf(app.getCustomerId())).ifPresent(c -> {
                                dto.setCustomerName(c.getName());
                                // attempt to split first/last name
                                if (c.getName() != null && c.getName().contains(" ")) {
                                    int idx = c.getName().indexOf(' ');
                                    dto.setCustomerFirstName(c.getName().substring(0, idx).trim());
                                    dto.setCustomerLastName(c.getName().substring(idx + 1).trim());
                                } else {
                                    dto.setCustomerFirstName(c.getName());
                                    dto.setCustomerLastName("");
                                }
                            });
                        }
                    } catch (Exception ignore) {
                        // non-fatal: leave name fields null
                    }
                    if (app.getVehicle() != null) {
                        VehicleSummaryDto v = new VehicleSummaryDto();
                        v.setId(app.getVehicle().getId());
                        v.setMake(app.getVehicle().getMake());
                        v.setModel(app.getVehicle().getModel());
                        v.setYear(app.getVehicle().getYear());
                        v.setColor(app.getVehicle().getColor());
                        v.setPlate(app.getVehicle().getPlate());
                        v.setCustomerId(app.getVehicle().getCustomerId());
                        dto.setVehicle(v);
                    }
                    if (app.getService() != null) {
                        ServiceSummaryDto s = new ServiceSummaryDto();
                        s.setId(app.getService().getId());
                        s.setName(app.getService().getName());
                        s.setDescription(app.getService().getDescription());
                        s.setCategory(app.getService().getCategory());
                        dto.setService(s);
                    }

                    // appointment core fields
                    dto.setAppointmentDate(app.getAppointmentDate());
                    dto.setAppointmentTime(app.getAppointmentTime());
                    dto.setStatus(app.getStatus());
                    dto.setEstimatedDuration(app.getEstimatedDuration());

                    // Try to fetch employee details from employee-service by appointment id
                    try {
                        String url = employeeServiceUrl + "/api/assignments/by-appointment/" + app.getId() + "/employee";
                        // Response shape: { success: true, data: { ...employee fields... }, message: "..." }
                        @SuppressWarnings("unchecked")
                        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
                        if (response != null && Boolean.TRUE.equals(response.get("success"))) {
                            Object data = response.get("data");
                            if (data instanceof Map) {
                                @SuppressWarnings("unchecked")
                                Map<String, Object> emp = (Map<String, Object>) data;
                                EmployeeSummaryDto e = new EmployeeSummaryDto();
                                if (emp.get("id") != null) e.setId(((Number) emp.get("id")).longValue());
                                e.setFirstName(emp.get("firstName") != null ? emp.get("firstName").toString() : null);
                                e.setLastName(emp.get("lastName") != null ? emp.get("lastName").toString() : null);
                                e.setEmail(emp.get("email") != null ? emp.get("email").toString() : null);
                                e.setPhoneNumber(emp.get("phoneNumber") != null ? emp.get("phoneNumber").toString() : null);
                                dto.setEmployee(e);
                            }
                        }
                    } catch (Exception ex) {
                        // Non-fatal: return appointment without employee details
                    }

                    return ResponseEntity.ok(dto);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
