package com.enterprice.notification_system.DTO;

import lombok.Data;


@Data
public class EmailRequestDTO {
    private String toMail;
    private String subject;
    private String body;
}