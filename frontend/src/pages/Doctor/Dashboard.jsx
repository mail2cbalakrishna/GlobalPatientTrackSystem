import React, { useState, useEffect } from 'react';
import { doctorService, patientService } from '../../services/api';
import CreateLabPrescription from '../../components/Lab/CreateLabPrescription';
import DoctorLabPrescriptions from '../../components/Lab/DoctorLabPrescriptions';

function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Show 10 patients per page
  const [patientForm, setPatientForm] = useState({
    patientName: '',
    email: '',
    age: '',
    gender: '',
    bloodType: '',
    phone: '',
    address: '',
    medicalHistory: '',
    currentMedications: ''
  });

  // State for visit creation with medications
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [visitForm, setVisitForm] = useState({
    visitDate: '',
    diagnosis: '',
    treatment: '',
    notes: ''
  });
  const [medications, setMedications] = useState([]);
  const [currentMedication, setCurrentMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    prescribedBy: '',
    active: true,
    notes: ''
  });
  const [visitCreating, setVisitCreating] = useState(false);
  const [patientHistory, setPatientHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'visits', 'create'

  useEffect(() => {
    // Load organization name from localStorage
    const orgName = localStorage.getItem('organizationName');
    if (orgName) {
      setOrganizationName(orgName);
    }
    loadData();
  }, []);

  // Auto-dismiss success and error messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Load patient history when selectedPatient changes
  useEffect(() => {
    if (selectedPatient) {
      loadPatientHistory();
      setActiveTab('info'); // Reset to info tab when opening new patient
    }
  }, [selectedPatient]);

  const loadPatientHistory = async () => {
    try {
      if (!selectedPatient || !selectedPatient.patientId) return;
      const history = await patientService.getPatientHistoryByPatientId(selectedPatient.patientId);
      setPatientHistory(history || []);
    } catch (err) {
      console.error('Error loading patient history:', err);
      // Don't show error for history - it's optional
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [profileData, patientsData] = await Promise.all([
        doctorService.getProfile(),
        doctorService.getPatients()
      ]);
      setProfile(profileData);
      setPatients(patientsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    // Phone number validation - only allow digits and max 10 characters
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length <= 10) {
        setPatientForm(prev => ({ ...prev, [name]: digitsOnly }));
      }
      return;
    }
    
    setPatientForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    if (patientForm.phone && patientForm.phone.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      const newPatient = await doctorService.createPatient(patientForm);
      
      // Immediately update local state with the new patient
      setPatients(prev => [...prev, newPatient]);
      
      setSuccessMessage('Patient record created successfully! Login credentials generated.');
      setShowAddPatient(false);
      resetForm();
      
      // Refresh to get the complete latest data from database
      await loadData();
    } catch (err) {
      console.error('Error adding patient:', err);
      setError(err.response?.data?.message || 'Failed to add patient record');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    if (patientForm.phone && patientForm.phone.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      const updatedPatient = await doctorService.updatePatient(editingPatient.userId, patientForm);
      
      // Immediately update local state with the updated patient
      setPatients(prev => prev.map(p => 
        p.userId === editingPatient.userId ? updatedPatient : p
      ));
      
      setSuccessMessage('Patient record updated successfully!');
      setEditingPatient(null);
      resetForm();
      
      // Refresh to get the complete latest data from database
      await loadData();
    } catch (err) {
      console.error('Error updating patient:', err);
      setError(err.response?.data?.message || 'Failed to update patient record');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (patientId) => {
    try {
      setError(null);
      setLoading(true);
      await doctorService.deletePatient(patientId);
      
      // Immediately remove from local state
      setPatients(prev => prev.filter(p => p.userId !== patientId));
      
      setSuccessMessage('Patient record deleted successfully!');
      setDeleteConfirm(null);
      
      // Refresh to get the complete latest data from database
      await loadData();
    } catch (err) {
      console.error('Error deleting patient:', err);
      setError(err.response?.data?.message || 'Failed to delete patient record');
      setDeleteConfirm(null);
    } finally {
      setLoading(false);
    }
  };

  const startEditPatient = (patient) => {
    setEditingPatient(patient);
    setPatientForm({
      patientName: patient.patientName || '',
      email: patient.email || '',
      age: patient.age || '',
      gender: patient.gender || '',
      bloodType: patient.bloodType || '',
      phone: patient.phone || '',
      address: patient.address || '',
      medicalHistory: patient.medicalHistory || '',
      currentMedications: patient.currentMedications || ''
    });
    setShowAddPatient(true);
  };

  const viewPatientDetails = async (userId) => {
    try {
      setError(null);
      const details = await doctorService.getPatientDetails(userId);
      setSelectedPatient(details);
    } catch (err) {
      console.error('Error loading patient details:', err);
      setError(err.response?.data?.message || 'Failed to load patient details');
    }
  };

  const resetForm = () => {
    setShowAddPatient(false);
    setEditingPatient(null);
    setPatientForm({
      patientName: '',
      email: '',
      age: '',
      gender: '',
      bloodType: '',
      phone: '',
      address: '',
      medicalHistory: '',
      currentMedications: ''
    });
  };

  // Visit/Medication handlers
  const resetVisitForm = () => {
    setShowVisitForm(false);
    setVisitForm({
      visitDate: '',
      diagnosis: '',
      treatment: '',
      notes: ''
    });
    setMedications([]);
    setCurrentMedication({
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      prescribedBy: profile?.doctorName || '',
      active: true,
      notes: ''
    });
  };

  const handleAddMedication = () => {
    if (currentMedication.name && currentMedication.dosage && currentMedication.frequency && currentMedication.duration) {
      setMedications([...medications, currentMedication]);
      setCurrentMedication({
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        prescribedBy: profile?.doctorName || '',
        active: true,
        notes: ''
      });
    } else {
      setError('Please fill in Name, Dosage, Frequency, and Duration for medication');
    }
  };

  const handleRemoveMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleToggleMedicationStatus = async (visitIndex, medicationIndex) => {
    try {
      if (!patientHistory[visitIndex] || !patientHistory[visitIndex].medications[medicationIndex]) {
        setError('Medication not found');
        return;
      }

      const visit = patientHistory[visitIndex];
      const medication = visit.medications[medicationIndex];
      const newActiveStatus = !medication.active;

      // Update the medication status in the history object
      const updatedMedications = [...visit.medications];
      updatedMedications[medicationIndex].active = newActiveStatus;
      
      // Call API to update the entire visit with the modified medications
      const updatedVisit = {
        ...visit,
        medications: updatedMedications
      };
      
      await patientService.updateHistory(visit.id, updatedVisit);

      // Update the history state
      const updatedHistory = [...patientHistory];
      updatedHistory[visitIndex].medications = updatedMedications;
      setPatientHistory(updatedHistory);
      
      setSuccessMessage(`Medication ${newActiveStatus ? 'activated' : 'deactivated'} successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error toggling medication status:', err);
      setError('Failed to update medication status: ' + (err.response?.data?.message || err.message));
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const handleCreateVisit = async (e) => {
    e.preventDefault();
    
    console.log('========== DOCTOR VISIT CREATION STARTED ==========');
    console.log('Selected Patient:', selectedPatient);
    console.log('Visit Form Data:', visitForm);
    console.log('Medications:', medications);
    
    if (!visitForm.visitDate || !visitForm.diagnosis) {
      console.error('❌ Validation failed: Missing visitDate or diagnosis');
      setError('Please fill in Visit Date and Diagnosis');
      return;
    }

    if (!selectedPatient) {
      console.error('❌ Validation failed: No patient selected');
      setError('Please select a patient');
      return;
    }

    setVisitCreating(true);
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      console.log('Doctor Info:', { userId, hasToken: !!token });
      
      const visitData = {
        patientId: selectedPatient.patientId,
        doctorId: userId,
        visitDate: visitForm.visitDate,
        diagnosis: visitForm.diagnosis,
        treatment: visitForm.treatment,
        notes: visitForm.notes,
        medications: medications
      };

      console.log('✅ Creating visit with data:', visitData);
      const response = await patientService.addHistory(visitData);
      console.log('✅ Visit created successfully! Response:', response);
      
      setSuccessMessage('Visit with medications created successfully!');
      resetVisitForm();
      setSelectedPatient(null);
      
      // Refresh patient data if needed
      await loadData();
    } catch (err) {
      console.error('❌ Error creating visit:', err);
      console.error('Error response status:', err.response?.status);
      console.error('Error response data:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to create visit');
    } finally {
      setVisitCreating(false);
      console.log('========== DOCTOR VISIT CREATION ENDED ==========');
    }
  };

  const filteredPatients = patients.filter(patient => 
    (patient.patientName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (patient.patientId?.toString().includes(searchTerm))
  );

  // Pagination logic
  const indexOfLastPatient = currentPage * itemsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - itemsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          fontSize: '24px',
          color: 'white',
          fontWeight: '600'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f7fa',
      fontFamily: 'Inter, -apple-system, sans-serif'
    }}>
      {/* Header matching admin style */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '25px 40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          {/* Hospital Icon */}
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
          }}>
            🏥
          </div>
          
          {/* Hospital Name and Dashboard Title - Matching Admin Layout */}
          <div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '4px',
              letterSpacing: '0.5px',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {organizationName || 'Hospital Name'}
            </div>
            <h1 style={{
              fontSize: '16px',
              fontWeight: '500',
              margin: 0,
              opacity: 0.95,
              letterSpacing: '0.3px'
            }}>
              Doctor Dashboard
            </h1>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            backdropFilter: 'blur(10px)'
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        padding: '30px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>

      {error && (
        <div style={{
          backgroundColor: 'rgba(255, 59, 48, 0.1)',
          color: '#d32f2f',
          padding: '15px 20px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid rgba(255, 59, 48, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(211, 47, 47, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <span style={{ fontWeight: '500' }}>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#d32f2f',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '0 5px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div style={{
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          color: '#2e7d32',
          padding: '15px 20px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid rgba(76, 175, 80, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(46, 125, 50, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>✅</span>
            <span style={{ fontWeight: '500' }}>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#2e7d32',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '0 5px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Profile Section - Removed, info now in header */}

      {/* Patient Records Section */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        padding: '25px',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            margin: 0,
            color: '#333'
          }}>
            Patient Records ({filteredPatients.length})
          </h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                minWidth: '200px'
              }}
            />
            <button
              onClick={() => setShowAddPatient(true)}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
            >
              + Add Patient Record
            </button>
          </div>
        </div>

        {showAddPatient && (
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '2px solid #667eea'
          }}>
            <h3 style={{
              fontSize: '18px',
              marginBottom: '15px',
              color: '#667eea',
              fontWeight: '600'
            }}>
              {editingPatient ? 'Edit Patient Record' : 'Add New Patient Record'}
            </h3>
            <form onSubmit={editingPatient ? handleUpdatePatient : handleAddPatient}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '15px',
                marginBottom: '15px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Patient Name *
                  </label>
                                      <input
                    type="text"
                    name="patientName"
                    value={patientForm.patientName}
                    onChange={handleFormChange}
                    placeholder="Enter patient name"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={patientForm.email}
                    onChange={handleFormChange}
                    placeholder="Enter email address"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={patientForm.age}
                    onChange={handleFormChange}
                    placeholder="Enter age"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={patientForm.gender}
                    onChange={handleFormChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Blood Type
                  </label>
                  <select
                    name="bloodType"
                    value={patientForm.bloodType}
                    onChange={handleFormChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select blood type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Phone (10 digits)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={patientForm.phone}
                    onChange={handleFormChange}
                    placeholder="Enter 10-digit phone number"
                    maxLength="10"
                    pattern="[0-9]{10}"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={patientForm.address}
                    onChange={handleFormChange}
                    placeholder="Enter address"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Medical History
                </label>
                <textarea
                  name="medicalHistory"
                  value={patientForm.medicalHistory}
                  onChange={handleFormChange}
                  placeholder="Enter medical history, diagnoses, past treatments..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Current Medications
                </label>
                <textarea
                  name="currentMedications"
                  value={patientForm.currentMedications}
                  onChange={handleFormChange}
                  placeholder="Enter current medications..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  {editingPatient ? 'Update Record' : 'Add Record'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {filteredPatients.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666',
            fontSize: '16px'
          }}>
            {searchTerm ? 'No patients found matching your search.' : 'No patient records yet. Add your first patient above.'}
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  backgroundColor: '#f8f9fa',
                  borderBottom: '2px solid #667eea'
                }}>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#667eea'
                  }}>ID</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#667eea'
                  }}>Name</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#667eea'
                  }}>Age</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#667eea'
                  }}>Gender</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#667eea'
                  }}>Blood Type</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#667eea'
                  }}>Phone</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#667eea'
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.map((patient, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: '1px solid #eee',
                      backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa'
                    }}
                  >
                    <td style={{ padding: '12px', color: '#333' }}>{patient.patientId || 'N/A'}</td>
                    <td style={{ padding: '12px', color: '#333', fontWeight: '500' }}>{patient.patientName || 'N/A'}</td>
                    <td style={{ padding: '12px', color: '#333' }}>{patient.age || 'N/A'}</td>
                    <td style={{ padding: '12px', color: '#333' }}>{patient.gender || 'N/A'}</td>
                    <td style={{ padding: '12px', color: '#333' }}>{patient.bloodType || 'N/A'}</td>
                    <td style={{ padding: '12px', color: '#333' }}>{patient.phone || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={() => viewPatientDetails(patient.userId)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => startEditPatient(patient)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#ffc107',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(patient)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredPatients.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '20px',
              padding: '15px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Showing {indexOfFirstPatient + 1} to {Math.min(indexOfLastPatient, filteredPatients.length)} of {filteredPatients.length} patients
              </div>
              
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: currentPage === 1 ? '#e0e0e0' : '#667eea',
                    color: currentPage === 1 ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                >
                  Previous
                </button>

                <div style={{ display: 'flex', gap: '5px' }}>
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: currentPage === pageNumber ? '#667eea' : 'white',
                            color: currentPage === pageNumber ? 'white' : '#667eea',
                            border: `2px solid ${currentPage === pageNumber ? '#667eea' : '#ddd'}`,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            minWidth: '40px',
                            transition: 'all 0.2s'
                          }}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return <span key={pageNumber} style={{ padding: '8px 4px', color: '#999' }}>...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: currentPage === totalPages ? '#e0e0e0' : '#667eea',
                    color: currentPage === totalPages ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          </>
        )}
      </div>

      {selectedPatient && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px',
          backdropFilter: 'blur(4px)'
        }}
        onClick={() => setSelectedPatient(null)}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'slideIn 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Tab Navigation */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '25px',
              borderBottom: '2px solid #e0e0e0',
              paddingBottom: '0px',
              overflowX: 'auto',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setActiveTab('info')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: activeTab === 'info' ? '#667eea' : 'transparent',
                  color: activeTab === 'info' ? 'white' : '#667eea',
                  border: 'none',
                  borderBottom: activeTab === 'info' ? '3px solid #667eea' : '3px solid transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}
              >
                Patient Info
              </button>
              <button
                onClick={() => setActiveTab('visits')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: activeTab === 'visits' ? '#667eea' : 'transparent',
                  color: activeTab === 'visits' ? 'white' : '#667eea',
                  border: 'none',
                  borderBottom: activeTab === 'visits' ? '3px solid #667eea' : '3px solid transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}
              >
                Visit History
              </button>
              <button
                onClick={() => setActiveTab('create')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: activeTab === 'create' ? '#667eea' : 'transparent',
                  color: activeTab === 'create' ? 'white' : '#667eea',
                  border: 'none',
                  borderBottom: activeTab === 'create' ? '3px solid #667eea' : '3px solid transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}
              >
                Create Visit
              </button>
              <button
                onClick={() => setActiveTab('labprescription')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: activeTab === 'labprescription' ? '#667eea' : 'transparent',
                  color: activeTab === 'labprescription' ? 'white' : '#667eea',
                  border: 'none',
                  borderBottom: activeTab === 'labprescription' ? '3px solid #667eea' : '3px solid transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}
              >
                Lab Prescription
              </button>
              <button
                onClick={() => setActiveTab('labresults')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: activeTab === 'labresults' ? '#667eea' : 'transparent',
                  color: activeTab === 'labresults' ? 'white' : '#667eea',
                  border: 'none',
                  borderBottom: activeTab === 'labresults' ? '3px solid #667eea' : '3px solid transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}
              >
                Lab Results
              </button>
            </div>

            {/* Patient Info Tab */}
            {activeTab === 'info' && (
              <div>
                <h3 style={{
                  fontSize: '24px',
                  marginBottom: '20px',
                  color: '#667eea',
                  fontWeight: '700'
                }}>
                  Patient Details
                </h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div>
                    <strong style={{ color: '#667eea' }}>Patient ID:</strong>{' '}
                    <span>{selectedPatient.patientId || 'N/A'}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#667eea' }}>Name:</strong>{' '}
                    <span>{selectedPatient.patientName}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#667eea' }}>Username:</strong>{' '}
                    <span>{selectedPatient.username || 'N/A'}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#667eea' }}>Email:</strong>{' '}
                    <span>{selectedPatient.email || 'N/A'}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#667eea' }}>Age:</strong>{' '}
                    <span>{selectedPatient.age || 'N/A'}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#667eea' }}>Gender:</strong>{' '}
                    <span>{selectedPatient.gender || 'N/A'}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#667eea' }}>Blood Type:</strong>{' '}
                    <span>{selectedPatient.bloodType || 'N/A'}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#667eea' }}>Phone:</strong>{' '}
                    <span>{selectedPatient.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#667eea' }}>Address:</strong>{' '}
                    <span>{selectedPatient.address || 'N/A'}</span>
                  </div>
                  {selectedPatient.medicalHistory && (
                    <div>
                      <strong style={{ color: '#667eea', display: 'block', marginBottom: '5px' }}>
                        Medical History:
                      </strong>
                      <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '12px',
                        borderRadius: '8px',
                        whiteSpace: 'pre-wrap',
                        border: '1px solid #e0e0e0'
                      }}>
                        {selectedPatient.medicalHistory}
                      </div>
                    </div>
                  )}
                  {selectedPatient.currentMedications && (
                    <div>
                      <strong style={{ color: '#667eea', display: 'block', marginBottom: '5px' }}>
                        Current Medications:
                      </strong>
                      <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '12px',
                        borderRadius: '8px',
                        whiteSpace: 'pre-wrap',
                        border: '1px solid #e0e0e0'
                      }}>
                        {selectedPatient.currentMedications}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Create Visit Tab */}
            {activeTab === 'create' && (
              <div>
                <h3 style={{
                  fontSize: '24px',
                  marginBottom: '20px',
                  color: '#667eea',
                  fontWeight: '700'
                }}>
                  Create New Visit - {selectedPatient.patientName}
                </h3>
                <form onSubmit={handleCreateVisit} style={{ display: 'grid', gap: '15px' }}>
                  {/* Visit Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '5px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        Visit Date *
                      </label>
                      <input
                        type="datetime-local"
                        value={visitForm.visitDate}
                        onChange={(e) => setVisitForm({ ...visitForm, visitDate: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '5px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        Diagnosis *
                      </label>
                      <input
                        type="text"
                        value={visitForm.diagnosis}
                        onChange={(e) => setVisitForm({ ...visitForm, diagnosis: e.target.value })}
                        placeholder="Enter diagnosis"
                        required
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '5px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      Treatment
                    </label>
                    <input
                      type="text"
                      value={visitForm.treatment}
                      onChange={(e) => setVisitForm({ ...visitForm, treatment: e.target.value })}
                      placeholder="Enter treatment plan"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '5px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      Notes
                    </label>
                    <textarea
                      value={visitForm.notes}
                      onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                      placeholder="Enter additional notes"
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  {/* Medications Section */}
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#667eea',
                      marginBottom: '15px'
                    }}>
                      Medications
                    </h4>

                    {/* Medication Input Form */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                      marginBottom: '15px'
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '3px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#333'
                        }}>
                          Name
                        </label>
                        <input
                          type="text"
                          value={currentMedication.name}
                          onChange={(e) => setCurrentMedication({ ...currentMedication, name: e.target.value })}
                          placeholder="e.g., Metoprolol"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '12px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '3px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#333'
                        }}>
                          Dosage
                        </label>
                        <input
                          type="text"
                          value={currentMedication.dosage}
                          onChange={(e) => setCurrentMedication({ ...currentMedication, dosage: e.target.value })}
                          placeholder="e.g., 25mg"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '12px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '3px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#333'
                        }}>
                          Frequency
                        </label>
                        <input
                          type="text"
                          value={currentMedication.frequency}
                          onChange={(e) => setCurrentMedication({ ...currentMedication, frequency: e.target.value })}
                          placeholder="e.g., Once daily"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '12px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '3px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#333'
                        }}>
                          Duration
                        </label>
                        <input
                          type="text"
                          value={currentMedication.duration}
                          onChange={(e) => setCurrentMedication({ ...currentMedication, duration: e.target.value })}
                          placeholder="e.g., 30 days"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '12px'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                      marginBottom: '15px'
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '3px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#333'
                        }}>
                          Prescribed By
                        </label>
                        <input
                          type="text"
                          value={currentMedication.prescribedBy}
                          onChange={(e) => setCurrentMedication({ ...currentMedication, prescribedBy: e.target.value })}
                          placeholder="Your name"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '12px'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#333',
                          margin: '0'
                        }}>
                          <input
                            type="checkbox"
                            checked={currentMedication.active}
                            onChange={(e) => setCurrentMedication({ ...currentMedication, active: e.target.checked })}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          Active
                        </label>
                      </div>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '3px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        Notes
                      </label>
                      <input
                        type="text"
                        value={currentMedication.notes}
                        onChange={(e) => setCurrentMedication({ ...currentMedication, notes: e.target.value })}
                        placeholder="Additional notes (optional)"
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddMedication}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        width: '100%'
                      }}
                    >
                      + Add Medication
                    </button>

                    {/* Added Medications List */}
                    {medications.length > 0 && (
                      <div style={{ marginTop: '15px' }}>
                        <h5 style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#333',
                          marginBottom: '10px'
                        }}>
                          Added Medications ({medications.length})
                        </h5>
                        {medications.map((med, index) => (
                          <div key={index} style={{
                            backgroundColor: med.active !== false ? '#f0f8ff' : '#fff5f5',
                            padding: '10px',
                            borderRadius: '6px',
                            marginBottom: '8px',
                            border: med.active !== false ? '1px solid #b3d9ff' : '1px solid #ffcccc',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <strong style={{ color: '#333' }}>{med.name}</strong>
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  backgroundColor: med.active !== false ? '#28a745' : '#dc3545',
                                  color: 'white'
                                }}>
                                  {med.active !== false ? '✓ Active' : '✗ Inactive'}
                                </span>
                              </div>
                              <span style={{ color: '#666', marginLeft: '8px', fontSize: '12px' }}>
                                {med.dosage} • {med.frequency} • {med.duration}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMedication(index)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form Buttons */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="submit"
                      disabled={visitCreating}
                      style={{
                        flex: 1,
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: visitCreating ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        opacity: visitCreating ? 0.6 : 1
                      }}
                    >
                      {visitCreating ? 'Creating...' : 'Create Visit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('info')}
                      style={{
                        flex: 1,
                        padding: '12px 24px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Visit History Tab */}
            {activeTab === 'visits' && (
              <div>
                <h3 style={{
                  fontSize: '24px',
                  marginBottom: '20px',
                  color: '#667eea',
                  fontWeight: '700'
                }}>
                  Visit History - {selectedPatient.patientName}
                </h3>

                {patientHistory && patientHistory.length > 0 ? (
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {patientHistory.map((visit, visitIndex) => (
                      <div
                        key={visitIndex}
                        style={{
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          padding: '16px',
                          transition: 'all 0.3s'
                        }}
                      >
                        {/* Visit Header */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          marginBottom: '12px',
                          paddingBottom: '12px',
                          borderBottom: '2px solid #e0e0e0'
                        }}>
                          <div>
                            <h4 style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#667eea',
                              margin: '0 0 4px 0'
                            }}>
                              Visit Date: {new Date(visit.visitDate).toLocaleDateString()} at {new Date(visit.visitDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </h4>
                            {visit.diagnosis && (
                              <p style={{
                                fontSize: '13px',
                                color: '#666',
                                margin: '4px 0 0 0'
                              }}>
                                <strong>Diagnosis:</strong> {visit.diagnosis}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Visit Details */}
                        {(visit.treatment || visit.notes) && (
                          <div style={{
                            marginBottom: '12px',
                            paddingBottom: '12px',
                            borderBottom: '1px solid #e0e0e0'
                          }}>
                            {visit.treatment && (
                              <p style={{
                                fontSize: '13px',
                                color: '#666',
                                margin: '0 0 4px 0'
                              }}>
                                <strong>Treatment:</strong> {visit.treatment}
                              </p>
                            )}
                            {visit.notes && (
                              <p style={{
                                fontSize: '13px',
                                color: '#666',
                                margin: '0'
                              }}>
                                <strong>Notes:</strong> {visit.notes}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Medications Section */}
                        {visit.medications && visit.medications.length > 0 ? (
                          <div>
                            <h5 style={{
                              fontSize: '13px',
                              fontWeight: '600',
                              color: '#333',
                              marginBottom: '10px',
                              marginTop: '12px'
                            }}>
                              Medications ({visit.medications.length})
                            </h5>
                            <div style={{ display: 'grid', gap: '8px' }}>
                              {visit.medications.map((med, medIndex) => (
                                <div
                                  key={medIndex}
                                  style={{
                                    backgroundColor: 'white',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    padding: '12px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                  }}
                                >
                                  <div style={{ flex: 1 }}>
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      marginBottom: '4px'
                                    }}>
                                      <span style={{
                                        fontWeight: '600',
                                        color: '#333',
                                        fontSize: '13px'
                                      }}>
                                        {med.name}
                                      </span>
                                      <span style={{
                                        padding: '2px 8px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        backgroundColor: med.active !== false ? '#28a745' : '#dc3545',
                                        color: 'white',
                                        borderRadius: '4px'
                                      }}>
                                        {med.active !== false ? '✓ Active' : '✗ Inactive'}
                                      </span>
                                    </div>
                                    <span style={{
                                      color: '#666',
                                      fontSize: '12px'
                                    }}>
                                      {med.dosage} • {med.frequency} • {med.duration}
                                    </span>
                                    {med.notes && (
                                      <div style={{
                                        fontSize: '11px',
                                        color: '#999',
                                        marginTop: '4px',
                                        fontStyle: 'italic'
                                      }}>
                                        Notes: {med.notes}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleMedicationStatus(visitIndex, medIndex)}
                                    style={{
                                      padding: '6px 12px',
                                      marginLeft: '12px',
                                      backgroundColor: med.active !== false ? '#ffc107' : '#28a745',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '11px',
                                      fontWeight: '600',
                                      whiteSpace: 'nowrap',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.transform = 'scale(1.05)';
                                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.transform = 'scale(1)';
                                      e.target.style.boxShadow = 'none';
                                    }}
                                  >
                                    {med.active !== false ? 'Deactivate' : 'Activate'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div style={{
                            fontSize: '13px',
                            color: '#999',
                            fontStyle: 'italic',
                            marginTop: '12px'
                          }}>
                            No medications recorded for this visit
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    border: '2px dashed #667eea',
                    borderRadius: '8px',
                    padding: '30px',
                    textAlign: 'center'
                  }}>
                    <p style={{
                      color: '#667eea',
                      fontSize: '16px',
                      fontWeight: '600',
                      margin: '0'
                    }}>
                      No visit history found
                    </p>
                    <p style={{
                      color: '#999',
                      fontSize: '13px',
                      margin: '8px 0 0 0'
                    }}>
                      Create a new visit to get started
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Lab Prescription Tab */}
            {activeTab === 'labprescription' && (
              <div>
                <CreateLabPrescription 
                  patientId={selectedPatient?.patientId || selectedPatient?.id} 
                  doctorId={profile?.doctorId || profile?.id}
                  organizationId={profile?.organizationId}
                />
              </div>
            )}

            {/* Lab Results Tab */}
            {activeTab === 'labresults' && (
              <div>
                <DoctorLabPrescriptions 
                  doctorId={profile?.doctorId || profile?.id} 
                  organizationId={profile?.organizationId}
                  patientId={selectedPatient?.patientId || selectedPatient?.id}
                />
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedPatient(null);
                resetVisitForm();
              }}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                width: '100%'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px',
          backdropFilter: 'blur(4px)'
        }}
        onClick={() => setDeleteConfirm(null)}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '450px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'slideIn 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '10px'
              }}>
                ⚠️
              </div>
              <h3 style={{
                fontSize: '22px',
                marginBottom: '10px',
                color: '#dc3545',
                fontWeight: '700'
              }}>
                Confirm Delete
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#666',
                lineHeight: '1.5'
              }}>
                Are you sure you want to delete the patient record for{' '}
                <strong style={{ color: '#333' }}>{deleteConfirm.patientName}</strong>?
                <br />
                <span style={{ fontSize: '14px', color: '#999' }}>
                  This action cannot be undone.
                </span>
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  flex: 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePatient(deleteConfirm.userId)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  flex: 1
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default DoctorDashboard;
