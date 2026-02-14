package com.globalpatienttrack.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class AuthenticationGatewayFilterFactory extends AbstractGatewayFilterFactory<AuthenticationGatewayFilterFactory.Config> {

    private final WebClient.Builder webClientBuilder;

    public AuthenticationGatewayFilterFactory(WebClient.Builder webClientBuilder) {
        super(Config.class);
        this.webClientBuilder = webClientBuilder;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getPath().value();
            
            // Skip auth validation for public paths
            if (path.startsWith("/auth/") || path.startsWith("/actuator/") || path.equals("/health")) {
                return chain.filter(exchange);
            }

            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                // No token - for now just continue (services will handle)
                return chain.filter(exchange);
            }

            String token = authHeader.substring(7);
            
            // Validate token with auth service
            return webClientBuilder.build()
                    .get()
                    .uri("http://auth-service:8081/auth/validate?token=" + token)
                    .retrieve()
                    .bodyToMono(String.class)
                    .flatMap(response -> {
                        // Token is valid, continue
                        return chain.filter(exchange);
                    })
                    .onErrorResume(error -> {
                        // Token validation failed
                        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                        return exchange.getResponse().setComplete();
                    });
        };
    }

    public static class Config {
        // Configuration properties if needed
    }
}
