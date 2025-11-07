package org.example.customer_service.services;

import lombok.RequiredArgsConstructor;
import org.example.customer_service.entities.Vehicle;
import org.example.customer_service.repositories.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public Vehicle addVehicle(Vehicle vehicle) {
        Objects.requireNonNull(vehicle, "vehicle must not be null");
        normalizeVehicle(vehicle);
        return vehicleRepository.save(vehicle);
    }

    public List<Vehicle> getVehiclesByCustomer(Long customerId) {
        return vehicleRepository.findByCustomerId(customerId);
    }

    public Vehicle updateVehicle(Vehicle vehicle) {
        Objects.requireNonNull(vehicle, "vehicle must not be null");
        normalizeVehicle(vehicle);
        return vehicleRepository.save(vehicle);
    }

    public void deleteVehicle(Long id) {
        Objects.requireNonNull(id, "id must not be null");
        vehicleRepository.deleteById(id);
    }

    private void normalizeVehicle(Vehicle vehicle) {
        if (vehicle.getPlate() != null) {
            vehicle.setPlate(vehicle.getPlate().trim().toUpperCase());
        }

        if (vehicle.getColor() != null) {
            String color = vehicle.getColor().trim();
            vehicle.setColor(color.isEmpty() ? null : color);
        }

        if (vehicle.getVin() != null) {
            String vin = vehicle.getVin().trim();
            vehicle.setVin(vin.isEmpty() ? null : vin.toUpperCase());
        }
    }
}
