package com.spicehaven.security;

import com.spicehaven.entity.Admin;
import com.spicehaven.repository.AdminRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminBootstrapTests {
    @Test
    void synchronizesConfiguredPasswordForExistingAdmin() throws Exception {
        AdminRepository repository = mock(AdminRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        Admin existingAdmin = new Admin();
        existingAdmin.setEmail("admin@example.com");
        existingAdmin.setPasswordHash("old-hash");
        when(repository.findByEmail("admin@example.com")).thenReturn(Optional.of(existingAdmin));
        when(encoder.encode("configured-password")).thenReturn("new-hash");

        CommandLineRunner seeder = new SecurityConfig().adminSeeder(
                repository, encoder, "Admin@Example.com", "configured-password");
        seeder.run();

        verify(repository).save(existingAdmin);
        org.junit.jupiter.api.Assertions.assertEquals("new-hash", existingAdmin.getPasswordHash());
    }

    @Test
    void skipsAdminBootstrapWhenCredentialsAreMissing() throws Exception {
        AdminRepository repository = mock(AdminRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);

        CommandLineRunner seeder = new SecurityConfig().adminSeeder(repository, encoder, "", "");
        seeder.run();

        verify(repository, never()).save(any());
        verify(encoder, never()).encode(any());
    }
}
