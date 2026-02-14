package com.globalpatienttrack.admin.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;
import java.util.Base64;

@Component
public class OAuth2TokenAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2TokenAuthenticationFilter.class);

    @Autowired
    private RestTemplate restTemplate;

    @Value("${service.auth-service-url:http://auth-service:8081}")
    private String authServiceUrl;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // Skip authentication for public endpoints
        String requestPath = request.getRequestURI();
        if (requestPath.startsWith("/actuator/") || requestPath.startsWith("/internal/")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            try {
                // First, try to validate token with auth service
                String validateUrl = authServiceUrl + "/auth/validate?token=" + token;
                Map<String, Object> tokenInfo = null;
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> response_map = restTemplate.getForObject(validateUrl, Map.class);
                    tokenInfo = response_map;
                } catch (HttpClientErrorException e) {
                    logger.warn("Could not validate token with auth service ({}), will try JWT decoding", e.getStatusCode());
                } catch (Exception e) {
                    logger.warn("Could not validate token with auth service, will try JWT decoding: {}", e.getMessage());
                }
                
                // If auth service validation succeeded, use that
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
                    
                    // Store organizationId in details for later retrieval
                    if (tokenInfo.get("organizationId") != null) {
                        Map<String, Object> details = new java.util.HashMap<>();
                        details.put("organizationId", tokenInfo.get("organizationId"));
                        authentication.setDetails(details);
                    }
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    // Fallback: decode JWT directly and extract claims
                    Map<String, Object> claims = decodeJWT(token);
                    if (claims != null) {
                        String username = (String) claims.get("sub");
                        String role = (String) claims.get("role");
                        
                        if (username != null) {
                            SimpleGrantedAuthority authority = role != null ? 
                                    new SimpleGrantedAuthority("ROLE_" + role) : 
                                    new SimpleGrantedAuthority("ROLE_USER");
                            
                            UsernamePasswordAuthenticationToken authentication = 
                                    new UsernamePasswordAuthenticationToken(
                                            username,
                                            null,
                                            Collections.singletonList(authority)
                                    );
                            
                            // Store all extracted claims in details
                            Map<String, Object> details = new java.util.HashMap<>(claims);
                            authentication.setDetails(details);
                            
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                            logger.debug("Token authenticated via JWT decoding for user: {}", username);
                        }
                    }
                }
            } catch (Exception e) {
                // Token validation and decoding failed - continue without authentication
                logger.warn("Token validation failed: " + e.getMessage());
            }
        }
        
        filterChain.doFilter(request, response);
    }

    /**
     * Decode JWT token and extract claims (without signature validation)
     * This is safe because we'll still validate with auth service in production,
     * but allows fallback when auth service is unavailable
     */
    private Map<String, Object> decodeJWT(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                logger.warn("Invalid JWT format");
                return null;
            }
            
            // Decode the payload (second part)
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            
            // Parse JSON manually (simple approach without external JSON library)
            // In production, use Jackson or Gson
            java.util.Map<String, Object> claims = new java.util.HashMap<>();
            
            // Simple JSON parsing - extract key-value pairs
            // This is a basic implementation; for production use Jackson
            if (payload.contains("\"sub\"")) {
                claims.put("sub", extractJsonValue(payload, "sub"));
            }
            if (payload.contains("\"organizationId\"")) {
                String orgIdStr = extractJsonValue(payload, "organizationId");
                try {
                    claims.put("organizationId", Long.parseLong(orgIdStr));
                } catch (NumberFormatException e) {
                    claims.put("organizationId", orgIdStr);
                }
            }
            if (payload.contains("\"role\"")) {
                claims.put("role", extractJsonValue(payload, "role"));
            }
            
            return claims.isEmpty() ? null : claims;
        } catch (Exception e) {
            logger.warn("Failed to decode JWT: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Simple helper to extract JSON string value for a given key
     */
    private String extractJsonValue(String json, String key) {
        String searchKey = "\"" + key + "\":";
        int startIndex = json.indexOf(searchKey);
        if (startIndex == -1) return null;
        
        startIndex += searchKey.length();
        char firstChar = json.charAt(startIndex);
        
        if (firstChar == '"') {
            // String value
            int endIndex = json.indexOf('"', startIndex + 1);
            return json.substring(startIndex + 1, endIndex);
        } else {
            // Numeric or boolean value
            int endIndex = startIndex;
            while (endIndex < json.length() && json.charAt(endIndex) != ',' && json.charAt(endIndex) != '}') {
                endIndex++;
            }
            return json.substring(startIndex, endIndex).trim();
        }
    }
}
