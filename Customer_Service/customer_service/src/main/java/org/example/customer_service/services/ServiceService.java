package org.example.customer_service.services;

import lombok.RequiredArgsConstructor;
import org.example.customer_service.repositories.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceService {

    private final ServiceRepository serviceRepository;

    public List<org.example.customer_service.entities.Service> getAllServices() {
        return serviceRepository.findAll();
    }

    // Dev helper: create a service so local dev environment can be seeded via API
    public org.example.customer_service.entities.Service createService(
            org.example.customer_service.entities.Service service) {
        return serviceRepository.save(service);
    }
}
