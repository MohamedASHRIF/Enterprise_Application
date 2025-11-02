package com.enterprise.employee_service.web;

import com.enterprise.employee_service.domain.Schedule;
import com.enterprise.employee_service.service.ScheduleService;
import com.enterprise.employee_service.web.dto.ResponseDto;
import com.enterprise.employee_service.web.dto.ScheduleResponseDto;
import com.enterprise.employee_service.web.mapper.DtoMapper;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {
    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @PostMapping
    public ResponseEntity<ResponseDto<ScheduleResponseDto>> create(@RequestParam Long employeeId,
                                                                   @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                                                   @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime start,
                                                                   @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime end){
        Schedule s = scheduleService.create(employeeId, date, start, end);
        return ResponseEntity.ok(new ResponseDto<>(true, DtoMapper.toDto(s), "Schedule created successfully"));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ResponseDto<List<ScheduleResponseDto>>> forEmployee(@PathVariable Long employeeId){
        List<Schedule> schedules = scheduleService.forEmployee(employeeId);
        return ResponseEntity.ok(new ResponseDto<>(true, DtoMapper.toScheduleDtoList(schedules), "Schedules retrieved successfully"));
    }
}
