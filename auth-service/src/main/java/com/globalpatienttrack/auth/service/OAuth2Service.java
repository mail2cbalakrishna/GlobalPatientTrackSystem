package com.globalpatienttrack.auth.service;

import com.globalpatienttrack.auth.dto.TokenResponse;
import com.globalpatienttrack.auth.entity.OAuthToken;
import com.globalpatienttrack.auth.repository.OAuthTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class OAuth2Service {

    @Autowired
    private OAuthTokenRepository tokenRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${service.user-data-url}")
    private String userDataServiceUrl;

    @Value("${oauth2.access-token.expiration:3600}")
    private long accessTokenExpiration;

    @Value("${oauth2.refresh-token.expiration:2592000}")
    private long refreshTokenExpiration;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public TokenResponse login(String username, String password) {
        try {
            String url = userDataServiceUrl + "/users/internal/auth/" + username;
            Map<String, Object> userDetails = restTemplate.getForObject(url, Map.class);
            
            if (userDetails == null) {
                throw new RuntimeException("User not found");
            }

            // VALIDATE PASSWORD
            String storedPassword = (String) userDetails.get("password");
            if (storedPassword == null || !passwordEncoder.matches(password, storedPassword)) {
                throw new RuntimeException("Invalid username or password");
            }

            String role = (String) userDetails.get("role");
            Boolean active = (Boolean) userDetails.get("active");
            String organizationName = (String) userDetails.get("organizationName");
            Long organizationId = null;
            Long userId = null;
            
            // Extract organizationId (might come as Double from JSON)
            Object orgIdObj = userDetails.get("organizationId");
            if (orgIdObj instanceof Number) {
                organizationId = ((Number) orgIdObj).longValue();
            }
            
            // Extract userId (might come as Double from JSON)
            Object userIdObj = userDetails.get("userId");
            if (userIdObj instanceof Number) {
                userId = ((Number) userIdObj).longValue();
            }

            if (!active) {
                throw new RuntimeException("User account is inactive");
            }

            tokenRepository.findByUsernameAndActiveTrue(username)
                .ifPresent(token -> {
                    token.setActive(false);
                    token.setRevokedAt(LocalDateTime.now());
                    tokenRepository.save(token);
                });

            String accessToken = generateToken();
            String refreshToken = generateToken();

            LocalDateTime now = LocalDateTime.now();
            LocalDateTime accessExpiry = now.plusSeconds(accessTokenExpiration);
            LocalDateTime refreshExpiry = now.plusSeconds(refreshTokenExpiration);

            OAuthToken oauthToken = new OAuthToken(
                accessToken,
                refreshToken,
                username,
                role,
                accessExpiry,
                refreshExpiry
            );
            tokenRepository.save(oauthToken);

            return new TokenResponse(
                accessToken,
                refreshToken,
                accessTokenExpiration,
                role.toLowerCase(),
                organizationName,
                organizationId,
                userId
            );

        } catch (Exception e) {
            throw new RuntimeException("Authentication failed: " + e.getMessage(), e);
        }
    }

    public TokenResponse refresh(String refreshToken) {
        OAuthToken token = tokenRepository.findByRefreshTokenAndActiveTrue(refreshToken)
            .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (token.isRefreshTokenExpired()) {
            token.setActive(false);
            token.setRevokedAt(LocalDateTime.now());
            tokenRepository.save(token);
            throw new RuntimeException("Refresh token expired");
        }

        String newAccessToken = generateToken();
        LocalDateTime newAccessExpiry = LocalDateTime.now().plusSeconds(accessTokenExpiration);

        token.setAccessToken(newAccessToken);
        token.setAccessTokenExpiresAt(newAccessExpiry);
        tokenRepository.save(token);

        return new TokenResponse(
            newAccessToken,
            refreshToken,
            accessTokenExpiration,
            token.getRole().toLowerCase()
        );
    }

    public Map<String, Object> validateToken(String accessToken) {
        OAuthToken token = tokenRepository.findByAccessTokenAndActiveTrue(accessToken)
            .orElseThrow(() -> new RuntimeException("Invalid access token"));

        if (token.isAccessTokenExpired()) {
            throw new RuntimeException("Access token expired");
        }

        return Map.of(
            "username", token.getUsername(),
            "role", token.getRole(),
            "active", token.isActive(),
            "expiresAt", token.getAccessTokenExpiresAt().toString()
        );
    }

    public void revokeToken(String accessToken) {
        tokenRepository.findByAccessTokenAndActiveTrue(accessToken)
            .ifPresent(token -> {
                token.setActive(false);
                token.setRevokedAt(LocalDateTime.now());
                tokenRepository.save(token);
            });
    }

    private String generateToken() {
        return UUID.randomUUID().toString().replace("-", "") + 
               UUID.randomUUID().toString().replace("-", "");
    }
}
