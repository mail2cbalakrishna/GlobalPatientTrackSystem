
package com.globalpatienttrack.patient.controller;

import com.globalpatienttrack.patient.dto.PatientHistoryDto;
import com.globalpatienttrack.patient.service.PatientService;
import com.globalpatienttrack.shared.dto.UserDto;
import com.globalpatienttrack.shared.dto.PatientDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/patient")
@CrossOrigin(origins = "*")
public class PatientController {

    private static final Logger logger = LoggerFactory.getLogger(PatientController.class);

    @Autowired
    private PatientService patientService;

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getPatientProfile(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        if (userIdHeader == null || userIdHeader.isEmpty()) {
            throw new RuntimeException("User ID required. Please login first.");
        }
        Long userId = Long.parseLong(userIdHeader);
        UserDto patient = patientService.getPatientProfile(userId);
        if (patient == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(patient);
    }

    @GetMapping("/medical-details/{userId}")
    public ResponseEntity<PatientDto> getPatientMedicalDetails(@PathVariable("userId") Long userId) {
        PatientDto patientDetails = patientService.getPatientMedicalDetails(userId);
        return ResponseEntity.ok(patientDetails);
    }

    @GetMapping("/profile/{patientId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN') or @patientService.isOwner(authentication.name, #patientId)")
    public ResponseEntity<UserDto> getPatientProfile(@PathVariable("patientId") Long patientId) {
        UserDto patient = patientService.getPatientProfile(patientId);
        return ResponseEntity.ok(patient);
    }

    @GetMapping("/history")
    public ResponseEntity<List<PatientHistoryDto>> getPatientHistory(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        if (userIdHeader == null || userIdHeader.isEmpty()) {
            throw new RuntimeException("User ID required. Please login first.");
        }
        Long userId = Long.parseLong(userIdHeader);
        List<PatientHistoryDto> history = patientService.getPatientHistoryByUserId(userId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/history/{patientId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN') or @patientService.isOwner(authentication.name, #patientId)")
    public ResponseEntity<List<PatientHistoryDto>> getPatientHistory(@PathVariable("patientId") Long patientId) {
        List<PatientHistoryDto> history = patientService.getPatientHistory(patientId);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/history")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<PatientHistoryDto> addPatientHistory(@Valid @RequestBody PatientHistoryDto historyDto) {
        logger.info("POST /patient/history called with medications: {}", 
            (historyDto.getMedications() == null ? "null" : historyDto.getMedications().size()));
        PatientHistoryDto savedHistory = patientService.addPatientHistory(historyDto);
        return ResponseEntity.ok(savedHistory);
    }

    @PutMapping("/history/{historyId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<PatientHistoryDto> updatePatientHistory(
            @PathVariable("historyId") Long historyId, 
            @Valid @RequestBody PatientHistoryDto historyDto) {
        PatientHistoryDto updatedHistory = patientService.updatePatientHistory(historyId, historyDto);
        return ResponseEntity.ok(updatedHistory);
    }

    @DeleteMapping("/history/{historyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePatientHistory(@PathVariable("historyId") Long historyId) {
        patientService.deletePatientHistory(historyId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/internal/{patientId}")
    public ResponseEntity<UserDto> getPatientUserInfo(@PathVariable("patientId") Long patientId) {
        UserDto patient = patientService.getPatientUserInfo(patientId);
        return ResponseEntity.ok(patient);
    }
}