package org.example.customer_service.services;

import org.example.customer_service.entities.Customer;
import org.example.customer_service.repositories.CustomerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    private static final Logger log = LoggerFactory.getLogger(CustomerService.class);


    public Customer saveCustomer(Customer customer) {
        try {
            return customerRepository.save(customer);
        } catch (Exception ex) {
            // If the customers table is missing or repository fails, swallow and return the provided object
            log.warn("Customer persistence unavailable (customers table may be removed) - save skipped: {}", ex.getMessage());
            return customer;
        }
    }


    public List<Customer> getAllCustomers() {
        try {
            return customerRepository.findAll();
        } catch (Exception ex) {
            log.warn("Customer repository unavailable - returning empty list: {}", ex.getMessage());
            return Collections.emptyList();
        }
    }


    public Optional<Customer> getCustomerById(Long id) {
        try {
            return customerRepository.findById(id);
        } catch (Exception ex) {
            log.warn("Customer repository unavailable - getCustomerById({}) returning empty: {}", id, ex.getMessage());
            return Optional.empty();
        }
    }


    public Optional<Customer> getCustomerByEmail(String email) {
        try {
            return Optional.ofNullable(customerRepository.findByEmail(email));
        } catch (Exception ex) {
            log.warn("Customer repository unavailable - getCustomerByEmail({}) returning empty: {}", email, ex.getMessage());
            return Optional.empty();
        }
    }

    public Optional<Customer> getCustomerByUserId(Long userId) {
        try {
            return Optional.ofNullable(customerRepository.findByUserId(userId));
        } catch (Exception ex) {
            log.warn("Customer repository unavailable - getCustomerByUserId({}) returning empty: {}", userId, ex.getMessage());
            return Optional.empty();
        }
    }


    public void deleteCustomer(Long id) {
        try {
            customerRepository.deleteById(id);
        } catch (Exception ex) {
            log.warn("Customer repository unavailable - deleteCustomer({}) skipped: {}", id, ex.getMessage());
        }
    }
}
