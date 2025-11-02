package com.enterprise.employee_service.web;

import com.enterprise.employee_service.domain.TimeLog;
import com.enterprise.employee_service.service.TimeLogService;
import com.enterprise.employee_service.web.dto.ResponseDto;
import com.enterprise.employee_service.web.dto.TimeLogResponseDto;
import com.enterprise.employee_service.web.mapper.DtoMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        TimeLog log = timeLogService.start(assignmentId, note);
        return ResponseEntity.ok(new ResponseDto<>(true, DtoMapper.toDto(log), "TimeLog started successfully"));
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
}
