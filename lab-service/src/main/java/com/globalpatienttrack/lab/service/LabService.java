package com.globalpatienttrack.lab.service;

import com.globalpatienttrack.lab.model.*;
import com.globalpatienttrack.lab.repository.LabPrescriptionRepository;
import com.globalpatienttrack.lab.repository.LabResultRepository;
import com.globalpatienttrack.lab.repository.LabTestTypeRepository;
import com.globalpatienttrack.shared.dto.UserDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LabService {

    @Autowired
    private LabPrescriptionRepository labPrescriptionRepository;

    @Autowired
    private LabResultRepository labResultRepository;

    @Autowired
    private LabTestTypeRepository labTestTypeRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${service.user-data-url}")
    private String userDataServiceUrl;

    // ==================== Lab Prescription Methods ====================

    @Transactional
    public LabPrescriptionDto createPrescription(LabPrescriptionDto prescriptionDto) {
        LabPrescription prescription = new LabPrescription();
        prescription.setPatientId(prescriptionDto.getPatientId());
        prescription.setDoctorId(prescriptionDto.getDoctorId());
        prescription.setOrganizationId(prescriptionDto.getOrganizationId());
        prescription.setTestName(prescriptionDto.getTestName());
        prescription.setTestType(prescriptionDto.getTestType());
        prescription.setReason(prescriptionDto.getReason());
        prescription.setInstructions(prescriptionDto.getInstructions());
        prescription.setStatus(LabPrescription.PrescriptionStatus.PENDING);

        LabPrescription saved = labPrescriptionRepository.save(prescription);
        return convertPrescriptionToDto(saved);
    }

    public LabPrescriptionDto getPrescriptionById(Long prescriptionId) {
        LabPrescription prescription = labPrescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));
        return convertPrescriptionToDto(prescription);
    }

    public List<LabPrescriptionDto> getPrescriptionsByPatient(Long patientId) {
        return labPrescriptionRepository.findByPatientId(patientId)
                .stream()
                .map(this::convertPrescriptionToDto)
                .collect(Collectors.toList());
    }

    public List<LabPrescriptionDto> getPrescriptionsByDoctor(Long doctorId, Long organizationId) {
        return labPrescriptionRepository.findByDoctorIdAndOrganizationId(doctorId, organizationId)
                .stream()
                .map(this::convertPrescriptionToDto)
                .collect(Collectors.toList());
    }

    public List<LabPrescriptionDto> getPendingPrescriptions(Long organizationId) {
        return labPrescriptionRepository.findByOrganizationIdAndStatus(
                organizationId,
                LabPrescription.PrescriptionStatus.PENDING
        )
        .stream()
        .map(this::convertPrescriptionToDto)
        .collect(Collectors.toList());
    }

    public List<LabPrescriptionDto> getPrescriptionsByOrganization(Long organizationId, String status) {
        if (status != null && !status.isEmpty()) {
            return labPrescriptionRepository.findByOrganizationIdAndStatus(
                    organizationId,
                    LabPrescription.PrescriptionStatus.valueOf(status)
            )
            .stream()
            .map(this::convertPrescriptionToDto)
            .collect(Collectors.toList());
        } else {
            return labPrescriptionRepository.findByOrganizationId(organizationId)
                    .stream()
                    .map(this::convertPrescriptionToDto)
                    .collect(Collectors.toList());
        }
    }

    @Transactional
    public LabPrescriptionDto updatePrescriptionStatus(Long prescriptionId, String status) {
        LabPrescription prescription = labPrescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));
        
        prescription.setStatus(LabPrescription.PrescriptionStatus.valueOf(status));
        LabPrescription updated = labPrescriptionRepository.save(prescription);
        return convertPrescriptionToDto(updated);
    }

    @Transactional
    public void deletePrescription(Long prescriptionId) {
        labPrescriptionRepository.deleteById(prescriptionId);
    }

    // ==================== Lab Result Methods ====================

    @Transactional
    public LabResultDto createResult(LabResultDto resultDto) {
        LabResult result = new LabResult();
        result.setPrescriptionId(resultDto.getPrescriptionId());
        result.setPatientId(resultDto.getPatientId());
        result.setLabTechnicianId(resultDto.getLabTechnicianId());
        result.setOrganizationId(resultDto.getOrganizationId());
        result.setResultData(resultDto.getResultData());
        result.setReferenceRange(resultDto.getReferenceRange());
        result.setAbnormalFlags(resultDto.getAbnormalFlags());
        result.setNotes(resultDto.getNotes());
        result.setStatus(LabResult.ResultStatus.DRAFT);

        LabResult saved = labResultRepository.save(result);
        return convertResultToDto(saved);
    }

    public LabResultDto getResultById(Long resultId) {
        LabResult result = labResultRepository.findById(resultId)
                .orElseThrow(() -> new RuntimeException("Result not found"));
        return convertResultToDto(result);
    }

    public LabResultDto getResultByPrescriptionId(Long prescriptionId) {
        LabResult result = labResultRepository.findByPrescriptionId(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Result not found for prescription"));
        return convertResultToDto(result);
    }

    public List<LabResultDto> getResultsByPatient(Long patientId) {
        return labResultRepository.findByPatientId(patientId)
                .stream()
                .map(this::convertResultToDto)
                .collect(Collectors.toList());
    }

    public List<LabResultDto> getResultsByLabTechnician(Long labTechnicianId, Long organizationId) {
        return labResultRepository.findByLabTechnicianIdAndOrganizationId(labTechnicianId, organizationId)
                .stream()
                .map(this::convertResultToDto)
                .collect(Collectors.toList());
    }

    public List<LabResultDto> getPendingResults(Long organizationId) {
        return labResultRepository.findByOrganizationIdAndStatus(
                organizationId,
                LabResult.ResultStatus.DRAFT
        )
        .stream()
        .map(this::convertResultToDto)
        .collect(Collectors.toList());
    }

    @Transactional
    public LabResultDto submitResult(Long resultId) {
        LabResult result = labResultRepository.findById(resultId)
                .orElseThrow(() -> new RuntimeException("Result not found"));
        
        result.setStatus(LabResult.ResultStatus.SUBMITTED);
        result.setSubmittedAt(LocalDateTime.now());
        
        // Update corresponding prescription status to COMPLETED
        LabPrescription prescription = labPrescriptionRepository.findById(result.getPrescriptionId())
                .orElseThrow(() -> new RuntimeException("Prescription not found"));
        prescription.setStatus(LabPrescription.PrescriptionStatus.COMPLETED);
        labPrescriptionRepository.save(prescription);
        
        LabResult updated = labResultRepository.save(result);
        return convertResultToDto(updated);
    }

    @Transactional
    public LabResultDto updateResultStatus(Long resultId, String status) {
        LabResult result = labResultRepository.findById(resultId)
                .orElseThrow(() -> new RuntimeException("Result not found"));
        
        result.setStatus(LabResult.ResultStatus.valueOf(status));
        LabResult updated = labResultRepository.save(result);
        return convertResultToDto(updated);
    }

    @Transactional
    public LabResultDto updateResult(Long resultId, LabResultDto resultDto) {
        LabResult result = labResultRepository.findById(resultId)
                .orElseThrow(() -> new RuntimeException("Result not found"));
        
        result.setResultData(resultDto.getResultData());
        result.setReferenceRange(resultDto.getReferenceRange());
        result.setAbnormalFlags(resultDto.getAbnormalFlags());
        result.setNotes(resultDto.getNotes());
        
        LabResult updated = labResultRepository.save(result);
        return convertResultToDto(updated);
    }

    @Transactional
    public void deleteResult(Long resultId) {
        labResultRepository.deleteById(resultId);
    }

    // ==================== Helper Methods ====================

    private LabPrescriptionDto convertPrescriptionToDto(LabPrescription prescription) {
        LabPrescriptionDto dto = new LabPrescriptionDto();
        dto.setId(prescription.getId());
        dto.setPatientId(prescription.getPatientId());
        dto.setDoctorId(prescription.getDoctorId());
        dto.setOrganizationId(prescription.getOrganizationId());
        dto.setTestName(prescription.getTestName());
        dto.setTestType(prescription.getTestType());
        dto.setReason(prescription.getReason());
        dto.setInstructions(prescription.getInstructions());
        dto.setStatus(prescription.getStatus().toString());
        dto.setCreatedAt(prescription.getCreatedAt());
        dto.setUpdatedAt(prescription.getUpdatedAt());
        
        // Fetch patient name via user-data-service patient-user endpoint
        try {
            String patientUrl = userDataServiceUrl + "/users/internal/patient-user/" + prescription.getPatientId();
            UserDto patient = restTemplate.getForObject(patientUrl, UserDto.class);
            if (patient != null) {
                dto.setPatientName(patient.getFirstName() + " " + patient.getLastName());
            } else {
                dto.setPatientName("N/A");
            }
        } catch (Exception e) {
            System.out.println("⚠️ Error fetching patient name: " + e.getMessage());
            dto.setPatientName("N/A");
        }
        
        // Fetch doctor name
        try {
            String doctorUrl = userDataServiceUrl + "/users/internal/user/" + prescription.getDoctorId();
            UserDto doctor = restTemplate.getForObject(doctorUrl, UserDto.class);
            if (doctor != null) {
                dto.setDoctorName(doctor.getFirstName() + " " + doctor.getLastName());
            } else {
                dto.setDoctorName("N/A");
            }
        } catch (Exception e) {
            System.out.println("⚠️ Error fetching doctor name: " + e.getMessage());
            dto.setDoctorName("N/A");
        }
        
        return dto;
    }

    private LabResultDto convertResultToDto(LabResult result) {
        return new LabResultDto(
            result.getId(),
            result.getPrescriptionId(),
            result.getPatientId(),
            result.getLabTechnicianId(),
            result.getOrganizationId(),
            result.getResultData(),
            result.getReferenceRange(),
            result.getAbnormalFlags(),
            result.getNotes(),
            result.getStatus().toString(),
            result.getSubmittedAt(),
            result.getCreatedAt(),
            result.getUpdatedAt()
        );
    }

    public List<LabTestType> getAllTestTypes() {
        return labTestTypeRepository.findByActiveTrue();
    }

    public LabTestType getTestTypeById(Long id) {
        return labTestTypeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Test type not found with id: " + id));
    }

    public List<LabTestType> getTestTypesByCategory(String category) {
        return labTestTypeRepository.findByCategory(category);
    }

    // ==================== Technician Profile Methods ====================

    public UserDto getTechnicianProfile(Long technicianId) {
        try {
            String url = userDataServiceUrl + "/users/internal/user/" + technicianId;
            UserDto user = restTemplate.getForObject(url, UserDto.class);
            if (user == null) {
                throw new RuntimeException("Technician not found with id: " + technicianId);
            }
            return user;
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch technician profile: " + e.getMessage(), e);
        }
    }
}
