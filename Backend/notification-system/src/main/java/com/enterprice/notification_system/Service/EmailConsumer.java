package com.enterprice.notification_system.Service;

import com.enterprice.notification_system.Config.RabbitMQConfig;
import com.enterprice.notification_system.DTO.EmailRequestDTO;
import com.enterprice.notification_system.Entity.EmailLog;
import com.enterprice.notification_system.Repository.EmailLogRepository;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDate;

@Service
public class EmailConsumer {

    private final EmailLogRepository emailLogRepository;

    @Autowired
    private NotificationService notificationService;

    @Value("${sendgrid.api.key}")
    private String sendGridApiKey;

    public EmailConsumer(EmailLogRepository emailLogRepository) {
        this.emailLogRepository = emailLogRepository;
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    public void consumeEmail(EmailRequestDTO emailRequestDTO) {
        try {
            sendEmail(emailRequestDTO);
            saveEmailLog(emailRequestDTO, "SENT");


            notificationService.createNotification(
                    emailRequestDTO.getToMail(),
                    emailRequestDTO.getSubject(),
                    emailRequestDTO.getBody(),
                    "EMAIL"
            );

        } catch (Exception e) {
            saveEmailLog(emailRequestDTO, "FAILED");
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    private void sendEmail(EmailRequestDTO dto) throws IOException {
        Email from = new Email("eadalerts@gmail.com");
        Email to = new Email(dto.getToMail());
        Content content = new Content("text/plain", dto.getBody());
        Mail mail = new Mail(from, dto.getSubject(), to, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();

        request.setMethod(Method.POST);
        request.setEndpoint("mail/send");
        request.setBody(mail.build());

        Response response = sg.api(request);
        System.out.println("SendGrid Response: " + response.getStatusCode());
    }

    private void saveEmailLog(EmailRequestDTO dto, String status) {
        EmailLog log = new EmailLog();
        log.setToMail(dto.getToMail());
        log.setSubject(dto.getSubject());
        log.setBody(dto.getBody());
        log.setStaus(status);
        log.setDate(LocalDate.now());
        emailLogRepository.save(log);
    }
}
