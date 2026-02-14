package com.globalpatienttrack.patient.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class MedicationDto {
    private Long id;
    private String name;
    private String dosage;
    private String frequency;
    private String duration;
    private String notes;
    private String prescribedDate;
    private String prescribedBy;
    private boolean active;

    // Constructors
    public MedicationDto() {}

    public MedicationDto(String name, String dosage, String frequency, String duration) {
        this.name = name;
        this.dosage = dosage;
        this.frequency = frequency;
        this.duration = duration;
        this.active = true;
    }

    public MedicationDto(String name, String dosage, String frequency, String duration, String notes) {
        this.name = name;
        this.dosage = dosage;
        this.frequency = frequency;
        this.duration = duration;
        this.notes = notes;
        this.active = true;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getPrescribedDate() {
        return prescribedDate;
    }

    public void setPrescribedDate(String prescribedDate) {
        this.prescribedDate = prescribedDate;
    }

    public String getPrescribedBy() {
        return prescribedBy;
    }

    public void setPrescribedBy(String prescribedBy) {
        this.prescribedBy = prescribedBy;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
