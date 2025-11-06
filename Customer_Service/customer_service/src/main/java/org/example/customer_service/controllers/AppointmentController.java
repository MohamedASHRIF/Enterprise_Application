package org.example.customer_service.controllers;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.customer_service.entities.Appointment;
import org.example.customer_service.entities.Vehicle;
import org.example.customer_service.entities.Service;
import org.example.customer_service.models.AppointmentStatus;
import org.example.customer_service.repositories.VehicleRepository;
import org.example.customer_service.repositories.ServiceRepository;
import org.example.customer_service.services.AppointmentService;
import org.example.customer_service.services.AuthClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final VehicleRepository vehicleRepository;
    private final ServiceRepository serviceRepository;
    private final AuthClientService authClientService;

    @PostMapping("/book")
    public ResponseEntity<?> book(@RequestBody Map<String, Object> requestData, HttpServletRequest req) {
        try {
            String email = getEmail(req);
            if (email == null) {
                return ResponseEntity.status(401).body("Unauthorized: Missing or invalid token");
            }

            // Try to get customerId from JWT token first (faster, no external call)
            Long customerId = getCustomerId(req);
            
            // If not in token, fetch from auth service
            if (customerId == null) {
                customerId = fetchCustomerIdFromAuth(email);
                if (customerId == null) {
                    return ResponseEntity.status(500)
                        .body("Unable to fetch customer ID. Please ensure you are logged in with a valid account.");
                }
            }

            // Create appointment object
            Appointment appointment = new Appointment();
            appointment.setCustomerId(customerId);

            // Get vehicle by ID
            Object vehicleIdObj = requestData.get("vehicleId");
            if (vehicleIdObj == null) {
                return ResponseEntity.status(400).body("Vehicle ID is required");
            }
            Long vehicleId = Long.valueOf(vehicleIdObj.toString());
            Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + vehicleId));
            appointment.setVehicle(vehicle);

            // Get service by ID
            Object serviceIdObj = requestData.get("serviceId");
            if (serviceIdObj == null) {
                return ResponseEntity.status(400).body("Service ID is required");
            }
            Long serviceId = Long.valueOf(serviceIdObj.toString());
            Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found with ID: " + serviceId));
            appointment.setService(service);

            // Set appointment date and time
            if (requestData.containsKey("appointmentDate")) {
                appointment.setAppointmentDate(java.time.LocalDate.parse(requestData.get("appointmentDate").toString()));
            }
            if (requestData.containsKey("appointmentTime")) {
                appointment.setAppointmentTime(requestData.get("appointmentTime").toString());
            }

            // Set notes if provided
            if (requestData.containsKey("notes") && requestData.get("notes") != null) {
                @SuppressWarnings("unchecked")
                List<String> notes = (List<String>) requestData.get("notes");
                appointment.setNotes(notes != null ? notes : new java.util.ArrayList<>());
            }

            // Employee is optional - can be assigned later
            // If not provided, leave it as null

            Appointment saved = appointmentService.bookAppointment(appointment);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.err.println("Error booking appointment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body("Error booking appointment: " + e.getMessage());
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> myAppointments(HttpServletRequest req) {
        Long customerId = getCustomerId(req);
        if (customerId == null) {
            String email = getEmail(req);
            if (email == null) {
                System.err.println("No email found in request - token may be invalid");
                return ResponseEntity.status(401).body("Unauthorized: Invalid or missing token");
            }

            System.out.println("Fetching customerId for email: " + email);
            customerId = fetchCustomerIdFromAuth(email);
            if (customerId == null) {
                System.err.println("Failed to fetch customerId for email: " + email);
                return ResponseEntity.status(500)
                    .body("Unable to fetch customer ID. The user with email '" + email + 
                          "' may not exist in the auth service. Please ensure you are logged in with a valid account.");
            }
            System.out.println("Successfully fetched customerId: " + customerId + " for email: " + email);
        }

        List<Appointment> list = appointmentService.getAppointmentsByCustomer(customerId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/customer/{customerId}")
    public List<Appointment> getAppointmentsByCustomer(@PathVariable Long customerId) {
        return appointmentService.getAppointmentsByCustomer(customerId);
    }

    @PutMapping("/{id}/status")
    public Appointment updateStatus(@PathVariable Long id, @RequestParam AppointmentStatus status) {
        return appointmentService.updateAppointmentStatus(id, status);
    }
    @GetMapping("/count")
    public Long getAppointmentCountByStatus(@RequestParam AppointmentStatus status) {
        return appointmentService.getAppointmentCountByStatus(status);
    }
    @GetMapping("/{id}")
    public Appointment getAppointmentById(@PathVariable Long id) {
        return appointmentService.getAppointmentById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));
    }

    @DeleteMapping("/{id}")
    public String deleteAppointment(@PathVariable Long id) {
        boolean deleted = appointmentService.deleteAppointment(id);
        if (deleted) {
            return "Appointment deleted successfully with ID: " + id;
        } else {
            return "Appointment not found with ID: " + id;
        }
    }

    // Helper methods to extract JWT claims from request
    private String getEmail(HttpServletRequest request) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims != null) {
            return claims.getSubject();
        }
        return null;
    }

    private Long getCustomerId(HttpServletRequest request) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims != null) {
            Object id = claims.get("id");
            if (id != null) {
                if (id instanceof Long) {
                    return (Long) id;
                } else if (id instanceof Number) {
                    return ((Number) id).longValue();
                }
            }
        }
        return null;
    }

    private Long fetchCustomerIdFromAuth(String email) {
        return authClientService.getCustomerIdByEmail(email);
    }
}
