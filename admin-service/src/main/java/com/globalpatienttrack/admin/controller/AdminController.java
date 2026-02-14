package com.globalpatienttrack.admin.controller;

import com.globalpatienttrack.admin.service.AdminService;
import com.globalpatienttrack.shared.dto.CreateUserRequest;
import com.globalpatienttrack.shared.dto.UserDto;
import com.globalpatienttrack.shared.model.UserRole;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
//@PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for development
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(org.springframework.security.core.Authentication authentication) {
        Map<String, Object> dashboard = adminService.getDashboardData(authentication);
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers(org.springframework.security.core.Authentication authentication) {
        List<UserDto> users = adminService.getAllUsers(authentication);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/doctors")
    public ResponseEntity<List<UserDto>> getAllDoctors(org.springframework.security.core.Authentication authentication) {
        List<UserDto> doctors = adminService.getUsersByRole(UserRole.DOCTOR, authentication);
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/users/patients")
    public ResponseEntity<List<UserDto>> getAllPatients(org.springframework.security.core.Authentication authentication) {
        List<UserDto> patients = adminService.getUsersByRole(UserRole.PATIENT, authentication);
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserDto> getUserById(@PathVariable("userId") Long userId, jakarta.servlet.http.HttpServletRequest httpRequest) {
        UserDto user = adminService.getUserById(userId, httpRequest);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/users")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserRequest request, org.springframework.security.core.Authentication authentication, jakarta.servlet.http.HttpServletRequest httpRequest) {
        UserDto newUser = adminService.createUser(request, authentication, httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<UserDto> updateUser(@PathVariable("userId") Long userId, @Valid @RequestBody CreateUserRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        UserDto updatedUser = adminService.updateUser(userId, request, httpRequest);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/users/{userId}/activate")
    public ResponseEntity<UserDto> activateUser(@PathVariable("userId") Long userId, jakarta.servlet.http.HttpServletRequest httpRequest) {
        UserDto user = adminService.activateUser(userId, httpRequest);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{userId}/deactivate")
    public ResponseEntity<UserDto> deactivateUser(@PathVariable("userId") Long userId, jakarta.servlet.http.HttpServletRequest httpRequest) {
        UserDto user = adminService.deactivateUser(userId, httpRequest);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable("userId") Long userId, jakarta.servlet.http.HttpServletRequest httpRequest) {
        adminService.deleteUser(userId, httpRequest);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSystemStats(org.springframework.security.core.Authentication authentication) {
        Map<String, Object> stats = adminService.getSystemStatistics(authentication);
        return ResponseEntity.ok(stats);
    }
}