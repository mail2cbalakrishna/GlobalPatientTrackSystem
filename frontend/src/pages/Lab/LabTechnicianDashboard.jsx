import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Flask, Beaker, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

const LabTechnicianDashboard = ({ userId, organizationId }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [resultForm, setResultForm] = useState({
    resultData: '',
    referenceRange: '',
    abnormalFlags: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingPrescriptions();
    fetchMyResults();
  }, [organizationId]);

  const fetchPendingPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/lab/prescriptions/pending?organizationId=${organizationId}`
      );
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyResults = async () => {
    try {
      const response = await api.get(
        `/lab/results/technician?labTechnicianId=${userId}&organizationId=${organizationId}`
      );
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const handleAcceptPrescription = async (prescriptionId) => {
    try {
      setLoading(true);
      await api.put(
        `/lab/prescription/${prescriptionId}/status?status=ACCEPTED`
      );
      
      // Create a new result for this prescription
      const prescription = prescriptions.find(p => p.id === prescriptionId);
      const newResult = {
        prescriptionId,
        patientId: prescription.patientId,
        labTechnicianId: userId,
        organizationId,
        status: 'DRAFT'
      };
      
      await api.post(`/lab/result/create`, newResult);
      
      fetchPendingPrescriptions();
      fetchMyResults();
      alert('Prescription accepted!');
    } catch (error) {
      console.error('Error accepting prescription:', error);
      alert('Error accepting prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResult = async (resultId) => {
    try {
      setLoading(true);
      
      // Update result with data
      await api.put(
        `/lab/result/${resultId}/update`,
        resultForm
      );
      
      // Submit the result
      await api.put(
        `/lab/result/${resultId}/submit`
      );
      
      alert('Result submitted successfully!');
      setSelectedPrescription(null);
      setResultForm({ resultData: '', referenceRange: '', abnormalFlags: '', notes: '' });
      fetchMyResults();
      fetchPendingPrescriptions();
    } catch (error) {
      console.error('Error submitting result:', error);
      alert('Error submitting result');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setResultForm({ resultData: '', referenceRange: '', abnormalFlags: '', notes: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <Flask className="w-10 h-10 text-blue-400" />
            <h1 className="text-5xl font-bold text-white">Lab Technician Dashboard</h1>
          </div>
          <p className="text-blue-200 text-lg">Manage prescriptions and submit accurate lab results</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-semibold">Pending</p>
                <p className="text-4xl font-bold mt-2">{prescriptions.length}</p>
              </div>
              <Clock className="w-12 h-12 text-orange-200 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-semibold">Submitted</p>
                <p className="text-4xl font-bold mt-2">{results.filter(r => r.status === 'SUBMITTED').length}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-200 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-semibold">In Progress</p>
                <p className="text-4xl font-bold mt-2">{results.filter(r => r.status === 'DRAFT').length}</p>
              </div>
              <Beaker className="w-12 h-12 text-blue-200 opacity-50" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-8 bg-slate-800 rounded-xl p-2 inline-flex">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Clock className="w-5 h-5" />
            Pending Prescriptions
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'results'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            My Results
          </button>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="col-span-2">
            {activeTab === 'pending' && (
              <div className="space-y-4">
                {loading && (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin">
                      <Beaker className="w-12 h-12 text-blue-400" />
                    </div>
                    <p className="text-blue-300 mt-4">Loading prescriptions...</p>
                  </div>
                )}
                {prescriptions.length === 0 && !loading && (
                  <div className="text-center py-16 bg-slate-800 rounded-xl border-2 border-dashed border-slate-600">
                    <AlertCircle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-300 text-lg">No pending prescriptions to process</p>
                    <p className="text-slate-400 text-sm mt-2">Check back later for new prescriptions</p>
                  </div>
                )}
                {prescriptions.map(prescription => (
                  <div
                    key={prescription.id}
                    className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl shadow-xl p-6 hover:shadow-2xl transition-all border-l-4 border-orange-500 hover:border-orange-400"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{prescription.testName}</h3>
                        <p className="text-slate-400 text-sm mt-1">Type: <span className="text-blue-300 font-semibold">{prescription.testType}</span></p>
                      </div>
                      <span className="px-4 py-2 bg-orange-900 text-orange-200 rounded-full text-sm font-bold flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {prescription.status}
                      </span>
                    </div>
                    <p className="text-slate-300 mb-4">💡 <strong>Reason:</strong> {prescription.reason}</p>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => handleAcceptPrescription(prescription.id)}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Accept & Create Result
                      </button>
                      <button
                        onClick={() => handleSelectPrescription(prescription)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-cyan-700 font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <Beaker className="w-5 h-5" />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'results' && (
              <div className="space-y-4">
                {loading && (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin">
                      <Beaker className="w-12 h-12 text-blue-400" />
                    </div>
                    <p className="text-blue-300 mt-4">Loading results...</p>
                  </div>
                )}
                {results.length === 0 && !loading && (
                  <div className="text-center py-16 bg-slate-800 rounded-xl border-2 border-dashed border-slate-600">
                    <AlertCircle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-300 text-lg">No results submitted yet</p>
                    <p className="text-slate-400 text-sm mt-2">Complete prescriptions to see them here</p>
                  </div>
                )}
                {results.map(result => (
                  <div
                    key={result.id}
                    className={`rounded-xl shadow-xl p-6 hover:shadow-2xl transition-all border-l-4 ${
                      result.status === 'SUBMITTED'
                        ? 'bg-gradient-to-r from-green-900 to-emerald-800 border-green-500'
                        : 'bg-gradient-to-r from-blue-900 to-cyan-800 border-blue-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">Result #{result.id}</h3>
                        <p className="text-slate-300 text-sm mt-1">Prescription: <span className="text-blue-300 font-semibold">#{result.prescriptionId}</span></p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
                        result.status === 'SUBMITTED'
                          ? 'bg-green-900 text-green-200'
                          : 'bg-blue-900 text-blue-200'
                      }`}>
                        {result.status === 'SUBMITTED' ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Submitted
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4" />
                            Draft
                          </>
                        )}
                      </span>
                    </div>
                    {result.resultData && (
                      <div className="space-y-2 bg-slate-700 bg-opacity-50 rounded-lg p-4 mb-4">
                        <p className="text-slate-200"><strong className="text-blue-300">📊 Result Data:</strong> <span className="text-white">{result.resultData}</span></p>
                        <p className="text-slate-200"><strong className="text-blue-300">📏 Reference Range:</strong> <span className="text-white">{result.referenceRange}</span></p>
                        {result.abnormalFlags && (
                          <p className="text-red-300"><strong className="text-red-400">⚠️ Abnormal Flags:</strong> <span>{result.abnormalFlags}</span></p>
                        )}
                        {result.notes && (
                          <p className="text-slate-200"><strong className="text-blue-300">📝 Notes:</strong> <span className="text-white">{result.notes}</span></p>
                        )}
                      </div>
                    )}
                    {result.status === 'DRAFT' && (
                      <button
                        onClick={() => handleSelectPrescription({ id: result.prescriptionId })}
                        className="mt-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-orange-700 font-semibold transition-all shadow-lg hover:shadow-xl"
                      >
                        ✏️ Edit Result
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          {selectedPrescription && (
            <div className="col-span-1">
              <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl shadow-2xl p-6 sticky top-8 border border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <Beaker className="w-6 h-6 text-blue-400" />
                  <h3 className="text-2xl font-bold text-white">Lab Results Entry</h3>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-blue-300 mb-2">
                      ✓ Result Data *
                    </label>
                    <textarea
                      value={resultForm.resultData}
                      onChange={(e) => setResultForm({...resultForm, resultData: e.target.value})}
                      placeholder="Enter detailed test results..."
                      className="w-full p-3 border-2 border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      rows="4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-300 mb-2">
                      📏 Reference Range
                    </label>
                    <input
                      type="text"
                      value={resultForm.referenceRange}
                      onChange={(e) => setResultForm({...resultForm, referenceRange: e.target.value})}
                      placeholder="e.g., 70-100 mg/dL"
                      className="w-full p-3 border-2 border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-300 mb-2">
                      ⚠️ Abnormal Flags (if any)
                    </label>
                    <input
                      type="text"
                      value={resultForm.abnormalFlags}
                      onChange={(e) => setResultForm({...resultForm, abnormalFlags: e.target.value})}
                      placeholder="e.g., HIGH, LOW, CRITICAL"
                      className="w-full p-3 border-2 border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-300 mb-2">
                      📝 Additional Notes
                    </label>
                    <textarea
                      value={resultForm.notes}
                      onChange={(e) => setResultForm({...resultForm, notes: e.target.value})}
                      placeholder="Add any additional clinical notes..."
                      className="w-full p-3 border-2 border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      rows="3"
                    />
                  </div>
                  <button
                    onClick={() => handleSubmitResult(selectedPrescription.id)}
                    disabled={loading || !resultForm.resultData}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {loading ? 'Submitting...' : 'Submit Results'}
                  </button>
                  <button
                    onClick={() => setSelectedPrescription(null)}
                    className="w-full bg-slate-700 text-slate-200 py-3 rounded-lg font-bold hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabTechnicianDashboard;
