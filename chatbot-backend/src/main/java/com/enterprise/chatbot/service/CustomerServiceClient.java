package com.enterprise.chatbot.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Collections;
import java.util.List;

@Component
public class CustomerServiceClient {

    private final RestTemplate restTemplate;
    private final String customerServiceBase;

    public CustomerServiceClient(RestTemplate restTemplate,
                                 @Value("${customer.service.url:http://localhost:8085}") String customerServiceBase) {
        this.restTemplate = restTemplate;
        this.customerServiceBase = customerServiceBase;
    }

    public static class AvailabilityResponse {
        public String date;
        public Integer serviceId;
        public List<String> slots;
    }

    public List<String> getAvailableSlots(String date, Integer serviceId) {
        UriComponentsBuilder b = UriComponentsBuilder.fromHttpUrl(customerServiceBase)
                .path("/api/public/availability")
                .queryParam("date", date);
        if (serviceId != null) {
            b.queryParam("serviceId", serviceId);
        }
        URI uri = b.build().toUri();
        try {
            ResponseEntity<AvailabilityResponse> resp = restTemplate.getForEntity(uri, AvailabilityResponse.class);
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null && resp.getBody().slots != null) {
                return resp.getBody().slots;
            }
        } catch (Exception ex) {
            // keep additive: avoid changing existing logging behavior; caller will handle empty lists
        }
        return Collections.emptyList();
    }
}
