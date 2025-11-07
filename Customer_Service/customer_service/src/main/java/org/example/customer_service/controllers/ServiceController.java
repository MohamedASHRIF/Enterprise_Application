package org.example.customer_service.controllers;

import lombok.RequiredArgsConstructor;
import org.example.customer_service.services.ServiceService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@CrossOrigin
public class ServiceController {

    private final ServiceService serviceService;

    @GetMapping("/all")
    public List<org.example.customer_service.entities.Service> getAllServices() {
        return serviceService.getAllServices();
    }

    // Dev-only: create a service (useful to seed local DB)
    @PostMapping("/create")
    public org.example.customer_service.entities.Service createService(
            @RequestBody org.example.customer_service.entities.Service service) {
        return serviceService.createService(service);
    }
}
