package com.enterprise.authentication.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {
    // MUST match the customer service filter key exactly
    private static final String SECRET_KEY = "your_secret_key_which_should_be_long_enough_for_hmac";
    private static final long EXPIRATION_TIME = 86400000; // 1 day in milliseconds

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    // Generate JWT token with email only (for backward compatibility)
    public String generateToken(String email) {
        return generateToken(email, null, null);
    }

    // Generate JWT token with email, user ID, and role
    public String generateToken(String email, Long userId, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME);

        var builder = Jwts.builder()
                .subject(email)
                .issuedAt(now)
                .expiration(expiryDate);

        // Add user ID and role as claims if provided
        if (userId != null) {
            builder.claim("id", userId);
        }
        if (role != null) {
            builder.claim("role", role);
        }

        return builder.signWith(getSigningKey())
                .compact();
    }

    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, String email) {
        final String extractedEmail = extractEmail(token);
        return (extractedEmail.equals(email) && !isTokenExpired(token));
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private boolean isTokenExpired(String token) {
        return getClaims(token).getExpiration().before(new Date());
    }
}
