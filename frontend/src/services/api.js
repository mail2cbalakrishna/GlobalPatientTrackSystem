import axios from 'axios';

// Configure API URL based on environment
let API_BASE_URL = '/api';

// In development, if not running through nginx proxy, use direct gateway URL
if (process.env.NODE_ENV === 'development') {
  // Check if we're behind the nginx proxy or running directly
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Running directly on localhost, use gateway directly
    API_BASE_URL = 'http://localhost:8080';
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token and userId to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add userId header for patient requests (development mode)
  const userId = localStorage.getItem('userId');
  if (userId) {
    config.headers['X-User-Id'] = userId;
  }
  
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', {
      username,
      password
    });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

export const adminService = {
  getAllPatients: async () => {
    const response = await api.get('/admin/users/patients');
    return response.data;
  },
  
  getAllDoctors: async () => {
    const response = await api.get('/admin/users/doctors');
    return response.data;
  },
  
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  
  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },
  
  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },
  
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
  
  activateUser: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/activate`);
    return response.data;
  },
  
  deactivateUser: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/deactivate`);
    return response.data;
  }
};

export const doctorService = {
  getProfile: async () => {
    // Get doctor ID from localStorage (set during login)
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found');
    }
    const response = await api.get(`/doctor/profile/${userId}`);
    return response.data;
  },
  
  getPatients: async () => {
    const organizationId = localStorage.getItem('organizationId');
    const params = {};
    if (organizationId) {
      params.organizationId = organizationId;
    }
    const response = await api.get('/doctor/patients', { params });
    return response.data;
  },
  
  getPatientDetails: async (patientId) => {
    const response = await api.get(`/doctor/patients/${patientId}`);
    return response.data;
  },
  
  createPatient: async (patientData) => {
    const organizationId = localStorage.getItem('organizationId');
    const params = {};
    if (organizationId) {
      params.organizationId = organizationId;
    }
    const response = await api.post('/doctor/patients', patientData, { params });
    return response.data;
  },
  
  updatePatient: async (patientId, patientData) => {
    const response = await api.put(`/doctor/patients/${patientId}`, patientData);
    return response.data;
  },
  
  deletePatient: async (patientId) => {
    const response = await api.delete(`/doctor/patients/${patientId}`);
    return response.data;
  },
  
  searchDoctors: async (name, id) => {
    const params = {};
    if (name) params.name = name;
    if (id) params.id = id;
    const response = await api.get('/doctor/search', { params });
    return response.data;
  },
  
  getAllDoctors: async () => {
    const response = await api.get('/doctor/colleagues');
    return response.data;
  }
};

export const patientService = {
  getProfile: async () => {
    const response = await api.get('/patient/profile');
    return response.data;
  },
  
  getMedicalDetails: async () => {
    const userId = localStorage.getItem('userId');
    const response = await api.get(`/patient/medical-details/${userId}`);
    return response.data;
  },
  
  getHistory: async () => {
    const response = await api.get('/patient/history');
    return response.data;
  },

  getPatientHistoryByPatientId: async (patientId) => {
    const response = await api.get(`/patient/history/${patientId}`);
    return response.data;
  },
  
  addHistory: async (historyData) => {
    const response = await api.post('/patient/history', historyData);
    return response.data;
  },
  
  updateHistory: async (historyId, historyData) => {
    const response = await api.put(`/patient/history/${historyId}`, historyData);
    return response.data;
  },
  
  deleteHistory: async (historyId) => {
    const response = await api.delete(`/patient/history/${historyId}`);
    return response.data;
  }
};

export const technicianService = {
  getProfile: async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found');
    }
    const response = await api.get(`/lab/technician/profile/${userId}`);
    return response.data;
  },

  getPrescriptions: async (organizationId, page = 0, size = 25, search = '') => {
    const params = {
      page,
      size,
      status: 'PENDING'
    };
    if (search) {
      params.search = search;
    }
    const response = await api.get(`/lab/prescriptions/org/${organizationId}`, { params });
    return response.data;
  },

  submitResult: async (prescriptionId, resultData, documents = []) => {
    const formData = new FormData();
    formData.append('prescriptionId', prescriptionId);
    formData.append('resultData', resultData.resultData);
    formData.append('referenceRange', resultData.referenceRange || '');
    formData.append('abnormalFlags', resultData.abnormalFlags || '');
    formData.append('notes', resultData.notes || '');
    
    documents.forEach((doc) => {
      formData.append('documents', doc);
    });

    const response = await api.post('/lab/result/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export default api;
