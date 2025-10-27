package org.example.customer_service.entities;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name="customer")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String phone;

    private String password;

    // One customer → many vehicles
    @OneToMany(mappedBy = "customerId", cascade = CascadeType.ALL)
    private List<Vehicle> vehicles;

    // One customer → many appointments
    @OneToMany(mappedBy = "customerId", cascade = CascadeType.ALL)
    private List<Appointment> appointments;
}
