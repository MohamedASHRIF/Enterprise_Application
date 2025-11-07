package org.example.customer_service.controllers;

import org.example.customer_service.entities.Customer;
import org.example.customer_service.services.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerService customerService;
    private static final Logger logger = LoggerFactory.getLogger(CustomerController.class);

    // Create or update customer
    @PostMapping
    public ResponseEntity<Customer> createOrUpdateCustomer(@RequestBody Customer customer) {
        logger.info("Customer-service: received createOrUpdateCustomer request payload={}", customer);
        Customer savedCustomer = customerService.saveCustomer(customer);
        logger.info("Customer-service: saved customer id={} email={}", savedCustomer.getId(), savedCustomer.getEmail());
        return ResponseEntity.ok(savedCustomer);
    }

    

    // Get customer by ID
    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
        Optional<Customer> customer = customerService.getCustomerById(id);
        return customer.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get customer by Email
    @GetMapping("/email/{email}")
    public ResponseEntity<Customer> getCustomerByEmail(@PathVariable String email) {
        Optional<Customer> customer = customerService.getCustomerByEmail(email);
        return customer.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    // Delete customer
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok("Customer deleted successfully");
    }
}
