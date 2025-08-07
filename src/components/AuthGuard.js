import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Auth from './Auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const AuthGuard = ({ children }) => {
  const { user, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          <p>Loading Grocery Manager...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the main app
  if (user) {
    return children;
  }

  // Show authentication flow (login/register)
  return <Auth />;
};

export default AuthGuard;