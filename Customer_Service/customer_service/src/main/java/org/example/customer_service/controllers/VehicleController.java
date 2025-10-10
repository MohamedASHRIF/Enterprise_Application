package org.example.customer_service.controllers;

import org.example.customer_service.entities.Vehicle;
import org.example.customer_service.services.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @PostMapping("/add/{customerId}")
    public ResponseEntity<Vehicle> addVehicle(@PathVariable Long customerId, @RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(vehicleService.addVehicle(customerId, vehicle));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Vehicle>> getVehiclesByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(vehicleService.getVehiclesByCustomer(customerId));
    }
}
