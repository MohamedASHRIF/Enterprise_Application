package com.enterprise.employee_service.web.mapper;

import com.enterprise.employee_service.domain.*;
import com.enterprise.employee_service.web.dto.*;

import java.util.List;
import java.util.stream.Collectors;

public class DtoMapper {

    // Assignment
    public static AssignmentResponseDto toDto(Assignment a){
        return new AssignmentResponseDto(
                a.getId(),
                a.getEmployeeId(),   // use employeeId field
                a.getAppointmentId(),
                a.getStatus()
        );
    }

    public static List<AssignmentResponseDto> toAssignmentDtoList(List<Assignment> assignments){
        return assignments.stream().map(DtoMapper::toDto).collect(Collectors.toList());
    }

    // TimeLog
    public static TimeLogResponseDto toDto(TimeLog log){
        return new TimeLogResponseDto(
                log.getId(),
                log.getAssignment().getId(),// you may need a getter for assignmentId if not directly available
                log.getStartTime(),
                log.getEndTime(),
                log.getNote()
        );
    }

    public static List<TimeLogResponseDto> toTimeLogDtoList(List<TimeLog> logs){
        return logs.stream().map(DtoMapper::toDto).collect(Collectors.toList());
    }
    
    // DailyWorkHours
    public static com.enterprise.employee_service.web.dto.WorkHoursResponseDto toWorkHoursDto(com.enterprise.employee_service.domain.DailyWorkHours dailyHours){
        return new com.enterprise.employee_service.web.dto.WorkHoursResponseDto(
                dailyHours.getId(),
                dailyHours.getEmployeeId(),
                dailyHours.getWorkDate(),
                dailyHours.getTotalSeconds(),
                dailyHours.getLogCount()
        );
    }
    
    public static List<com.enterprise.employee_service.web.dto.WorkHoursResponseDto> toWorkHoursDtoList(List<com.enterprise.employee_service.domain.DailyWorkHours> dailyHoursList){
        return dailyHoursList.stream().map(DtoMapper::toWorkHoursDto).collect(Collectors.toList());
    }
}
