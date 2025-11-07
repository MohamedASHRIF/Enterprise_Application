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

    // Link back to Auth service user id (nullable for legacy rows)
    @Column(name = "user_id", unique = true)
    private Long userId;

    // One customer → many vehicles
    @OneToMany(mappedBy = "customerId", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Vehicle> vehicles;

    // One customer → many appointments
    @OneToMany(mappedBy = "customerId", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Appointment> appointments;
}
