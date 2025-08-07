import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AUTH_STORAGE_KEY = 'grocery-manager-auth';
const USERS_STORAGE_KEY = 'grocery-manager-users';

// Mock validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    try {
      // Clear old authentication data from previous system
      localStorage.removeItem('lettucetrack-auth');
      localStorage.removeItem('lettucetrack-codes');
      localStorage.removeItem('user'); // Old simple user storage
      
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedAuth) {
        const authData = JSON.parse(savedAuth);
        // Check if session is still valid (7 days)
        const sessionExpiry = new Date(authData.timestamp);
        sessionExpiry.setDate(sessionExpiry.getDate() + 7);
        
        if (new Date() < sessionExpiry) {
          setUser(authData.user);
        } else {
          // Session expired, clear it
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  // Save user to localStorage
  const saveAuthData = (userData) => {
    try {
      const authData = {
        user: userData,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  };

  // Get stored users
  const getStoredUsers = () => {
    try {
      const users = localStorage.getItem(USERS_STORAGE_KEY);
      return users ? JSON.parse(users) : {};
    } catch {
      return {};
    }
  };

  // Save users to localStorage
  const saveUsers = (users) => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  };

  const register = async (name, email, password) => {
    // Validate inputs
    if (!name || name.trim().length < 2) {
      throw new Error('Please enter a valid name (at least 2 characters)');
    }

    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    if (!validatePassword(password)) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if user already exists
    const users = getStoredUsers();
    const emailKey = email.toLowerCase();
    
    if (users[emailKey]) {
      throw new Error('An account with this email already exists');
    }

    // Create new user
    const userData = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase(),
      registeredAt: new Date().toISOString()
    };

    // Store user credentials (in real app, password would be hashed)
    users[emailKey] = {
      ...userData,
      password: password // In production, this should be hashed
    };

    saveUsers(users);

    // Log the user in immediately
    setUser(userData);
    saveAuthData(userData);

    return { success: true, user: userData };
  };

  const login = async (email, password) => {
    // Validate inputs
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    if (!password) {
      throw new Error('Please enter your password');
    }

    // Check credentials
    const users = getStoredUsers();
    const emailKey = email.toLowerCase();
    const storedUser = users[emailKey];

    if (!storedUser || storedUser.password !== password) {
      throw new Error('Invalid email or password');
    }

    // Create user session data (excluding password)
    const userData = {
      id: storedUser.id,
      name: storedUser.name,
      email: storedUser.email,
      registeredAt: storedUser.registeredAt,
      loginTime: new Date().toISOString()
    };

    setUser(userData);
    saveAuthData(userData);

    return { success: true, user: userData };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = {
    user,
    isLoading,
    register,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};