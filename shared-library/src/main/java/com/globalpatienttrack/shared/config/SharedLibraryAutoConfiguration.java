package com.globalpatienttrack.shared.config;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.web.client.RestTemplate;

@AutoConfiguration
@ComponentScan(basePackages = "com.globalpatienttrack.shared")
public class SharedLibraryAutoConfiguration {
    
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}