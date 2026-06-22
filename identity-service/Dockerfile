# Multi-stage build — identity-service
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Copy parent POM and all module POMs to cache dependencies
COPY pom.xml .
COPY common/pom.xml common/
COPY identity-service/pom.xml identity-service/
COPY core-service/pom.xml core-service/
COPY social-service/pom.xml social-service/
COPY gateway-service/pom.xml gateway-service/

RUN mvn dependency:go-offline -B -q || true

# Copy sources needed for build
COPY common/src common/src
COPY identity-service/src identity-service/src

RUN mvn clean package -pl identity-service -am -DskipTests -B -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=build /build/identity-service/target/identity-service-*.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
