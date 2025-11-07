package com.enterprise.admin.service;

import com.enterprise.admin.entity.ServiceItem;
import com.enterprise.admin.repository.ServiceItemRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ServiceItemService {
    @Autowired
    private ServiceItemRepository repository;

    public List<ServiceItem> listAll() { return repository.findAll(); }

    @Transactional
    public ServiceItem create(String name, String description, Integer estimateMins, BigDecimal cost) {
        if (repository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Service name already exists");
        }
        ServiceItem s = new ServiceItem();
        s.setName(name.trim());
        s.setDescription(description.trim());
        s.setEstimateMins(estimateMins);
        s.setCost(cost);
        s.setActive(true);
        return repository.save(s);
    }

    @Transactional
    public ServiceItem toggleActive(Long id) {
        ServiceItem s = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Service not found"));
        s.setActive(!Boolean.TRUE.equals(s.getActive()));
        return repository.save(s);
    }

    @Transactional
    public ServiceItem update(Long id, String name, String description, Integer estimateMins, BigDecimal cost, Boolean active) {
        ServiceItem s = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Service not found"));
        if (name != null && !name.isBlank() && !s.getName().equalsIgnoreCase(name)) {
            if (repository.existsByNameIgnoreCase(name)) {
                throw new IllegalArgumentException("Service name already exists");
            }
            s.setName(name.trim());
        }
        if (description != null && !description.isBlank()) s.setDescription(description.trim());
        if (estimateMins != null && estimateMins > 0) s.setEstimateMins(estimateMins);
        if (cost != null && cost.compareTo(BigDecimal.ZERO) >= 0) s.setCost(cost);
        if (active != null) s.setActive(active);
        return repository.save(s);
    }
}


