package com.enterprice.notification_system.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class SmsRequestDTO {
    private String toNumber;
    private String message;
}
