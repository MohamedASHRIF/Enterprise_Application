package com.enterprice.notification_system.Service;

import com.enterprice.notification_system.Entity.SmsLog;
import com.enterprice.notification_system.Repository.SmsLogRepository;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class SmsService {

    @Value("${twilio.phone_number}")
    private String fromNumber;

    private final SmsLogRepository smsLogRepository;

    public SmsService(SmsLogRepository smsLogRepository) {
        this.smsLogRepository = smsLogRepository;
    }

    public String sendSms(String toNumber, String messageText) {
        try {
            Message message = Message.creator(
                    new PhoneNumber(toNumber),
                    new PhoneNumber(fromNumber),
                    messageText
            ).create();

            saveSmsLog(toNumber, messageText, "SENT");
            return "SMS sent successfully with SID: " + message.getSid();

        } catch (Exception e) {
            saveSmsLog(toNumber, messageText, "FAILED");
            return "Error sending SMS: " + e.getMessage();
        }
    }

    private void saveSmsLog(String to, String text, String status) {
        SmsLog log = new SmsLog();
        log.setToNumber(to);
        log.setMessage(text);
        log.setStatus(status);
        log.setDate(LocalDate.now());
        smsLogRepository.save(log);
    }
}