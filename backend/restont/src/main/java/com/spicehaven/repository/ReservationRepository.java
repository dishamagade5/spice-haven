package com.spicehaven.repository;

import com.spicehaven.entity.Enums.ReservationStatus;
import com.spicehaven.entity.Reservation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    @Query(value = """
            select r from Reservation r
            where (:status is null or r.status = :status)
              and (:date is null or r.reservationDate = :date)
            order by r.createdAt desc
            """,
            countQuery = """
                    select count(r) from Reservation r
                    where (:status is null or r.status = :status)
                      and (:date is null or r.reservationDate = :date)
                    """)
    Page<Reservation> findFiltered(ReservationStatus status, LocalDate date, Pageable pageable);
}
