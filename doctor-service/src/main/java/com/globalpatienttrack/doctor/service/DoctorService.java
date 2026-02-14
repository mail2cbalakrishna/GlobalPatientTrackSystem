package com.globalpatienttrack.doctor.service;

import com.globalpatienttrack.doctor.exception.PatientCreationException;
import com.globalpatienttrack.doctor.exception.PatientNotFoundException;
import com.globalpatienttrack.doctor.model.Patient;
import com.globalpatienttrack.doctor.repository.PatientRepository;
import com.globalpatienttrack.shared.dto.UserDto;
import com.globalpatienttrack.shared.dto.PatientDto;
import com.globalpatienttrack.shared.model.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.ArrayList;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private PatientRepository patientRepository;

    @Value("${service.user-data-url}")
    private String userDataServiceUrl;
    
    /**
     * Get doctor profile by ID
     */
    public UserDto getDoctorProfile(Long doctorId) {
        return restTemplate.getForObject(
                userDataServiceUrl + "/users/internal/user/" + doctorId,
                UserDto.class
        );
    }

    public List<UserDto> searchDoctors(String name, Long id) {
        List<UserDto> allDoctors = getAllDoctors();
        
        return allDoctors.stream()
                .filter(doctor -> {
                    if (id != null) {
                        return doctor.getId().equals(id);
                    }
                    if (name != null && !name.trim().isEmpty()) {
                        String fullName = (doctor.getFirstName() + " " + doctor.getLastName()).toLowerCase();
                        return fullName.contains(name.toLowerCase()) ||
                               doctor.getUsername().toLowerCase().contains(name.toLowerCase());
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    public List<UserDto> getAllPatients() {
        // Get all users with PATIENT role
        UserDto[] userPatients = restTemplate.getForObject(
                userDataServiceUrl + "/users/internal/patients",
                UserDto[].class
        );
        
        if (userPatients == null || userPatients.length == 0) {
            return List.of();
        }
        
        // Convert to list for easier processing
        return List.of(userPatients);
    }
    
    /**
     * Get all patients with their medical data (PatientDto)
     * This combines User data with Patient medical records
     * Filters by the specified organization
     */
    public List<PatientDto> getAllPatientsWithMedicalDataByOrganization(Long organizationId) {
        // Get all users with PATIENT role (optionally filtered by organization)
        String url = userDataServiceUrl + "/users/internal/patients";
        if (organizationId != null) {
            url += "?organizationId=" + organizationId;
        }
        
        UserDto[] userPatients = restTemplate.getForObject(url, UserDto[].class);
        
        if (userPatients == null || userPatients.length == 0) {
            return List.of();
        }
        
        List<PatientDto> patientDtos = new ArrayList<>();
        
        // For each user, fetch their medical data from patients table
        for (UserDto user : userPatients) {
            PatientDto patientDto = new PatientDto();
            
            // Set user data
            patientDto.setUserId(user.getId());
            patientDto.setUsername(user.getUsername());
            patientDto.setEmail(user.getEmail());
            patientDto.setOrganizationName(user.getOrganizationName());
            patientDto.setOrganizationId(user.getOrganizationId());
            patientDto.setPatientName(user.getFirstName() + " " + user.getLastName());
            
            // Fetch medical data if exists
            Optional<Patient> patientRecord = patientRepository.findByUserId(user.getId());
            if (patientRecord.isPresent()) {
                Patient patient = patientRecord.get();
                patientDto.setPatientId(patient.getId());
                patientDto.setAge(patient.getAge());
                patientDto.setGender(patient.getGender());
                patientDto.setBloodType(patient.getBloodType());
                patientDto.setPhone(patient.getPhone());
                patientDto.setAddress(patient.getAddress());
                patientDto.setMedicalHistory(patient.getMedicalHistory());
                patientDto.setCurrentMedications(patient.getCurrentMedications());
            }
            
            patientDtos.add(patientDto);
        }
        
        return patientDtos;
    }

    public UserDto getPatientDetails(Long patientId) {
        return restTemplate.getForObject(
                userDataServiceUrl + "/users/internal/user/" + patientId,
                UserDto.class
        );
    }
    
    /**
     * Get patient details with medical data (PatientDto)
     * This combines User data with Patient medical records
     */
    public PatientDto getPatientDetailsWithMedicalData(Long userId) {
        // Get user data
        UserDto user = restTemplate.getForObject(
                userDataServiceUrl + "/users/internal/user/" + userId,
                UserDto.class
        );
        
        if (user == null) {
            throw new PatientNotFoundException("Patient not found with userId: " + userId);
        }
        
        PatientDto patientDto = new PatientDto();
        
        // Set user data
        patientDto.setUserId(user.getId());
        patientDto.setUsername(user.getUsername());
        patientDto.setEmail(user.getEmail());
        patientDto.setOrganizationName(user.getOrganizationName());
        patientDto.setPatientName(user.getFirstName() + " " + user.getLastName());
        
        // Fetch medical data if exists
        Optional<Patient> patientRecord = patientRepository.findByUserId(user.getId());
        if (patientRecord.isPresent()) {
            Patient patient = patientRecord.get();
            patientDto.setPatientId(patient.getId());
            patientDto.setAge(patient.getAge());
            patientDto.setGender(patient.getGender());
            patientDto.setBloodType(patient.getBloodType());
            patientDto.setPhone(patient.getPhone());
            patientDto.setAddress(patient.getAddress());
            patientDto.setMedicalHistory(patient.getMedicalHistory());
            patientDto.setCurrentMedications(patient.getCurrentMedications());
        }
        
        return patientDto;
    }

    @Transactional
    public PatientDto createPatient(PatientDto patientDto, Long organizationId) {
        return createPatientByOrganization(patientDto, organizationId);
    }

    @Transactional
    public PatientDto createPatientByOrganization(PatientDto patientDto, Long organizationId) {
        try {
            if (organizationId == null) {
                throw new PatientCreationException("Could not determine doctor's organization");
            }
            
            // Step 1: Create a basic user account with login credentials
            UserDto userDto = new UserDto();
            userDto.setUsername(generateUsername(patientDto.getPatientName()));
            userDto.setPassword("patient123"); // Default password - patient can change later
            userDto.setEmail(generateEmail(patientDto.getPatientName()));
            userDto.setFirstName(extractFirstName(patientDto.getPatientName()));
            userDto.setLastName(extractLastName(patientDto.getPatientName()));
            userDto.setRole(UserRole.PATIENT);
            userDto.setActive(true);
            userDto.setOrganizationId(organizationId); // Assign to same organization as doctor
            
            // Step 2: Register the user account (creates login credentials)
            UserDto createdUser = restTemplate.postForObject(
                    userDataServiceUrl + "/users/register",
                    userDto,
                    UserDto.class
            );
            
            if (createdUser == null) {
                throw new PatientCreationException("Failed to create user account for patient");
            }
            
            // Step 3: Save medical data to patients table (PRIVATE - not visible to admin)
            Patient patient = new Patient();
            patient.setUserId(createdUser.getId());
            patient.setPatientName(patientDto.getPatientName());
            patient.setAge(patientDto.getAge());
            patient.setGender(patientDto.getGender());
            patient.setBloodType(patientDto.getBloodType());
            patient.setPhone(patientDto.getPhone());
            patient.setAddress(patientDto.getAddress());
            patient.setMedicalHistory(patientDto.getMedicalHistory());
            patient.setCurrentMedications(patientDto.getCurrentMedications());
            
            Patient savedPatient = patientRepository.save(patient);
            
            // Step 4: Return complete PatientDto with user + medical data
            patientDto.setPatientId(savedPatient.getId());
            patientDto.setUserId(createdUser.getId());
            patientDto.setUsername(createdUser.getUsername());
            patientDto.setEmail(createdUser.getEmail());
            patientDto.setOrganizationName(createdUser.getOrganizationName());
            patientDto.setOrganizationId(createdUser.getOrganizationId());
            
            return patientDto;
        } catch (Exception e) {
            throw new PatientCreationException("Failed to create patient: " + e.getMessage(), e);
        }
    }
    
    @Transactional
    public PatientDto updatePatient(Long userId, PatientDto patientDto) {
        // Step 1: Update basic user info using internal endpoint
        UserDto userDto = new UserDto();
        userDto.setFirstName(extractFirstName(patientDto.getPatientName()));
        userDto.setLastName(extractLastName(patientDto.getPatientName()));
        userDto.setEmail(patientDto.getEmail());
        
        // Use exchange() with PUT method to call internal endpoint
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            org.springframework.http.HttpEntity<UserDto> requestEntity = new org.springframework.http.HttpEntity<>(userDto, headers);
            
            restTemplate.exchange(
                userDataServiceUrl + "/users/internal/user/" + userId,
                org.springframework.http.HttpMethod.valueOf("PUT"),
                requestEntity,
                UserDto.class
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to update user data: " + e.getMessage(), e);
        }
        
        // Step 2: Update medical data in Patient table
        Optional<Patient> existingPatient = patientRepository.findByUserId(userId);
        
        if (existingPatient.isPresent()) {
            Patient patient = existingPatient.get();
            patient.setPatientName(patientDto.getPatientName());
            patient.setAge(patientDto.getAge());
            patient.setGender(patientDto.getGender());
            patient.setBloodType(patientDto.getBloodType());
            patient.setPhone(patientDto.getPhone());
            patient.setAddress(patientDto.getAddress());
            patient.setMedicalHistory(patientDto.getMedicalHistory());
            patient.setCurrentMedications(patientDto.getCurrentMedications());
            
            patientRepository.save(patient);
            patientDto.setPatientId(patient.getId());
        } else {
            // If no medical record exists, create one
            Patient patient = new Patient();
            patient.setUserId(userId);
            patient.setPatientName(patientDto.getPatientName());
            patient.setAge(patientDto.getAge());
            patient.setGender(patientDto.getGender());
            patient.setBloodType(patientDto.getBloodType());
            patient.setPhone(patientDto.getPhone());
            patient.setAddress(patientDto.getAddress());
            patient.setMedicalHistory(patientDto.getMedicalHistory());
            patient.setCurrentMedications(patientDto.getCurrentMedications());
            
            Patient savedPatient = patientRepository.save(patient);
            patientDto.setPatientId(savedPatient.getId());
        }
        
        return patientDto;
    }
    
    @Transactional
    public void deletePatient(Long userId) {
        try {
            // Delete user account first - this will CASCADE delete the patient record
            // due to ON DELETE CASCADE foreign key constraint
            restTemplate.delete(userDataServiceUrl + "/users/internal/user/" + userId);
            
            // Note: Patient record is automatically deleted by database cascade
            // No need to manually delete from patients table
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete patient: " + e.getMessage(), e);
        }
    }
    
    private String generateUsername(String patientName) {
        if (patientName == null) return "patient" + System.currentTimeMillis();
        return patientName.toLowerCase().replace(" ", ".") + System.currentTimeMillis() % 1000;
    }
    
    private String generateEmail(String patientName) {
        if (patientName == null) return "patient@hospital.com";
        return patientName.toLowerCase().replace(" ", ".") + "@hospital.com";
    }
    
    private String extractFirstName(String patientName) {
        if (patientName == null || !patientName.contains(" ")) return patientName;
        return patientName.substring(0, patientName.indexOf(" "));
    }
    
    private String extractLastName(String patientName) {
        if (patientName == null || !patientName.contains(" ")) return "";
        return patientName.substring(patientName.indexOf(" ") + 1);
    }

    public List<UserDto> getAllDoctors() {
        UserDto[] doctors = restTemplate.getForObject(
                userDataServiceUrl + "/users/internal/doctors",
                UserDto[].class
        );
        return List.of(doctors != null ? doctors : new UserDto[0]);
    }
}