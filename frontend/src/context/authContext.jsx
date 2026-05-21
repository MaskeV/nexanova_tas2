import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

// Helper logger
const log = (label, message, data = null) => {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] 🔐 ${label}: ${message}`, data || '');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken]     = useState(null);

  // Restore session on mount
  useEffect(() => {
    log('INIT', 'AuthContext initializing...');
    
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser  = localStorage.getItem('user');
      
      log('INIT', 'Stored data found:', { token: !!storedToken, user: !!storedUser });
      
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          log('INIT', 'Successfully parsed user:', { name: parsedUser.name, role: parsedUser.role });
          setUser(parsedUser);
          setToken(storedToken);
        } catch (parseError) {
          log('ERROR', 'Failed to parse stored user data:', parseError.message);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        log('INIT', 'No stored session found - starting fresh');
      }
    } catch (error) {
      log('ERROR', 'Failed during auth initialization:', error.message);
    } finally {
      log('INIT', 'Setting loading = false');
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      log('LOGIN', 'Attempting login for:', email);
      
      const response = await authAPI.login({ email, password });
      log('LOGIN', 'Backend response received:', response.status);
      
      const body = response.data;
      
      // Validate response structure
      if (!body.success) {
        log('LOGIN', 'Backend returned success=false:', body.message);
        return { success: false, message: body.message || 'Login failed' };
      }

      const userData  = body.data;
      const userToken = body.token;

      if (!userData) {
        log('ERROR', 'No user data in response:', body);
        return { success: false, message: 'Invalid response: missing user data' };
      }

      if (!userToken) {
        log('ERROR', 'No token in response:', body);
        return { success: false, message: 'Invalid response: missing token' };
      }

      log('LOGIN', 'Valid response structure - saving data');
      
      // Save to localStorage
      try {
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        log('LOGIN', 'Saved to localStorage');
      } catch (storageError) {
        log('ERROR', 'Failed to save to localStorage:', storageError.message);
        return { success: false, message: 'Failed to save session' };
      }

      // Update state
      setToken(userToken);
      setUser(userData);
      log('LOGIN', 'State updated - login successful', { name: userData.name, role: userData.role });

      return { success: true };
    } catch (error) {
      log('ERROR', 'Login error caught:', error.message);
      console.error('Full error:', error);
      
      // Better error handling
      let message = 'Login failed';
      
      if (error.response) {
        // Backend responded with error
        message = error.response.data?.message || `Server error: ${error.response.status}`;
        log('ERROR', 'Backend error response:', { status: error.response.status, message });
      } else if (error.request) {
        // Request made but no response
        message = 'No response from server - is the backend running?';
        log('ERROR', 'No response from server');
      } else {
        // Error in request setup
        message = error.message;
        log('ERROR', 'Request setup error:', message);
      }

      return { success: false, message };
    }
  };

  const logout = () => {
    log('LOGOUT', 'User logging out');
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    log('LOGOUT', 'Logout complete');
  };

  const isAdmin     = () => user?.role === 'admin';
  const isEvaluator = () => user?.role === 'evaluator';

  // Log state changes
  useEffect(() => {
    log('STATE', 'Current state:', { 
      user: user ? `${user.name} (${user.role})` : 'null', 
      token: token ? '***' : 'null', 
      loading 
    });
  }, [user, token, loading]);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAdmin,
    isEvaluator,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  
  if (!ctx) {
    const error = 'useAuth must be used within <AuthProvider>';
    console.error('🔴 ' + error);
    throw new Error(error);
  }
  
  return ctx;
};

export default AuthContext;