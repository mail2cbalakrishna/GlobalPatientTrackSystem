package com.globalpatienttrack.doctor.exception;

public class PatientCreationException extends RuntimeException {
    public PatientCreationException(String message) {
        super(message);
    }
    
    public PatientCreationException(String message, Throwable cause) {
        super(message, cause);
    }
}
