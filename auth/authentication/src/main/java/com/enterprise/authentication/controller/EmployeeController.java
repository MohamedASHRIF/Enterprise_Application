package com.enterprise.authentication.controller;

import com.enterprise.authentication.service.EmployeeService;
import com.enterprise.authentication.dto.EmployeeDtos.EmployeeListItem;
import com.enterprise.authentication.dto.EmployeeDtos.CreateEmployeeRequest;
import org.springframework.data.domain.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.HttpStatus;

import java.util.Map;

@RestController
@RequestMapping("/api/employees") // Base URL for all employee management
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    /**
     * GET /api/employees/stats
     * Retrieves the 4 stat card counts.
     * This endpoint is secured by SecurityConfig to be ADMIN-only.
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getEmployeeStats() {
        Map<String, Long> stats = employeeService.getEmployeeStats();
        return ResponseEntity.ok(stats);
    }

    // You will add other endpoints here later, e.g.:
    /**
     * GET /api/employees
     * Query params: search, role, status, page, size
     * Response: Spring Page with EmployeeListItem
     */
    @GetMapping
    public ResponseEntity<Page<EmployeeListItem>> listEmployees(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size
    ) {
        Page<EmployeeListItem> result = employeeService.listEmployees(search, role, status, page, size);
        return ResponseEntity.ok(result);
    }

    // @PostMapping
    // public ResponseEntity<User> createEmployee(@RequestBody User employee) { ... }

    @PostMapping
    public ResponseEntity<EmployeeListItem> createEmployee(@RequestBody CreateEmployeeRequest request) {
        EmployeeListItem created = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
