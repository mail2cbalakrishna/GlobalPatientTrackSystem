package com.globalpatienttrack.userdata.service;

import com.globalpatienttrack.shared.dto.UserDto;
import com.globalpatienttrack.shared.model.UserRole;
import com.globalpatienttrack.userdata.entity.User;
import com.globalpatienttrack.userdata.entity.Organization;
import com.globalpatienttrack.userdata.repository.UserRepository;
import com.globalpatienttrack.userdata.repository.OrganizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserDto createUser(UserDto userDto) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(userDto.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(userDto.getUsername());
        // Encode password from userDto, use default if not provided
        String password = userDto.getPassword() != null ? userDto.getPassword() : "defaultPassword";
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(userDto.getEmail());
        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setRole(userDto.getRole());
        user.setActive(true);
        
        // Set organization if provided
        if (userDto.getOrganizationId() != null) {
            Organization organization = organizationRepository.findById(userDto.getOrganizationId())
                    .orElseThrow(() -> new RuntimeException("Organization not found"));
            user.setOrganization(organization);
        }

        User savedUser = userRepository.save(user);
        return convertToDto(savedUser);
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDto(user);
    }

    public UserDto getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDto(user);
    }

    public java.util.Map<String, Object> getUserForAuth(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Return user data including password for authentication
        java.util.Map<String, Object> authData = new java.util.HashMap<>();
        authData.put("userId", user.getId());
        authData.put("id", user.getId());
        authData.put("username", user.getUsername());
        authData.put("password", user.getPassword()); // Include encrypted password
        authData.put("email", user.getEmail());
        authData.put("role", user.getRole().name());
        authData.put("active", user.isActive());
        
        // Add organization info if available
        if (user.getOrganization() != null) {
            authData.put("organizationName", user.getOrganization().getName());
            authData.put("organizationId", user.getOrganization().getId());
        }
        
        return authData;
    }

    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDto(user);
    }

    public List<UserDto> getUsersByRole(UserRole role) {
        List<User> users = userRepository.findByRoleAndActiveTrue(role);
        return users.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<UserDto> getActiveUsers() {
        List<User> users = userRepository.findByActiveTrue();
        return users.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    // Organization-based filtering methods
    public List<UserDto> getUsersByRoleAndOrganization(UserRole role, Long organizationId) {
        List<User> users = userRepository.findByRoleAndActiveTrueAndOrganizationId(role, organizationId);
        return users.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<UserDto> getActiveUsersByOrganization(Long organizationId) {
        List<User> users = userRepository.findByActiveTrueAndOrganizationId(organizationId);
        return users.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public Long getOrganizationIdFromAuthentication(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElse(null);
        if (user != null && user.getOrganization() != null) {
            return user.getOrganization().getId();
        }
        
        return null;
    }

    public UserDto updateUser(Long id, UserDto userDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only update fields if they are not null (partial update support)
        if (userDto.getFirstName() != null) {
            user.setFirstName(userDto.getFirstName());
        }
        if (userDto.getLastName() != null) {
            user.setLastName(userDto.getLastName());
        }
        if (userDto.getEmail() != null) {
            user.setEmail(userDto.getEmail());
        }

        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }

    public UserDto activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(true);
        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }

    public UserDto deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

    public boolean isOwner(String username, Long userId) {
        User user = userRepository.findByUsername(username).orElse(null);
        return user != null && user.getId().equals(userId);
    }

    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        // Never return password in DTO
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setRole(user.getRole());
        dto.setActive(user.isActive());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        
        // Set organization info if available
        if (user.getOrganization() != null) {
            dto.setOrganizationName(user.getOrganization().getName());
            dto.setOrganizationId(user.getOrganization().getId());
        }
        
        return dto;
    }

    public UserDto getUserByPatientId(Long patientId) {
        return userRepository.findByPatientId(patientId)
                .map(this::convertToDto)
                .orElse(null);
    }
}