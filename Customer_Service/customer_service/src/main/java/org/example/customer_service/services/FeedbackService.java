package org.example.customer_service.services;

import lombok.RequiredArgsConstructor;
import org.example.customer_service.entities.Feedback;
import org.example.customer_service.repositories.FeedbackRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    public Feedback submitFeedback(Feedback feedback) {
        return feedbackRepository.save(feedback);
    }

    public List<Feedback> getFeedbackByAppointment(Long appointmentId) {
        return feedbackRepository.findByAppointmentId(appointmentId);
    }
}
