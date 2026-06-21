# Dockerfile for Core Service
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# The jar file must be built beforehand via maven
COPY target/core-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]
