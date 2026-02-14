package com.globalpatienttrack.doctor.exception;

public class PatientNotFoundException extends RuntimeException {
    public PatientNotFoundException(String message) {
        super(message);
    }
    
    public PatientNotFoundException(Long patientId) {
        super("Patient not found with ID: " + patientId);
    }
}
