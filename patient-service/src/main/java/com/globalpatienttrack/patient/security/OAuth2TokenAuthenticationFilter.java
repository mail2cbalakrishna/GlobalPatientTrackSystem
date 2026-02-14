package com.globalpatienttrack.patient.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;

public class OAuth2TokenAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${service.auth-service-url}")
    private String authServiceUrl;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // Skip authentication for public endpoints
        String requestPath = request.getRequestURI();
        if (requestPath.startsWith("/actuator/")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            try {
                // Validate token with auth service
                String validateUrl = authServiceUrl + "/auth/validate?token=" + token;
                Map<String, Object> tokenInfo = restTemplate.getForObject(validateUrl, Map.class);
                
                if (tokenInfo != null && Boolean.TRUE.equals(tokenInfo.get("active"))) {
                    String username = (String) tokenInfo.get("username");
                    String role = (String) tokenInfo.get("role");
                    
                    // Create authentication with ROLE_ prefix for Spring Security
                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
                    
                    UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(
                                    username,
                                    null,
                                    Collections.singletonList(authority)
                            );
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                // Token validation failed - continue without authentication
                logger.warn("Token validation failed: " + e.getMessage());
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
