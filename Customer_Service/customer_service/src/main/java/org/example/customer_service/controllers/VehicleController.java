package org.example.customer_service.controllers;

import lombok.RequiredArgsConstructor;
import org.example.customer_service.entities.Vehicle;
import org.example.customer_service.services.VehicleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    public Vehicle addVehicle(@RequestBody Vehicle vehicle) {
        // Accept vehicles without VIN now (nullable). Save directly.
        return vehicleService.addVehicle(vehicle);
    }

    @GetMapping("/customer/{customerId}")
    public List<Vehicle> getByCustomer(@PathVariable Long customerId) {
        return vehicleService.getVehiclesByCustomer(customerId);
    }

    @PutMapping
    public Vehicle updateVehicle(@RequestBody Vehicle vehicle) {
        return vehicleService.updateVehicle(vehicle);
    }

    @DeleteMapping("/{id}")
    public void deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
    }
}
