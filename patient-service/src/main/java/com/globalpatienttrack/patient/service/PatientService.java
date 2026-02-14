package com.globalpatienttrack.patient.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.globalpatienttrack.patient.dto.MedicationDto;
import com.globalpatienttrack.patient.dto.PatientHistoryDto;
import com.globalpatienttrack.patient.entity.PatientHistory;
import com.globalpatienttrack.patient.repository.PatientHistoryRepository;
import com.globalpatienttrack.shared.dto.PatientDto;
import com.globalpatienttrack.shared.dto.UserDto;

@Service
public class PatientService {
    
    private static final Logger logger = LoggerFactory.getLogger(PatientService.class);

    @Autowired
    private PatientHistoryRepository patientHistoryRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${service.user-data-url}")
    private String userDataServiceUrl;

    @Value("${service.doctor-service-url:http://doctor-service:8083}")
    private String doctorServiceUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public UserDto getPatientProfile(Long patientId) {
        return restTemplate.getForObject(
            userDataServiceUrl + "/users/internal/user/" + patientId,
            UserDto.class
        );
    }

    public UserDto getPatientProfileByUsername(String username) {
        return restTemplate.getForObject(
            userDataServiceUrl + "/users/internal/user-by-username/" + username,
            UserDto.class
        );
    }

    public PatientDto getPatientMedicalDetails(Long userId) {
        try {
            return restTemplate.getForObject(
                doctorServiceUrl + "/doctor/patients/" + userId,
                PatientDto.class
            );
        } catch (Exception e) {
            return null;
        }
    }

    public List<PatientHistoryDto> getPatientHistory(Long patientId) {
        List<PatientHistory> history = patientHistoryRepository.findByPatientIdOrderByVisitDateDesc(patientId);
        return history.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    public List<PatientHistoryDto> getPatientHistoryByUserId(Long userId) {
        logger.info("getPatientHistoryByUserId called with userId: {}", userId);
        // Get patient details which includes patientId mapped from userId
        PatientDto patientDto = getPatientMedicalDetails(userId);
        if (patientDto == null || patientDto.getPatientId() == null) {
            logger.warn("No patient record found for userId: {}", userId);
            return new ArrayList<>();
        }
        
        logger.info("Resolved userId {} to patientId {}", userId, patientDto.getPatientId());
        // Now query history using the resolved patientId
        return getPatientHistory(patientDto.getPatientId());
    }

    public List<PatientHistoryDto> getPatientHistoryByUsername(String username) {
        UserDto patient = getPatientProfileByUsername(username);
        return getPatientHistory(patient.getId());
    }

    public PatientHistoryDto addPatientHistory(PatientHistoryDto historyDto) {
        logger.info("addPatientHistory: medications = {}", 
            (historyDto.getMedications() == null ? "null" : historyDto.getMedications().size() + " items"));
        PatientHistory history = convertToEntity(historyDto);
        PatientHistory savedHistory = patientHistoryRepository.save(history);
        return convertToDto(savedHistory);
    }

    public PatientHistoryDto updatePatientHistory(Long historyId, PatientHistoryDto historyDto) {
        PatientHistory existingHistory = patientHistoryRepository.findById(historyId)
            .orElseThrow(() -> new RuntimeException("Patient history not found"));

        existingHistory.setDiagnosis(historyDto.getDiagnosis());
        existingHistory.setTreatment(historyDto.getTreatment());
        existingHistory.setNotes(historyDto.getNotes());
        existingHistory.setVisitDate(historyDto.getVisitDate());

        if (historyDto.getMedications() != null) {
            try {
                String medicationsJson = objectMapper.writeValueAsString(historyDto.getMedications());
                existingHistory.setMedications(medicationsJson);
            } catch (Exception e) {
                existingHistory.setMedications(null);
            }
        }

        PatientHistory updatedHistory = patientHistoryRepository.save(existingHistory);
        return convertToDto(updatedHistory);
    }

    public void deletePatientHistory(Long historyId) {
        if (!patientHistoryRepository.existsById(historyId)) {
            throw new RuntimeException("Patient history not found");
        }
        patientHistoryRepository.deleteById(historyId);
    }

    public boolean isOwner(String username, Long patientId) {
        try {
            UserDto user = getPatientProfileByUsername(username);
            return user.getId().equals(patientId);
        } catch (Exception e) {
            return false;
        }
    }

    private PatientHistoryDto convertToDto(PatientHistory history) {
        PatientHistoryDto dto = new PatientHistoryDto();
        dto.setId(history.getId());
        dto.setPatientId(history.getPatientId());
        dto.setDoctorId(history.getDoctorId());
        dto.setDiagnosis(history.getDiagnosis());
        dto.setTreatment(history.getTreatment());
        dto.setNotes(history.getNotes());
        dto.setVisitDate(history.getVisitDate());
        dto.setCreatedAt(history.getCreatedAt());
        dto.setUpdatedAt(history.getUpdatedAt());

        // Parse medications from JSON string
        if (history.getMedications() != null && !history.getMedications().isEmpty()) {
            try {
                List<MedicationDto> medications = objectMapper.readValue(
                    history.getMedications(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, MedicationDto.class)
                );
                dto.setMedications(medications);
            } catch (Exception e) {
                dto.setMedications(new ArrayList<>());
            }
        } else {
            dto.setMedications(new ArrayList<>());
        }

        // Enrich with patient and doctor names
        try {
            UserDto patient = getPatientProfile(history.getPatientId());
            if (patient != null) {
                dto.setPatientName(patient.getFirstName() + " " + patient.getLastName());
            }

            if (history.getDoctorId() != null) {
                UserDto doctor = restTemplate.getForObject(
                    userDataServiceUrl + "/users/internal/user/" + history.getDoctorId(),
                    UserDto.class
                );
                if (doctor != null) {
                    dto.setDoctorName(doctor.getFirstName() + " " + doctor.getLastName());
                }
            }
        } catch (Exception e) {
            // Handle gracefully if user service is unavailable
        }

        return dto;
    }

    private PatientHistory convertToEntity(PatientHistoryDto dto) {
        PatientHistory history = new PatientHistory();
        history.setPatientId(dto.getPatientId());
        history.setDoctorId(dto.getDoctorId());
        history.setDiagnosis(dto.getDiagnosis());
        history.setTreatment(dto.getTreatment());
        history.setNotes(dto.getNotes());
        history.setVisitDate(dto.getVisitDate());

        // Serialize medications to JSON string
        if (dto.getMedications() != null && !dto.getMedications().isEmpty()) {
            try {
                String medicationsJson = objectMapper.writeValueAsString(dto.getMedications());
                logger.info("Serialized medications: {}", medicationsJson);
                history.setMedications(medicationsJson);
            } catch (Exception e) {
                logger.error("Error serializing medications", e);
                history.setMedications(null);
            }
        } else {
            logger.info("Medications is null or empty list");
            history.setMedications(null);
        }

        return history;
    }

    public UserDto getPatientUserInfo(Long patientId) {
        try {
            return restTemplate.getForObject(
                userDataServiceUrl + "/users/internal/patient-user/" + patientId,
                UserDto.class
            );
        } catch (Exception e) {
            logger.warn("Error fetching user info for patientId: {}", patientId, e);
            return null;
        }
    }
}
