package com.globalpatienttrack.lab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EnableDiscoveryClient
@ComponentScan(basePackages = {"com.globalpatienttrack.lab", "com.globalpatienttrack.shared"})
public class LabServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(LabServiceApplication.class, args);
    }
}
