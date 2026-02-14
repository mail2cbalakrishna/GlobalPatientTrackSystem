package com.globalpatienttrack.userdata.controller;

import com.globalpatienttrack.shared.dto.UserDto;
import com.globalpatienttrack.shared.model.UserRole;
import com.globalpatienttrack.userdata.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;


@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserDto> registerUser(@Valid @RequestBody UserDto userDto) {
        UserDto user = userService.createUser(userDto);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userService.isOwner(authentication.name, #id)")
    public ResponseEntity<UserDto> getUserById(@PathVariable("id") Long id) {
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserDto> getUserByUsername(@PathVariable("username") String username) {
        UserDto user = userService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }

    // Internal endpoint for authentication - returns user with password
    @GetMapping("/internal/auth/{username}")
    public ResponseEntity<java.util.Map<String, Object>> getUserForAuth(@PathVariable("username") String username) {
        java.util.Map<String, Object> authUser = userService.getUserForAuth(username);
        return ResponseEntity.ok(authUser);
    }

    // Internal endpoints for service-to-service calls (no authentication required)
    @GetMapping("/internal/user/{id}")
    public ResponseEntity<UserDto> getInternalUserById(@PathVariable("id") Long id) {
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/internal/user-by-username/{username}")
    public ResponseEntity<UserDto> getInternalUserByUsername(@PathVariable("username") String username) {
        UserDto user = userService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/internal/doctors")
    public ResponseEntity<List<UserDto>> getInternalDoctors(@RequestParam(value = "organizationId", required = false) Long organizationId) {
        List<UserDto> doctors = organizationId != null 
            ? userService.getUsersByRoleAndOrganization(UserRole.DOCTOR, organizationId)
            : userService.getUsersByRole(UserRole.DOCTOR);
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/internal/patients")
    public ResponseEntity<List<UserDto>> getInternalPatients(@RequestParam(value = "organizationId", required = false) Long organizationId) {
        List<UserDto> patients = organizationId != null
            ? userService.getUsersByRoleAndOrganization(UserRole.PATIENT, organizationId)
            : userService.getUsersByRole(UserRole.PATIENT);
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/internal/all")
    public ResponseEntity<List<UserDto>> getInternalAllUsers(@RequestParam(value = "organizationId", required = false) Long organizationId) {
        List<UserDto> users = organizationId != null
            ? userService.getActiveUsersByOrganization(organizationId)
            : userService.getActiveUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> getUserByEmail(@PathVariable("email") String email) {
        UserDto user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<List<UserDto>> getUsersByRole(@PathVariable("role") UserRole role, Authentication authentication) {
        Long organizationId = userService.getOrganizationIdFromAuthentication(authentication);
        List<UserDto> users = organizationId != null
            ? userService.getUsersByRoleAndOrganization(role, organizationId)
            : userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getActiveUsers(Authentication authentication) {
        Long organizationId = userService.getOrganizationIdFromAuthentication(authentication);
        List<UserDto> users = organizationId != null
            ? userService.getActiveUsersByOrganization(organizationId)
            : userService.getActiveUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/doctors")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<List<UserDto>> getAllDoctors(
            @RequestParam(value = "organizationId", required = false) Long organizationId,
            Authentication authentication) {
        // If organizationId is not provided, extract from authenticated user
        if (organizationId == null) {
            organizationId = userService.getOrganizationIdFromAuthentication(authentication);
        }
        
        List<UserDto> doctors = organizationId != null 
            ? userService.getUsersByRoleAndOrganization(UserRole.DOCTOR, organizationId)
            : userService.getUsersByRole(UserRole.DOCTOR);
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/patients")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<List<UserDto>> getAllPatients(
            @RequestParam(value = "organizationId", required = false) Long organizationId,
            Authentication authentication) {
        // If organizationId is not provided, extract from authenticated user
        if (organizationId == null) {
            organizationId = userService.getOrganizationIdFromAuthentication(authentication);
        }
        
        List<UserDto> patients = organizationId != null
            ? userService.getUsersByRoleAndOrganization(UserRole.PATIENT, organizationId)
            : userService.getUsersByRole(UserRole.PATIENT);
        return ResponseEntity.ok(patients);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userService.isOwner(authentication.name, #id)")
    public ResponseEntity<UserDto> updateUser(@PathVariable("id") Long id, @Valid @RequestBody UserDto userDto) {
        UserDto updatedUser = userService.updateUser(id, userDto);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> activateUser(@PathVariable("id") Long id) {
        UserDto user = userService.activateUser(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> deactivateUser(@PathVariable("id") Long id) {
        UserDto user = userService.deactivateUser(id);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/internal/user/{id}")
    public ResponseEntity<Void> deleteUserInternal(@PathVariable("id") Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/internal/user/{id}")
    public ResponseEntity<UserDto> updateUserInternal(@PathVariable("id") Long id, @Valid @RequestBody UserDto userDto) {
        UserDto updatedUser = userService.updateUser(id, userDto);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/internal/patient-user/{patientId}")
    public ResponseEntity<UserDto> getUserByPatientId(@PathVariable("patientId") Long patientId) {
        UserDto user = userService.getUserByPatientId(patientId);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }
}