# Multi-stage Dockerfile for admin (Maven / Spring Boot)
FROM maven:3.8.8-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml ./
COPY src ./src
RUN mvn -B -DskipTests package || mvn -B -DskipTests package

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
ARG JAR_FILE=target/*.jar
COPY --from=build /workspace/${JAR_FILE} /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
