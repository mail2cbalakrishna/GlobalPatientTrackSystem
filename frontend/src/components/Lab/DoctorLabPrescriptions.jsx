import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import CreateLabPrescription from './CreateLabPrescription';

const DoctorLabPrescriptions = ({ doctorId, organizationId, patientId }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [results, setResults] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('prescriptions');
  const [resultsLoading, setResultsLoading] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, [doctorId, organizationId, patientId]);

  // Fetch results when Results tab is opened
  useEffect(() => {
    if (activeTab === 'results' && results.length === 0) {
      fetchResults();
    }
  }, [activeTab]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      let response;
      
      // If patientId is provided, fetch for that specific patient
      if (patientId) {
        response = await api.get(`/lab/prescriptions/patient/${patientId}`);
      } else {
        // Otherwise fetch all prescriptions for this doctor
        response = await api.get(
          `/lab/prescriptions/doctor?doctorId=${doctorId}&organizationId=${organizationId}`
        );
      }
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch results when Results tab is opened
  const fetchResults = async () => {
    try {
      setResultsLoading(true);
      
      // If patientId is available, fetch all results for that patient at once
      if (patientId) {
        const response = await api.get(`/lab/results/patient/${patientId}`);
        setResults(response.data || []);
      } else {
        // For doctor view, fetch results for each prescription
        const resultsPromises = prescriptions.map(p =>
          api.get(`/lab/result/prescription/${p.id}`, {
            validateStatus: (status) => status === 200 || status === 404
          }).then(response => {
            if (response.status === 404) {
              return null;
            }
            return response.data;
          })
        );
        const resultsData = await Promise.all(resultsPromises);
        setResults(resultsData.filter(r => r !== null));
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setResultsLoading(false);
    }
  };

  const getResultForPrescription = (prescriptionId) => {
    return results.find(r => r.prescriptionId === prescriptionId);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultStatusColor = (status) => {
    switch(status) {
      case 'DRAFT': return 'bg-orange-100 text-orange-800';
      case 'SUBMITTED': return 'bg-green-100 text-green-800';
      case 'REVIEWED': return 'bg-blue-100 text-blue-800';
      case 'RELEASED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div style={{ display: 'grid', gap: '25px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#667eea'
        }}>
          Lab Management
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.target.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)'}
          onMouseLeave={(e) => e.target.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'}
        >
          {showForm ? 'Cancel' : 'Create Prescription'}
        </button>
      </div>

      {showForm && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '25px',
          borderRadius: '12px',
          border: '2px solid #e0e0e0'
        }}>
          <CreateLabPrescription
            doctorId={doctorId}
            organizationId={organizationId}
            patientId={patientId}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              fetchPrescriptions();
            }}
          />
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '15px',
        borderBottom: '2px solid #e0e0e0'
      }}>
        <button
          onClick={() => setActiveTab('prescriptions')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeTab === 'prescriptions' ? '#667eea' : 'transparent',
            color: activeTab === 'prescriptions' ? 'white' : '#667eea',
            border: 'none',
            borderBottom: activeTab === 'prescriptions' ? '3px solid #667eea' : '3px solid transparent',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.3s'
          }}
        >
          Prescriptions
        </button>
        <button
          onClick={() => setActiveTab('results')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeTab === 'results' ? '#667eea' : 'transparent',
            color: activeTab === 'results' ? 'white' : '#667eea',
            border: 'none',
            borderBottom: activeTab === 'results' ? '3px solid #667eea' : '3px solid transparent',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.3s'
          }}
        >
          Results
        </button>
      </div>

      {(loading || resultsLoading) && <p style={{ textAlign: 'center', color: '#999', fontSize: '14px' }}>Loading...</p>}

      {/* Prescriptions Tab */}
      {activeTab === 'prescriptions' && (
        <div style={{ display: 'grid', gap: '15px' }}>
          {prescriptions.length === 0 && !loading && (
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '40px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '2px dashed #667eea'
            }}>
              <p style={{ color: '#667eea', fontSize: '15px', fontWeight: '600', margin: '0' }}>
                No lab prescriptions created yet
              </p>
            </div>
          )}
          {prescriptions.map(prescription => (
            <div key={prescription.id} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
              padding: '20px',
              border: '1px solid #e0e0e0',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.12)'}
            onMouseLeave={(e) => e.currentTarget.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)'}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '15px'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#333',
                    margin: '0 0 5px 0'
                  }}>
                    {prescription.testName}
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    color: '#999',
                    margin: '0'
                  }}>
                    Prescription ID: #{prescription.id}
                  </p>
                </div>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: prescription.status === 'PENDING' ? '#ffe8e8' : prescription.status === 'ACCEPTED' ? '#e8f0ff' : '#e8ffe8',
                  color: prescription.status === 'PENDING' ? '#d32f2f' : prescription.status === 'ACCEPTED' ? '#0066ff' : '#00aa00'
                }}>
                  {prescription.status}
                </span>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '15px',
                fontSize: '13px',
                color: '#666'
              }}>
                <div>
                  <p style={{ margin: '0 0 8px 0' }}>Test Type: <strong style={{ color: '#333' }}>{prescription.testType}</strong></p>
                  <p style={{ margin: '0' }}>Patient ID: <strong style={{ color: '#333' }}>{prescription.patientId}</strong></p>
                </div>
                <div>
                  <p style={{ margin: '0 0 8px 0' }}>Created: <strong style={{ color: '#333' }}>{new Date(prescription.createdAt).toLocaleDateString()}</strong></p>
                </div>
              </div>

              {prescription.reason && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', margin: '0 0 5px 0' }}>Reason:</p>
                  <p style={{ fontSize: '13px', color: '#666', margin: '0' }}>{prescription.reason}</p>
                </div>
              )}

              {prescription.instructions && (
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', margin: '0 0 5px 0' }}>Instructions:</p>
                  <p style={{ fontSize: '13px', color: '#666', margin: '0' }}>{prescription.instructions}</p>
                </div>
              )}

              {/* Show result status if available */}
              {getResultForPrescription(prescription.id) && (
                <div style={{
                  marginTop: '15px',
                  paddingTop: '15px',
                  borderTop: '1px solid #e0e0e0'
                }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '8px', margin: '0 0 8px 0' }}>Lab Result:</p>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: getResultForPrescription(prescription.id).status === 'SUBMITTED' ? '#e8ffe8' : '#e8f0ff',
                    color: getResultForPrescription(prescription.id).status === 'SUBMITTED' ? '#00aa00' : '#0066ff'
                  }}>
                    {getResultForPrescription(prescription.id).status}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <div style={{ display: 'grid', gap: '15px' }}>
          {results.length === 0 && !resultsLoading && (
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '40px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '2px dashed #667eea'
            }}>
              <p style={{ color: '#667eea', fontSize: '15px', fontWeight: '600', margin: '0' }}>
                No lab results available yet
              </p>
            </div>
          )}
          {results.map(result => (
            <div key={result.id} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
              padding: '20px',
              border: '1px solid #e0e0e0',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.12)'}
            onMouseLeave={(e) => e.currentTarget.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)'}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '15px'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#333',
                    margin: '0 0 5px 0'
                  }}>
                    Lab Result #{result.id}
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    color: '#999',
                    margin: '0'
                  }}>
                    Prescription: #{result.prescriptionId}
                  </p>
                </div>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: result.status === 'SUBMITTED' ? '#e8ffe8' : '#e8f0ff',
                  color: result.status === 'SUBMITTED' ? '#00aa00' : '#0066ff'
                }}>
                  {result.status}
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '15px',
                fontSize: '13px',
                color: '#666'
              }}>
                <div>
                  <p style={{ margin: '0 0 8px 0' }}>Patient ID: <strong style={{ color: '#333' }}>{result.patientId}</strong></p>
                </div>
                <div>
                  <p style={{ margin: '0' }}>Submitted: <strong style={{ color: '#333' }}>{result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : 'Pending'}</strong></p>
                </div>
              </div>

              {result.resultData && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700">Result Data:</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-2">{result.resultData}</p>
                </div>
              )}

              {result.referenceRange && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700">Reference Range: {result.referenceRange}</p>
                </div>
              )}

              {result.abnormalFlags && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm font-semibold text-red-700">⚠️ Abnormal Flags: {result.abnormalFlags}</p>
                </div>
              )}

              {result.notes && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Notes:</p>
                  <p className="text-sm text-gray-600">{result.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorLabPrescriptions;
