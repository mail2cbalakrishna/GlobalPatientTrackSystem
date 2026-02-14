package com.globalpatienttrack.auth.controller;

import com.globalpatienttrack.auth.dto.LoginRequest;
import com.globalpatienttrack.auth.dto.TokenResponse;
import com.globalpatienttrack.auth.service.OAuth2Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private OAuth2Service oauth2Service;

    /**
     * OAuth2.0 Password Grant - Standard endpoint
     * POST /auth/token?grant_type=password&username=xxx&password=xxx
     */
    @PostMapping("/token")
    public ResponseEntity<TokenResponse> token(
            @RequestParam("grant_type") String grantType,
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "password", required = false) String password,
            @RequestParam(value = "refresh_token", required = false) String refreshToken) {
        
        if ("password".equals(grantType)) {
            if (username == null || password == null) {
                throw new RuntimeException("Username and password required");
            }
            return ResponseEntity.ok(oauth2Service.login(username, password));
            
        } else if ("refresh_token".equals(grantType)) {
            if (refreshToken == null) {
                throw new RuntimeException("Refresh token required");
            }
            return ResponseEntity.ok(oauth2Service.refresh(refreshToken));
            
        } else {
            throw new RuntimeException("Unsupported grant_type: " + grantType);
        }
    }

    /**
     * Login with JSON body (easier for frontend)
     * POST /auth/login with {"username": "xxx", "password": "xxx"}
     */
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest loginRequest) {
        System.out.println("LOGIN CALLED: username=" + loginRequest.getUsername());
        return ResponseEntity.ok(oauth2Service.login(loginRequest.getUsername(), loginRequest.getPassword()));
    }

    /**
     * Test endpoint to verify auth is working
     */
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Auth service is working!");
    }

    /**
     * Refresh access token
     * POST /auth/refresh with {"refreshToken": "xxx"}
     */
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null) {
            throw new RuntimeException("refreshToken is required");
        }
        return ResponseEntity.ok(oauth2Service.refresh(refreshToken));
    }

    /**
     * Validate access token
     * GET /auth/validate?token=xxx
     */
    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(@RequestParam("token") String token) {
        return ResponseEntity.ok(oauth2Service.validateToken(token));
    }

    /**
     * Revoke token (logout)
     * POST /auth/revoke with {"token": "xxx"}
     */
    @PostMapping("/revoke")
    public ResponseEntity<Map<String, String>> revoke(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        if (token == null) {
            throw new RuntimeException("token is required");
        }
        oauth2Service.revokeToken(token);
        return ResponseEntity.ok(Map.of("message", "Token revoked successfully"));
    }

    /**
     * Logout with Bearer token (alternative to revoke)
     * POST /auth/logout with Authorization: Bearer <token>
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Bearer token required");
        }
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        oauth2Service.revokeToken(token);
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }
}