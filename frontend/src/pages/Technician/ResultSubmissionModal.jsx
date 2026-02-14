import React, { useState } from 'react';
import api from '../../services/api';

export default function ResultSubmissionModal({ prescription, onClose, onSubmitted }) {
  const [formData, setFormData] = useState({
    resultData: '',
    referenceRange: '',
    abnormalFlags: '',
    notes: '',
    documents: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewFiles, setPreviewFiles] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    console.log('📎 Files selected:', files.length, files.map(f => f.name));

    // Validate file types and sizes
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Allowed: PDF, JPG, PNG`);
        return false;
      }
      if (file.size > maxFileSize) {
        setError(`File too large: ${file.name}. Max 10MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        documents: validFiles
      }));
      setPreviewFiles(validFiles.map(f => f.name));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.resultData.trim()) {
      setError('Result data is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const submitFormData = new FormData();
      submitFormData.append('prescriptionId', prescription.id);
      submitFormData.append('resultData', formData.resultData);
      submitFormData.append('referenceRange', formData.referenceRange || '');
      submitFormData.append('abnormalFlags', formData.abnormalFlags || '');
      submitFormData.append('notes', formData.notes || '');

      // Append files
      formData.documents.forEach((doc, idx) => {
        submitFormData.append(`documents`, doc);
      });

      console.log('📤 Submitting lab result for prescription:', prescription.id);

      const response = await api.post('/lab/result/submit', submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Result submitted successfully:', response.data);
      alert('✅ Lab result submitted successfully!');
      onSubmitted();
    } catch (err) {
      console.error('❌ Error submitting result:', err);
      setError(err.response?.data?.message || 'Failed to submit result. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Submit Lab Result</h2>
            <p className="text-green-100 text-sm mt-1">
              Prescription #{prescription.id} | Patient: {prescription.patientName} | Test: {prescription.testName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-green-100 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Prescription Info - Read Only */}
          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Test Name
              </label>
              <input
                type="text"
                value={prescription.testName}
                disabled
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Test Type
              </label>
              <input
                type="text"
                value={prescription.testType}
                disabled
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Patient Name
              </label>
              <input
                type="text"
                value={prescription.patientName}
                disabled
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Doctor Name
              </label>
              <input
                type="text"
                value={prescription.doctorName}
                disabled
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-600"
              />
            </div>
          </div>

          {/* Result Data - Required */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Result Data <span className="text-red-600">*</span>
            </label>
            <textarea
              name="resultData"
              value={formData.resultData}
              onChange={handleInputChange}
              placeholder="Enter test results, values, observations, etc."
              rows="5"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Include all relevant test values and measurements
            </p>
          </div>

          {/* Reference Range */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reference Range
            </label>
            <input
              type="text"
              name="referenceRange"
              value={formData.referenceRange}
              onChange={handleInputChange}
              placeholder="e.g., 4.5 - 5.5 g/dL"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Abnormal Flags */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Abnormal Flags
            </label>
            <input
              type="text"
              name="abnormalFlags"
              value={formData.abnormalFlags}
              onChange={handleInputChange}
              placeholder="e.g., HIGH, LOW, CRITICAL"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional comments or observations"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Documents (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                id="document-upload"
              />
              <label htmlFor="document-upload" className="cursor-pointer">
                <div className="text-gray-600">
                  <div className="text-2xl mb-2">📎</div>
                  <p className="font-semibold">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, JPG, PNG (max 10MB each)
                  </p>
                </div>
              </label>
            </div>

            {/* File Preview */}
            {previewFiles.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  📋 {previewFiles.length} file(s) selected:
                </p>
                <ul className="space-y-1">
                  {previewFiles.map((name, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition font-semibold"
            >
              {loading ? '⏳ Submitting...' : '✓ Submit Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
