package com.spicehaven.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "reservation")
@Getter
@Setter
@NoArgsConstructor
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_id")
    private Long reservationId;
    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;
    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;
    @Column(nullable = false, length = 150)
    private String email;
    @Column(name = "reservation_date", nullable = false)
    private LocalDate reservationDate;
    @Column(name = "reservation_time", nullable = false)
    private LocalTime reservationTime;
    @Column(name = "number_of_guests", nullable = false)
    private int numberOfGuests;
    @Column(length = 500)
    private String message;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Enums.ReservationStatus status = Enums.ReservationStatus.PENDING;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
