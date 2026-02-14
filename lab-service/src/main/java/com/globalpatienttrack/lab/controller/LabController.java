package com.globalpatienttrack.lab.controller;

import com.globalpatienttrack.lab.model.LabPrescriptionDto;
import com.globalpatienttrack.lab.model.LabResultDto;
import com.globalpatienttrack.lab.model.LabTestType;
import com.globalpatienttrack.lab.service.LabService;
import com.globalpatienttrack.shared.dto.UserDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lab")
@CrossOrigin(origins = "*")
public class LabController {

    @Autowired
    private LabService labService;

    // ==================== Lab Prescription Endpoints ====================

    @PostMapping("/prescription/create")
    public ResponseEntity<LabPrescriptionDto> createPrescription(
            @RequestBody LabPrescriptionDto prescriptionDto) {
        LabPrescriptionDto created = labService.createPrescription(prescriptionDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/prescription/{prescriptionId}")
    public ResponseEntity<LabPrescriptionDto> getPrescription(
            @PathVariable Long prescriptionId) {
        LabPrescriptionDto prescription = labService.getPrescriptionById(prescriptionId);
        return ResponseEntity.ok(prescription);
    }

    @GetMapping("/prescriptions/patient/{patientId}")
    public ResponseEntity<List<LabPrescriptionDto>> getPrescriptionsByPatient(
            @PathVariable Long patientId) {
        List<LabPrescriptionDto> prescriptions = labService.getPrescriptionsByPatient(patientId);
        return ResponseEntity.ok(prescriptions);
    }

    @GetMapping("/prescriptions/doctor")
    public ResponseEntity<List<LabPrescriptionDto>> getPrescriptionsByDoctor(
            @RequestParam Long doctorId,
            @RequestParam Long organizationId) {
        List<LabPrescriptionDto> prescriptions = labService.getPrescriptionsByDoctor(doctorId, organizationId);
        return ResponseEntity.ok(prescriptions);
    }

    @GetMapping("/prescriptions/pending")
    public ResponseEntity<List<LabPrescriptionDto>> getPendingPrescriptions(
            @RequestParam Long organizationId) {
        List<LabPrescriptionDto> prescriptions = labService.getPendingPrescriptions(organizationId);
        return ResponseEntity.ok(prescriptions);
    }

    @GetMapping("/prescriptions/org/{organizationId}")
    public ResponseEntity<List<LabPrescriptionDto>> getPrescriptionsByOrganization(
            @PathVariable Long organizationId,
            @RequestParam(required = false) String status) {
        List<LabPrescriptionDto> prescriptions = labService.getPrescriptionsByOrganization(organizationId, status);
        return ResponseEntity.ok(prescriptions);
    }

    @PutMapping("/prescription/{prescriptionId}/status")
    public ResponseEntity<LabPrescriptionDto> updatePrescriptionStatus(
            @PathVariable Long prescriptionId,
            @RequestParam String status) {
        LabPrescriptionDto updated = labService.updatePrescriptionStatus(prescriptionId, status);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/prescription/{prescriptionId}")
    public ResponseEntity<Void> deletePrescription(
            @PathVariable Long prescriptionId) {
        labService.deletePrescription(prescriptionId);
        return ResponseEntity.ok().build();
    }

    // ==================== Lab Result Endpoints ====================

    @PostMapping("/result/create")
    public ResponseEntity<LabResultDto> createResult(
            @RequestBody LabResultDto resultDto) {
        LabResultDto created = labService.createResult(resultDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/result/{resultId}")
    public ResponseEntity<LabResultDto> getResult(
            @PathVariable Long resultId) {
        LabResultDto result = labService.getResultById(resultId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/result/prescription/{prescriptionId}")
    public ResponseEntity<LabResultDto> getResultByPrescription(
            @PathVariable Long prescriptionId) {
        LabResultDto result = labService.getResultByPrescriptionId(prescriptionId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/results/patient/{patientId}")
    public ResponseEntity<List<LabResultDto>> getResultsByPatient(
            @PathVariable Long patientId) {
        List<LabResultDto> results = labService.getResultsByPatient(patientId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/results/technician")
    public ResponseEntity<List<LabResultDto>> getResultsByTechnician(
            @RequestParam Long labTechnicianId,
            @RequestParam Long organizationId) {
        List<LabResultDto> results = labService.getResultsByLabTechnician(labTechnicianId, organizationId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/results/pending")
    public ResponseEntity<List<LabResultDto>> getPendingResults(
            @RequestParam Long organizationId) {
        List<LabResultDto> results = labService.getPendingResults(organizationId);
        return ResponseEntity.ok(results);
    }

    @PutMapping("/result/{resultId}/submit")
    public ResponseEntity<LabResultDto> submitResult(
            @PathVariable Long resultId) {
        LabResultDto submitted = labService.submitResult(resultId);
        return ResponseEntity.ok(submitted);
    }

    @PutMapping("/result/{resultId}/update")
    public ResponseEntity<LabResultDto> updateResult(
            @PathVariable Long resultId,
            @RequestBody LabResultDto resultDto) {
        LabResultDto updated = labService.updateResult(resultId, resultDto);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/result/{resultId}/status")
    public ResponseEntity<LabResultDto> updateResultStatus(
            @PathVariable Long resultId,
            @RequestParam String status) {
        LabResultDto updated = labService.updateResultStatus(resultId, status);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/result/{resultId}")
    public ResponseEntity<Void> deleteResult(
            @PathVariable Long resultId) {
        labService.deleteResult(resultId);
        return ResponseEntity.ok().build();
    }

    // ==================== Lab Test Types Endpoints ====================

    @GetMapping("/test-types")
    public ResponseEntity<List<LabTestType>> getAllTestTypes() {
        List<LabTestType> testTypes = labService.getAllTestTypes();
        return ResponseEntity.ok(testTypes);
    }

    @GetMapping("/test-types/{id}")
    public ResponseEntity<LabTestType> getTestTypeById(
            @PathVariable Long id) {
        LabTestType testType = labService.getTestTypeById(id);
        return ResponseEntity.ok(testType);
    }

    @GetMapping("/test-types/category/{category}")
    public ResponseEntity<List<LabTestType>> getTestTypesByCategory(
            @PathVariable String category) {
        List<LabTestType> testTypes = labService.getTestTypesByCategory(category);
        return ResponseEntity.ok(testTypes);
    }

    // ==================== Technician Profile Endpoint ====================

    @GetMapping("/technician/profile/{technicianId}")
    public ResponseEntity<UserDto> getTechnicianProfile(
            @PathVariable Long technicianId) {
        UserDto technician = labService.getTechnicianProfile(technicianId);
        return ResponseEntity.ok(technician);
    }
}
