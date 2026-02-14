package com.globalpatienttrack.doctor.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenUtil {

    /**
     * Extract organizationId from JWT token in the authentication context
     */
    public Long extractOrganizationId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return null;
        }

        try {
            // If using Spring Security's OAuth2 JWT support
            if (authentication.getPrincipal() instanceof Jwt) {
                Jwt token = (Jwt) authentication.getPrincipal();
                Object orgId = token.getClaim("organizationId");
                if (orgId != null) {
                    if (orgId instanceof Long) {
                        return (Long) orgId;
                    } else if (orgId instanceof Integer) {
                        return ((Integer) orgId).longValue();
                    } else if (orgId instanceof String) {
                        return Long.parseLong((String) orgId);
                    }
                }
            }
        } catch (Exception e) {
            // Fallback: return null if token parsing fails
            return null;
        }
        
        return null;
    }

    /**
     * Extract username from JWT token in the authentication context
     */
    public String extractUsername(Authentication authentication) {
        if (authentication == null) {
            return null;
        }
        return authentication.getName();
    }
}
