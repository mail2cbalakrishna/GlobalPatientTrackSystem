import React from 'react';

export default function PrescriptionsList({ prescriptions, onSubmitResult }) {
  if (!prescriptions || prescriptions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">ID</th>
              <th className="px-6 py-4 text-left font-semibold">Patient Name</th>
              <th className="px-6 py-4 text-left font-semibold">Patient ID</th>
              <th className="px-6 py-4 text-left font-semibold">Test Name</th>
              <th className="px-6 py-4 text-left font-semibold">Test Type</th>
              <th className="px-6 py-4 text-left font-semibold">Doctor Name</th>
              <th className="px-6 py-4 text-left font-semibold">Reason</th>
              <th className="px-6 py-4 text-left font-semibold">Created Date</th>
              <th className="px-6 py-4 text-left font-semibold">Status</th>
              <th className="px-6 py-4 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {prescriptions.map((prescription, idx) => (
              <tr
                key={prescription.id}
                className={`${
                  idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                } hover:bg-blue-50 transition`}
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  #{prescription.id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {prescription.patientName || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {prescription.patientId || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                  {prescription.testName || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {prescription.testType || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {prescription.doctorName || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {prescription.reason || 'No reason specified'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(prescription.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                    {prescription.status || 'PENDING'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => onSubmitResult(prescription)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-medium"
                  >
                    Submit Result
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
