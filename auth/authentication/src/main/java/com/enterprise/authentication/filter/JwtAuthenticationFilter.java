package com.enterprise.authentication.filter;

import com.enterprise.authentication.entity.User; // Import User
import com.enterprise.authentication.repository.UserRepository; // Import UserRepository
import com.enterprise.authentication.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List; // Import List
import java.util.Optional; // Import Optional

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority; // Import GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority; // Import SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    // --- 1. INJECT THE USER REPOSITORY ---
    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                email = jwtUtil.extractEmail(token);
            } catch (Exception e) {
                // Invalid token
            }
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.isTokenValid(token, email)) {

                // --- 2. FETCH THE USER FROM DATABASE ---
                Optional<User> userOpt = userRepository.findByEmail(email);

                if (userOpt.isPresent()) {
                    User user = userOpt.get();

                    // --- 3. CREATE THE AUTHORITY LIST (ROLES) ---
                    List<GrantedAuthority> authorities = List.of(
                            new SimpleGrantedAuthority(user.getRole().name())
                    );

                    // --- 4. CREATE THE TOKEN *WITH* AUTHORITIES ---
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user.getEmail(), // Use user email from DB as principal
                            null,
                            authorities // Pass the user's role
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
