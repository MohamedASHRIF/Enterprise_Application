package org.example.customer_service.controllers;

import lombok.RequiredArgsConstructor;
import org.example.customer_service.dto.CustomerSummaryDto;
import org.example.customer_service.dto.VehicleSummaryDto;
import org.example.customer_service.dto.EmployeeSummaryDto;
import org.example.customer_service.entities.Customer;
import org.example.customer_service.entities.Vehicle;
import org.example.customer_service.services.CustomerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/customers")
@RequiredArgsConstructor
public class CustomerPublicController {

    private final CustomerService customerService;
    private final RestTemplate restTemplate;

    @Value("${employee.service.url:http://localhost:8070}")
    private String employeeServiceUrl;

    @GetMapping("/{id}")
    public ResponseEntity<?> getCustomerPublic(@PathVariable Long id) {
        return customerService.getCustomerById(id)
                .map(c -> {
                    CustomerSummaryDto dto = new CustomerSummaryDto();
                    dto.setId(c.getId());
                    dto.setUserId(c.getUserId());
                    dto.setName(c.getName());
                    dto.setEmail(c.getEmail());
                    dto.setPhone(c.getPhone());

                    List<Vehicle> vehicles = c.getVehicles();
                    if (vehicles != null) {
                        List<VehicleSummaryDto> vs = vehicles.stream().map(v -> {
                            VehicleSummaryDto vd = new VehicleSummaryDto();
                            vd.setId(v.getId());
                            vd.setMake(v.getMake());
                            vd.setModel(v.getModel());
                            vd.setYear(v.getYear());
                            vd.setColor(v.getColor());
                            vd.setPlate(v.getPlate());
                            vd.setCustomerId(v.getCustomerId());
                            return vd;
                        }).collect(Collectors.toList());
                        dto.setVehicles(vs);
                    }

                    return ResponseEntity.ok(dto);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Public endpoint returning customer details and, optionally, an employee
     * fetched from the employee-service by appointment id.
     * Example: /api/public/customers/{id}/with-employee?appointmentId=123
     */
    @GetMapping("/{id}/with-employee")
    public ResponseEntity<?> getCustomerPublicWithEmployee(@PathVariable Long id,
                                                           @RequestParam(required = false) Long appointmentId) {
        return customerService.getCustomerById(id)
                .map(c -> {
                    CustomerSummaryDto dto = new CustomerSummaryDto();
                    dto.setId(c.getId());
                    dto.setUserId(c.getUserId());
                    dto.setName(c.getName());
                    dto.setEmail(c.getEmail());
                    dto.setPhone(c.getPhone());

                    List<Vehicle> vehicles = c.getVehicles();
                    if (vehicles != null) {
                        List<VehicleSummaryDto> vs = vehicles.stream().map(v -> {
                            VehicleSummaryDto vd = new VehicleSummaryDto();
                            vd.setId(v.getId());
                            vd.setMake(v.getMake());
                            vd.setModel(v.getModel());
                            vd.setYear(v.getYear());
                            vd.setColor(v.getColor());
                            vd.setPlate(v.getPlate());
                            vd.setCustomerId(v.getCustomerId());
                            return vd;
                        }).collect(Collectors.toList());
                        dto.setVehicles(vs);
                    }

                    // If caller provided an appointmentId, try to fetch assigned employee
                    if (appointmentId != null) {
                        try {
                            String url = employeeServiceUrl + "/api/assignments/by-appointment/" + appointmentId + "/employee";
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
                            // Non-fatal: return customer without employee
                        }
                    }

                    return ResponseEntity.ok(dto);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
