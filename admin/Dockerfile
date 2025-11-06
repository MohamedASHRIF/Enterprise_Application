# Multi-stage Dockerfile for admin service (build with Maven, run on Eclipse Temurin JRE 17)

################################################################################
# Builder stage - builds the Spring Boot jar using the included Maven wrapper
################################################################################
FROM maven:3.9.5-eclipse-temurin-17 AS builder

# Working directory for build
WORKDIR /workspace

# Copy only what is needed for a build to leverage layer caching
# When copying multiple sources, ensure the destination is a directory
COPY mvnw pom.xml ./
COPY .mvn/ .mvn/
COPY src/ src/

# Ensure mvnw is executable and build the project (skip tests for faster builds)
RUN chmod +x mvnw && ./mvnw -B -DskipTests package

################################################################################
# Runtime stage - small, secure JRE image
################################################################################
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the fat jar produced by Spring Boot (assumes artifact is in target/)
COPY --from=builder /workspace/target/*.jar app.jar

# If your build produces a jar with a different name, you may need to adjust the pattern above.

# Expose the port the admin service listens on (matches k8s and docker-compose configs)
EXPOSE 8082

# Run the jar
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
