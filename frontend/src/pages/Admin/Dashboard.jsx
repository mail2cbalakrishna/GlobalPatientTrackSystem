import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f7fa',
    fontFamily: 'Inter, -apple-system, sans-serif'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '25px 40px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    margin: 0
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  content: {
    padding: '30px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'white',
    padding: '25px',
    borderRadius: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    borderLeft: '4px solid'
  },
  statTitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
    fontWeight: '600'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#333'
  },
  tableContainer: {
    background: 'white',
    borderRadius: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    padding: '25px',
    marginBottom: '20px'
  },
  tableTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#333'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '2px solid #e0e0e0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666'
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '14px',
    color: '#333'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontSize: '16px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '450px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    animation: 'slideIn 0.3s ease-out'
  },
  modalIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#fee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    fontSize: '30px'
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: '10px'
  },
  modalMessage: {
    fontSize: '16px',
    color: '#666',
    textAlign: 'center',
    marginBottom: '30px',
    lineHeight: '1.5'
  },
  modalButtons: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center'
  },
  modalButtonCancel: {
    flex: 1,
    padding: '12px 24px',
    backgroundColor: '#f0f0f0',
    color: '#333',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  modalButtonDelete: {
    flex: 1,
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
    padding: '15px 0',
    borderTop: '1px solid #e0e0e0'
  },
  paginationInfo: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },
  paginationControls: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  pageButton: {
    padding: '8px 12px',
    backgroundColor: 'white',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    transition: 'all 0.3s',
    minWidth: '36px',
    textAlign: 'center'
  },
  pageButtonActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderColor: '#667eea'
  },
  pageButtonDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#ccc',
    cursor: 'not-allowed',
    borderColor: '#f0f0f0'
  },
  pageSizeSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: '#666'
  },
  selectBox: {
    padding: '8px 30px 8px 12px',
    borderRadius: '8px',
    border: '2px solid #e0e0e0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s',
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage: 'linear-gradient(45deg, transparent 50%, #667eea 50%), linear-gradient(135deg, #667eea 50%, transparent 50%)',
    backgroundPosition: 'calc(100% - 15px) calc(1em + 2px), calc(100% - 10px) calc(1em + 2px)',
    backgroundSize: '5px 5px, 5px 5px',
    backgroundRepeat: 'no-repeat'
  }
};

function AdminDashboard() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, userId: null, userName: '', role: '' });
  const [organizationName, setOrganizationName] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [patientsPage, setPatientsPage] = useState(1);
  const [patientsPageSize, setPatientsPageSize] = useState(10);
  const [doctorsPage, setDoctorsPage] = useState(1);
  const [doctorsPageSize, setDoctorsPageSize] = useState(10);
  
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    role: 'PATIENT'
  });
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load organization name from localStorage
    const orgName = localStorage.getItem('organizationName');
    console.log('Loading organization from localStorage:', orgName);
    if (orgName && orgName !== 'null' && orgName !== 'undefined') {
      setOrganizationName(orgName);
    } else {
      console.warn('Organization name not found in localStorage. Please logout and login again.');
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [patientsData, doctorsData] = await Promise.all([
        adminService.getAllPatients(),
        adminService.getAllDoctors()
      ]);
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (err) {
      console.error('Error loading data:', err);
      
      let errorMessage = 'Failed to load dashboard data.';
      
      if (err.response) {
        const status = err.response.status;
        const serverMessage = err.response.data?.message || err.response.data?.error;
        
        if (status === 401) {
          errorMessage = 'Session expired. Please login again.';
          setTimeout(() => {
            localStorage.clear();
            window.location.href = '/login';
          }, 2000);
        } else if (status === 403) {
          errorMessage = 'Access denied. You do not have permission to view this data.';
        } else if (status === 500) {
          errorMessage = 'Server error while loading data. Please refresh the page.';
        } else if (status === 503) {
          errorMessage = 'Service temporarily unavailable. Please wait and refresh.';
        } else if (serverMessage) {
          errorMessage = serverMessage;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please check your connection and refresh.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Pagination helper functions
  const getPaginatedData = (data, page, size) => {
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (dataLength, size) => {
    return Math.ceil(dataLength / size);
  };

  const getPageNumbers = (currentPage, totalPages) => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Get paginated data
  const paginatedPatients = getPaginatedData(patients, patientsPage, patientsPageSize);
  const paginatedDoctors = getPaginatedData(doctors, doctorsPage, doctorsPageSize);
  const allUsers = [...patients, ...doctors];
  const paginatedAllUsers = getPaginatedData(allUsers, currentPage, pageSize);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      setLoading(true);
      const newUser = await adminService.createUser(userForm);
      
      // Immediately update local state with new user based on role
      if (newUser.role === 'PATIENT') {
        setPatients(prev => [...prev, newUser]);
      } else if (newUser.role === 'DOCTOR') {
        setDoctors(prev => [...prev, newUser]);
      }
      
      setShowCreateUser(false);
      resetForm();
      setSuccess('✓ User created successfully!');
      setTimeout(() => setSuccess(null), 5000);
      
      // Refresh to get complete latest data from database
      await loadData();
    } catch (err) {
      console.error('Error creating user:', err);
      
      let errorMessage = 'Failed to create user. Please try again.';
      
      if (err.response) {
        const status = err.response.status;
        const serverMessage = err.response.data?.message || err.response.data?.error;
        
        if (status === 400) {
          errorMessage = serverMessage || 'Invalid user data. Please check all fields.';
        } else if (status === 409) {
          errorMessage = 'Username or email already exists. Please use different credentials.';
        } else if (status === 500) {
          errorMessage = 'Server error while creating user. Please try again later.';
        } else if (status === 503) {
          errorMessage = 'Service temporarily unavailable. Please wait and try again.';
        } else if (serverMessage) {
          errorMessage = serverMessage;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      }
      
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      setLoading(true);
      // Send password only if it's not empty, otherwise send placeholder
      const updateData = {
        ...userForm,
        password: userForm.password || 'KEEP_EXISTING_PASSWORD'
      };
      const updatedUser = await adminService.updateUser(editingUser.id, updateData);
      
      // Immediately update local state based on role
      if (updatedUser.role === 'PATIENT') {
        setPatients(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
      } else if (updatedUser.role === 'DOCTOR') {
        setDoctors(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
      }
      
      setEditingUser(null);
      resetForm();
      setSuccess('✓ User updated successfully!');
      setTimeout(() => setSuccess(null), 5000);
      
      // Refresh to get complete latest data from database
      await loadData();
    } catch (err) {
      console.error('Error updating user:', err);
      
      let errorMessage = 'Failed to update user. Please try again.';
      
      if (err.response) {
        const status = err.response.status;
        const serverMessage = err.response.data?.message || err.response.data?.error;
        
        if (status === 400) {
          errorMessage = serverMessage || 'Invalid user data. Please check all fields.';
        } else if (status === 404) {
          errorMessage = 'User not found. They may have been deleted.';
        } else if (status === 409) {
          errorMessage = 'Email already in use. Please use a different email.';
        } else if (status === 500) {
          errorMessage = 'Server error while updating user. Please try again later.';
        } else if (status === 503) {
          errorMessage = 'Service temporarily unavailable. Please wait and try again.';
        } else if (serverMessage) {
          errorMessage = serverMessage;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      }
      
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName, role) => {
    setDeleteConfirm({ show: true, userId, userName, role });
  };

  const confirmDelete = async () => {
    setError(null);
    setSuccess(null);
    
    try {
      setLoading(true);
      await adminService.deleteUser(deleteConfirm.userId);
      
      // Immediately remove from local state based on role
      if (deleteConfirm.role === 'PATIENT') {
        setPatients(prev => prev.filter(u => u.id !== deleteConfirm.userId));
      } else if (deleteConfirm.role === 'DOCTOR') {
        setDoctors(prev => prev.filter(u => u.id !== deleteConfirm.userId));
      }
      
      setSuccess('✓ User deleted successfully!');
      setTimeout(() => setSuccess(null), 5000);
      setDeleteConfirm({ show: false, userId: null, userName: '', role: '' });
      
      // Refresh to get complete latest data from database
      await loadData();
    } catch (err) {
      console.error('Error deleting user:', err);
      
      let errorMessage = 'Failed to delete user. Please try again.';
      
      if (err.response) {
        const status = err.response.status;
        const serverMessage = err.response.data?.message || err.response.data?.error;
        
        if (status === 404) {
          errorMessage = 'User not found. They may have already been deleted.';
        } else if (status === 403) {
          errorMessage = 'You do not have permission to delete this user.';
        } else if (status === 409) {
          errorMessage = 'Cannot delete user. They have associated data.';
        } else if (status === 500) {
          errorMessage = 'Server error while deleting user. Please try again later.';
        } else if (status === 503) {
          errorMessage = 'Service temporarily unavailable. Please wait and try again.';
        } else if (serverMessage) {
          errorMessage = serverMessage;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      }
      
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
      setDeleteConfirm({ show: false, userId: null, userName: '', role: '' });
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, userId: null, userName: '', role: '' });
  };

  const startEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      username: user.username || '',
      password: '',
      email: user.email || '',
      fullName: user.name || '',
      role: user.role || 'PATIENT'
    });
    setShowCreateUser(true);
  };

  const resetForm = () => {
    setShowCreateUser(false);
    setEditingUser(null);
    setUserForm({
      username: '',
      password: '',
      email: '',
      fullName: '',
      role: 'PATIENT'
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Pagination Component
  const Pagination = ({ currentPage, totalItems, pageSize, onPageChange, onPageSizeChange }) => {
    const totalPages = getTotalPages(totalItems, pageSize);
    const pageNumbers = getPageNumbers(currentPage, totalPages);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
      <div style={styles.paginationContainer}>
        <div style={styles.pageSizeSelector}>
          <span style={{ fontWeight: '500' }}>Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            style={styles.selectBox}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e0e0e0';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span style={{ fontWeight: '500' }}>entries</span>
        </div>

        <div style={styles.paginationInfo}>
          Showing <strong style={{ color: '#667eea' }}>{startItem}</strong> to <strong style={{ color: '#667eea' }}>{endItem}</strong> of <strong style={{ color: '#667eea' }}>{totalItems}</strong> entries
        </div>

        <div style={styles.paginationControls}>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              ...styles.pageButton,
              ...(currentPage === 1 ? styles.pageButtonDisabled : {})
            }}
            onMouseEnter={(e) => currentPage !== 1 && (e.target.style.borderColor = '#667eea')}
            onMouseLeave={(e) => currentPage !== 1 && (e.target.style.borderColor = '#e0e0e0')}
          >
            ←
          </button>

          {pageNumbers.map((pageNum, idx) => (
            pageNum === '...' ? (
              <span key={`ellipsis-${idx}`} style={{ padding: '0 5px', color: '#999' }}>...</span>
            ) : (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                style={{
                  ...styles.pageButton,
                  ...(currentPage === pageNum ? styles.pageButtonActive : {})
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== pageNum) {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.backgroundColor = '#f8f9ff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== pageNum) {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.backgroundColor = 'white';
                  }
                }}
              >
                {pageNum}
              </button>
            )
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              ...styles.pageButton,
              ...(currentPage === totalPages ? styles.pageButtonDisabled : {})
            }}
            onMouseEnter={(e) => currentPage !== totalPages && (e.target.style.borderColor = '#667eea')}
            onMouseLeave={(e) => currentPage !== totalPages && (e.target.style.borderColor = '#e0e0e0')}
          >
            →
          </button>
        </div>
      </div>
    );
  };

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Hospital Icon */}
          <div style={{
            width: '60px',
            height: '60px',
            background: 'rgba(255, 255, 255, 0.25)',
            borderRadius: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
          }}>
            🏥
          </div>
          
          {/* Hospital Name and Dashboard Title */}
          <div>
            {organizationName && (
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
                {organizationName}
              </div>
            )}
            <h1 style={{
              fontSize: '16px',
              fontWeight: '500',
              margin: 0,
              opacity: 0.95,
              letterSpacing: '0.3px'
            }}>
              Admin Dashboard
            </h1>
          </div>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      <div style={styles.content}>
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

        {success && (
          <div style={{
            backgroundColor: 'rgba(0, 200, 0, 0.1)',
            color: '#00aa00',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid rgba(0, 200, 0, 0.3)'
          }}>
            ✓ {success}
          </div>
        )}

        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, borderLeftColor: '#667eea'}}>
            <div style={styles.statTitle}>Total Patients</div>
            <div style={styles.statValue}>{patients.length}</div>
          </div>
          <div style={{...styles.statCard, borderLeftColor: '#764ba2'}}>
            <div style={styles.statTitle}>Total Doctors</div>
            <div style={styles.statValue}>{doctors.length}</div>
          </div>
          <div style={{...styles.statCard, borderLeftColor: '#f093fb'}}>
            <div style={styles.statTitle}>Total Users</div>
            <div style={styles.statValue}>{allUsers.length}</div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={styles.tableTitle}>All Users</h2>
          <button
            onClick={() => setShowCreateUser(true)}
            style={{
              padding: '12px 24px',
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
            + Create User
          </button>
        </div>

        {showCreateUser && (
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '2px solid #667eea'
          }}>
            <h3 style={{
              fontSize: '18px',
              marginBottom: '15px',
              color: '#667eea',
              fontWeight: '600'
            }}>
              {editingUser ? 'Edit User' : 'Create New User'}
            </h3>
            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
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
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={userForm.username}
                    onChange={handleFormChange}
                    placeholder="Enter username"
                    required
                    disabled={editingUser !== null}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: editingUser ? '#f0f0f0' : 'white'
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
                    Password {editingUser ? '' : '*'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={userForm.password}
                    onChange={handleFormChange}
                    placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
                    required={!editingUser}
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
                    value={userForm.email}
                    onChange={handleFormChange}
                    placeholder="Enter email"
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
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={userForm.fullName}
                    onChange={handleFormChange}
                    placeholder="Enter full name"
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
                    Organization
                  </label>
                  <input
                    type="text"
                    value={organizationName || 'Loading organization...'}
                    disabled
                    placeholder="Organization name"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#f0f0f0',
                      color: '#666',
                      cursor: 'not-allowed'
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
                    Role *
                  </label>
                  <select
                    name="role"
                    value={userForm.role}
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
                    <option value="PATIENT">Patient</option>
                    <option value="DOCTOR">Doctor</option>
                  </select>
                </div>
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
                  {editingUser ? 'Update User' : 'Create User'}
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

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Organization</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAllUsers.map(user => (
                <tr key={user.userId}>
                  <td style={styles.td}>{user.userId}</td>
                  <td style={styles.td}>{user.username}</td>
                  <td style={styles.td}>{user.name}</td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>
                    <span style={{
                      background: user.role === 'PATIENT' ? '#e3f2fd' : '#f3e5f5',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: user.role === 'PATIENT' ? '#1976d2' : '#7b1fa2'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      fontSize: '13px',
                      color: '#666',
                      fontStyle: user.organizationName ? 'normal' : 'italic'
                    }}>
                      {user.organizationName || 'No Organization'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => startEditUser(user)}
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
                        onClick={() => handleDeleteUser(user.id, user.name, user.role)}
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
          
          <Pagination
            currentPage={currentPage}
            totalItems={allUsers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>

        <div style={styles.tableContainer}>
          <h2 style={styles.tableTitle}>All Patients</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Organization</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPatients.map(patient => (
                <tr key={patient.userId}>
                  <td style={styles.td}>{patient.userId}</td>
                  <td style={styles.td}>{patient.username}</td>
                  <td style={styles.td}>{patient.name}</td>
                  <td style={styles.td}>{patient.email}</td>
                  <td style={styles.td}><span style={{background: '#e3f2fd', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', color: '#1976d2'}}>PATIENT</span></td>
                  <td style={styles.td}>
                    <span style={{fontSize: '13px', color: '#666', fontStyle: patient.organizationName ? 'normal' : 'italic'}}>
                      {patient.organizationName || 'No Organization'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <Pagination
            currentPage={patientsPage}
            totalItems={patients.length}
            pageSize={patientsPageSize}
            onPageChange={setPatientsPage}
            onPageSizeChange={setPatientsPageSize}
          />
        </div>

        <div style={styles.tableContainer}>
          <h2 style={styles.tableTitle}>All Doctors</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Organization</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDoctors.map(doctor => (
                <tr key={doctor.userId}>
                  <td style={styles.td}>{doctor.userId}</td>
                  <td style={styles.td}>{doctor.username}</td>
                  <td style={styles.td}>{doctor.name}</td>
                  <td style={styles.td}>{doctor.email}</td>
                  <td style={styles.td}><span style={{background: '#f3e5f5', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', color: '#7b1fa2'}}>DOCTOR</span></td>
                  <td style={styles.td}>
                    <span style={{fontSize: '13px', color: '#666', fontStyle: doctor.organizationName ? 'normal' : 'italic'}}>
                      {doctor.organizationName || 'No Organization'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <Pagination
            currentPage={doctorsPage}
            totalItems={doctors.length}
            pageSize={doctorsPageSize}
            onPageChange={setDoctorsPage}
            onPageSizeChange={setDoctorsPageSize}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div style={styles.modalOverlay} onClick={cancelDelete}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalIcon}>
              ⚠️
            </div>
            <h2 style={styles.modalTitle}>Delete User</h2>
            <p style={styles.modalMessage}>
              Are you sure you want to delete <strong>{deleteConfirm.userName}</strong>?
              <br />
              This action cannot be undone.
            </p>
            <div style={styles.modalButtons}>
              <button
                onClick={cancelDelete}
                style={styles.modalButtonCancel}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e0e0e0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={styles.modalButtonDelete}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
