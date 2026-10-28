package com.spicehaven.controller;

import com.spicehaven.dto.Dto.*;
import com.spicehaven.entity.MenuImage;
import com.spicehaven.service.MenuService;
import com.spicehaven.service.OrderService;
import com.spicehaven.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.security.Principal;

/** Customer-facing endpoints (no login). */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PublicController {
    private final MenuService menu;
    private final OrderService orders;
    private final ReservationService reservations;
    private final com.spicehaven.service.AuthService auth;

    @GetMapping("/menu")
    public List<PublicMenuResponse> menu() {
        return menu.list();
    }

    @GetMapping("/menu/{id}")
    public PublicMenuResponse menuItem(@PathVariable Long id) {
        return menu.get(id);
    }

    @GetMapping("/menu/{id}/image")
    public ResponseEntity<byte[]> menuImage(@PathVariable Long id) {
        MenuImage image = menu.getImage(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.getContentType()))
                .body(image.getData());
    }

    @GetMapping("/menu/category/{category}")
    public List<PublicMenuResponse> byCategory(@PathVariable String category) {
        return menu.byCategory(category);
    }

    @PostMapping("/orders")
    public ResponseEntity<OrderResponse> placeOrder(@Valid @RequestBody OrderRequest req, Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orders.create(req, principal.getName()));
    }

    @GetMapping("/orders/{id}")
    public OrderResponse track(@PathVariable Long id, @RequestParam String phone) {
        return orders.track(id, phone);
    }

    @PostMapping("/reservations")
    public ResponseEntity<ReservationResponse> reserve(@Valid @RequestBody ReservationRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservations.create(req));
    }

    @GetMapping("/customer/orders")
    public List<OrderResponse> customerOrders(Principal principal) {
        return orders.listForCustomer(principal.getName());
    }

    @GetMapping("/customer/profile")
    public CustomerProfile customerProfile(Principal principal) {
        return auth.customerProfile(principal.getName());
    }
}
