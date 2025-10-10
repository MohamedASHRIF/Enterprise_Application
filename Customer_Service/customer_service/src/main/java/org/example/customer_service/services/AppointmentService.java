package org.example.customer_service.services;

import org.example.customer_service.entities.Appointment;
import org.example.customer_service.entities.Customer;
import org.example.customer_service.entities.Vehicle;
import org.example.customer_service.models.AppointmentStatus;
import org.example.customer_service.repositories.AppointmentRepository;
import org.example.customer_service.repositories.CustomerRepository;
import org.example.customer_service.repositories.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    public Appointment bookAppointment(Appointment appointment) {
        Customer customer = customerRepository.findById(appointment.getCustomer().getId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        Vehicle vehicle = vehicleRepository.findById(appointment.getVehicle().getId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        appointment.setCustomer(customer);
        appointment.setVehicle(vehicle);
        appointment.setStatus(AppointmentStatus.BOOKED);
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAppointmentsByCustomer(Long customerId) {
        return appointmentRepository.findByCustomerId(customerId);
    }

    public Appointment updateAppointmentStatus(Long id, String status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(AppointmentStatus.valueOf(status.toUpperCase()));
        return appointmentRepository.save(appointment);
    }
}
