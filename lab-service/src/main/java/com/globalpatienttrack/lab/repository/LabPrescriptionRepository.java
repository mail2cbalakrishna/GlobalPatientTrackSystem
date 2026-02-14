package com.globalpatienttrack.lab.repository;

import com.globalpatienttrack.lab.model.LabPrescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LabPrescriptionRepository extends JpaRepository<LabPrescription, Long> {
    
    List<LabPrescription> findByPatientId(Long patientId);
    
    List<LabPrescription> findByDoctorId(Long doctorId);
    
    List<LabPrescription> findByOrganizationId(Long organizationId);
    
    List<LabPrescription> findByPatientIdAndOrganizationId(Long patientId, Long organizationId);
    
    List<LabPrescription> findByDoctorIdAndOrganizationId(Long doctorId, Long organizationId);
    
    List<LabPrescription> findByStatus(LabPrescription.PrescriptionStatus status);
    
    @Query("SELECT lp FROM LabPrescription lp WHERE lp.organizationId = :orgId AND lp.status = :status")
    List<LabPrescription> findByOrganizationIdAndStatus(
            @Param("orgId") Long organizationId,
            @Param("status") LabPrescription.PrescriptionStatus status
    );
}
