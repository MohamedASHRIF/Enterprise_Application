package com.enterprice.notification_system.Service;

import com.enterprice.notification_system.Config.RabbitMQConfig;
import com.enterprice.notification_system.DTO.EmailRequestDTO;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class EmailProducer {

    private final RabbitTemplate rabbitTemplate;

    public EmailProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendToQueue(EmailRequestDTO emailRequestDTO) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.QUEUE_NAME, emailRequestDTO);
        System.out.println("Email message sent to queue: " + emailRequestDTO.getToMail());
    }
}