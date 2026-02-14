package com.globalpatienttrack.admin.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AdminServiceConfig {
    
    // Create a separate non-LoadBalanced RestTemplate for direct service-to-service calls
    @Bean("directRestTemplate")
    public RestTemplate directRestTemplate() {
        return new RestTemplate();
    }
}