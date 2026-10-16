package com.spicehaven.service;

import com.spicehaven.dto.Dto.CustomerAdminRequest;
import com.spicehaven.dto.Dto.CustomerAdminResponse;
import com.spicehaven.dto.Dto.PageResponse;
import com.spicehaven.entity.Customer;
import com.spicehaven.exception.ApiExceptions;
import com.spicehaven.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository customers;

    @Transactional(readOnly = true)
    public PageResponse<CustomerAdminResponse> list(int page, int size) {
        return PageResponse.from(customers.findAllByOrderByCreatedAtDesc(
                PageRequest.of(Math.max(page, 0), Math.max(1, Math.min(size, 100))))
                .map(CustomerAdminResponse::from));
    }

    @Transactional
    public CustomerAdminResponse update(Long id, CustomerAdminRequest request) {
        Customer customer = customers.findById(id)
                .orElseThrow(() -> new ApiExceptions.NotFound("Customer not found"));
        String email = request.email().trim().toLowerCase();
        customers.findByEmail(email).filter(existing -> !existing.getCustomerId().equals(id))
                .ifPresent(existing -> { throw new ApiExceptions.Conflict("Email is already in use"); });
        customer.setFullName(request.fullName().trim());
        customer.setEmail(email);
        customer.setPhone(request.phone().trim());
        return CustomerAdminResponse.from(customers.save(customer));
    }

    @Transactional
    public void delete(Long id) {
        if (!customers.existsById(id)) throw new ApiExceptions.NotFound("Customer not found");
        customers.deleteById(id);
    }
}
