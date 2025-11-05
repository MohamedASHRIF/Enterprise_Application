package com.enterprise.authentication.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    // MUST match the customer service filter key exactly
    private static final String SECRET_KEY = "your_secret_key_which_should_be_long_enough_for_hmac";
    private static final long EXPIRATION_TIME = 86400000; // 1 day in milliseconds

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    // Generate JWT token
    public String generateToken(String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME);

        return Jwts.builder()
                .subject(email) // ✅ modern method name
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Extract email from token
    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    // Validate token
    public boolean isTokenValid(String token, String email) {
        String extractedEmail = extractEmail(token);
        return extractedEmail.equals(email) && !isTokenExpired(token);
    }

    // Get all claims
    private Claims getClaims(String token) {
        return Jwts.parser() // ✅ use parser(), not parserBuilder()
                .verifyWith(getSigningKey()) // ✅ 0.12.x API
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Check if token expired
    private boolean isTokenExpired(String token) {
        return getClaims(token).getExpiration().before(new Date());
    }
}
