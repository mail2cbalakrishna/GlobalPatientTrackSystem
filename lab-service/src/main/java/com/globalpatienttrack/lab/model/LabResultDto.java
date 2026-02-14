package com.globalpatienttrack.lab.model;

import java.time.LocalDateTime;

public class LabResultDto {
    
    private Long id;
    private Long prescriptionId;
    private Long patientId;
    private Long labTechnicianId;
    private Long organizationId;
    private String resultData;
    private String referenceRange;
    private String abnormalFlags;
    private String notes;
    private String status;
    private LocalDateTime submittedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public LabResultDto() {}
    
    public LabResultDto(Long id, Long prescriptionId, Long patientId, Long labTechnicianId,
                        Long organizationId, String resultData, String referenceRange,
                        String abnormalFlags, String notes, String status,
                        LocalDateTime submittedAt, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.prescriptionId = prescriptionId;
        this.patientId = patientId;
        this.labTechnicianId = labTechnicianId;
        this.organizationId = organizationId;
        this.resultData = resultData;
        this.referenceRange = referenceRange;
        this.abnormalFlags = abnormalFlags;
        this.notes = notes;
        this.status = status;
        this.submittedAt = submittedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPrescriptionId() {
        return prescriptionId;
    }

    public void setPrescriptionId(Long prescriptionId) {
        this.prescriptionId = prescriptionId;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public Long getLabTechnicianId() {
        return labTechnicianId;
    }

    public void setLabTechnicianId(Long labTechnicianId) {
        this.labTechnicianId = labTechnicianId;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public String getResultData() {
        return resultData;
    }

    public void setResultData(String resultData) {
        this.resultData = resultData;
    }

    public String getReferenceRange() {
        return referenceRange;
    }

    public void setReferenceRange(String referenceRange) {
        this.referenceRange = referenceRange;
    }

    public String getAbnormalFlags() {
        return abnormalFlags;
    }

    public void setAbnormalFlags(String abnormalFlags) {
        this.abnormalFlags = abnormalFlags;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
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
}
