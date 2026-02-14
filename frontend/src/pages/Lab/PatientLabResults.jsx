import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const PatientLabResults = ({ patientId }) => {
  const [results, setResults] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('results');
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch results
      const resultsResponse = await api.get(
        `/lab/results/patient/${patientId}`
      );
      setResults(resultsResponse.data);

      // Fetch prescriptions
      const prescriptionsResponse = await api.get(
        `/lab/prescriptions/patient/${patientId}`
      );
      setPrescriptions(prescriptionsResponse.data);
    } catch (error) {
      console.error('Error fetching lab data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResultStatusBadge = (status) => {
    const styles = {
      'DRAFT': 'bg-orange-100 text-orange-800',
      'SUBMITTED': 'bg-green-100 text-green-800',
      'REVIEWED': 'bg-blue-100 text-blue-800',
      'RELEASED': 'bg-green-100 text-green-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getPrescriptionStatusBadge = (status) => {
    const styles = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'ACCEPTED': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Lab Results</h1>
          <p className="text-gray-600">View your lab prescriptions and results</p>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('results')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'results'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-300'
            }`}
          >
            Lab Results
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'prescriptions'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-300'
            }`}
          >
            Prescriptions
          </button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && !loading && (
          <div className="space-y-6">
            {results.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <p className="text-gray-600 text-lg">No lab results available yet</p>
                <p className="text-gray-500 mt-2">Your lab results will appear here once they are submitted by the lab technician</p>
              </div>
            ) : (
              results.map(result => (
                <div
                  key={result.id}
                  className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setSelectedResult(selectedResult?.id === result.id ? null : result)}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">Lab Result #{result.id}</h3>
                      <p className="text-gray-600 mt-2">Prescription ID: #{result.prescriptionId}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-semibold text-sm ${getResultStatusBadge(result.status)}`}>
                      {result.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mb-6 pb-6 border-b border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Status</p>
                      <p className="text-lg text-gray-800">{result.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Submitted</p>
                      <p className="text-lg text-gray-800">
                        {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : 'Pending'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Created</p>
                      <p className="text-lg text-gray-800">{new Date(result.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {selectedResult?.id === result.id && (
                    <div className="space-y-6 mt-6 pt-6 border-t border-gray-200">
                      {result.resultData && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Test Results</h4>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700 whitespace-pre-wrap">{result.resultData}</p>
                          </div>
                        </div>
                      )}

                      {result.referenceRange && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Reference Range</h4>
                          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{result.referenceRange}</p>
                        </div>
                      )}

                      {result.abnormalFlags && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                          <h4 className="font-semibold text-red-800 mb-2">⚠️ Abnormal Flags</h4>
                          <p className="text-red-700">{result.abnormalFlags}</p>
                        </div>
                      )}

                      {result.notes && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Additional Notes</h4>
                          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{result.notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedResult?.id !== result.id && (
                    <p className="text-gray-600 text-sm">Click to view full details</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Prescriptions Tab */}
        {activeTab === 'prescriptions' && !loading && (
          <div className="space-y-6">
            {prescriptions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <p className="text-gray-600 text-lg">No lab prescriptions</p>
                <p className="text-gray-500 mt-2">Your doctor will create lab prescriptions for you when needed</p>
              </div>
            ) : (
              prescriptions.map(prescription => {
                const correspondingResult = results.find(r => r.prescriptionId === prescription.id);
                return (
                  <div
                    key={prescription.id}
                    className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">{prescription.testName}</h3>
                        <p className="text-gray-600 mt-2">Prescription ID: #{prescription.id}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-4 py-2 rounded-full font-semibold text-sm ${getPrescriptionStatusBadge(prescription.status)}`}>
                          {prescription.status}
                        </span>
                        {correspondingResult && (
                          <span className={`px-4 py-2 rounded-full font-semibold text-sm ${getResultStatusBadge(correspondingResult.status)}`}>
                            Result: {correspondingResult.status}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Test Type</p>
                        <p className="text-lg text-gray-800">{prescription.testType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Created Date</p>
                        <p className="text-lg text-gray-800">{new Date(prescription.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {prescription.reason && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Reason for Test</h4>
                        <p className="text-gray-700">{prescription.reason}</p>
                      </div>
                    )}

                    {prescription.instructions && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Instructions</h4>
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                          <p className="text-gray-700">{prescription.instructions}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientLabResults;
