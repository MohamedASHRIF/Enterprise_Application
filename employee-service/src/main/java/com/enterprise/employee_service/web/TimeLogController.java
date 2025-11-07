package com.enterprise.employee_service.web;

import com.enterprise.employee_service.domain.TimeLog;
import com.enterprise.employee_service.service.TimeLogService;
import com.enterprise.employee_service.web.dto.ResponseDto;
import com.enterprise.employee_service.web.dto.TimeLogResponseDto;
import com.enterprise.employee_service.web.dto.WorkHoursResponseDto;
import com.enterprise.employee_service.web.mapper.DtoMapper;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/timelogs")
public class TimeLogController {
    private final TimeLogService timeLogService;

    public TimeLogController(TimeLogService timeLogService) {
        this.timeLogService = timeLogService;
    }

    @PostMapping("/start")
    public ResponseEntity<ResponseDto<TimeLogResponseDto>> start(@RequestParam Long assignmentId, @RequestParam(required = false) String note){
        try {
            TimeLog log = timeLogService.start(assignmentId, note);
            return ResponseEntity.ok(new ResponseDto<>(true, DtoMapper.toDto(log), "TimeLog started successfully"));
        } catch (IllegalStateException ise) {
            // Conflict: active time log already exists
            return ResponseEntity.status(409).body(new ResponseDto<>(false, null, ise.getMessage()));
        }
    }

    @PostMapping("/{logId}/stop")
    public ResponseEntity<ResponseDto<TimeLogResponseDto>> stop(@PathVariable Long logId){
        TimeLog log = timeLogService.stop(logId);
        return ResponseEntity.ok(new ResponseDto<>(true, DtoMapper.toDto(log), "TimeLog stopped successfully"));
    }

    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<ResponseDto<List<TimeLogResponseDto>>> forAssignment(@PathVariable Long assignmentId){
        List<TimeLog> logs = timeLogService.forAssignment(assignmentId);
        return ResponseEntity.ok(new ResponseDto<>(true, DtoMapper.toTimeLogDtoList(logs), "TimeLogs retrieved successfully"));
    }
    
    /**
     * Get work hours for an employee (for employee dashboard)
     */
    @GetMapping("/employee/{employeeId}/hours")
    public ResponseEntity<ResponseDto<List<WorkHoursResponseDto>>> getWorkHours(@PathVariable Long employeeId){
        List<com.enterprise.employee_service.domain.DailyWorkHours> hours = timeLogService.getAllWorkHours(employeeId);
        return ResponseEntity.ok(new ResponseDto<>(true, DtoMapper.toWorkHoursDtoList(hours), "Work hours retrieved successfully"));
    }
    
    /**
     * Get work hours for an employee within a date range (for admin/reporting)
     */
    @GetMapping("/employee/{employeeId}/hours/range")
    public ResponseEntity<ResponseDto<List<WorkHoursResponseDto>>> getWorkHoursRange(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate){
        List<com.enterprise.employee_service.domain.DailyWorkHours> hours = timeLogService.getWorkHours(employeeId, startDate, endDate);
        return ResponseEntity.ok(new ResponseDto<>(true, DtoMapper.toWorkHoursDtoList(hours), "Work hours retrieved successfully"));
    }
}
