package org.example.customer_service.entities;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import org.example.customer_service.models.ModificationStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "modifications")
public class Modification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

//    @ManyToOne
//    @JoinColumn(name = "customer_id", nullable = false)
//    private Customer customer;


    @Column(name = "vehicle_id", nullable = false)
    private Long vehicleId;


    @Column(name = "appointment_id", nullable = false)
    private Long appointmentId;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double estimatedCost;

    @Enumerated(EnumType.STRING)
    private ModificationStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
