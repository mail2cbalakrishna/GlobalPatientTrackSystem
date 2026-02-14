package com.globalpatienttrack.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Auth Service Routes
                .route("auth-service", r -> r.path("/auth/**")
                        .uri("lb://auth-service"))
                
                // User Data Service Routes
                .route("user-data-service", r -> r.path("/users/**")
                        .uri("lb://user-data-service"))
                
                // Admin Service Routes
                .route("admin-service", r -> r.path("/admin/**")
                        .uri("lb://admin-service"))
                
                // Doctor Service Routes
                .route("doctor-service", r -> r.path("/doctor/**")
                        .uri("lb://doctor-service"))
                
                // Patient Service Routes
                .route("patient-service", r -> r.path("/patient/**")
                        .uri("lb://patient-service"))

                // Lab Service Routes
                .route("lab-service", r -> r.path("/lab/**")
                        .uri("lb://lab-service"))
                
                // Health Check Route
                .route("health-check", r -> r.path("/health")
                        .uri("http://localhost:8080"))
                
                .build();
    }
}