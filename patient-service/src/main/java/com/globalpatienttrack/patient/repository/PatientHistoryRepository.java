package com.globalpatienttrack.patient.repository;

import com.globalpatienttrack.patient.entity.PatientHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientHistoryRepository extends JpaRepository<PatientHistory, Long> {
    
    List<PatientHistory> findByPatientIdOrderByVisitDateDesc(Long patientId);
    
    List<PatientHistory> findByDoctorIdOrderByVisitDateDesc(Long doctorId);
    
    List<PatientHistory> findByPatientIdAndDoctorIdOrderByVisitDateDesc(Long patientId, Long doctorId);
}