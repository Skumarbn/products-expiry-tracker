import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faSpinner, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';

const EmailSignup = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { sendLoginCode } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await sendLoginCode(email.trim().toLowerCase());
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <div className="auth-header">
          <div className="auth-logo">
            <FontAwesomeIcon icon={faEnvelope} />
          </div>
          <h1>Welcome to Grocery Manager</h1>
          <p>Enter your email to get started. We'll send you a secure login code.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form-body">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="auth-input"
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-button primary"
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Sending Code...
              </>
            ) : (
              <>
                Send Login Code
                <FontAwesomeIcon icon={faArrowRight} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailSignup;