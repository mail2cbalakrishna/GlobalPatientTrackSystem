import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const PatientLabView = ({ patientId }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('prescriptions');
  const [resultsLoading, setResultsLoading] = useState(false);

  useEffect(() => {
    console.log('📋 PatientLabView mounted with patientId:', patientId);
    if (patientId) {
      fetchPrescriptions();
    } else {
      console.warn('⚠️ PatientLabView: patientId is not provided');
    }
  }, [patientId]);

  // Fetch results when Results tab is opened
  useEffect(() => {
    if (activeTab === 'results' && results.length === 0) {
      fetchResults();
    }
  }, [activeTab]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching prescriptions for patientId:', patientId);
      const response = await api.get(`/lab/prescriptions/patient/${patientId}`);
      console.log('✅ Prescriptions fetched:', response.data);
      setPrescriptions(response.data || []);
    } catch (error) {
      console.error('❌ Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch results for patient
  const fetchResults = async () => {
    try {
      setResultsLoading(true);
      const response = await api.get(`/lab/results/patient/${patientId}`);
      setResults(response.data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setResultsLoading(false);
    }
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
      <div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#667eea'
        }}>
          My Lab Tests
        </h2>
      </div>

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
                No lab prescriptions yet
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
              transition: 'all 0.3s'
            }}>
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
                    Test ID: #{prescription.id}
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
                fontSize: '13px',
                color: '#666'
              }}>
                <div>
                  <p style={{ margin: '0 0 8px 0' }}>Test Type: <strong style={{ color: '#333' }}>{prescription.testType}</strong></p>
                </div>
                <div>
                  <p style={{ margin: '0' }}>Created: <strong style={{ color: '#333' }}>{new Date(prescription.createdAt).toLocaleDateString()}</strong></p>
                </div>
              </div>

              {prescription.reason && (
                <div style={{ marginTop: '12px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', margin: '0 0 5px 0' }}>Reason:</p>
                  <p style={{ fontSize: '13px', color: '#666', margin: '0' }}>{prescription.reason}</p>
                </div>
              )}

              {prescription.instructions && (
                <div style={{ marginTop: '12px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', margin: '0 0 5px 0' }}>Instructions:</p>
                  <p style={{ fontSize: '13px', color: '#666', margin: '0' }}>{prescription.instructions}</p>
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
              <p style={{ color: '#999', fontSize: '13px', margin: '8px 0 0 0' }}>
                Results will appear here once submitted by the laboratory
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
            }}>
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
                    Test ID: #{result.prescriptionId}
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
                  <p style={{ margin: '0' }}>Submitted: <strong style={{ color: '#333' }}>{result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : 'Pending'}</strong></p>
                </div>
              </div>

              {result.resultData && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', margin: '0 0 5px 0' }}>Result Data:</p>
                  <p style={{ fontSize: '13px', color: '#666', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '6px', margin: '0' }}>{result.resultData}</p>
                </div>
              )}

              {result.referenceRange && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', margin: '0' }}>Reference Range: <strong>{result.referenceRange}</strong></p>
                </div>
              )}

              {result.abnormalFlags && (
                <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#fff5f5', border: '1px solid #ffcccc', borderRadius: '6px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#d32f2f', margin: '0' }}>⚠️ Abnormal Flags: {result.abnormalFlags}</p>
                </div>
              )}

              {result.notes && (
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', margin: '0 0 5px 0' }}>Notes:</p>
                  <p style={{ fontSize: '13px', color: '#666', margin: '0' }}>{result.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientLabView;
