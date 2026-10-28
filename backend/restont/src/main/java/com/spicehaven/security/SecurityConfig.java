package com.spicehaven.security;

import com.spicehaven.entity.Admin;
import com.spicehaven.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, JwtFilter jwtFilter,
            CorsConfigurationSource corsSource) throws Exception {
        http.csrf(c -> c.disable()) // stateless token API, no cookies
                .cors(cors -> cors.configurationSource(corsSource))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(
                        e -> e.authenticationEntryPoint((req, res, ex) -> res.sendError(401, "Unauthorized")))
                .authorizeHttpRequests(a -> a
                        .requestMatchers(HttpMethod.GET, "/api/menu/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/orders/*").permitAll() // tracking: id + phone required
                        .requestMatchers(HttpMethod.POST, "/api/reservations").permitAll()
                        .requestMatchers("/api/admin/auth/login", "/api/customer/register", "/api/customer/login",
                                "/actuator/health").permitAll()
                        .requestMatchers("/api/payments/**").hasRole("CUSTOMER")
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll() // remove
                                                                                                              // in
                                                                                                              // production
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/customer/**").hasRole("CUSTOMER")
                        .requestMatchers(HttpMethod.POST, "/api/orders").hasRole("CUSTOMER")
                        .anyRequest().denyAll())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CorsConfigurationSource corsSource(@Value("${spicehaven.cors.allowed-origin}") String origins) {
        CorsConfiguration c = new CorsConfiguration();
        List<String> allowedOrigins = new ArrayList<>(List.of("http://localhost:5173"));
        for (String origin : origins.split(",")) {
            String trimmedOrigin = origin.trim();
            if (!trimmedOrigin.isEmpty() && !allowedOrigins.contains(trimmedOrigin)) {
                allowedOrigins.add(trimmedOrigin);
            }
        }
        c.setAllowedOrigins(allowedOrigins);
        c.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        c.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
        s.registerCorsConfiguration("/**", c);
        return s;
    }

    /** Creates or synchronizes the configured admin account without storing its password in source. */
    @Bean
    CommandLineRunner adminSeeder(AdminRepository repo, PasswordEncoder enc,
            @Value("${spicehaven.admin.email}") String email,
            @Value("${spicehaven.admin.password}") String password) {
        return args -> {
            String normalizedEmail = email.trim().toLowerCase();
            if (normalizedEmail.isBlank() || password.isBlank()) {
                logger.warn("Admin bootstrap skipped; set both SPICEHAVEN_ADMIN_EMAIL and SPICEHAVEN_ADMIN_PASSWORD to create or reset the configured admin account.");
                return;
            }

            Admin admin = repo.findByEmail(normalizedEmail).orElseGet(() -> {
                Admin created = new Admin();
                created.setName("Administrator");
                created.setEmail(normalizedEmail);
                return created;
            });
            admin.setPasswordHash(enc.encode(password));
            repo.save(admin);
            logger.info("Configured admin account is ready for sign-in: {}", normalizedEmail);
        };
    }
}
