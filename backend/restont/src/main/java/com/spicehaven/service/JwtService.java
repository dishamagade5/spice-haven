package com.spicehaven.service;

import com.spicehaven.entity.Admin;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class JwtService {
    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);
    private final SecretKey key;
    private final long minutes;

    public JwtService(@Value("${spicehaven.jwt.secret:}") String secret,
            @Value("${spicehaven.jwt.expiry-minutes}") long minutes) {
        if (secret == null || secret.isBlank()) {
            this.key = Jwts.SIG.HS256.key().build();
            logger.warn("No JWT secret configured; using a process-local signing key. Tokens will expire when the application restarts.");
        } else {
            this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        }
        this.minutes = minutes;
    }

    public String generate(Admin a) {
        return generate(a.getEmail(), a.getRole());
    }

    public String generate(String subject, String role) {
        Date now = new Date();
        return Jwts.builder().subject(subject).claim("role", role)
                .issuedAt(now).expiration(new Date(now.getTime() + minutes * 60_000))
                .signWith(key).compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public long expiryMinutes() {
        return minutes;
    }
}
