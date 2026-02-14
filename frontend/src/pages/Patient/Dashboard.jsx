import React, { useState, useEffect } from 'react';
import { patientService } from '../../services/api';
import PatientLabView from '../../components/Lab/PatientLabView';

function PatientDashboard() {
  const [profile, setProfile] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [organizationName, setOrganizationName] = useState('');

  useEffect(() => {
    // Load organization name from localStorage
    const orgName = localStorage.getItem('organizationName');
    if (orgName) {
      setOrganizationName(orgName);
    }
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get userId from localStorage
      const userId = localStorage.getItem('userId');
      console.log('Loading patient data for userId:', userId);
      
      const [profileData, historyData, patientData] = await Promise.all([
        patientService.getProfile(),
        patientService.getHistory(),
        // Fetch patient medical details from doctor service
        patientService.getMedicalDetails().catch(() => null)
      ]);
      
      console.log('Profile Data:', profileData);
      console.log('History Data:', historyData);
      console.log('History length:', historyData ? historyData.length : 0);
      
      setProfile(profileData);
      setHistory(historyData || []);
      setPatientDetails(patientData);
    } catch (err) {
      console.error('Error loading patient data:', err);
      console.error('Full error:', err.response);
      setError(err.response?.data?.message || 'Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

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
          Loading your health information...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            color: 'white',
            margin: 0,
            fontWeight: '700'
          }}>
            My Health Dashboard
          </h1>
          {organizationName && (
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9, color: 'white' }}>
              {organizationName}
            </p>
          )}
        </div>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            backdropFilter: 'blur(10px)'
          }}
        >
          Logout
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          color: '#ff4444',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid rgba(255, 0, 0, 0.3)'
        }}>
          {error}
        </div>
      )}

      {profile && (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '24px',
            marginBottom: '20px',
            color: '#667eea',
            fontWeight: '700'
          }}>
            My Profile
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: '#666',
                marginBottom: '5px',
                fontWeight: '600'
              }}>
                Name
              </label>
              <div style={{ fontSize: '16px', color: '#333' }}>
                {profile.name || profile.firstName + ' ' + profile.lastName || 'N/A'}
              </div>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: '#666',
                marginBottom: '5px',
                fontWeight: '600'
              }}>
                Email
              </label>
              <div style={{ fontSize: '16px', color: '#333' }}>
                {profile.email || 'N/A'}
              </div>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: '#666',
                marginBottom: '5px',
                fontWeight: '600'
              }}>
                Username
              </label>
              <div style={{ fontSize: '16px', color: '#333' }}>
                {profile.username || 'N/A'}
              </div>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: '#666',
                marginBottom: '5px',
                fontWeight: '600'
              }}>
                Status
              </label>
              <div style={{
                fontSize: '16px',
                color: profile.active ? '#28a745' : '#dc3545',
                fontWeight: '600'
              }}>
                {profile.active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Medical Details */}
      {patientDetails && (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '24px',
            marginBottom: '20px',
            color: '#667eea',
            fontWeight: '700'
          }}>
            Medical Information
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: '#666',
                marginBottom: '5px',
                fontWeight: '600'
              }}>
                Age
              </label>
              <div style={{ fontSize: '16px', color: '#333' }}>
                {patientDetails.age || 'N/A'} years
              </div>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: '#666',
                marginBottom: '5px',
                fontWeight: '600'
              }}>
                Gender
              </label>
              <div style={{ fontSize: '16px', color: '#333' }}>
                {patientDetails.gender || 'N/A'}
              </div>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: '#666',
                marginBottom: '5px',
                fontWeight: '600'
              }}>
                Blood Type
              </label>
              <div style={{ fontSize: '16px', color: '#333' }}>
                {patientDetails.bloodType || 'N/A'}
              </div>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: '#666',
                marginBottom: '5px',
                fontWeight: '600'
              }}>
                Phone
              </label>
              <div style={{ fontSize: '16px', color: '#333' }}>
                {patientDetails.phone || 'N/A'}
              </div>
            </div>
          </div>

          {/* Medical History from Latest Visit */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              color: '#666',
              marginBottom: '10px',
              fontWeight: '600'
            }}>
              📋 Medical History (Latest Visit)
            </label>
            <div style={{
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              fontSize: '15px',
              color: '#333',
              lineHeight: '1.6'
            }}>
              {history && history.length > 0 ? (
                <div>
                  <div><strong>Diagnosis:</strong> {history[0].diagnosis || 'N/A'}</div>
                  <div><strong>Treatment:</strong> {history[0].treatment || 'N/A'}</div>
                  <div><strong>Notes:</strong> {history[0].notes || 'N/A'}</div>
                </div>
              ) : (
                patientDetails.medicalHistory || 'No medical history recorded'
              )}
            </div>
          </div>

          {/* Current Medications from Latest Visit */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              color: '#666',
              marginBottom: '10px',
              fontWeight: '600'
            }}>
              💊 Current Medications (Active from Latest Visit)
            </label>
            <div style={{
              padding: '15px',
              backgroundColor: '#e8f5e9',
              borderRadius: '8px',
              fontSize: '15px',
              color: '#2e7d32',
              lineHeight: '1.6'
            }}>
              {history && history.length > 0 && history[0].medications && history[0].medications.length > 0 ? (
                <div>
                  {history[0].medications
                    .filter(med => med.active !== false)
                    .map((med, idx) => (
                      <div key={idx} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid rgba(46, 125, 50, 0.2)' }}>
                        <div><strong>{med.name}</strong> - {med.dosage}</div>
                        <div style={{ fontSize: '13px', color: '#1976d2' }}>Frequency: {med.frequency}</div>
                        <div style={{ fontSize: '13px', color: '#1976d2' }}>Duration: {med.duration}</div>
                        {med.notes && <div style={{ fontSize: '13px', color: '#666' }}>Notes: {med.notes}</div>}
                      </div>
                    ))}
                  {history[0].medications.filter(med => med.active !== false).length === 0 && (
                    <div>No active medications</div>
                  )}
                </div>
              ) : (
                patientDetails.currentMedications || 'No current medications'
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              fontSize: '24px',
              margin: 0,
              color: '#667eea',
              fontWeight: '700'
            }}>
              Doctor Visits & Medical History
            </h2>
            <div style={{
              padding: '10px 20px',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              color: '#667eea',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              marginTop: '10px',
              display: 'inline-block'
            }}>
              📋 Read-Only Access
            </div>
          </div>
          <button
            onClick={loadPatientData}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        {history.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666',
            fontSize: '16px'
          }}>
            No doctor visits recorded yet. Your doctor will add entries during your visits.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {history.map((item, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '15px',
                  borderBottom: '2px solid #667eea',
                  paddingBottom: '10px'
                }}>
                  <div>
                    <span style={{
                      fontSize: '16px',
                      color: '#333',
                      fontWeight: '700'
                    }}>
                      📅 Visit Date: {item.visitDate ? new Date(item.visitDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  {item.doctorName && (
                    <div style={{
                      fontSize: '14px',
                      color: '#667eea',
                      fontWeight: '600',
                      backgroundColor: 'white',
                      padding: '5px 15px',
                      borderRadius: '20px'
                    }}>
                      👨‍⚕️ Dr. {item.doctorName}
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#667eea', fontSize: '15px' }}>Diagnosis:</strong>{' '}
                  <span style={{ color: '#333', fontSize: '15px' }}>{item.diagnosis || 'N/A'}</span>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#667eea', fontSize: '15px' }}>Treatment:</strong>{' '}
                  <span style={{ color: '#333', fontSize: '15px' }}>{item.treatment || 'N/A'}</span>
                </div>

                {/* Medications Section */}
                {item.medications && item.medications.length > 0 && (
                  <div style={{
                    marginTop: '15px',
                    padding: '15px',
                    backgroundColor: '#fff3e0',
                    borderRadius: '6px',
                    borderLeft: '4px solid #ff9800'
                  }}>
                    <strong style={{ color: '#ff9800', fontSize: '15px', display: 'block', marginBottom: '10px' }}>
                      💊 Prescribed Medications
                    </strong>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {item.medications.map((med, medIndex) => (
                        <div
                          key={medIndex}
                          style={{
                            backgroundColor: 'white',
                            padding: '12px',
                            borderRadius: '4px',
                            border: '1px solid #ffe0b2'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            marginBottom: '8px'
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#ff9800',
                                marginBottom: '4px'
                              }}>
                                {med.name}
                              </div>
                              <div style={{
                                fontSize: '13px',
                                color: '#666',
                                marginBottom: '3px'
                              }}>
                                <strong>Dosage:</strong> {med.dosage || 'N/A'}
                              </div>
                              <div style={{
                                fontSize: '13px',
                                color: '#666',
                                marginBottom: '3px'
                              }}>
                                <strong>Frequency:</strong> {med.frequency || 'N/A'}
                              </div>
                              {med.duration && (
                                <div style={{
                                  fontSize: '13px',
                                  color: '#666',
                                  marginBottom: '3px'
                                }}>
                                  <strong>Duration:</strong> {med.duration}
                                </div>
                              )}
                              {med.prescribedBy && (
                                <div style={{
                                  fontSize: '12px',
                                  color: '#999',
                                  marginTop: '6px',
                                  fontStyle: 'italic'
                                }}>
                                  Prescribed by: {med.prescribedBy}
                                </div>
                              )}
                            </div>
                            {med.active && (
                              <div style={{
                                padding: '4px 8px',
                                backgroundColor: '#4caf50',
                                color: 'white',
                                fontSize: '11px',
                                borderRadius: '4px',
                                fontWeight: '600',
                                whiteSpace: 'nowrap',
                                marginLeft: '10px'
                              }}>
                                Active
                              </div>
                            )}
                          </div>
                          {med.notes && (
                            <div style={{
                              fontSize: '12px',
                              color: '#666',
                              backgroundColor: '#f5f5f5',
                              padding: '8px',
                              borderRadius: '3px',
                              marginTop: '8px',
                              borderLeft: '3px solid #ff9800'
                            }}>
                              <strong>Notes:</strong> {med.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {item.notes && (
                  <div style={{
                    marginTop: '15px',
                    padding: '15px',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#666',
                    borderLeft: '4px solid #667eea'
                  }}>
                    <strong style={{ color: '#667eea' }}>Doctor's Notes:</strong><br/>
                    {item.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lab Tests Section */}
      {profile && (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          padding: '30px',
          marginTop: '50px',
          marginBottom: '30px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <PatientLabView patientId={profile.id} />
        </div>
      )}
    </div>
  );
}

export default PatientDashboard;
