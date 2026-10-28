package com.spicehaven.controller;

import com.spicehaven.dto.Dto.OnlineOrderRequest;
import com.spicehaven.dto.Dto.OrderResponse;
import com.spicehaven.dto.Dto.PaymentVerificationRequest;
import com.spicehaven.dto.Dto.RazorpayOrderResponse;
import com.spicehaven.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService payments;

    @PostMapping("/create-order")
    public RazorpayOrderResponse createOrder(@Valid @RequestBody OnlineOrderRequest request, Principal principal) {
        return payments.createOrder(request, principal.getName());
    }

    @PostMapping("/verify")
    public OrderResponse verifyPayment(@Valid @RequestBody PaymentVerificationRequest request, Principal principal) {
        return payments.verifyPayment(request, principal.getName());
    }
}
