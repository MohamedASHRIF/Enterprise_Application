package org.example.customer_service.controllers;

import lombok.RequiredArgsConstructor;
import org.example.customer_service.dto.CustomerSummaryDto;
import org.example.customer_service.dto.VehicleSummaryDto;
import org.example.customer_service.entities.Customer;
import org.example.customer_service.entities.Vehicle;
import org.example.customer_service.services.CustomerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/customers")
@RequiredArgsConstructor
public class CustomerPublicController {

    private final CustomerService customerService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getCustomerPublic(@PathVariable Long id) {
        return customerService.getCustomerById(id)
                .map(c -> {
                    CustomerSummaryDto dto = new CustomerSummaryDto();
                    dto.setId(c.getId());
                    dto.setName(c.getName());
                    dto.setEmail(c.getEmail());
                    dto.setPhone(c.getPhone());

                    List<Vehicle> vehicles = c.getVehicles();
                    if (vehicles != null) {
                        List<VehicleSummaryDto> vs = vehicles.stream().map(v -> {
                            VehicleSummaryDto vd = new VehicleSummaryDto();
                            vd.setId(v.getId());
                            vd.setMake(v.getMake());
                            vd.setModel(v.getModel());
                            vd.setYear(v.getYear());
                            vd.setColor(v.getColor());
                            vd.setPlate(v.getPlate());
                            vd.setCustomerId(v.getCustomerId());
                            return vd;
                        }).collect(Collectors.toList());
                        dto.setVehicles(vs);
                    }

                    return ResponseEntity.ok(dto);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
