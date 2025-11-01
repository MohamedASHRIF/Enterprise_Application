Chatbot backend (copy)

This folder contains a copy of the chatbot backend service. It's the same Spring Boot microservice used for the frontend integration.

Run (requires Maven and Java 17+):

cd chatbot-backend
mvn spring-boot:run

The service listens on port 8080 and exposes POST /api/chat with JSON body { "message": "..." }.
