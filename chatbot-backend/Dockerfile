# Multi-stage Dockerfile for chatbot-backend (Maven / Spring Boot)
FROM maven:3.8.8-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml ./
COPY src ./src
RUN mvn -B -DskipTests package || mvn -B -DskipTests package

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
ARG JAR_FILE=target/*.jar
COPY --from=build /workspace/${JAR_FILE} /app/app.jar
EXPOSE 8086
ENV GEMINI_API_URL="https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent"
ENV GEMINI_API_KEY="AIzaSyC-lhpwIm0kZB_tbG1dnpPHlK7ZzWVPlaI"
ENTRYPOINT ["java","-jar","/app/app.jar"]
