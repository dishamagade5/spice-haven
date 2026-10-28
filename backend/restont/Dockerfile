# Stage 1: Build the application using Maven with Eclipse Temurin Java 17
FROM maven:3.8.5-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build the jar file
RUN mvn clean package -DskipTests

# Stage 2: Run the application using lightweight Eclipse Temurin JRE/JDK 17
FROM eclipse-temurin:17-jdk-slim
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port your Spring Boot app runs on
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
