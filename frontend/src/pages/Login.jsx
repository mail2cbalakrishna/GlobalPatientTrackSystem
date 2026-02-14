import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'Inter, -apple-system, sans-serif'
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    width: '100%',
    maxWidth: '420px',
    margin: '20px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '10px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    textAlign: 'center',
    marginBottom: '30px'
  },
  errorBox: {
    background: '#fee',
    border: '1px solid #fcc',
    color: '#c33',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    color: '#333',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '15px',
    transition: 'all 0.3s',
    outline: 'none'
  },
  inputFocus: {
    borderColor: '#667eea',
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    marginTop: '10px'
  },
  buttonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)'
  },
  buttonDisabled: {
    background: '#ccc',
    cursor: 'not-allowed',
    transform: 'none'
  },
  demoCredentials: {
    marginTop: '30px',
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '10px',
    fontSize: '12px'
  },
  demoTitle: {
    fontWeight: '600',
    marginBottom: '10px',
    color: '#333'
  },
  demoItem: {
    marginBottom: '6px',
    color: '#666'
  }
};

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [organizationName, setOrganizationName] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(username, password);
      
      // API returns: { accessToken, refreshToken, scope, expiresIn, organizationName, organizationId, userId }
      const token = response.accessToken;
      const role = response.scope?.toUpperCase() || 'PATIENT';
      const orgName = response.organizationName || 'Unknown Organization';
      const orgId = response.organizationId;
      const userId = response.userId;
      
      // Store organization name, organizationId, and userId in localStorage
      localStorage.setItem('organizationName', orgName);
      if (orgId) {
        localStorage.setItem('organizationId', orgId.toString());
      }
      if (userId) {
        localStorage.setItem('userId', userId.toString());
      }
      setOrganizationName(orgName);
      
      login(token, role);
      
      const route = role === 'ADMIN' ? '/admin' : 
                    role === 'DOCTOR' ? '/doctor' :
                    role === 'LABTECHNICIAN' ? '/technician' : '/patient';
      navigate(route);
    } catch (err) {
      console.error('Login error:', err);
      
      // Improved error handling
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response) {
        // Server responded with error
        const status = err.response.status;
        const serverMessage = err.response.data?.message || err.response.data?.error;
        
        if (status === 401) {
          errorMessage = 'Invalid username or password. Please try again.';
        } else if (status === 403) {
          errorMessage = 'Access denied. Your account may be inactive.';
        } else if (status === 500) {
          errorMessage = serverMessage || 'Server error. Please try again later.';
        } else if (status === 503) {
          errorMessage = 'Service temporarily unavailable. Please wait a moment and try again.';
        } else if (serverMessage) {
          errorMessage = serverMessage;
        }
      } else if (err.request) {
        // Request made but no response
        errorMessage = 'Cannot connect to server. Please check your connection.';
      } else {
        // Something else went wrong
        errorMessage = err.message || 'An unexpected error occurred.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Global Patient Track System</h1>
        <p style={styles.subtitle}>Healthcare Management Platform</p>
        
        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocusedInput('username')}
              onBlur={() => setFocusedInput(null)}
              style={{
                ...styles.input,
                ...(focusedInput === 'username' ? styles.inputFocus : {})
              }}
              placeholder="Enter your username"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
              style={{
                ...styles.input,
                ...(focusedInput === 'password' ? styles.inputFocus : {})
              }}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
            onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)')}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.demoCredentials}>
          <div style={styles.demoTitle}>Demo Credentials:</div>
          <div style={styles.demoItem}>👨‍⚕️ Doctor: doctor / password</div>
          <div style={styles.demoItem}>👤 Patient: patient / password</div>
          <div style={styles.demoItem}>🧪 Technician: tech_mmc_1 / TechMMC1@2026</div>
          <div style={styles.demoItem}>🔧 Admin: admin / password</div>
        </div>
      </div>
    </div>
  );
}

export default Login;
