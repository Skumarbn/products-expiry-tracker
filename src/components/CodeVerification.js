import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faSpinner, faArrowLeft, faSync, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';

const CodeVerification = ({ onBack }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const { pendingEmail, verifyLoginCode, resendCode } = useAuth();
  
  const inputRefs = useRef([]);

  // Timer for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleCodeChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only take the last character
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleVerification(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      setError('');
      
      // Focus the last input
      inputRefs.current[5]?.focus();
      
      // Auto-submit
      handleVerification(pastedData);
    }
  };

  const handleVerification = async (codeString = null) => {
    const verificationCode = codeString || code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await verifyLoginCode(pendingEmail, verificationCode);
      // Success will be handled by the auth context
    } catch (err) {
      setError(err.message);
      // Clear the code on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setError('');

    try {
      await resendCode();
      setCanResend(false);
      setResendTimer(60);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const maskEmail = (email) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    const maskedUsername = username.length > 2 
      ? username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
      : username;
    return `${maskedUsername}@${domain}`;
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <div className="auth-header">
          <div className="auth-logo">
            <FontAwesomeIcon icon={faLock} />
          </div>
          <h1>Verify Your Email</h1>
          <p>We've sent a 6-digit code to <strong>{maskEmail(pendingEmail)}</strong></p>
          <p className="auth-subtext">Check your email and enter the code below</p>
        </div>

        <div className="auth-form-body">
          <div className="code-input-container">
            <label>Enter 6-digit code</label>
            <div className="code-inputs" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`code-input ${error ? 'error' : ''}`}
                  disabled={isLoading}
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="auth-actions">
            <button 
              type="button"
              onClick={() => handleVerification()}
              className="auth-button primary"
              disabled={isLoading || code.some(digit => digit === '')}
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Verifying...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Verify Code
                </>
              )}
            </button>

            <div className="resend-section">
              {canResend ? (
                <button 
                  type="button"
                  onClick={handleResendCode}
                  className="auth-button secondary"
                  disabled={isLoading}
                >
                  <FontAwesomeIcon icon={faSync} />
                  Resend Code
                </button>
              ) : (
                <p className="resend-timer">
                  Resend code in {resendTimer}s
                </p>
              )}
            </div>

            <button 
              type="button"
              onClick={onBack}
              className="auth-button text"
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Change Email
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            Didn't receive the code? Check your spam folder or try resending.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CodeVerification;