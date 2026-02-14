import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  const login = (newToken, userRole) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', userRole);
    setToken(newToken);
    setRole(userRole);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('organizationId');
    localStorage.removeItem('organizationName');
    localStorage.removeItem('userId');
    setToken(null);
    setRole(null);
  };

  const isAuthenticated = () => {
    return !!token;
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
