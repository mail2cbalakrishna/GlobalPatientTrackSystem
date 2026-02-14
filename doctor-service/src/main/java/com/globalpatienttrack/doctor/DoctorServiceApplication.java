package com.globalpatienttrack.doctor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EnableDiscoveryClient
@ComponentScan(basePackages = {"com.globalpatienttrack.doctor", "com.globalpatienttrack.shared"})
public class DoctorServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DoctorServiceApplication.class, args);
    }
}