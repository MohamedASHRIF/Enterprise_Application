package org.example.customer_service.controllers;

import lombok.RequiredArgsConstructor;
import org.example.customer_service.dto.AppointmentSummaryDto;
import org.example.customer_service.dto.ServiceSummaryDto;
import org.example.customer_service.dto.VehicleSummaryDto;
import org.example.customer_service.entities.Appointment;
import org.example.customer_service.services.AppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/appointments")
@RequiredArgsConstructor
public class AppointmentPublicController {

    private final AppointmentService appointmentService;

    /**
     * Non-breaking public endpoint returning a shallow appointment DTO
     * so other services (BFFs) can consume appointment info without
     * serializing the full JPA graph or changing existing controllers.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointmentPublic(@PathVariable Long id) {
        return appointmentService.getAppointmentById(id)
                .map(app -> {
                    AppointmentSummaryDto dto = new AppointmentSummaryDto();
                    dto.setId(app.getId());
                    dto.setCustomerId(app.getCustomerId());
                    if (app.getVehicle() != null) {
                        VehicleSummaryDto v = new VehicleSummaryDto();
                        v.setId(app.getVehicle().getId());
                        v.setMake(app.getVehicle().getMake());
                        v.setModel(app.getVehicle().getModel());
                        v.setYear(app.getVehicle().getYear());
                        v.setColor(app.getVehicle().getColor());
                        v.setPlate(app.getVehicle().getPlate());
                        v.setCustomerId(app.getVehicle().getCustomerId());
                        dto.setVehicle(v);
                    }
                    if (app.getService() != null) {
                        ServiceSummaryDto s = new ServiceSummaryDto();
                        s.setId(app.getService().getId());
                        s.setName(app.getService().getName());
                        s.setDescription(app.getService().getDescription());
                        s.setCategory(app.getService().getCategory());
                        dto.setService(s);
                    }
                    if (app.getEmployee() != null) dto.setEmployeeId(app.getEmployee().getId());
                    dto.setAppointmentDate(app.getAppointmentDate());
                    dto.setAppointmentTime(app.getAppointmentTime());
                    dto.setStatus(app.getStatus());
                    dto.setEstimatedDuration(app.getEstimatedDuration());
                    return ResponseEntity.ok(dto);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
