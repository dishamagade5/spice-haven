package com.spicehaven;

import com.spicehaven.service.JwtService;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtServiceTests {
    @Test
    void generatesProcessLocalKeyWhenSecretIsNotConfigured() {
        JwtService service = new JwtService("", 120);
        String token = service.generate("customer@example.com", "CUSTOMER");

        assertEquals("customer@example.com", service.parse(token).getSubject());
        assertEquals("CUSTOMER", service.parse(token).get("role", String.class));
        assertThrows(JwtException.class, () -> new JwtService("", 120).parse(token));
    }
}
