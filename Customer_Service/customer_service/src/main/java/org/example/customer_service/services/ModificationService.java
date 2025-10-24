package org.example.customer_service.services;

import org.example.customer_service.entities.Appointment;
import org.example.customer_service.entities.Customer;
import org.example.customer_service.entities.Modification;
import org.example.customer_service.entities.Vehicle;
import org.example.customer_service.models.ModificationStatus;
import org.example.customer_service.repositories.AppointmentRepository;
import org.example.customer_service.repositories.CustomerRepository;
import org.example.customer_service.repositories.ModificationRepository;
import org.example.customer_service.repositories.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ModificationService {

    @Autowired
    private ModificationRepository modificationRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    // Customer requests a modification for an existing appointment
    public Modification requestModification(Long appointmentId, Modification modification) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Customer customer = customerRepository.findById(modification.getCustomer().getId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Vehicle vehicle = vehicleRepository.findById(modification.getVehicle().getId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        modification.setAppointment(appointment);
        modification.setCustomer(customer);
        modification.setVehicle(vehicle);
        modification.setStatus(ModificationStatus.REQUESTED);
        modification.setCreatedAt(LocalDateTime.now());
        modification.setUpdatedAt(LocalDateTime.now());

        return modificationRepository.save(modification);
    }

    //  Admin updates the modification status (approve, in-progress, completed, etc.)
    public Modification updateModificationStatus(Long id, String status) {
        Modification modification = modificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Modification not found"));
        modification.setStatus(ModificationStatus.valueOf(status.toUpperCase()));
        modification.setUpdatedAt(LocalDateTime.now());
        return modificationRepository.save(modification);
    }

    //  Get all modifications for a particular appointment
    public List<Modification> getModificationsByAppointment(Long appointmentId) {
        return modificationRepository.findByAppointmentId(appointmentId);
    }

    // Get all modifications for a specific customer
    public List<Modification> getByCustomer(Long customerId) {
        return modificationRepository.findByCustomerId(customerId);
    }
}
