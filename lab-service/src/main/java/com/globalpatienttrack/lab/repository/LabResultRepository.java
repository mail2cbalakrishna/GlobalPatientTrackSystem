package com.globalpatienttrack.lab.repository;

import com.globalpatienttrack.lab.model.LabResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LabResultRepository extends JpaRepository<LabResult, Long> {
    
    List<LabResult> findByPatientId(Long patientId);
    
    List<LabResult> findByLabTechnicianId(Long labTechnicianId);
    
    List<LabResult> findByOrganizationId(Long organizationId);
    
    Optional<LabResult> findByPrescriptionId(Long prescriptionId);
    
    List<LabResult> findByPatientIdAndOrganizationId(Long patientId, Long organizationId);
    
    List<LabResult> findByLabTechnicianIdAndOrganizationId(Long labTechnicianId, Long organizationId);
    
    List<LabResult> findByStatus(LabResult.ResultStatus status);
    
    @Query("SELECT lr FROM LabResult lr WHERE lr.organizationId = :orgId AND lr.status = :status")
    List<LabResult> findByOrganizationIdAndStatus(
            @Param("orgId") Long organizationId,
            @Param("status") LabResult.ResultStatus status
    );
}
