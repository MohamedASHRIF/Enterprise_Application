package org.example.customer_service.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Dev-only filter to log the final response status and body for the booking
 * endpoint.
 * Use to diagnose why POST /api/appointments/book returns 403.
 * Remove or tighten before committing to production.
 */
@Component
public class ResponseLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(ResponseLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        ContentCachingResponseWrapper wrapped = new ContentCachingResponseWrapper(response);
        try {
            try {
                filterChain.doFilter(request, wrapped);
            } catch (Throwable t) {
                // Log the full stacktrace for any exception thrown during request
                // processing so we can diagnose why a 400/500 is returned.
                log.error("ResponseLoggingFilter: exception while handling request {} {}: {}", request.getMethod(),
                        request.getRequestURI(), t.toString(), t);
                throw t;
            }
        } finally {
            String path = request.getRequestURI();
            // Match booking endpoint more robustly (in case context path or trailing slash
            // differ)
            if (path != null && path.contains("/appointments") && path.endsWith("/book")) {
                int status = wrapped.getStatus();
                String respBody = "";
                byte[] buf = wrapped.getContentAsByteArray();
                if (buf != null && buf.length > 0) {
                    try {
                        respBody = new String(buf, wrapped.getCharacterEncoding());
                    } catch (Exception e) {
                        respBody = "<unreadable>";
                    }
                }
                log.info("ResponseLoggingFilter: {} {} -> status={} body={}", request.getMethod(), path, status,
                        respBody);
            }
            // Copy the cached body back to the real response
            wrapped.copyBodyToResponse();
        }
    }
}
