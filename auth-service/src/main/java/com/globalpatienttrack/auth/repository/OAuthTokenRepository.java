package com.globalpatienttrack.auth.repository;

import com.globalpatienttrack.auth.entity.OAuthToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OAuthTokenRepository extends JpaRepository<OAuthToken, Long> {
    
    Optional<OAuthToken> findByAccessTokenAndActiveTrue(String accessToken);
    
    Optional<OAuthToken> findByRefreshTokenAndActiveTrue(String refreshToken);
    
    Optional<OAuthToken> findByUsernameAndActiveTrue(String username);
    
    void deleteByUsername(String username);
}
