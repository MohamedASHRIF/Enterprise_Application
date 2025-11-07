package org.example.customer_service.controllers;

import lombok.RequiredArgsConstructor;
import org.example.customer_service.services.ServiceService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/services")
@RequiredArgsConstructor
@CrossOrigin
public class ServiceController {


    private ServiceService serviceService;

    @GetMapping("/all")
    public List<org.example.customer_service.entities.Service> getAllServices() {
        return serviceService.getAllServices();
    }
}
