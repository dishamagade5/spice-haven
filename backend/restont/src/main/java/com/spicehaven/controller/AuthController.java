package com.spicehaven.controller;

import com.spicehaven.dto.Dto.*;
import com.spicehaven.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService auth;

    @PostMapping("/admin/auth/login")
    public TokenResponse login(@Valid @RequestBody LoginRequest req) {
        return auth.login(req);
    }

    @PostMapping("/customer/register")
    public TokenResponse registerCustomer(@Valid @RequestBody CustomerRegistrationRequest req) {
        return auth.register(req);
    }

    @PostMapping("/customer/login")
    public TokenResponse loginCustomer(@Valid @RequestBody LoginRequest req) {
        return auth.loginCustomer(req);
    }
}
