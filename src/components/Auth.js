import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const Auth = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const switchToRegister = () => setIsLoginMode(false);
  const switchToLogin = () => setIsLoginMode(true);

  return isLoginMode ? (
    <Login switchToRegister={switchToRegister} />
  ) : (
    <Register switchToLogin={switchToLogin} />
  );
};

export default Auth;