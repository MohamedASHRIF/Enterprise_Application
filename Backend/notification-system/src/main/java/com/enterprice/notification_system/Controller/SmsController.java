package com.enterprice.notification_system.Controller;

import com.enterprice.notification_system.DTO.SmsRequestDTO;
import com.enterprice.notification_system.Service.SmsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sms")
public class SmsController {

    private final SmsService smsService;

    public SmsController(SmsService smsService) {
        this.smsService = smsService;
    }

    @PostMapping("/send")
    public String sendSms(@RequestBody SmsRequestDTO smsRequestDTO) {
        return smsService.sendSms(smsRequestDTO.getToNumber(), smsRequestDTO.getMessage());
    }
}
