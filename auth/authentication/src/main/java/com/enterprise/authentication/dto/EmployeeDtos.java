package com.enterprise.authentication.dto;

import java.time.LocalDateTime;

public class EmployeeDtos {
    public static class EmployeeListItem {
        public Long id;
        public String firstName;
        public String lastName;
        public String email;
        public String phoneNumber;
        public String role;
        public String jobTitle;
        public Boolean isActive;
        public LocalDateTime createdAt;
    }

    public static class CreateEmployeeRequest {
        public String firstName;
        public String lastName;
        public String email;
        public String phoneNumber;
        public String jobTitle; // MECHANIC | TECHNICIAN | GENERAL
    }
}


