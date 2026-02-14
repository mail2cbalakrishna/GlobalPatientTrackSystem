package com.globalpatienttrack.doctor.controller;

import com.globalpatienttrack.shared.dto.UserDto;
import com.globalpatienttrack.shared.dto.PatientDto;
import com.globalpatienttrack.doctor.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctor")
@CrossOrigin(origins = "*")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @GetMapping("/profile/{doctorId}")
    public ResponseEntity<UserDto> getDoctorProfile(@PathVariable("doctorId") Long doctorId) {
        UserDto doctor = doctorService.getDoctorProfile(doctorId);
        return ResponseEntity.ok(doctor);
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> searchDoctors(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long id) {
        List<UserDto> doctors = doctorService.searchDoctors(name, id);
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/patients")
    public ResponseEntity<List<PatientDto>> getAssignedPatients(
            @RequestParam(required = false) Long organizationId) {
        // organizationId should come from the client's JWT token (extracted during login)
        // If not provided, patients endpoint will return all patients
        List<PatientDto> patients = doctorService.getAllPatientsWithMedicalDataByOrganization(organizationId);
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/patients/{patientId}")
    public ResponseEntity<PatientDto> getPatientDetails(@PathVariable("patientId") Long patientId) {
        PatientDto patient = doctorService.getPatientDetailsWithMedicalData(patientId);
        return ResponseEntity.ok(patient);
    }

    @PostMapping("/patients")
    public ResponseEntity<PatientDto> createPatient(
            @RequestBody PatientDto patientDto,
            @RequestParam(required = false) Long organizationId) {
        // organizationId should come from the client's JWT token (extracted during login)
        PatientDto createdPatient = doctorService.createPatient(patientDto, organizationId);
        return ResponseEntity.ok(createdPatient);
    }

    @PutMapping("/patients/{patientId}")
    public ResponseEntity<PatientDto> updatePatient(
            @PathVariable("patientId") Long patientId,
            @RequestBody PatientDto patientDto) {
        PatientDto updatedPatient = doctorService.updatePatient(patientId, patientDto);
        return ResponseEntity.ok(updatedPatient);
    }

    @DeleteMapping("/patients/{patientId}")
    public ResponseEntity<Void> deletePatient(@PathVariable("patientId") Long patientId) {
        doctorService.deletePatient(patientId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/colleagues")
    public ResponseEntity<List<UserDto>> getAllDoctors() {
        List<UserDto> doctors = doctorService.getAllDoctors();
        return ResponseEntity.ok(doctors);
    }
}