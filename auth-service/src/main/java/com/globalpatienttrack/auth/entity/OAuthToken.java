package com.globalpatienttrack.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "oauth_tokens")
public class OAuthToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String accessToken;
    
    @Column(nullable = false, unique = true)
    private String refreshToken;
    
    @Column(nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String role;
    
    @Column(nullable = false)
    private LocalDateTime accessTokenExpiresAt;
    
    @Column(nullable = false)
    private LocalDateTime refreshTokenExpiresAt;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime revokedAt;
    
    @Column(nullable = false)
    private boolean active = true;

    public OAuthToken() {
        this.createdAt = LocalDateTime.now();
    }

    public OAuthToken(String accessToken, String refreshToken, String username, String role,
                      LocalDateTime accessTokenExpiresAt, LocalDateTime refreshTokenExpiresAt) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.username = username;
        this.role = role;
        this.accessTokenExpiresAt = accessTokenExpiresAt;
        this.refreshTokenExpiresAt = refreshTokenExpiresAt;
        this.createdAt = LocalDateTime.now();
        this.active = true;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getAccessTokenExpiresAt() {
        return accessTokenExpiresAt;
    }

    public void setAccessTokenExpiresAt(LocalDateTime accessTokenExpiresAt) {
        this.accessTokenExpiresAt = accessTokenExpiresAt;
    }

    public LocalDateTime getRefreshTokenExpiresAt() {
        return refreshTokenExpiresAt;
    }

    public void setRefreshTokenExpiresAt(LocalDateTime refreshTokenExpiresAt) {
        this.refreshTokenExpiresAt = refreshTokenExpiresAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getRevokedAt() {
        return revokedAt;
    }

    public void setRevokedAt(LocalDateTime revokedAt) {
        this.revokedAt = revokedAt;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
    
    public boolean isAccessTokenExpired() {
        return LocalDateTime.now().isAfter(accessTokenExpiresAt);
    }
    
    public boolean isRefreshTokenExpired() {
        return LocalDateTime.now().isAfter(refreshTokenExpiresAt);
    }
}
