package com.enterprise.authentication.service;

import com.enterprise.authentication.entity.Role;
import com.enterprise.authentication.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmployeeService {

    @Autowired
    private UserRepository userRepository;

    // Define the roles that are considered "employees" (i.e., not customers)
    private static final List<Role> EMPLOYEE_ROLES = List.of(Role.ADMIN, Role.EMPLOYEE);

    public Map<String, Long> getEmployeeStats() {

        // 1. Total Employees (ADMIN + EMPLOYEE)
        long totalEmployees = userRepository.countByRoleIn(EMPLOYEE_ROLES);

        // 2. Active Employees (Active ADMIN + Active EMPLOYEE)
        long activeEmployees = userRepository.countByIsActiveAndRoleIn(true, EMPLOYEE_ROLES);

        // 3. Mechanics
        long mechanics = userRepository.countByJobTitleAndRoleIn("MECHANIC", EMPLOYEE_ROLES);

        // 4. Technicians
        long technicians = userRepository.countByJobTitleAndRoleIn("TECHNICIAN", EMPLOYEE_ROLES);

        // 5. Build the response map
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalEmployees", totalEmployees);
        stats.put("activeEmployees", activeEmployees);
        stats.put("mechanics", mechanics);
        stats.put("technicians", technicians);

        return stats;
    }
}
