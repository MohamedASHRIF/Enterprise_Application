package org.example.customer_service.controllers;

import lombok.RequiredArgsConstructor;
import org.example.customer_service.entities.Appointment;
import org.example.customer_service.entities.Service;
import org.example.customer_service.repositories.AppointmentRepository;
import org.example.customer_service.repositories.ServiceRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Public availability endpoint used by other services (chatbot) to query free
 * time slots.
 * This controller is intentionally conservative: it computes candidate slots
 * using a
 * default business hours window and a service's configured duration (if
 * provided).
 */
@RestController
@RequestMapping("/api/public/availability")
@RequiredArgsConstructor
@CrossOrigin
public class AvailabilityController {

    private final AppointmentRepository appointmentRepository;
    private final ServiceRepository serviceRepository;

    // Simple availability: business hours 09:00-17:00 unless overridden in future
    private static final LocalTime DEFAULT_START = LocalTime.of(9, 0);
    private static final LocalTime DEFAULT_END = LocalTime.of(17, 0);

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    /**
     * Example: GET /api/public/availability?date=2025-11-07&serviceId=2
     * Returns a JSON object: { "date":"2025-11-07", "serviceId":2,
     * "slots":["09:00","09:30",...] }
     */
    @GetMapping
    public ResponseEntity<?> getAvailability(
            @RequestParam(value = "date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(value = "serviceId", required = false) Long serviceId) {
        try {
            int slotMinutes = 30; // default granularity
            if (serviceId != null) {
                Optional<Service> svc = serviceRepository.findById(serviceId);
                if (svc.isPresent()) {
                    int dur = svc.get().getDuration();
                    if (dur > 0)
                        slotMinutes = dur;
                }
            }

            // Load appointments for the date
            List<Appointment> appointments = appointmentRepository.findByAppointmentDate(date);

            // Build list of occupied intervals
            List<java.time.Duration[]> occupied = new ArrayList<>();
            List<TimeRange> occupiedRanges = new ArrayList<>();
            for (Appointment a : appointments) {
                // If serviceId filter applied, skip other services
                if (serviceId != null && (a.getService() == null || !Objects.equals(a.getService().getId(), serviceId)))
                    continue;
                String timeStr = a.getAppointmentTime();
                if (timeStr == null || timeStr.isBlank())
                    continue;
                try {
                    LocalTime t = LocalTime.parse(timeStr, TIME_FMT);
                    int dur = 30;
                    if (a.getService() != null && a.getService().getDuration() > 0)
                        dur = a.getService().getDuration();
                    LocalTime end = t.plusMinutes(dur);
                    occupiedRanges.add(new TimeRange(t, end));
                } catch (Exception ex) {
                    // ignore malformed times
                }
            }

            // Candidate slots
            List<String> slots = new ArrayList<>();
            LocalTime cursor = DEFAULT_START;
            while (!cursor.plusMinutes(slotMinutes).isAfter(DEFAULT_END)) {
                LocalTime slotEnd = cursor.plusMinutes(slotMinutes);
                TimeRange candidate = new TimeRange(cursor, slotEnd);
                boolean overlaps = occupiedRanges.stream().anyMatch(r -> r.overlaps(candidate));
                if (!overlaps)
                    slots.add(cursor.format(TIME_FMT));
                cursor = cursor.plusMinutes(30); // granularity step (30m) to present nicer multiples
            }

            Map<String, Object> out = new HashMap<>();
            out.put("date", date.toString());
            out.put("serviceId", serviceId);
            out.put("slots", slots);
            return ResponseEntity.ok(out);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", ex.getMessage()));
        }
    }

    // small helper for intervals
    private static class TimeRange {
        LocalTime start;
        LocalTime end;

        TimeRange(LocalTime s, LocalTime e) {
            this.start = s;
            this.end = e;
        }

        boolean overlaps(TimeRange other) {
            return !this.end.isBefore(other.start) && !other.end.isBefore(this.start);
        }
    }
}
