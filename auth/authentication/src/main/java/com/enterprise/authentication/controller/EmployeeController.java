package com.enterprise.authentication.controller;

import com.enterprise.authentication.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    // @GetMapping
    // public ResponseEntity<List<User>> getAllEmployees() { ... }

    // @PostMapping
    // public ResponseEntity<User> createEmployee(@RequestBody User employee) { ... }
}
