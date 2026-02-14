package com.globalpatienttrack.admin.service;

import com.globalpatienttrack.shared.dto.CreateUserRequest;
import com.globalpatienttrack.shared.dto.UserDto;
import com.globalpatienttrack.shared.model.UserRole;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);

    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired(required = false)
    private RestTemplate directRestTemplate;

    @Value("${service.user-data-url}")
    private String userDataServiceUrl;

    private Long getOrganizationIdFromAuthentication(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        // First, try to get organizationId from authentication details (set by OAuth2 filter)
        if (authentication.getDetails() instanceof Map) {
            Map<String, Object> details = (Map<String, Object>) authentication.getDetails();
            if (details.get("organizationId") != null) {
                Object orgId = details.get("organizationId");
                if (orgId instanceof Number) {
                    return ((Number) orgId).longValue();
                } else if (orgId instanceof String) {
                    try {
                        return Long.parseLong((String) orgId);
                    } catch (NumberFormatException e) {
                        logger.warn("Could not parse organizationId from authentication details");
                    }
                }
            }
        }
        
        // Fallback: try to get from backend user-data-service
        String username = authentication.getName();
        try {
            RestTemplate template = (directRestTemplate != null) ? directRestTemplate : restTemplate;
            Map<String, Object> userInfo = template.getForObject(
                    userDataServiceUrl + "/users/internal/auth/" + username,
                    Map.class
            );
            
            if (userInfo != null && userInfo.get("organizationId") != null) {
                return ((Number) userInfo.get("organizationId")).longValue();
            }
        } catch (Exception e) {
            logger.warn("Could not retrieve organizationId from user-data-service for user: {}: {}", username, e.getMessage());
        }
        
        // If all else fails, return null - let user-data-service handle it
        return null;
    }

    public Map<String, Object> getDashboardData(Authentication authentication) {
        Map<String, Object> dashboard = new HashMap<>();
        List<UserDto> allUsers = getAllUsers(authentication);
        long totalUsers = allUsers.size();
        long totalDoctors = allUsers.stream().filter(u -> u.getRole() == UserRole.DOCTOR).count();
        long totalPatients = allUsers.stream().filter(u -> u.getRole() == UserRole.PATIENT).count();
        long activeUsers = allUsers.stream().filter(UserDto::isActive).count();
        
        dashboard.put("totalUsers", totalUsers);
        dashboard.put("totalDoctors", totalDoctors);
        dashboard.put("totalPatients", totalPatients);
        dashboard.put("activeUsers", activeUsers);
        dashboard.put("inactiveUsers", totalUsers - activeUsers);
        return dashboard;
    }

    public List<UserDto> getAllUsers(Authentication authentication) {
        Long organizationId = getOrganizationIdFromAuthentication(authentication);
        String url = userDataServiceUrl + "/users/internal/all";
        if (organizationId != null) {
            url += "?organizationId=" + organizationId;
        }
        RestTemplate template = (directRestTemplate != null) ? directRestTemplate : restTemplate;
        UserDto[] users = template.getForObject(url, UserDto[].class);
        return List.of(users != null ? users : new UserDto[0]);
    }

    public List<UserDto> getUsersByRole(UserRole role, Authentication authentication) {
        Long organizationId = getOrganizationIdFromAuthentication(authentication);
        String endpoint = role == UserRole.DOCTOR ? "/users/internal/doctors" : "/users/internal/patients";
        String url = userDataServiceUrl + endpoint;
        if (organizationId != null) {
            url += "?organizationId=" + organizationId;
        }
        RestTemplate template = (directRestTemplate != null) ? directRestTemplate : restTemplate;
        UserDto[] users = template.getForObject(url, UserDto[].class);
        return List.of(users != null ? users : new UserDto[0]);
    }

    public UserDto getUserById(Long userId, jakarta.servlet.http.HttpServletRequest httpRequest) {
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader != null) {
            headers.set("Authorization", authHeader);
        }
        org.springframework.http.HttpEntity<?> entity = new org.springframework.http.HttpEntity<>(headers);
        RestTemplate template = (directRestTemplate != null) ? directRestTemplate : restTemplate;
        return template.exchange(userDataServiceUrl + "/users/internal/user/" + userId, org.springframework.http.HttpMethod.GET, entity, UserDto.class).getBody();
    }

    public UserDto createUser(CreateUserRequest request, Authentication authentication, jakarta.servlet.http.HttpServletRequest httpRequest) {
        // Get the authenticated user's organization
        Long organizationId = getOrganizationIdFromAuthentication(authentication);
        logger.info("Extracted organizationId from authentication: {}", organizationId);
        
        // Override with request organizationId if provided (for admin to create in other orgs)
        if (request.getOrganizationId() != null) {
            organizationId = request.getOrganizationId();
            logger.info("Using organizationId from request: {}", organizationId);
        }
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        // Note: /users/register is a public endpoint that doesn't require authentication
        // so we don't pass the Authorization header
        
        UserDto userDto = new UserDto();
        userDto.setUsername(request.getUsername());
        userDto.setPassword(request.getPassword());
        userDto.setEmail(request.getEmail());
        userDto.setRole(request.getRole());
        if (organizationId != null) {
            userDto.setOrganizationId(organizationId);
            logger.info("Set organizationId on UserDto: {}", organizationId);
        } else {
            logger.warn("organizationId is NULL - user will be created without organization");
        }
        
        // Set firstName and lastName - either from fullName or use username as default
        if (request.getFullName() != null && !request.getFullName().isEmpty()) {
            String[] nameParts = request.getFullName().trim().split("\\s+", 2);
            userDto.setFirstName(nameParts[0]);
            if (nameParts.length > 1) userDto.setLastName(nameParts[1]);
        } else {
            // Use username as firstName if fullName not provided
            userDto.setFirstName(request.getUsername());
            userDto.setLastName(""); // Empty string for lastName
        }
        HttpEntity<UserDto> httpEntity = new HttpEntity<>(userDto, headers);
        // Use directRestTemplate to bypass LoadBalancer interceptor which can cause issues with ports
        RestTemplate template = (directRestTemplate != null) ? directRestTemplate : restTemplate;
        return template.postForObject(userDataServiceUrl + "/users/register", httpEntity, UserDto.class);
    }

    public UserDto updateUser(Long userId, CreateUserRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader != null) {
            headers.set("Authorization", authHeader);
        }
        UserDto userDto = new UserDto();
        userDto.setUsername(request.getUsername());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            userDto.setPassword(request.getPassword());
        }
        userDto.setEmail(request.getEmail());
        userDto.setRole(request.getRole());
        if (request.getFullName() != null && !request.getFullName().isEmpty()) {
            String[] nameParts = request.getFullName().trim().split("\\s+", 2);
            userDto.setFirstName(nameParts[0]);
            if (nameParts.length > 1) userDto.setLastName(nameParts[1]);
        }
        HttpEntity<UserDto> httpEntity = new HttpEntity<>(userDto, headers);
        RestTemplate template = (directRestTemplate != null) ? directRestTemplate : restTemplate;
        return template.exchange(userDataServiceUrl + "/users/" + userId, org.springframework.http.HttpMethod.PUT, httpEntity, UserDto.class).getBody();
    }

    public UserDto activateUser(Long userId, jakarta.servlet.http.HttpServletRequest httpRequest) {
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader != null) {
            headers.set("Authorization", authHeader);
        }
        org.springframework.http.HttpEntity<?> entity = new org.springframework.http.HttpEntity<>(headers);
        RestTemplate template = (directRestTemplate != null) ? directRestTemplate : restTemplate;
        return template.exchange(userDataServiceUrl + "/users/" + userId + "/activate", org.springframework.http.HttpMethod.PUT, entity, UserDto.class).getBody();
    }

    public UserDto deactivateUser(Long userId, jakarta.servlet.http.HttpServletRequest httpRequest) {
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader != null) {
            headers.set("Authorization", authHeader);
        }
        org.springframework.http.HttpEntity<?> entity = new org.springframework.http.HttpEntity<>(headers);
        RestTemplate template = (directRestTemplate != null) ? directRestTemplate : restTemplate;
        return template.exchange(userDataServiceUrl + "/users/" + userId + "/deactivate", org.springframework.http.HttpMethod.PUT, entity, UserDto.class).getBody();
    }

    public void deleteUser(Long userId, jakarta.servlet.http.HttpServletRequest httpRequest) {
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader != null) {
            headers.set("Authorization", authHeader);
        }
        org.springframework.http.HttpEntity<?> entity = new org.springframework.http.HttpEntity<>(headers);
        RestTemplate template = (directRestTemplate != null) ? directRestTemplate : restTemplate;
        template.exchange(userDataServiceUrl + "/users/" + userId, org.springframework.http.HttpMethod.DELETE, entity, Void.class);
    }

    public Map<String, Object> getSystemStatistics(Authentication authentication) {
        Map<String, Object> stats = new HashMap<>();
        List<UserDto> allUsers = getAllUsers(authentication);
        Map<String, Long> usersByRole = new HashMap<>();
        usersByRole.put("ADMIN", allUsers.stream().filter(u -> u.getRole() == UserRole.ADMIN).count());
        usersByRole.put("DOCTOR", allUsers.stream().filter(u -> u.getRole() == UserRole.DOCTOR).count());
        usersByRole.put("PATIENT", allUsers.stream().filter(u -> u.getRole() == UserRole.PATIENT).count());
        Map<String, Long> userActivity = new HashMap<>();
        userActivity.put("active", allUsers.stream().filter(UserDto::isActive).count());
        userActivity.put("inactive", allUsers.stream().filter(u -> !u.isActive()).count());
        stats.put("usersByRole", usersByRole);
        stats.put("userActivity", userActivity);
        stats.put("totalUsers", allUsers.size());
        return stats;
    }
}
