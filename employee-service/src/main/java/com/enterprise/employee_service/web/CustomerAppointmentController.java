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
        return ResponseEntity.ok(details);
    }
}
