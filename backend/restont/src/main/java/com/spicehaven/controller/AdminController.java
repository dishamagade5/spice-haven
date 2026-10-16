package com.spicehaven.controller;

import com.spicehaven.dto.Dto.*;
import com.spicehaven.service.MenuService;
import com.spicehaven.service.OrderService;
import com.spicehaven.service.ReservationService;
import com.spicehaven.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.util.List;

/** Admin endpoints - every route requires a valid JWT with role ADMIN. */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {
    private final MenuService menu;
    private final OrderService orders;
    private final ReservationService reservations;
    private final CustomerService customers;

    @GetMapping("/customers")
    public PageResponse<CustomerAdminResponse> customers(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return customers.list(page, size);
    }

    @PutMapping("/customers/{id}")
    public CustomerAdminResponse updateCustomer(@PathVariable Long id, @Valid @RequestBody CustomerAdminRequest request) {
        return customers.update(id, request);
    }

    @DeleteMapping("/customers/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customers.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public StatsResponse stats() {
        return orders.stats();
    }

    // ----- menu -----
    @GetMapping("/menu")
    public List<MenuResponse> menu() {
        return menu.listAdmin();
    }

    @PostMapping(value = "/menu", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MenuResponse> add(@Valid @RequestPart("dish") MenuRequest r,
            @RequestPart("image") MultipartFile image) {
        return ResponseEntity.status(HttpStatus.CREATED).body(menu.create(r, image));
    }

    @PutMapping(value = "/menu/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public MenuResponse update(@PathVariable Long id, @Valid @RequestPart("dish") MenuRequest r,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return menu.update(id, r, image);
    }

    @PatchMapping("/menu/{id}/price")
    public MenuResponse price(@PathVariable Long id, @Valid @RequestBody PriceRequest r) {
        return menu.updatePrice(id, r.price());
    }

    @PatchMapping("/menu/{id}/availability")
    public MenuResponse availability(@PathVariable Long id, @RequestBody AvailabilityRequest r) {
        return menu.setAvailable(id, r.isAvailable());
    }

    @DeleteMapping("/menu/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        menu.softDelete(id);
        return ResponseEntity.noContent().build();
    }

    // ----- orders -----
    @GetMapping("/orders")
    public PageResponse<OrderResponse> orders(@RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return orders.list(status, page, size);
    }

    @GetMapping("/orders/{id}")
    public OrderResponse order(@PathVariable Long id) {
        return orders.get(id);
    }

    @PatchMapping("/orders/{id}/status")
    public OrderResponse orderStatus(@PathVariable Long id, @Valid @RequestBody StatusRequest r) {
        return orders.updateStatus(id, r.status());
    }

    // ----- reservations -----
    @GetMapping("/reservations")
    public PageResponse<ReservationResponse> reservations(@RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return reservations.list(status, date, page, size);
    }

    @PatchMapping("/reservations/{id}/status")
    public ReservationResponse reservationStatus(@PathVariable Long id, @Valid @RequestBody StatusRequest r) {
        return reservations.updateStatus(id, r.status());
    }
}
