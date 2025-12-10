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
            // Prefer the new non-breaking public endpoint if present
            String publicUrl = customerServiceUrl + "/public/appointments/" + appointmentId;
            try {
                ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                        publicUrl, HttpMethod.GET, null,
                        new ParameterizedTypeReference<Map<String, Object>>() {}
                );
                Map<String, Object> body = response.getBody();
                // If the Customer Service wraps responses in an ApiResponse { success, data }, unwrap it.
                if (body != null && body.containsKey("data") && body.get("data") instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> inner = (Map<String, Object>) body.get("data");
                    log.info("Fetched appointment details (wrapped) from Customer Service (public) for id={} -> {}", appointmentId, inner);
                    return inner;
                }
                log.info("Fetched appointment details from Customer Service (public) for id={} -> {}", appointmentId, body);
                return body;
            } catch (RestClientException e) {
                // If public endpoint is not available or returns error, fall back to the original endpoint
                log.debug("Public appointment endpoint unavailable for id={} (will try legacy): {}", appointmentId, e.toString());
            }

            String legacyUrl = customerServiceUrl + "/appointments/" + appointmentId;
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    legacyUrl, HttpMethod.GET, null,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("data") && body.get("data") instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> inner = (Map<String, Object>) body.get("data");
                log.info("Fetched appointment details (wrapped) from Customer Service (legacy) for id={} -> {}", appointmentId, inner);
                return inner;
            }
            log.info("Fetched appointment details from Customer Service (legacy) for id={} -> {}", appointmentId, body);
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

    public Map<String, Object> getCustomerById(Long customerId) {
        try {
            // Prefer public customer endpoint to avoid nested appointment graphs
            String publicUrl = customerServiceUrl + "/public/customers/" + customerId;
            try {
                ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                        publicUrl, HttpMethod.GET, null,
                        new ParameterizedTypeReference<Map<String, Object>>() {}
                );
                Map<String, Object> body = response.getBody();
                if (body != null && body.containsKey("data") && body.get("data") instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> inner = (Map<String, Object>) body.get("data");
                    log.info("Fetched customer (wrapped) from Customer Service (public) for id={} -> {}", customerId, inner);
                    return inner;
                }
                log.info("Fetched customer from Customer Service (public) for id={} -> {}", customerId, body);
                return body;
            } catch (RestClientException e) {
                log.debug("Public customer endpoint unavailable for id={} (will try legacy): {}", customerId, e.toString());
            }

            String url = customerServiceUrl + "/customers/" + customerId;
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.GET, null,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("data") && body.get("data") instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> inner = (Map<String, Object>) body.get("data");
                log.info("Fetched customer (wrapped) from Customer Service (legacy) for id={} -> {}", customerId, inner);
                return inner;
            }
            log.info("Fetched customer from Customer Service (legacy) for id={} -> {}", customerId, body);
            return body;
        } catch (RestClientResponseException e) {
            log.warn("Customer service returned error for customer id={} status={} body={}", customerId, e.getRawStatusCode(), e.getResponseBodyAsString());
            return null;
        } catch (RestClientException e) {
            log.warn("Failed to fetch customer from Customer Service for id={}: {}", customerId, e.toString());
            return null;
        } catch (Exception e) {
            log.error("Unexpected error while fetching customer for id={}", customerId, e);
            return null;
        }
    }

    /**
     * Update appointment status in customer service.
     * This is called when assignment status changes to keep them synchronized.
     */
    public boolean updateAppointmentStatus(Long appointmentId, String status) {
        try {
            String url = customerServiceUrl + "/appointments/" + appointmentId + "/status?status=" + status;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.PUT, entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            log.info("✅ Updated appointment {} status to {} in customer service", appointmentId, status);
            return response.getStatusCode().is2xxSuccessful();
        } catch (RestClientResponseException e) {
            log.warn("⚠️ Customer service returned error when updating appointment {} status to {}: status={} body={}", 
                    appointmentId, status, e.getRawStatusCode(), e.getResponseBodyAsString());
            return false;
        } catch (RestClientException e) {
            log.warn("⚠️ Failed to update appointment {} status to {} in customer service: {}", 
                    appointmentId, status, e.toString());
            return false;
        } catch (Exception e) {
            log.error("❌ Unexpected error while updating appointment {} status to {}", appointmentId, status, e);
            return false;
        }
    }
}
