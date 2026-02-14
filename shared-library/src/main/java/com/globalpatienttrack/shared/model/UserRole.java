package com.globalpatienttrack.shared.model;

public enum UserRole {
    ADMIN("ADMIN"),
    DOCTOR("DOCTOR"),
    PATIENT("PATIENT"),
    LABTECHNICIAN("LABTECHNICIAN");

    private final String role;

    UserRole(String role) {
        this.role = role;
    }

    public String getRole() {
        return role;
    }

    @Override
    public String toString() {
        return role;
    }
}