package com.globalpatienttrack.doctor.repository;

import com.globalpatienttrack.doctor.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    
    /**
     * Find patient by userId
     */
    Optional<Patient> findByUserId(Long userId);
    
    /**
     * Check if patient exists by userId
     */
    boolean existsByUserId(Long userId);
    
    /**
     * Delete patient by userId
     */
    void deleteByUserId(Long userId);
}
