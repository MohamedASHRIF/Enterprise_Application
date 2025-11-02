package com.enterprise.employee_service.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

@Service
public class CustomerServiceClient {

    private static final Logger log = LoggerFactory.getLogger(CustomerServiceClient.class);

    private final RestTemplate restTemplate;

    @Value("${customer.service.url}")
    private String customerServiceUrl;

    public CustomerServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> getAppointmentDetails(Long appointmentId) {
        try {
            String url = customerServiceUrl + "/appointments/" + appointmentId;
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.GET, null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> body = response.getBody();
            log.info("Fetched appointment details from Customer Service for id={} -> {}", appointmentId, body);
            return body;
        } catch (RestClientResponseException e) {
            // HTTP status errors (4xx,5xx) - log status and body to diagnose extraction problems
            log.warn("Customer service returned error for id={} status={} body={}", appointmentId, e.getRawStatusCode(), e.getResponseBodyAsString());
            return null;
        } catch (RestClientException e) {
            // Non-HTTP errors (IO, connection refused, etc.)
            log.warn("Failed to fetch appointment details from Customer Service for id={}: {}", appointmentId, e.toString());
            return null;
        } catch (Exception e) {
            // Fallback for any other unexpected exceptions
            log.error("Unexpected error while fetching appointment details for id={}", appointmentId, e);
            return null;
        }
    }
}
