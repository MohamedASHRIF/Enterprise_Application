package org.example.customer_service.services;

import lombok.RequiredArgsConstructor;
import org.example.customer_service.entities.Vehicle;
import org.example.customer_service.repositories.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public Vehicle addVehicle(Vehicle vehicle) {
        // If a plate was provided, reject duplicate plates with 409 to give a clear, user-friendly error
        if (vehicle.getPlate() != null && !vehicle.getPlate().isBlank()) {
            // normalize plate check (trim) — repository method handles exact match
            String plate = vehicle.getPlate().trim();
            if (vehicleRepository.existsByPlate(plate)) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.CONFLICT,
                        "A vehicle with this plate already exists"
                );
            }
            vehicle.setPlate(plate);
        }

        return vehicleRepository.save(vehicle);
    }

    public List<Vehicle> getVehiclesByCustomer(Long customerId) {
        return vehicleRepository.findByCustomerId(customerId);
    }

    public Vehicle updateVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public void deleteVehicle(Long id) {
        vehicleRepository.deleteById(id);
    }
}
