package org.example.customer_service.services;

import org.example.customer_service.entities.Customer;
import org.example.customer_service.entities.Vehicle;
import org.example.customer_service.repositories.CustomerRepository;
import org.example.customer_service.repositories.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private CustomerRepository customerRepository;

    public Vehicle addVehicle(Long customerId, Vehicle vehicle) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        vehicle.setCustomer(customer);
        return vehicleRepository.save(vehicle);
    }

    public List<Vehicle> getVehiclesByCustomer(Long customerId) {
        return vehicleRepository.findByCustomerId(customerId);
    }
}
