package com.spicehaven.service;

import com.spicehaven.dto.Dto.*;
import com.spicehaven.entity.Admin;
import com.spicehaven.entity.Customer;
import com.spicehaven.exception.ApiExceptions;
import com.spicehaven.repository.AdminRepository;
import com.spicehaven.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AdminRepository admins;
    private final CustomerRepository customers;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public TokenResponse login(LoginRequest r) {
        String email = r.email().trim().toLowerCase();
        Admin admin = admins.findByEmail(email)
                .filter(a -> encoder.matches(r.password(), a.getPasswordHash()))
                .orElseThrow(() -> new ApiExceptions.Unauthorized("Invalid email or password"));
        return new TokenResponse(jwt.generate(admin), jwt.expiryMinutes(), admin.getName(),
                admin.getAdminId(), admin.getEmail(), null, "ADMIN");
    }

    public TokenResponse register(CustomerRegistrationRequest request) {
        String email = request.email().trim().toLowerCase();
        if (customers.findByEmail(email).isPresent())
            throw new ApiExceptions.Conflict("An account with this email already exists");

        Customer customer = new Customer();
        customer.setFullName(request.fullName().trim());
        customer.setEmail(email);
        customer.setPhone(request.phone().trim());
        customer.setPasswordHash(encoder.encode(request.password()));
        Customer saved = customers.save(customer);
        return customerToken(saved);
    }

    public TokenResponse loginCustomer(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        Customer customer = customers.findByEmail(email)
                .filter(c -> encoder.matches(request.password(), c.getPasswordHash()))
                .orElseThrow(() -> new ApiExceptions.Unauthorized("Invalid email or password"));
        return customerToken(customer);
    }

    private TokenResponse customerToken(Customer customer) {
        return new TokenResponse(jwt.generate(customer.getEmail(), "CUSTOMER"), jwt.expiryMinutes(),
                customer.getFullName(), customer.getCustomerId(), customer.getEmail(), customer.getPhone(), "CUSTOMER");
    }

    public CustomerProfile customerProfile(String email) {
        Customer customer = customers.findByEmail(email)
                .orElseThrow(() -> new ApiExceptions.NotFound("Customer account not found"));
        return new CustomerProfile(customer.getCustomerId(), customer.getFullName(), customer.getEmail(),
                customer.getPhone());
    }
}
