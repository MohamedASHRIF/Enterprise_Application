package com.enterprise.employee_service.web;

import com.enterprise.employee_service.service.EmployeeService;
import com.enterprise.employee_service.web.dto.UserDto;
import com.enterprise.employee_service.web.dto.ResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // Example endpoint to get logged-in employee info
    @GetMapping("/me")
    public ResponseEntity<ResponseDto<UserDto>> getLoggedInEmployee(
            @RequestParam String email,
            @RequestHeader("Authorization") String token) {

        // remove "Bearer " if included
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        UserDto user = employeeService.getLoggedInEmployee(email, token);
        return ResponseEntity.ok(new ResponseDto<>(true, user, "Employee info retrieved successfully"));
    }
}
