package org.example.customer_service.controllers;

import lombok.RequiredArgsConstructor;
import org.example.customer_service.entities.Feedback;
import org.example.customer_service.services.FeedbackService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public Feedback submitFeedback(@RequestBody Feedback feedback) {
        return feedbackService.submitFeedback(feedback);
    }

    @GetMapping("/appointment/{appointmentId}")
    public List<Feedback> getFeedbackByAppointment(@PathVariable Long appointmentId) {
        return feedbackService.getFeedbackByAppointment(appointmentId);
    }
}
