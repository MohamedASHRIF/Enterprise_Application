package com.enterprise.employee_service.repository;

import com.enterprise.employee_service.domain.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByEmployeeId(Long employeeId);
    List<Schedule> findByEmployeeIdAndDate(Long employeeId, LocalDate date);
}
