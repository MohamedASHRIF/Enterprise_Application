package org.example.customer_service.controllers;

import lombok.RequiredArgsConstructor;
import org.example.customer_service.entities.Vehicle;
import org.example.customer_service.services.VehicleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.security.Principal;
import org.example.customer_service.entities.Customer;
import org.example.customer_service.services.CustomerService;

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

    @Deprecated
    @GetMapping("/customer/{customerId}")
    public List<Vehicle> getByCustomer(@PathVariable Long customerId) {
        // Deprecated: kept for backward compatibility. Use /user/{userId} or /me instead.
        return vehicleService.getVehiclesByUserId(customerId);
    }

    /**
     * Return vehicles for the currently authenticated user. Resolves the linked
     * Customer by userId and returns vehicles for that customer.
     */
    @GetMapping("/me")
    public List<Vehicle> getMyVehicles(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new RuntimeException("Unauthenticated");
        }
        Long userId;
        try {
            userId = Long.parseLong(principal.getName());
        } catch (NumberFormatException nfe) {
            throw new RuntimeException("Unexpected principal name format; expected numeric user id");
        }

        return vehicleService.getVehiclesByUserId(userId);
    }

    /**
     * Return vehicles for a given application user id. Convenience endpoint for
     * other services that have the application user id.
     */
    @GetMapping("/user/{userId}")
    public List<Vehicle> getVehiclesByUserId(@PathVariable Long userId) {
        return vehicleService.getVehiclesByUserId(userId);
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
