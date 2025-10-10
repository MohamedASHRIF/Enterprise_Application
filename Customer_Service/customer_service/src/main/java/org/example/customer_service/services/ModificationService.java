package org.example.customer_service.services;

import org.example.customer_service.entities.Customer;
import org.example.customer_service.entities.Modification;
import org.example.customer_service.entities.Vehicle;
import org.example.customer_service.models.AppointmentStatus;
import org.example.customer_service.repositories.CustomerRepository;
import org.example.customer_service.repositories.ModificationRepository;
import org.example.customer_service.repositories.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ModificationService {

    @Autowired
    private ModificationRepository modificationRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    public Modification requestModification(Modification modification) {
        Customer customer = customerRepository.findById(modification.getCustomer().getId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        Vehicle vehicle = vehicleRepository.findById(modification.getVehicle().getId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        modification.setCustomer(customer);
        modification.setVehicle(vehicle);
        modification.setStatus(AppointmentStatus.BOOKED);
        return modificationRepository.save(modification);
    }

    public List<Modification> getByCustomer(Long customerId) {
        return modificationRepository.findByCustomerId(customerId);
    }

    public Modification updateStatus(Long id, String status) {
        Modification modification = modificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Modification not found"));
        modification.setStatus(AppointmentStatus.valueOf(status.toUpperCase()));
        return modificationRepository.save(modification);
    }
}
