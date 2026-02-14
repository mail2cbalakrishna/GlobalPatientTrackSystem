import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const CreateLabPrescription = ({ doctorId, organizationId, patientId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    testName: '',
    testType: '',
    reason: '',
    instructions: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testTypes, setTestTypes] = useState([]);
  const [loadingTestTypes, setLoadingTestTypes] = useState(true);

  // Fetch test types on component mount
  useEffect(() => {
    fetchTestTypes();
  }, []);

  const fetchTestTypes = async () => {
    try {
      setLoadingTestTypes(true);
      const response = await api.get('/lab/test-types');
      setTestTypes(response.data);
    } catch (error) {
      console.error('Error fetching test types:', error);
      setError('Failed to load test types');
    } finally {
      setLoadingTestTypes(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.testName || !formData.testType) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const prescription = {
        patientId,
        doctorId,
        organizationId,
        testName: formData.testName,
        testType: formData.testType,
        reason: formData.reason,
        instructions: formData.instructions
      };

      console.log('Creating prescription:', prescription);
      const response = await api.post('/lab/prescription/create', prescription);
      console.log('Prescription created successfully:', response.data);
      
      setSuccess('Lab prescription created successfully!');
      setFormData({ testName: '', testType: '', reason: '', instructions: '' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error('Error creating prescription:', error.response?.data || error.message);
      setError('Failed to create prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '30px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '700',
        color: '#667eea',
        marginBottom: '25px'
      }}>
        Create Lab Prescription
      </h2>
      
      {error && (
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#fee',
          border: '2px solid #f44',
          borderRadius: '8px',
          color: '#c33',
          fontWeight: '600'
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#efe',
          border: '2px solid #4f4',
          borderRadius: '8px',
          color: '#3a3',
          fontWeight: '600'
        }}>
          ✓ {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '8px'
            }}>
              Test Name *
            </label>
            <input
              type="text"
              name="testName"
              value={formData.testName}
              onChange={handleChange}
              placeholder="e.g., Complete Blood Count"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              required
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '8px'
            }}>
              Test Type *
            </label>
            <select
              name="testType"
              value={formData.testType}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              required
              disabled={loadingTestTypes}
            >
              <option value="">{loadingTestTypes ? 'Loading...' : 'Select Test Type'}</option>
              {testTypes.map(type => (
                <option key={type.id} value={type.name}>{type.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '8px'
          }}>
            Reason for Test
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Clinical reason for prescribing this test"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              resize: 'vertical',
              minHeight: '100px',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '8px'
          }}>
            Instructions for Patient
          </label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            placeholder="e.g., Fasting required, avoid certain medications, etc."
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              resize: 'vertical',
              minHeight: '100px',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? '#999' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            marginTop: '10px'
          }}
          onMouseEnter={(e) => !loading && (e.target.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)')}
          onMouseLeave={(e) => !loading && (e.target.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)')}
        >
          {loading ? 'Creating Prescription...' : 'Create Prescription'}
        </button>
      </form>
    </div>
  );
};

export default CreateLabPrescription;
