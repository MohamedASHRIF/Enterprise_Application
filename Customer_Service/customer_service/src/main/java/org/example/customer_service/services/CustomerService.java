package org.example.customer_service.services;

import org.example.customer_service.entities.Customer;
import org.example.customer_service.repositories.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;


    public Customer saveCustomer(Customer customer) {
        return customerRepository.save(customer);
    }


    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }


    public Optional<Customer> getCustomerById(Long id) {
        return customerRepository.findById(id);
    }


    public Optional<Customer> getCustomerByEmail(String email) {
        return Optional.ofNullable(customerRepository.findByEmail(email));
    }


    public void deleteCustomer(Long id) {
        customerRepository.deleteById(id);
    }
}
