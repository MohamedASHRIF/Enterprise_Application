package com.enterprise.employee_service.service;

import com.enterprise.employee_service.domain.Schedule;
import com.enterprise.employee_service.repository.ScheduleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class ScheduleService {
    private final ScheduleRepository scheduleRepository;

    public ScheduleService(ScheduleRepository scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }

    public Schedule create(Long employeeId, LocalDate date, LocalTime start, LocalTime end) {
        Schedule s = Schedule.builder()
                .date(date)
                .shiftStart(start)
                .shiftEnd(end)
                .build();
        return scheduleRepository.save(s);
    }

    public List<Schedule> forEmployee(Long employeeId) {
        return scheduleRepository.findByEmployeeId(employeeId);
    }
}
