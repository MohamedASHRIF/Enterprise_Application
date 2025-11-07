FROM maven:3.9.5-eclipse-temurin-17 AS builder

# Working directory for build
WORKDIR /workspace

COPY pom.xml ./
COPY src/ src/

RUN mvn -B -DskipTests package

# Use the non-alpine Temurin JRE image which provides multi-arch manifests (supports linux/arm64)
FROM eclipse-temurin:17-jre

WORKDIR /app


COPY --from=builder /workspace/target/*.jar app.jar


EXPOSE 8082

# Run the jar
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
