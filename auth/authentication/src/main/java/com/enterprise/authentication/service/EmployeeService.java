package com.enterprise.authentication.service;

import com.enterprise.authentication.entity.Role;
import com.enterprise.authentication.entity.User;
import com.enterprise.authentication.dto.EmployeeDtos.EmployeeListItem;
import com.enterprise.authentication.dto.EmployeeDtos.CreateEmployeeRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
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

    @Autowired
    private PasswordEncoder passwordEncoder;

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

    public List<EmployeeListItem> getAllEmployees() {
        // Convert roles to strings for native query
        List<String> roleNames = EMPLOYEE_ROLES.stream()
                .map(Role::name)
                .toList();
        
        // Get all employees (no pagination, no filters)
        Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE);
        Page<User> pageResult = userRepository.findEmployees(
                roleNames,
                null, // no search
                null, // no job title filter
                null, // no status filter
                pageable
        );

        return pageResult.getContent().stream()
                .map(EmployeeService::toListItem)
                .toList();
    }

    public Page<EmployeeListItem> listEmployees(
            String search,
            String role,
            String status,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        // normalize filters
        String normalizedSearch = (search == null || search.isBlank()) ? null : search;
        // In UI, role refers to job title (MECHANIC | TECHNICIAN | GENERAL)
        String jobTitleFilter = (role == null || role.isBlank() || role.equalsIgnoreCase("ALL"))
                ? null : role.toUpperCase();
        Boolean statusFilter = null;
        if (status != null && !status.isBlank()) {
            if (status.equalsIgnoreCase("ACTIVE")) statusFilter = true;
            else if (status.equalsIgnoreCase("INACTIVE")) statusFilter = false;
        }

        // Convert roles to strings for native query
        List<String> roleNames = EMPLOYEE_ROLES.stream()
                .map(Role::name)
                .toList();
        
        Page<User> pageResult = userRepository.findEmployees(
                roleNames,
                normalizedSearch,
                jobTitleFilter,
                statusFilter,
                pageable
        );

        return pageResult.map(EmployeeService::toListItem);
    }
    public EmployeeListItem getEmployeeByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(EmployeeService::toListItem)
                .orElseThrow(() -> new RuntimeException("Employee not found with email: " + email));
    }



    private static EmployeeListItem toListItem(User u) {
        EmployeeListItem dto = new EmployeeListItem();
        dto.id = u.getId();
        dto.firstName = u.getFirstName();
        dto.lastName = u.getLastName();
        dto.email = u.getEmail();
        dto.phoneNumber = u.getPhoneNumber();
        dto.role = u.getRole() != null ? u.getRole().name() : null;
        dto.jobTitle = u.getJobTitle();
        dto.isActive = u.getIsActive();
        dto.createdAt = u.getCreatedAt();
        return dto;
    }

    public EmployeeListItem createEmployee(CreateEmployeeRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("Invalid request");
        }
        if (req.firstName == null || req.firstName.isBlank()) {
            throw new IllegalArgumentException("firstName is required");
        }
        if (req.lastName == null || req.lastName.isBlank()) {
            throw new IllegalArgumentException("lastName is required");
        }
        if (req.email == null || req.email.isBlank()) {
            throw new IllegalArgumentException("email is required");
        }
        if (userRepository.existsByEmail(req.email)) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (req.phoneNumber != null && !req.phoneNumber.isBlank()) {
            // Basic E.164 check: + followed by 8-15 digits
            if (!req.phoneNumber.matches("^\\+?[1-9]\\d{7,14}$")) {
                throw new IllegalArgumentException("phoneNumber must be E.164 format");
            }
        }

        User user = new User();
        user.setFirstName(req.firstName.trim());
        user.setLastName(req.lastName.trim());
        user.setEmail(req.email.trim().toLowerCase());
        user.setPhoneNumber(req.phoneNumber);
        user.setJobTitle(req.jobTitle != null ? req.jobTitle.toUpperCase() : "GENERAL");
        user.setRole(Role.EMPLOYEE);
        user.setIsActive(true);

        // Auto-verify employees created by admins (trusted creation)
        // Employees created by admins don't need email verification
        user.setEmailVerified(true);

        // Set a temporary password
        String tempPassword = "ChangeMe@123";
        user.setPassword(passwordEncoder.encode(tempPassword));

        User saved = userRepository.save(user);
        return toListItem(saved);
    }
}
