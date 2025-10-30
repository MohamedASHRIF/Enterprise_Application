package org.example.customer_service.entities;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "vehicles")
public class    Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String make;
    private String model;
    private int year;
    private String color;

    @Column(unique = true, nullable = false)
    private String plate;

    @Column(name = "customer_id", nullable = false)
    private long customerId;

    @Column(unique = true, nullable = false)
    private String VIN;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL)
    private List<Appointment> appointments = new ArrayList<>();
}
