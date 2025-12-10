package org.example.customer_service.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    // SAME AS IN JwtUtil
    private static final String SECRET_KEY = "your_secret_key_which_should_be_long_enough_for_hmac";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        log.debug("JwtAuthFilter: incoming request {} {} - Authorization header present: {}",
                request.getMethod(), request.getRequestURI(), authHeader != null);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(key)
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                String email = claims.getSubject();

                // set claims for controllers that inspect them
                request.setAttribute("jwtClaims", claims);

                // --- ADD: set email attribute (controllers expect this) ---
                request.setAttribute("email", email);

                // Optionally set customerId if token includes an "id" claim:
                Object idClaim = claims.get("id");
                if (idClaim != null) {
                    // Be careful with types: jwt numeric claims may come as Integer/Long
                    try {
                        Long idLong = Long.valueOf(String.valueOf(idClaim));
                        request.setAttribute("customerId", idLong);
                    } catch (Exception ignored) {}
                }

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(email, null, Collections.emptyList());
                SecurityContextHolder.getContext().setAuthentication(auth);

                log.debug("JwtAuthFilter: token valid for subject={}", email);

            } catch (io.jsonwebtoken.ExpiredJwtException e) {
                log.warn("JwtAuthFilter: token expired: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Token expired");
                return;
            } catch (Exception e) {
                log.warn("JwtAuthFilter: token invalid: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Invalid or expired token");
                return;
            }
        } else {
            log.debug("JwtAuthFilter: no Authorization header present");
        }

        filterChain.doFilter(request, response);
    }
}
