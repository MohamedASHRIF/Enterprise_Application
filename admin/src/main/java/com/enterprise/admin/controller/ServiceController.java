package com.enterprise.admin.controller;

import com.enterprise.admin.entity.ServiceItem;
import com.enterprise.admin.service.ServiceItemService;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/services")
public class ServiceController {
    @Autowired
    private ServiceItemService service;

    @GetMapping
    public ResponseEntity<List<ServiceItem>> list() {
        return ResponseEntity.ok(service.listAll());
    }

    public record CreateRequest(@NotBlank String name, @NotBlank String description,
                                @Min(1) Integer estimateMins, BigDecimal cost) {}

    @PostMapping
    public ResponseEntity<ServiceItem> create(@RequestBody CreateRequest req) {
        ServiceItem created = service.create(req.name(), req.description(), req.estimateMins(), req.cost());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggle(@PathVariable Long id) {
        ServiceItem updated = service.toggleActive(id);
        return ResponseEntity.ok(Map.of("id", updated.getId(), "active", updated.getActive()));
    }

    public record UpdateRequest(String name, String description, Integer estimateMins, BigDecimal cost, Boolean active) {}

    @PutMapping("/{id}")
    public ResponseEntity<ServiceItem> update(@PathVariable Long id, @RequestBody UpdateRequest req) {
        ServiceItem updated = service.update(id, req.name(), req.description(), req.estimateMins(), req.cost(), req.active());
        return ResponseEntity.ok(updated);
    }
}


