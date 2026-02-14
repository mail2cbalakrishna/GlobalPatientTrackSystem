import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { technicianService } from '../../services/api';
import PrescriptionsList from './PrescriptionsList';
import ResultSubmissionModal from './ResultSubmissionModal';

// Icons as simple SVG components
const FlaskIcon = () => (
  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const itemsPerPage = 25;

  // Load profile data
  const loadProfile = useCallback(async () => {
    try {
      console.log('📋 Loading technician profile...');
      const profileData = await technicianService.getProfile();
      console.log('✅ Profile loaded:', profileData);
      setProfile(profileData);
    } catch (err) {
      console.error('❌ Error loading profile:', err);
      setError('Failed to load technician profile. Please refresh the page.');
    }
  }, []);

  // Load prescriptions
  const fetchPrescriptions = useCallback(async (page = 1, search = '') => {
    if (!profile?.organizationId) return;

    try {
      setLoading(true);
      setError('');

      console.log('🔬 Technician fetching prescriptions:', {
        orgId: profile?.organizationId,
        page,
        search,
        itemsPerPage
      });

      const response = await technicianService.getPrescriptions(
        profile.organizationId,
        page - 1,
        itemsPerPage,
        search
      );

      console.log('✅ Prescriptions fetched:', response);

      if (response.content) {
        setPrescriptions(response.content || []);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.totalElements || 0);
      } else if (Array.isArray(response)) {
        setPrescriptions(response);
        setTotalPages(1);
        setTotalItems(response.length);
      } else {
        setPrescriptions(response.data || []);
        setTotalPages(1);
        setTotalItems((response.data || []).length);
      }
    } catch (err) {
      console.error('❌ Error fetching prescriptions:', err);
      setError('Failed to fetch prescriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [profile?.organizationId, profile]);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Fetch prescriptions when profile or page changes
  useEffect(() => {
    if (profile?.organizationId) {
      fetchPrescriptions(currentPage, searchQuery);
    }
  }, [currentPage, profile?.organizationId]);

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('access_token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    // Redirect to login
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPrescriptions(1, searchQuery);
  };

  const handleResultSubmit = (prescription) => {
    console.log('📋 Opening result submission for:', prescription.id);
    setSelectedPrescription(prescription);
    setShowResultModal(true);
  };

  const handleResultSubmitted = () => {
    console.log('✅ Result submitted, refreshing list');
    setShowResultModal(false);
    setSelectedPrescription(null);
    fetchPrescriptions(currentPage, searchQuery);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent mb-6"></div>
          <p className="text-blue-300 font-semibold text-lg">Loading technician dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-blue-400">
                <FlaskIcon />
              </div>
              <h1 className="text-5xl font-bold text-white">
                Lab Technician Dashboard
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-semibold transition shadow-lg hover:shadow-xl"
            >
              <LogoutIcon />
              Logout
            </button>
          </div>
          <div className="flex items-center gap-6 text-lg">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-full font-semibold">
              👨‍🔬 {profile?.firstName} {profile?.lastName}
            </span>
            <span className="bg-slate-700 text-slate-200 px-4 py-2 rounded-full">
              🏥 Organization: {profile?.organizationId}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-semibold uppercase tracking-wide">Pending Tests</p>
                <p className="text-4xl font-bold mt-2">{totalItems}</p>
              </div>
              <div className="text-orange-200 opacity-50">
                <ClockIcon />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-semibold uppercase tracking-wide">Completed Today</p>
                <p className="text-4xl font-bold mt-2">0</p>
              </div>
              <div className="text-green-200 opacity-50">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-semibold uppercase tracking-wide">In Progress</p>
                <p className="text-4xl font-bold mt-2">0</p>
              </div>
              <div className="text-purple-200 opacity-50">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl shadow-xl p-6 mb-8 border border-slate-600">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search by patient name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-900 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 font-semibold transition shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <SearchIcon />
              {loading ? 'Searching...' : 'Search'}
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                  fetchPrescriptions(1, '');
                }}
                className="px-6 py-3 bg-slate-600 text-slate-200 rounded-lg hover:bg-slate-500 font-semibold transition"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-6 py-4 rounded-xl mb-8 flex items-center gap-3">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent"></div>
              <p className="mt-4 text-blue-300 font-semibold">Loading prescriptions...</p>
            </div>
          </div>
        )}

        {/* Prescriptions List */}
        {!loading && prescriptions.length > 0 && (
          <>
            <PrescriptionsList
              prescriptions={prescriptions}
              onSubmitResult={handleResultSubmit}
            />

            {/* Pagination */}
            <div className="flex justify-between items-center mt-8 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl shadow-xl p-5 border border-slate-600">
              <div className="text-slate-300 font-medium">
                📄 Page <span className="text-white font-bold">{currentPage}</span> of <span className="text-white font-bold">{totalPages}</span> | 
                Total: <span className="text-blue-400 font-bold">{totalItems}</span> prescriptions
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="px-5 py-2 bg-slate-600 text-slate-200 rounded-lg hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 font-semibold transition flex items-center gap-2"
                >
                  ← Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  className="px-5 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-600 disabled:text-slate-400 font-semibold transition flex items-center gap-2"
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && prescriptions.length === 0 && (
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl shadow-xl p-16 text-center border-2 border-dashed border-slate-600">
            <div className="text-slate-500 mx-auto mb-6">
              <AlertIcon />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              No Prescriptions Found
            </h3>
            <p className="text-slate-400 text-lg">
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'No pending prescriptions to process'}
            </p>
          </div>
        )}
      </div>

      {/* Result Submission Modal */}
      {showResultModal && selectedPrescription && (
        <ResultSubmissionModal
          prescription={selectedPrescription}
          onClose={() => setShowResultModal(false)}
          onSubmitted={handleResultSubmitted}
        />
      )}
    </div>
  );
}
