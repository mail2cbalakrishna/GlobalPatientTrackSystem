import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import DoctorDashboard from './pages/Doctor/Dashboard';
import PatientDashboard from './pages/Patient/Dashboard';
import TechnicianDashboard from './pages/Technician/Dashboard';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/admin/*" 
            element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/doctor/*" 
            element={
              <PrivateRoute allowedRoles={['DOCTOR']}>
                <DoctorDashboard />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/patient/*" 
            element={
              <PrivateRoute allowedRoles={['PATIENT']}>
                <PatientDashboard />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/technician/*" 
            element={
              <PrivateRoute allowedRoles={['LABTECHNICIAN']}>
                <TechnicianDashboard />
              </PrivateRoute>
            } 
          />
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
