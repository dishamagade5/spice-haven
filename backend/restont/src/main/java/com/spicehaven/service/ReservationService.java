package com.spicehaven.service;

import com.spicehaven.dto.Dto.*;
import com.spicehaven.entity.Enums.ReservationStatus;
import com.spicehaven.entity.Reservation;
import com.spicehaven.exception.ApiExceptions;
import com.spicehaven.repository.ReservationRepository;
import com.spicehaven.dto.Dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {
    private static final ZoneId RESTAURANT_TZ = ZoneId.of("Asia/Kolkata");
    private final ReservationRepository repo;

    @Transactional
    public ReservationResponse create(ReservationRequest r) {
        if (LocalDateTime.of(r.reservationDate(), r.reservationTime()).isBefore(LocalDateTime.now(RESTAURANT_TZ)))
            throw new ApiExceptions.BadRequest("Reservation date and time must be in the future");
        Reservation e = new Reservation();
        e.setCustomerName(r.customerName().trim());
        e.setPhoneNumber(r.phoneNumber().trim());
        e.setEmail(r.email().trim());
        e.setReservationDate(r.reservationDate());
        e.setReservationTime(r.reservationTime());
        e.setNumberOfGuests(r.numberOfGuests());
        e.setMessage(r.message());
        return ReservationResponse.from(repo.save(e));
    }

    @Transactional(readOnly = true)
    public PageResponse<ReservationResponse> list(String status, LocalDate date, int page, int size) {
        Pageable p = PageRequest.of(Math.max(page, 0), Math.max(1, Math.min(size, 100)));
        ReservationStatus parsedStatus = status == null || status.isBlank() ? null : parse(status);
        return PageResponse.from(repo.findFiltered(parsedStatus, date, p).map(ReservationResponse::from));
    }

    @Transactional
    public ReservationResponse updateStatus(Long id, String status) {
        Reservation r = repo.findById(id).orElseThrow(() -> new ApiExceptions.NotFound("Reservation not found"));
        r.setStatus(parse(status));
        return ReservationResponse.from(repo.save(r));
    }

    private ReservationStatus parse(String s) {
        try {
            return ReservationStatus.valueOf(s.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiExceptions.BadRequest("Unknown reservation status: " + s);
        }
    }
}
