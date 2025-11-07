package com.enterprise.employee_service.repository;

import com.enterprise.employee_service.domain.DailyWorkHours;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyWorkHoursRepository extends JpaRepository<DailyWorkHours, Long> {
    Optional<DailyWorkHours> findByEmployeeIdAndWorkDate(Long employeeId, LocalDate workDate);
    List<DailyWorkHours> findByEmployeeId(Long employeeId);
    List<DailyWorkHours> findByEmployeeIdAndWorkDateBetween(Long employeeId, LocalDate startDate, LocalDate endDate);
}

