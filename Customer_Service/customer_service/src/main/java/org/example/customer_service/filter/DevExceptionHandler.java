package org.example.customer_service.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

import java.io.PrintWriter;
import java.io.StringWriter;

/**
 * Dev-only exception handler that logs full stacktraces and returns a readable
 * error body so we can diagnose why the booking endpoint responds with 400.
 * Remove or restrict before production.
 */
@ControllerAdvice
public class DevExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(DevExceptionHandler.class);

    @ExceptionHandler(Throwable.class)
    public ResponseEntity<String> handleAll(Throwable ex) {
        // Log full stacktrace
        StringWriter sw = new StringWriter();
        ex.printStackTrace(new PrintWriter(sw));
        String stack = sw.toString();
        log.error("DevExceptionHandler: caught unhandled exception: {}", ex.toString());
        log.error(stack);

        if (ex instanceof ResponseStatusException) {
            ResponseStatusException rse = (ResponseStatusException) ex;
            String body = "ResponseStatusException: " + rse.getStatusCode() + " - " + rse.getReason() + "\n" + stack;
            HttpHeaders headers = new HttpHeaders();
            return ResponseEntity.status(rse.getStatusCode()).headers(headers).body(body);
        }

        String body = "Unhandled exception: " + ex.toString() + "\n" + stack;
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
