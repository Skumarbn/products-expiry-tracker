import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock email service - in production, this would be a real API
const mockEmailService = {
  generateCode: () => Math.floor(100000 + Math.random() * 900000).toString(),
  
  sendCode: async (email, code) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Log to console for demo purposes
    console.log(`🔐 Login Code for ${email}: ${code}`);
    
    // In a real app, this would send an actual email
    // For demo, we'll show a browser notification if available
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Login Code Sent', {
        body: `Your login code is: ${code}`,
        icon: '/favicon.ico'
      });
    }
    
    return { success: true };
  },
  
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};

const AUTH_STORAGE_KEY = 'lettucetrack-auth';
const CODES_STORAGE_KEY = 'lettucetrack-codes';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingEmail, setPendingEmail] = useState('');

  // Load user from localStorage on app start
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedAuth) {
        const authData = JSON.parse(savedAuth);
        // Check if session is still valid (24 hours)
        const sessionExpiry = new Date(authData.timestamp);
        sessionExpiry.setHours(sessionExpiry.getHours() + 24);
        
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

  // Generate and store verification codes
  const getStoredCodes = () => {
    try {
      const codes = localStorage.getItem(CODES_STORAGE_KEY);
      return codes ? JSON.parse(codes) : {};
    } catch {
      return {};
    }
  };

  const storeCode = (email, code) => {
    try {
      const codes = getStoredCodes();
      codes[email] = {
        code,
        timestamp: new Date().toISOString(),
        attempts: 0
      };
      localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(codes));
    } catch (error) {
      console.error('Error storing code:', error);
    }
  };

  const isCodeValid = (email, code) => {
    const codes = getStoredCodes();
    const storedCodeData = codes[email];
    
    if (!storedCodeData) return false;
    
    // Check if code is expired (10 minutes)
    const codeTime = new Date(storedCodeData.timestamp);
    const now = new Date();
    const timeDiff = (now - codeTime) / (1000 * 60); // minutes
    
    if (timeDiff > 10) {
      // Code expired, remove it
      delete codes[email];
      localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(codes));
      return false;
    }
    
    // Check if too many attempts (max 3)
    if (storedCodeData.attempts >= 3) {
      return false;
    }
    
    return storedCodeData.code === code;
  };

  const incrementCodeAttempts = (email) => {
    try {
      const codes = getStoredCodes();
      if (codes[email]) {
        codes[email].attempts = (codes[email].attempts || 0) + 1;
        localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(codes));
      }
    } catch (error) {
      console.error('Error incrementing attempts:', error);
    }
  };

  const sendLoginCode = async (email) => {
    if (!mockEmailService.validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    // Check if there's a recent code for this email (rate limiting)
    const codes = getStoredCodes();
    const existingCode = codes[email];
    
    if (existingCode) {
      const codeTime = new Date(existingCode.timestamp);
      const now = new Date();
      const timeDiff = (now - codeTime) / (1000 * 60); // minutes
      
      if (timeDiff < 1) {
        throw new Error('Please wait 1 minute before requesting a new code');
      }
    }

    const code = mockEmailService.generateCode();
    
    try {
      await mockEmailService.sendCode(email, code);
      storeCode(email, code);
      setPendingEmail(email);
      return { success: true };
    } catch (error) {
      throw new Error('Failed to send login code. Please try again.');
    }
  };

  const verifyLoginCode = async (email, code) => {
    if (!email || !code) {
      throw new Error('Email and code are required');
    }

    if (!isCodeValid(email, code)) {
      incrementCodeAttempts(email);
      const codes = getStoredCodes();
      const attempts = codes[email]?.attempts || 0;
      
      if (attempts >= 3) {
        throw new Error('Too many failed attempts. Please request a new code.');
      } else {
        throw new Error(`Invalid code. ${3 - attempts} attempts remaining.`);
      }
    }

    // Code is valid, log the user in
    const userData = {
      email,
      loginTime: new Date().toISOString(),
      id: `user_${Date.now()}`
    };

    setUser(userData);
    saveAuthData(userData);
    setPendingEmail('');
    
    // Clear the used code
    const codes = getStoredCodes();
    delete codes[email];
    localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(codes));

    return { success: true, user: userData };
  };

  const logout = () => {
    setUser(null);
    setPendingEmail('');
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // Don't clear codes on logout, they might still be valid
  };

  const resendCode = async () => {
    if (pendingEmail) {
      return sendLoginCode(pendingEmail);
    }
    throw new Error('No email address to resend code to');
  };

  const value = {
    user,
    isLoading,
    pendingEmail,
    sendLoginCode,
    verifyLoginCode,
    logout,
    resendCode,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};