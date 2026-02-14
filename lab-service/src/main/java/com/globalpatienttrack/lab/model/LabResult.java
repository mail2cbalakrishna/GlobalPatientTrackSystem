package com.globalpatienttrack.lab.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_results")
public class LabResult {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "prescription_id", nullable = false, unique = true)
    private Long prescriptionId;
    
    @Column(name = "patient_id", nullable = false)
    private Long patientId;
    
    @Column(name = "lab_technician_id", nullable = false)
    private Long labTechnicianId;
    
    @Column(name = "organization_id", nullable = false)
    private Long organizationId;
    
    @Column(name = "result_data", columnDefinition = "LONGTEXT")
    private String resultData;
    
    @Column(name = "reference_range", columnDefinition = "TEXT")
    private String referenceRange;
    
    @Column(name = "abnormal_flags", columnDefinition = "TEXT")
    private String abnormalFlags;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ResultStatus status;
    
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        status = ResultStatus.DRAFT;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
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

    public ResultStatus getStatus() {
        return status;
    }

    public void setStatus(ResultStatus status) {
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

    public enum ResultStatus {
        DRAFT,
        SUBMITTED,
        REVIEWED,
        RELEASED
    }
}
