package com.globalpatienttrack.patient.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class PatientHistoryDto {
    private Long id;
    
    @NotNull(message = "Patient ID is required")
    private Long patientId;
    
    private Long doctorId;
    
    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;
    
    private String treatment;
    private String notes;
    
    @NotNull(message = "Visit date is required")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime visitDate;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Patient information (for display purposes)
    private String patientName;
    private String doctorName;
    
    // Medications prescribed during this visit
    @JsonInclude(JsonInclude.Include.ALWAYS)  // Always include medications even if empty
    private List<MedicationDto> medications = new ArrayList<>();

    // Constructors
    public PatientHistoryDto() {}

    public PatientHistoryDto(Long patientId, Long doctorId, String diagnosis, 
                            String treatment, String notes, LocalDateTime visitDate) {
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.diagnosis = diagnosis;
        this.treatment = treatment;
        this.notes = notes;
        this.visitDate = visitDate;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getTreatment() {
        return treatment;
    }

    public void setTreatment(String treatment) {
        this.treatment = treatment;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getVisitDate() {
        return visitDate;
    }

    public void setVisitDate(LocalDateTime visitDate) {
        this.visitDate = visitDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }
    
    public List<MedicationDto> getMedications() {
        return medications;
    }
    
    public void setMedications(List<MedicationDto> medications) {
        this.medications = medications;
    }
}