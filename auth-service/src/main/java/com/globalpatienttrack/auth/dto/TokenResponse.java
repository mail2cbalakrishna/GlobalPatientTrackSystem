package com.globalpatienttrack.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.ALWAYS)
public class TokenResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private long expiresIn; // in seconds
    private String scope;
    private String organizationName;
    private Long organizationId;
    private Long userId;

    public TokenResponse() {
    }

    public TokenResponse(String accessToken, String refreshToken, long expiresIn, String scope) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.scope = scope;
    }

    public TokenResponse(String accessToken, String refreshToken, long expiresIn, String scope, String organizationName) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.scope = scope;
        this.organizationName = organizationName;
    }

    // 6-parameter constructor with organizationId
    public TokenResponse(String accessToken, String refreshToken, long expiresIn, String scope, String organizationName, Long organizationId) {
        this(accessToken, refreshToken, expiresIn, scope, organizationName, organizationId, null);
    }

    public TokenResponse(String accessToken, String refreshToken, long expiresIn, String scope, String organizationName, Long organizationId, Long userId) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.scope = scope;
        this.organizationName = organizationName;
        this.organizationId = organizationId;
        this.userId = userId;
    }

    // Getters and Setters
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

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public String getScope() {
        return scope;
    }

    public void setScope(String scope) {
        this.scope = scope;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}