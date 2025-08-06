import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import EmailSignup from './EmailSignup';
import CodeVerification from './CodeVerification';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const AuthGuard = ({ children }) => {
  const { user, isLoading, pendingEmail } = useAuth();
  const [authStep, setAuthStep] = useState('email'); // 'email' or 'verification'

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          <p>Loading Lettucetrack...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the main app
  if (user) {
    return children;
  }

  // Show authentication flow
  if (pendingEmail && authStep === 'verification') {
    return (
      <CodeVerification 
        onBack={() => setAuthStep('email')}
      />
    );
  }

  return (
    <EmailSignup 
      onSuccess={() => setAuthStep('verification')}
    />
  );
};

export default AuthGuard;