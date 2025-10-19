package com.enterprice.notification_system.service;


import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {


    @Value("${sendgrid.api.key}")
    private String sendGridApiKey;


    public String sendEmail(String toEmail, String subject, String body) {
        Email from = new Email("petergwenstacy123@gmail.com");
        Email to = new Email(toEmail);
        Content content = new Content("text/plain", body);
        Mail main = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();

        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(main.build());
            Response response = sg.api(request);

            return response.getStatusCode() + " " + response.getBody();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

    }
}
