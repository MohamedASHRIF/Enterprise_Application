package com.enterprise.employee_service.web;

import com.enterprise.employee_service.service.CustomerServiceClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class CustomerAppointmentController {

    private static final Logger log = LoggerFactory.getLogger(CustomerAppointmentController.class);

    private final CustomerServiceClient customerServiceClient;

    public CustomerAppointmentController(CustomerServiceClient customerServiceClient) {
        this.customerServiceClient = customerServiceClient;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointment(@PathVariable Long id) {
        Map<String, Object> details = customerServiceClient.getAppointmentDetails(id);
        if (details == null) {
            log.debug("Appointment {} not found or customer service returned an error", id);
            return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND).build();
        }
        // If customerId exists in the appointment summary, try to fetch customer details
        try {
            Object cidObj = details.get("customerId");
            Long cid = null;
            if (cidObj instanceof Number) cid = ((Number) cidObj).longValue();
            else if (cidObj != null) {
                try { cid = Long.parseLong(cidObj.toString()); } catch (Exception ignored) {}
            }

            if (cid != null) {
                Map<String, Object> customer = customerServiceClient.getCustomerById(cid);
                if (customer != null) {
                    // attach the customer object so frontend can read name/firstName/lastName
                    // Ensure the customer map contains firstName/lastName for frontend compatibility
                    try {
                        if (customer.get("firstName") == null) {
                            String full = null;
                            if (customer.get("name") != null) full = customer.get("name").toString();
                            if (full != null) {
                                if (full.contains(" ")) {
                                    int i = full.indexOf(' ');
                                    customer.put("firstName", full.substring(0, i).trim());
                                    customer.put("lastName", full.substring(i + 1).trim());
                                } else {
                                    customer.put("firstName", full);
                                    customer.put("lastName", "");
                                }
                            }
                        }
                    } catch (Exception e) {
                        log.debug("Could not normalize customer name for appointment {}: {}", id, e.toString());
                    }
                    details.put("customer", customer);

                    // also add flattened name fields for easier frontend consumption
                    try {
                        String fullName = null;
                        if (customer.get("name") != null) fullName = customer.get("name").toString();
                        else if (customer.get("firstName") != null) {
                            String fn = customer.get("firstName").toString();
                            String ln = customer.get("lastName") != null ? customer.get("lastName").toString() : "";
                            fullName = (fn + " " + ln).trim();
                        }

                        if (fullName != null) {
                            details.put("customerName", fullName);
                            if (fullName.contains(" ")) {
                                int idx = fullName.indexOf(' ');
                                details.put("customerFirstName", fullName.substring(0, idx).trim());
                                details.put("customerLastName", fullName.substring(idx + 1).trim());
                            } else {
                                details.put("customerFirstName", fullName);
                                details.put("customerLastName", "");
                            }
                        }
                    } catch (Exception e) {
                        log.debug("Could not compute flattened customer name for appointment {}: {}", id, e.toString());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to enrich appointment {} with customer info: {}", id, e.toString());
        }

        return ResponseEntity.ok(details);
    }
}
